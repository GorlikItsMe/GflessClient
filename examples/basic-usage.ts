#!/usr/bin/env ts-node

import { GameforgeAccount, GameforgeAuthUtils, GameAccount } from '../src/index';
import * as path from 'path';

/**
 * Basic usage example for Gameforge Authentication Library
 * 
 * This example demonstrates:
 * 1. Setting up a Gameforge account
 * 2. Authenticating with Gameforge
 * 3. Getting game accounts
 * 4. Generating game tokens
 */

async function basicExample() {
  console.log('🎮 Gameforge Authentication Library - Basic Example\n');

  // Step 1: Generate an installation ID (like the Gameforge client)
  const installationId = GameforgeAuthUtils.generateInstallationId();
  console.log('📱 Generated installation ID:', installationId);

  // Step 2: Set up identity file path
  const identityPath = path.join(__dirname, 'identity.json');
  console.log('🆔 Identity file path:', identityPath);

  // Step 3: (Optional) Generate identity from blackbox extracted with Fiddler
  // If you have extracted a blackbox from the Gameforge client using Fiddler:
  /*
  const blackboxFromFiddler = 'tra:JVqc0...'; // Your extracted blackbox
  const success = GameforgeAuthUtils.generateIdentityFromBlackbox(blackboxFromFiddler, identityPath);
  if (success) {
    console.log('✅ Identity file generated from blackbox');
  } else {
    console.log('❌ Failed to generate identity from blackbox');
  }
  */

  // Step 4: Configure the Gameforge account
  const accountConfig = {
    email: 'your-gameforge-email@example.com',
    password: 'your-gameforge-password',
    identityPath: identityPath,
    installationId: installationId,
    // Optional: Configure proxy if needed
    // proxy: {
    //   host: '127.0.0.1',
    //   port: 1080,
    //   username: 'proxy-user',
    //   password: 'proxy-pass'
    // }
  };

  // Step 5: Create the Gameforge account instance
  const gameforgeAccount = new GameforgeAccount(accountConfig);
  console.log('🔧 Gameforge account configured');

  try {
    // Step 6: Authenticate with Gameforge
    console.log('🔐 Attempting to authenticate...');
    const authResult = await gameforgeAccount.authenticate();

    if (authResult.success) {
      console.log('✅ Authentication successful!');
      console.log('🎟️  Auth token:', authResult.token?.substring(0, 20) + '...');

      // Step 7: Get game accounts
      console.log('\n📋 Fetching game accounts...');
      const gameAccounts = gameforgeAccount.getGameAccounts();
      
      if (gameAccounts.size === 0) {
        console.log('ℹ️  No game accounts found');
        return;
      }

      console.log(`🎮 Found ${gameAccounts.size} game account(s):`);
      
      // Step 8: Generate tokens for each game account
      for (const [accountId, displayName] of gameAccounts) {
        console.log(`\n👤 Account: ${displayName} (${accountId})`);
        
        try {
          const gameToken = await gameforgeAccount.getToken(accountId);
          if (gameToken) {
            console.log('✅ Game token generated:', gameToken.substring(0, 20) + '...');
            
            // You can now use this token to connect to the game
            console.log('🎯 This token can be used to connect to the game');
          } else {
            console.log('❌ Failed to generate game token');
          }
        } catch (error) {
          console.error('❌ Error generating token:', error);
        }
      }

    } else if (authResult.captcha) {
      console.log('🤖 Captcha required - Challenge ID:', authResult.challengeId);
      console.log('ℹ️  You need to solve the captcha to continue');
      
    } else if (authResult.wrongCredentials) {
      console.log('❌ Authentication failed: Wrong credentials');
      
    } else {
      console.log('❌ Authentication failed for unknown reason');
    }

  } catch (error) {
    console.error('💥 Error during authentication:', error);
  }
}

// Example of using individual GameAccount objects
async function gameAccountExample() {
  console.log('\n🎯 Game Account Management Example\n');

  // Assuming you have an authenticated GameforgeAccount
  const accountConfig = {
    email: 'your-email@example.com',
    password: 'your-password',
    identityPath: path.join(__dirname, 'identity.json'),
    installationId: GameforgeAuthUtils.generateInstallationId()
  };

  const gameforgeAccount = new GameforgeAccount(accountConfig);
  
  // After authentication (skipped in this example)
  // const authResult = await gameforgeAccount.authenticate();

  // Create GameAccount objects for easier management
  const gameAccounts = gameforgeAccount.getGameAccounts();
  const gameAccountObjects: GameAccount[] = [];

  for (const [accountId, displayName] of gameAccounts) {
    const gameAccount = new GameAccount(
      gameforgeAccount,
      displayName,
      accountId,
      `Custom Name for ${displayName}`, // Custom display name
      0,  // Server location
      1,  // Server index
      1,  // Channel index
      0,  // Character slot
      true // Auto login
    );

    gameAccountObjects.push(gameAccount);
    
    console.log(`🎮 Game Account: ${gameAccount.getDisplayName()}`);
    console.log(`   ID: ${gameAccount.getId()}`);
    console.log(`   Server: ${gameAccount.getServer()}, Channel: ${gameAccount.getChannel()}`);
    console.log(`   Auto login: ${gameAccount.getAutoLogin()}`);
    
    // Generate token for this account
    try {
      const token = await gameAccount.getGameToken();
      console.log(`   Token: ${token ? token.substring(0, 20) + '...' : 'Failed to generate'}`);
    } catch (error) {
      console.log(`   Token: Failed - ${error}`);
    }
  }
}

// Run the examples
if (require.main === module) {
  basicExample()
    .then(() => gameAccountExample())
    .then(() => {
      console.log('\n🎉 Examples completed');
    })
    .catch((error) => {
      console.error('💥 Example failed:', error);
    });
}

export { basicExample, gameAccountExample };