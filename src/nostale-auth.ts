import axios, { AxiosInstance } from 'axios';
import * as crypto from 'crypto';
import { SocksProxyAgent } from 'socks-proxy-agent';
import { Identity } from './identity';
import { BlackBox, EncryptedBlackBox } from './blackbox';
import { AuthResult, GameAccount, ProxyConfig } from './types';

export class NostaleAuth {
  private static readonly GAMEFORGE_BASE_URL = 'https://spark.gameforge.com/api/v1';
  private static readonly NOSTALE_GAME_ID = 'dd4e22d6-00d1-44b9-8126-d8b40e0cd7c9';

  private identity: Identity;
  private installationId: string;
  private token: string = '';
  private locale: string = 'en-US';
  private chromeVersion: string = '72.0.3626.121';
  private gameforgeVersion: string = '2.1.15';
  private browserUserAgent: string = 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/72.0.3626.121 Safari/537.36';
  private httpClient: AxiosInstance;

  constructor(
    identityPath: string,
    installationId: string,
    proxy?: ProxyConfig
  ) {
    this.identity = new Identity(identityPath, proxy);
    this.installationId = installationId;
    this.httpClient = this.createHttpClient(proxy);
  }

  private createHttpClient(proxy?: ProxyConfig): AxiosInstance {
    const config: any = {
      timeout: 30000,
      headers: {
        'User-Agent': this.browserUserAgent,
      },
    };

    if (proxy) {
      const proxyUrl = proxy.username 
        ? `socks5://${proxy.username}:${proxy.password}@${proxy.host}:${proxy.port}`
        : `socks5://${proxy.host}:${proxy.port}`;
      
      config.httpsAgent = new SocksProxyAgent(proxyUrl);
      config.httpAgent = new SocksProxyAgent(proxyUrl);
    }

    return axios.create(config);
  }

