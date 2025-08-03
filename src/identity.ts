import * as fs from 'fs';
import * as path from 'path';
import { Fingerprint } from './fingerprint';
import { FingerprintData, ProxyConfig } from './types';

export class Identity {
  private filename: string;
  private fingerprint: Fingerprint;

  constructor(filePath?: string, proxy?: ProxyConfig) {
    this.filename = filePath || path.join(__dirname, '..', 'identity.json');
    this.fingerprint = this.initFingerprint(proxy);
  }

  private initFingerprint(proxy?: ProxyConfig): Fingerprint {
    let fingerprintData: Partial<FingerprintData> = {};

    // Try to load existing fingerprint from file
    if (fs.existsSync(this.filename)) {
      try {
        const fileContent = fs.readFileSync(this.filename, 'utf8');
        fingerprintData = JSON.parse(fileContent);
      } catch (error) {
        console.warn('Failed to load identity file, creating new one:', error);
      }
    }

    const fingerprint = new Fingerprint(fingerprintData, proxy);
    
    // Save the fingerprint if it's new or updated
    this.save(fingerprint);

    return fingerprint;
  }

  public update(): void {
    this.fingerprint.updateVector();
    this.fingerprint.updateCreation();
    this.fingerprint.updateTimings();
    this.save(this.fingerprint);
  }

  public async updateServerTime(): Promise<void> {
    await this.fingerprint.updateServerTime();
    this.save(this.fingerprint);
  }

  public getFingerprint(): Fingerprint {
    return this.fingerprint;
  }

  public setRequest(request: any): void {
    this.fingerprint.setRequest(request);
  }

  private save(fingerprint: Fingerprint): void {
    try {
      // Ensure directory exists
      const dir = path.dirname(this.filename);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      // Save fingerprint to file
      const data = JSON.stringify(fingerprint.json(), null, 2);
      fs.writeFileSync(this.filename, data, 'utf8');
    } catch (error) {
      console.error('Failed to save identity file:', error);
    }
  }

  public static generateIdentityFile(blackboxString: string, outputPath: string): boolean {
    try {
      // Parse blackbox to extract fingerprint data
      const decoded = this.parseBlackbox(blackboxString);
      if (!decoded) {
        return false;
      }

      // Create fingerprint from decoded data
      const fingerprint = new Fingerprint(decoded);
      
      // Ensure directory exists
      const dir = path.dirname(outputPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      // Save to file
      const data = JSON.stringify(fingerprint.json(), null, 2);
      fs.writeFileSync(outputPath, data, 'utf8');

      return true;
    } catch (error) {
      console.error('Failed to generate identity file:', error);
      return false;
    }
  }

  private static parseBlackbox(blackboxString: string): Partial<FingerprintData> | null {
    try {
      // Remove "tra:" prefix if present
      let cleanBlackbox = blackboxString.replace(/^tra:/, '');
      
      // Replace URL-safe base64 characters
      cleanBlackbox = cleanBlackbox.replace(/_/g, '/').replace(/-/g, '+');
      
      // Add padding if needed
      while (cleanBlackbox.length % 4) {
        cleanBlackbox += '=';
      }

      // Decode base64
      let decoded = Buffer.from(cleanBlackbox, 'base64');

      // Decode the differential encoding
      const uriDecoded = Buffer.alloc(decoded.length);
      uriDecoded[0] = decoded[0];

      for (let i = 1; i < decoded.length; i++) {
        const b = decoded[i - 1];
        const a = decoded[i];
        const c = a - b;
        uriDecoded[i] = c;
      }

      // URI decode
      const fingerprintStr = decodeURIComponent(uriDecoded.toString());
      
      // Parse as JSON array
      const fingerprintArray = JSON.parse(fingerprintStr);
      
      // Map array to fingerprint object
      const blackboxFields = [
        'v', 'tz', 'osType', 'app', 'vendor', 'mem', 'con', 'lang',
        'plugins', 'gpu', 'fonts', 'audioC', 'width', 'height', 'video',
        'audio', 'media', 'permissions', 'audioFP', 'webglFP', 'canvasFP',
        'creation', 'uuid', 'd', 'osVersion', 'vector', 'userAgent',
        'serverTimeInMS', 'request'
      ];

      if (fingerprintArray.length !== blackboxFields.length) {
        console.error('Blackbox field count mismatch');
        return null;
      }

      const fingerprint: Partial<FingerprintData> = {};
      for (let i = 0; i < blackboxFields.length; i++) {
        (fingerprint as any)[blackboxFields[i]] = fingerprintArray[i];
      }

      return fingerprint;
    } catch (error) {
      console.error('Failed to parse blackbox:', error);
      return null;
    }
  }
}