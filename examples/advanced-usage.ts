#!/usr/bin/env ts-node

import { GameforgeAccount, GameforgeAuthUtils, GameAccount, Identity } from '../src/index';
import * as path from 'path';
import * as fs from 'fs';

/**
 * Advanced usage example for Gameforge Authentication Library
 * 
 * This example demonstrates:
 * 1. Managing multiple Gameforge accounts
 * 2. Using proxy configurations
 * 3. Advanced error handling and retry logic
 * 4. Custom identity generation
 * 5. Batch token generation
 */

interface AccountProfile {
  name: string;
  config: any;
  gameAccount?: GameforgeAccount;
}

class GameforgeManager {
  private accounts: Map<string, AccountProfile> = new Map();
  private identityDir: string;

  constructor(identityDir: string = path.join(__dirname, 'identities')) {
    this.identityDir = identityDir;
    this.ensureDirectoryExists();
  }

  private ensureDirectoryExists(): void {
    if (!fs.existsSync(this.identityDir)) {
      fs.mkdirSync(this.identityDir, { recursive: true });
    }
  }

  /**
   * Add a Gameforge account profile
   */
  addAccount(profileName: string, email: string, password: string, options: any = {}): void {
    const identityPath = path.join(this.identityDir, `${profileName}-identity.json`);
    
    const config = {
      email,
      password,
      identityPath,
      installationId: GameforgeAuthUtils.generateInstallationId(),
      ...options
    };

    this.accounts.set(profileName, {
      name: profileName,
      config,
    });

    console.log(`➕ Added account profile: ${profileName}`);
  }

  /**
   * Generate identity from blackbox for a specific profile
   */
  generateIdentityForProfile(profileName: string, blackboxString: string): boolean {
    const profile = this.accounts.get(profileName);
    if (!profile) {
      console.error(`❌ Profile ${profileName} not found`);
      return false;
    }

    const success = GameforgeAuthUtils.generateIdentityFromBlackbox(
      blackboxString,
      profile.config.identityPath
    );

    if (success) {
      console.log(`✅ Identity generated for profile: ${profileName}`);
    } else {
      console.error(`❌ Failed to generate identity for profile: ${profileName}`);
    }

    return success;
  }

  /**
   * Authenticate a specific account with retry logic
   */
  async authenticateAccount(profileName: string, maxRetries: number = 3): Promise<boolean> {
    const profile = this.accounts.get(profileName);
    if (!profile) {
      console.error(`❌ Profile ${profileName} not found`);
      return false;
    }

    if (!profile.gameAccount) {
      profile.gameAccount = new GameforgeAccount(profile.config);
    }

    let lastError: any;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`🔐 Authenticating ${profileName} (attempt ${attempt}/${maxRetries})...`);
        
        const result = await profile.gameAccount.authenticate();
        
