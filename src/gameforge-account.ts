import { NostaleAuth } from './nostale-auth';
import { AuthResult, GameAccount, GameforgeAccountConfig } from './types';

export class GameforgeAccount {
  private email: string;
  private password: string;
  private identityPath: string;
  private customClientPath?: string;
  private auth: NostaleAuth;
  private gameAccounts: Map<string, string> = new Map();

  constructor(config: GameforgeAccountConfig) {
    this.email = config.email;
    this.password = config.password;
    this.identityPath = config.identityPath;
    this.customClientPath = config.customGamePath;

    this.auth = new NostaleAuth(
      config.identityPath,
      config.installationId,
      config.proxy
    );
  }

  public async authenticate(): Promise<AuthResult> {
    const result = await this.auth.authenticate(this.email, this.password);
    
    if (result.success) {
      await this.updateGameAccounts();
    }

    return result;
  }

  public async createGameAccount(name: string, gfLang: string = 'en'): Promise<any> {
    return await this.auth.createGameAccount(this.email, name, gfLang);
  }

  public setToken(token: string): void {
    this.auth.setToken(token);
  }

  public getGameAccounts(): Map<string, string> {
    return new Map(this.gameAccounts);
  }

  public async updateGameAccounts(): Promise<void> {
    this.gameAccounts = await this.auth.getAccounts();
  }

  public async getToken(accountId: string): Promise<string> {
    return await this.auth.getToken(accountId);
  }

  public getEmail(): string {
    return this.email;
  }

  public getPassword(): string {
    return this.password;
  }

  public getIdentityPath(): string {
    return this.identityPath;
  }

  public getAuth(): NostaleAuth {
    return this.auth;
  }

  public getCustomClientPath(): string | undefined {
    return this.customClientPath;
  }
}