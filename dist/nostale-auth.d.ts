import { AuthResult, ProxyConfig } from './types';
export declare class NostaleAuth {
    private static readonly GAMEFORGE_BASE_URL;
    private static readonly NOSTALE_GAME_ID;
    private identity;
    private installationId;
    private token;
    private locale;
    private chromeVersion;
    private gameforgeVersion;
    private browserUserAgent;
    private httpClient;
    constructor(identityPath: string, installationId: string, proxy?: ProxyConfig);
    private createHttpClient;
    authenticate(email: string, password: string): Promise<AuthResult>;
    getAccounts(): Promise<Map<string, string>>;
    getGameToken(accountId: string): Promise<string>;
    createGameAccount(email: string, name: string, gfLang?: string): Promise<any>;
    private sendIovation;
    private generateGsid;
    private getFirstNumber;
    private generateThirdTypeUserAgentMagic;
    getInstallationId(): string;
    setToken(token: string): void;
    getToken(): string;
}
//# sourceMappingURL=nostale-auth.d.ts.map