        if (result.success) {
          console.log(`✅ ${profileName} authenticated successfully`);
          return true;
        } else if (result.captcha) {
          console.log(`🤖 ${profileName} requires captcha - Challenge ID: ${result.challengeId}`);
          return false; // Don't retry captcha automatically
        } else if (result.wrongCredentials) {
          console.log(`❌ ${profileName} has wrong credentials`);
          return false; // Don't retry wrong credentials
        } else {
          throw new Error('Authentication failed for unknown reason');
        }
        
      } catch (error) {
        lastError = error;
        console.warn(`⚠️  ${profileName} authentication attempt ${attempt} failed:`, error.message);
        
        if (attempt < maxRetries) {
          const delay = Math.pow(2, attempt) * 1000; // Exponential backoff
          console.log(`⏳ Waiting ${delay}ms before retry...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    console.error(`❌ ${profileName} authentication failed after ${maxRetries} attempts:`, lastError);
    return false;
  }

  /**
   * Authenticate all accounts in parallel
   */
  async authenticateAllAccounts(): Promise<Map<string, boolean>> {
    const results = new Map<string, boolean>();
    
    console.log(`🚀 Authenticating ${this.accounts.size} accounts...`);
    
    const promises = Array.from(this.accounts.keys()).map(async (profileName) => {
      const success = await this.authenticateAccount(profileName);
      results.set(profileName, success);
      return { profileName, success };
    });

    const outcomes = await Promise.allSettled(promises);
    
    let successCount = 0;
    outcomes.forEach((outcome) => {
      if (outcome.status === 'fulfilled' && outcome.value.success) {
        successCount++;
      }
    });

    console.log(`📊 Authentication completed: ${successCount}/${this.accounts.size} successful`);
    
    return results;
  }

  /**
   * Get all game accounts from all authenticated profiles
   */
  async getAllGameAccounts(): Promise<Map<string, Map<string, string>>> {
    const allGameAccounts = new Map<string, Map<string, string>>();

    for (const [profileName, profile] of this.accounts) {
      if (profile.gameAccount) {
        try {
          await profile.gameAccount.updateGameAccounts();
          const gameAccounts = profile.gameAccount.getGameAccounts();
          allGameAccounts.set(profileName, gameAccounts);
          
          console.log(`🎮 ${profileName}: ${gameAccounts.size} game accounts`);
        } catch (error) {
          console.error(`❌ Failed to get game accounts for ${profileName}:`, error);
        }
      }
    }

    return allGameAccounts;
  }

  /**
   * Generate tokens for all game accounts
   */
  async generateAllTokens(): Promise<Map<string, Map<string, string>>> {
    const allTokens = new Map<string, Map<string, string>>();

    console.log('🎟️  Generating tokens for all game accounts...');

    for (const [profileName, profile] of this.accounts) {
      if (!profile.gameAccount) continue;

      const profileTokens = new Map<string, string>();
      
      try {
        const gameAccounts = profile.gameAccount.getGameAccounts();
        
        for (const [accountId, displayName] of gameAccounts) {
          try {
            console.log(`   Generating token for ${profileName}/${displayName}...`);
            const token = await profile.gameAccount.getToken(accountId);
            
            if (token) {
              profileTokens.set(accountId, token);
              console.log(`   ✅ Token generated for ${displayName}`);
            } else {
              console.log(`   ❌ Failed to generate token for ${displayName}`);
            }
          } catch (error) {
            console.error(`   💥 Error generating token for ${displayName}:`, error);
          }
        }
        
        allTokens.set(profileName, profileTokens);
        
      } catch (error) {
        console.error(`❌ Failed to process ${profileName}:`, error);
      }
    }

    return allTokens;
  }

  /**
   * Get summary of all accounts and their status
   */
  getSummary(): void {
    console.log('\n📋 Account Summary:');
    console.log('='.repeat(50));

    for (const [profileName, profile] of this.accounts) {
      console.log(`\n👤 Profile: ${profileName}`);
      console.log(`   Email: ${profile.config.email}`);
      console.log(`   Identity: ${profile.config.identityPath}`);
      console.log(`   Proxy: ${profile.config.proxy ? `${profile.config.proxy.host}:${profile.config.proxy.port}` : 'None'}`);
      console.log(`   Authenticated: ${profile.gameAccount ? 'Yes' : 'No'}`);
      
      if (profile.gameAccount) {
        const gameAccounts = profile.gameAccount.getGameAccounts();
        console.log(`   Game Accounts: ${gameAccounts.size}`);
        
        for (const [accountId, displayName] of gameAccounts) {
          console.log(`     - ${displayName} (${accountId.substring(0, 8)}...)`);
        }
      }
    }
  }
}

/**
 * Example usage with multiple accounts and proxy configurations
 */
async function advancedExample() {
  console.log('🚀 Gameforge Authentication Library - Advanced Example\n');

  const manager = new GameforgeManager();

  // Add multiple accounts with different configurations
  manager.addAccount('main-account', 'user1@example.com', 'password1');
  
  manager.addAccount('alt-account', 'user2@example.com', 'password2', {
    proxy: {
      host: '127.0.0.1',
      port: 1080,
      username: 'proxyuser',
      password: 'proxypass'
    }
  });

  manager.addAccount('third-account', 'user3@example.com', 'password3', {
    customGamePath: '/path/to/custom/nostale/client'
  });

  // Example: Generate identity from blackbox for specific accounts
  // (You would extract these from Fiddler)
  /*
  manager.generateIdentityForProfile('main-account', 'tra:extracted-blackbox-1...');
  manager.generateIdentityForProfile('alt-account', 'tra:extracted-blackbox-2...');
  */

  // Authenticate all accounts
  const authResults = await manager.authenticateAllAccounts();

  // Get all game accounts
  const allGameAccounts = await manager.getAllGameAccounts();

  // Generate tokens for all authenticated accounts
  const allTokens = await manager.generateAllTokens();

  // Display summary
  manager.getSummary();

  // Display token summary
  console.log('\n🎟️  Token Summary:');
  console.log('='.repeat(50));
  
  for (const [profileName, tokens] of allTokens) {
    console.log(`\n👤 ${profileName}: ${tokens.size} tokens generated`);
    for (const [accountId, token] of tokens) {
      console.log(`   ${accountId.substring(0, 8)}...: ${token.substring(0, 20)}...`);
    }
  }

  return { authResults, allGameAccounts, allTokens };
}

/**
 * Example of custom identity manipulation
 */
async function customIdentityExample() {
  console.log('\n🔧 Custom Identity Example\n');

  const identityPath = path.join(__dirname, 'custom-identity.json');
  
  // Create identity with custom fingerprint data
  const identity = new Identity(identityPath);
  
  // Update identity properties
  identity.update();
  await identity.updateServerTime();
  
  // Get fingerprint data
  const fingerprint = identity.getFingerprint();
  const fingerprintData = fingerprint.json();
  
  console.log('🆔 Identity fingerprint:');
  console.log(`   Version: ${fingerprintData.v}`);
  console.log(`   OS: ${fingerprintData.osType} ${fingerprintData.osVersion}`);
  console.log(`   Resolution: ${fingerprintData.width}x${fingerprintData.height}`);
  console.log(`   Memory: ${fingerprintData.mem}MB`);
  console.log(`   Language: ${fingerprintData.lang}`);
  console.log(`   User Agent: ${fingerprintData.userAgent}`);

  // Clean up
  if (fs.existsSync(identityPath)) {
    fs.unlinkSync(identityPath);
  }
}

// Run the advanced examples
if (require.main === module) {
  advancedExample()
    .then(() => customIdentityExample())
    .then(() => {
      console.log('\n🎉 Advanced examples completed');
    })
    .catch((error) => {
      console.error('💥 Advanced example failed:', error);
    });
}

export { GameforgeManager, advancedExample, customIdentityExample };