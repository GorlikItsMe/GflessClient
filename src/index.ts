// Core classes
export { Fingerprint } from './fingerprint';
export { Identity } from './identity';
export { BlackBox, EncryptedBlackBox } from './blackbox';
export { NostaleAuth } from './nostale-auth';
export { GameforgeAccount } from './gameforge-account';
export { GameAccount } from './game-account';

// Types
export {
  ProxyConfig,
  AuthResult,
  GameAccount as GameAccountType,
  FingerprintData,
  IdentityConfig,
  GameforgeAccountConfig
} from './types';

// Utility functions
export class GameforgeAuthUtils {
  /**
   * Generate an installation ID similar to what the Gameforge client uses
   */
  public static generateInstallationId(): string {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 32; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  /**
   * Create an identity file from a blackbox string (extracted from Fiddler)
   */
  public static generateIdentityFromBlackbox(blackboxString: string, outputPath: string): boolean {
    return Identity.generateIdentityFile(blackboxString, outputPath);
  }
}