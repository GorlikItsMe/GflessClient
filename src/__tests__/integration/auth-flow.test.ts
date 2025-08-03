import { GameforgeAccount, NostaleAuth, GameforgeAuthUtils } from '../../index';
import * as path from 'path';
import * as fs from 'fs';

describe('Authentication Flow Integration', () => {
  let tempIdentityPath: string;
  let tempDir: string;

  beforeEach(() => {
    tempDir = path.join(__dirname, 'temp-integration');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    tempIdentityPath = path.join(tempDir, 'test-identity.json');
  });

  afterEach(() => {
    // Clean up temp files
    if (fs.existsSync(tempIdentityPath)) {
      fs.unlinkSync(tempIdentityPath);
    }
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  describe('Installation ID Generation', () => {
    it('should generate valid installation IDs', () => {
      const id1 = GameforgeAuthUtils.generateInstallationId();
      const id2 = GameforgeAuthUtils.generateInstallationId();

      expect(id1).toHaveLength(32);
      expect(id2).toHaveLength(32);
      expect(id1).not.toBe(id2);
      expect(id1).toMatch(/^[a-z0-9]+$/);
    });
  });

  describe('Identity File Generation', () => {
    it('should generate identity from valid blackbox', () => {
      // This is a mock blackbox - in real usage you'd extract this from Fiddler
      const mockBlackbox = 'tra:dGVzdCBkYXRhIGZvciBibGFja2JveCBkZWNvZGluZw';
      
      // Should not throw for this test - real blackbox would work
      expect(() => {
        GameforgeAuthUtils.generateIdentityFromBlackbox(mockBlackbox, tempIdentityPath);
      }).not.toThrow();
    });

    it('should handle invalid blackbox gracefully', () => {
      const invalidBlackbox = 'invalid-blackbox-data';
      
      const result = GameforgeAuthUtils.generateIdentityFromBlackbox(invalidBlackbox, tempIdentityPath);
      expect(result).toBe(false);
    });
  });

  describe('GameforgeAccount Authentication', () => {
    it('should create GameforgeAccount with proper configuration', () => {
      const config = {
        email: 'test@example.com',
        password: 'testpassword',
        identityPath: tempIdentityPath,
        installationId: GameforgeAuthUtils.generateInstallationId()
      };

      const account = new GameforgeAccount(config);

      expect(account.getEmail()).toBe(config.email);
      expect(account.getPassword()).toBe(config.password);
      expect(account.getIdentityPath()).toBe(config.identityPath);
      expect(account.getAuth()).toBeInstanceOf(NostaleAuth);
    });

    it('should handle authentication with mock credentials', async () => {
      const config = {
        email: 'test@example.com',
        password: 'testpassword',
        identityPath: tempIdentityPath,
        installationId: GameforgeAuthUtils.generateInstallationId()
      };

      const account = new GameforgeAccount(config);

      // This will fail with real Gameforge servers, but tests the flow
      const result = await account.authenticate();
      
      // We expect failure with test credentials, but it should not crash
      expect(result.success).toBe(false);
      expect(result).toHaveProperty('success');
    });

    it('should manage game accounts after authentication', async () => {
      const config = {
        email: 'test@example.com',
        password: 'testpassword',
        identityPath: tempIdentityPath,
        installationId: GameforgeAuthUtils.generateInstallationId()
      };

      const account = new GameforgeAccount(config);
      
      // Initially should have no game accounts
      const initialAccounts = account.getGameAccounts();
      expect(initialAccounts.size).toBe(0);

      // After failed auth, still should have no accounts
      await account.authenticate();
      const postAuthAccounts = account.getGameAccounts();
      expect(postAuthAccounts.size).toBe(0);
    });
  });

  describe('Proxy Support', () => {
    it('should create account with proxy configuration', () => {
      const config = {
        email: 'test@example.com',
        password: 'testpassword',
        identityPath: tempIdentityPath,
        installationId: GameforgeAuthUtils.generateInstallationId(),
        proxy: {
          host: '127.0.0.1',
          port: 1080,
          username: 'proxyuser',
          password: 'proxypass'
        }
      };

      const account = new GameforgeAccount(config);
      expect(account.getAuth()).toBeInstanceOf(NostaleAuth);
    });
  });

  describe('Error Handling', () => {
    it('should handle network errors gracefully', async () => {
      const config = {
        email: 'test@example.com',
        password: 'testpassword',
        identityPath: tempIdentityPath,
        installationId: GameforgeAuthUtils.generateInstallationId(),
        proxy: {
          host: 'invalid-proxy-host',
          port: 9999
        }
      };

      const account = new GameforgeAccount(config);
      
      // Should not crash on network errors
      const result = await account.authenticate();
      expect(result.success).toBe(false);
    });

    it('should handle invalid identity paths', () => {
      const config = {
        email: 'test@example.com',
        password: 'testpassword',
        identityPath: '/invalid/path/that/does/not/exist/identity.json',
        installationId: GameforgeAuthUtils.generateInstallationId()
      };

      // Should not crash when creating with invalid path
      expect(() => new GameforgeAccount(config)).not.toThrow();
    });
  });

  // Only run if test credentials are available
  if (process.env.TEST_EMAIL && process.env.TEST_PASSWORD) {
    describe('Real Authentication Tests', () => {
      it('should authenticate with real credentials', async () => {
        const config = {
          email: process.env.TEST_EMAIL!,
          password: process.env.TEST_PASSWORD!,
          identityPath: tempIdentityPath,
          installationId: GameforgeAuthUtils.generateInstallationId()
        };

        // Generate identity from test blackbox if available
        if (process.env.TEST_BLACKBOX) {
          GameforgeAuthUtils.generateIdentityFromBlackbox(
            process.env.TEST_BLACKBOX,
            tempIdentityPath
          );
        }

        const account = new GameforgeAccount(config);
        const result = await account.authenticate();

        if (result.captcha) {
          console.warn('Captcha required for test authentication');
          return;
        }

        if (result.wrongCredentials) {
          console.warn('Test credentials are incorrect');
          return;
        }

        expect(result.success).toBe(true);
        expect(result.token).toBeTruthy();

        if (result.success) {
          // Test getting game accounts
          const gameAccounts = account.getGameAccounts();
          console.log(`Found ${gameAccounts.size} game accounts`);

          // Test getting tokens for each account
          for (const [accountId, displayName] of gameAccounts) {
            console.log(`Testing token generation for account: ${displayName}`);
            const token = await account.getToken(accountId);
            expect(token).toBeTruthy();
          }
        }
      }, 30000); // 30 second timeout for real network requests
    });
  }
});