import { NostaleAuth } from './nostale-auth';
import { AuthResult, GameforgeAccountConfig } from './types';
export declare class GameforgeAccount {
    private email;
    private password;
    private identityPath;
    private customClientPath?;
    private auth;
    private gameAccounts;
    constructor(config: GameforgeAccountConfig);
    authenticate(): Promise<AuthResult>;
    createGameAccount(name: string, gfLang?: string): Promise<any>;
    setToken(token: string): void;
    getGameAccounts(): Map<string, string>;
    updateGameAccounts(): Promise<void>;
    getToken(accountId: string): Promise<string>;
    getEmail(): string;
    getPassword(): string;
    getIdentityPath(): string;
    getAuth(): NostaleAuth;
    getCustomClientPath(): string | undefined;
}
//# sourceMappingURL=gameforge-account.d.ts.map