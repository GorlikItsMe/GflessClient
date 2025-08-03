import axios, { AxiosInstance } from 'axios';
import { SocksProxyAgent } from 'socks-proxy-agent';
import { HttpsProxyAgent } from 'https-proxy-agent';
import { FingerprintData, ProxyConfig } from './types';

export class Fingerprint {
  private static readonly VERSION = 7;
  private static readonly UUID_LENGTH = 27;
  private static readonly VECTOR_LENGTH = 100;
  private static readonly SERVER_FILE_GAME1_FILE = 'https://gameforge.com/tra/game1.js';

  private fingerprint: FingerprintData;
  private proxy?: ProxyConfig;
  private httpClient: AxiosInstance;

  constructor(fingerprint: Partial<FingerprintData> = {}, proxy?: ProxyConfig) {
    this.proxy = proxy;
    this.fingerprint = this.initializeFingerprint(fingerprint);
    this.httpClient = this.createHttpClient();
  }

  private createHttpClient(): AxiosInstance {
    const config: any = {
      timeout: 30000,
      headers: {
        'User-Agent': this.fingerprint.userAgent,
      },
    };

    if (this.proxy) {
      const proxyUrl = this.proxy.username 
        ? `socks5://${this.proxy.username}:${this.proxy.password}@${this.proxy.host}:${this.proxy.port}`
        : `socks5://${this.proxy.host}:${this.proxy.port}`;
      
      config.httpsAgent = new SocksProxyAgent(proxyUrl);
      config.httpAgent = new SocksProxyAgent(proxyUrl);
    }

    return axios.create(config);
  }

  private initializeFingerprint(partial: Partial<FingerprintData>): FingerprintData {
    const now = new Date();
    const timezone = -now.getTimezoneOffset();
    
    return {
      v: Fingerprint.VERSION,
      tz: timezone,
      osType: 'Windows',
      app: 'Gecko',
      vendor: 'Google Inc.',
      mem: 8192,
      con: 4,
      lang: 'en-US,en;q=0.9',
      plugins: ['PDF Viewer', 'Chrome PDF Viewer', 'Chromium PDF Viewer'],
      gpu: 'ANGLE (NVIDIA GeForce GTX 1060 6GB Direct3D11 vs_5_0 ps_5_0)',
      fonts: ['Arial', 'Calibri', 'Cambria', 'Comic Sans MS', 'Courier', 'Georgia', 'Impact', 'Times New Roman', 'Trebuchet MS', 'Verdana'],
      audioC: 2,
      width: 1920,
      height: 1080,
      video: 'probably',
      audio: 'probably',
      media: 'probably',
      permissions: 'granted',
      audioFP: this.generateRandomString(32),
      webglFP: this.generateRandomString(64),
      canvasFP: this.generateRandomString(48),
      creation: now.toISOString(),
      uuid: this.generateUuid(),
      d: Math.floor(Math.random() * (300 - 150) + 150),
      osVersion: '10.0',
      vector: this.generateVector(),
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/72.0.3626.121 Safari/537.36',
      serverTimeInMS: now.toISOString(),
      ...partial
    };
  }

  public json(): FingerprintData {
    return { ...this.fingerprint };
  }

  public toString(): string {
    return JSON.stringify(this.fingerprint);
  }

  public updateVector(): void {
    const currentTimeMs = Date.now();
    const vectorData = Buffer.from(this.fingerprint.vector, 'base64').toString();
    const lastSpaceIndex = vectorData.lastIndexOf(' ');
    let content = vectorData.substring(0, lastSpaceIndex);
    const oldTime = parseInt(vectorData.substring(lastSpaceIndex + 1));

    if (oldTime + 1000 < currentTimeMs) {
      content = content.substring(1) + this.randomAsciiCharacter();
    }

    const newVector = content + ' ' + currentTimeMs;
    this.fingerprint.vector = Buffer.from(newVector).toString('base64');
  }

  public updateCreation(): void {
    this.fingerprint.creation = new Date().toISOString();
  }

  public async updateServerTime(): Promise<void> {
    try {
      const serverDate = await this.getServerDate();
      this.fingerprint.serverTimeInMS = serverDate;
    } catch (error) {
      // Fallback to current time if server request fails
      this.fingerprint.serverTimeInMS = new Date().toISOString();
    }
  }

  public updateTimings(): void {
    this.fingerprint.d = Math.floor(Math.random() * (300 - 150) + 150);
  }

  public setRequest(request: any): void {
    this.fingerprint.request = request;
  }

  private generateUuid(): string {
    const str = this.generateRandomString(Fingerprint.UUID_LENGTH);
    return Buffer.from(str).toString('base64').toLowerCase();
  }

  private generateVector(): string {
    const str = this.generateRandomString(Fingerprint.VECTOR_LENGTH);
    const time = Date.now();
    const vec = str + ' ' + time;
    return Buffer.from(vec).toString('base64');
  }

  private randomAsciiCharacter(): string {
    return String.fromCharCode(Math.floor(Math.random() * (126 - 32) + 32));
  }

  private generateRandomString(size: number): string {
    let str = '';
    for (let i = 0; i < size; i++) {
      str += this.randomAsciiCharacter();
    }
    return str;
  }

  private async getServerDate(): Promise<string> {
    try {
      const response = await this.httpClient.get(Fingerprint.SERVER_FILE_GAME1_FILE);
      const dateHeader = response.headers.date;
      
      if (dateHeader) {
        const date = new Date(dateHeader);
        return date.toISOString();
      }
      
      return new Date().toISOString();
    } catch (error) {
      return new Date().toISOString();
    }
  }
}