  public async authenticate(email: string, password: string): Promise<AuthResult> {
    try {
      this.identity.update();
      const blackbox = new BlackBox(this.identity, null);

      const response = await this.httpClient.post(`${NostaleAuth.GAMEFORGE_BASE_URL}/auth/sessions`, {
        blackbox: blackbox.encoded(),
        email: email,
        locale: this.locale,
        password: password
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': '*/*',
          'Accept-Language': 'en-US,en;q=0.9',
          'TNT-Installation-Id': this.installationId,
          'Origin': 'spark://www.gameforge.com',
          'Connection': 'keep-alive',
          'accept-encoding': 'gzip, deflate, br'
        }
      });

      if (response.status === 201) {
        this.token = response.data.token;
        return { success: true, token: this.token };
      }

      return { success: false };
    } catch (error: any) {
      if (error.response) {
        const status = error.response.status;
        
        if (status === 409) { // Captcha required
          const challengeId = error.response.headers['gf-challenge-id']?.split(';')[0];
          return { 
            success: false, 
            captcha: true, 
            challengeId: challengeId 
          };
        } else if (status === 403) { // Wrong credentials
          return { 
            success: false, 
            wrongCredentials: true 
          };
        }
      }

      return { success: false };
    }
  }

  public async getAccounts(): Promise<Map<string, string>> {
    const accounts = new Map<string, string>();

    if (!this.token) {
      return accounts;
    }

    try {
      const response = await this.httpClient.get(`${NostaleAuth.GAMEFORGE_BASE_URL}/user/accounts`, {
        headers: {
          'User-Agent': this.browserUserAgent,
          'TNT-Installation-Id': this.installationId,
          'Origin': 'spark://www.gameforge.com',
          'Authorization': `Bearer ${this.token}`,
          'Connection': 'Keep-Alive'
        }
      });

      if (response.status === 200) {
        const data = response.data;
        
        for (const key in data) {
          const accountData = data[key];
          const guls = accountData.guls;

          if (guls && guls.game === 'nostale') {
            accounts.set(accountData.id, accountData.displayName);
          }
        }
      }
    } catch (error) {
      console.error('Failed to get accounts:', error);
    }

    return accounts;
  }

  public async getToken(accountId: string): Promise<string> {
    if (!this.token) {
      return '';
    }

    try {
      // Send iovation data first
      await this.sendIovation(accountId);

      const gsid = this.generateGsid();
      this.identity.update();
      const encryptedBlackbox = new EncryptedBlackBox(this.identity, accountId, gsid, this.installationId);

      const response = await this.httpClient.post(`${NostaleAuth.GAMEFORGE_BASE_URL}/auth/thin/codes`, {
        platformGameAccountId: accountId,
        gsid: gsid,
        blackbox: encryptedBlackbox.encrypted(),
        gameId: NostaleAuth.NOSTALE_GAME_ID
      }, {
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          'User-Agent': `Chrome/${this.chromeVersion} (${this.generateThirdTypeUserAgentMagic(accountId)})`,
          'Authorization': `Bearer ${this.token}`,
          'Connection': 'Keep-Alive',
          'tnt-installation-id': this.installationId,
          'accept-encoding': 'gzip, deflate, br'
        }
      });

      if (response.status === 201) {
        return response.data.code;
      }
    } catch (error) {
      console.error('Failed to get token for account:', accountId, error);
    }

    return '';
  }

  public async createGameAccount(email: string, name: string, gfLang: string = 'en'): Promise<any> {
    if (!this.token) {
      throw new Error('Not authenticated');
    }

    try {
      const response = await this.httpClient.post(`${NostaleAuth.GAMEFORGE_BASE_URL}/user/accounts`, {
        email: email,
        name: name,
        gfLang: gfLang
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.token}`,
          'TNT-Installation-Id': this.installationId
        }
      });

      return response.data;
    } catch (error) {
      console.error('Failed to create game account:', error);
      throw error;
    }
  }

  private async sendIovation(accountId: string): Promise<boolean> {
    try {
      this.identity.update();
      const blackbox = new BlackBox(this.identity, null);

      await this.httpClient.post('https://spark.gameforge.com/api/v1/auth/iovation', {
        iov: blackbox.encoded(),
        platformGameAccountId: accountId
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.token}`,
          'TNT-Installation-Id': this.installationId
        }
      });

      return true;
    } catch (error) {
      console.error('Failed to send iovation:', error);
      return false;
    }
  }

  private generateGsid(): string {
    const uuid = crypto.randomUUID().replace(/-/g, '');
    const randomNum = Math.floor(Math.random() * (9999 - 1000) + 1000);
    return `${uuid}-${randomNum}`;
  }

  private getFirstNumber(uuid: string): string | null {
    for (const char of uuid) {
      if (/\d/.test(char)) {
        return char;
      }
    }
    return null;
  }

  private generateThirdTypeUserAgentMagic(accountId: string): string {
    const firstLetter = this.getFirstNumber(this.installationId);
    const firstTwoLettersOfAccountId = accountId.substring(0, 2);

    if (!firstLetter || parseInt(firstLetter) % 2 === 0) {
      const hashOfCert = crypto.createHash('sha256').update('dummy-cert').digest('hex');
      const hashOfVersion = crypto.createHash('sha1').update(this.chromeVersion).digest('hex');
      const hashOfInstallationId = crypto.createHash('sha256').update(this.installationId).digest('hex');
      const hashOfAccountId = crypto.createHash('sha256').update(accountId).digest('hex');
      const hashOfSum = crypto.createHash('sha1').update(hashOfCert + hashOfVersion + hashOfInstallationId + hashOfAccountId).digest('hex');

      return hashOfSum.substring(0, 8);
    } else {
      const hashOfVersion = crypto.createHash('sha256').update(this.gameforgeVersion).digest('hex');
      const hashOfInstallationId = crypto.createHash('sha1').update(this.installationId).digest('hex');
      const hashOfAccountId = crypto.createHash('sha1').update(accountId).digest('hex');
      const hashOfSum = crypto.createHash('sha256').update(hashOfVersion + hashOfInstallationId + hashOfAccountId).digest('hex');

      return hashOfSum.substring(0, 8);
    }
  }

  public getInstallationId(): string {
    return this.installationId;
  }

  public setToken(token: string): void {
    this.token = token;
  }

  public getToken(): string {
    return this.token;
  }
}