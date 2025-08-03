export { Fingerprint } from './fingerprint';
export { Identity } from './identity';
export { BlackBox, EncryptedBlackBox } from './blackbox';
export { NostaleAuth } from './nostale-auth';
export { GameforgeAccount } from './gameforge-account';
export { GameAccount } from './game-account';
export { ProxyConfig, AuthResult, GameAccount as GameAccountType, FingerprintData, IdentityConfig, GameforgeAccountConfig } from './types';
export declare class GameforgeAuthUtils {
    /**
     * Generate an installation ID similar to what the Gameforge client uses
     */
    static generateInstallationId(): string;
    /**
     * Create an identity file from a blackbox string (extracted from Fiddler)
     */
    static generateIdentityFromBlackbox(blackboxString: string, outputPath: string): boolean;
}
//# sourceMappingURL=index.d.ts.map