import * as crypto from 'crypto';
import { Identity } from './identity';
import { FingerprintData } from './types';

export class BlackBox {
  protected static readonly BLACKBOX_FIELDS = [
    'v', 'tz', 'osType', 'app', 'vendor', 'mem', 'con', 'lang',
    'plugins', 'gpu', 'fonts', 'audioC', 'width', 'height', 'video',
    'audio', 'media', 'permissions', 'audioFP', 'webglFP', 'canvasFP',
    'creation', 'uuid', 'd', 'osVersion', 'vector', 'userAgent',
    'serverTimeInMS', 'request'
  ];

  protected identity: Identity;

  constructor(identity: Identity, request?: any) {
    this.identity = identity;
    this.identity.setRequest(request);
  }

  public encoded(): string {
    return BlackBox.encode(this.fingerprintArrayToBuffer());
  }

  public static decode(blackbox: string): Buffer {
    let decodedBlackbox = blackbox.replace(/^tra:/, '').replace(/_/g, '/').replace(/-/g, '+');
    
    // Add padding if needed
    while (decodedBlackbox.length % 4) {
      decodedBlackbox += '=';
    }
    
    const decoded = Buffer.from(decodedBlackbox, 'base64');
    const uriDecoded = Buffer.alloc(decoded.length);
    
    uriDecoded[0] = decoded[0];
    
    for (let i = 1; i < decoded.length; i++) {
      const b = decoded[i - 1];
      const a = decoded[i];
      const c = (a - b) & 0xFF; // Ensure byte range
      uriDecoded[i] = c;
    }

    const fingerprintStr = decodeURIComponent(uriDecoded.toString());
    const fingerprintArray = JSON.parse(fingerprintStr);
    const fingerprint: any = {};

    if (fingerprintArray.length !== BlackBox.BLACKBOX_FIELDS.length) {
      throw new Error('BlackBox field count mismatch');
    }

    for (let i = 0; i < BlackBox.BLACKBOX_FIELDS.length; i++) {
      fingerprint[BlackBox.BLACKBOX_FIELDS[i]] = fingerprintArray[i];
    }

    return Buffer.from(JSON.stringify(fingerprint));
  }

  public static encode(fingerprintArrayBuffer: Buffer): string {
    const uriEncoded = Buffer.from(encodeURIComponent(fingerprintArrayBuffer.toString()).replace(/[!'()*]/g, (c) => {
      return '%' + c.charCodeAt(0).toString(16).toUpperCase();
    }));

    const blackbox = Buffer.alloc(uriEncoded.length);
    blackbox[0] = uriEncoded[0];

    for (let i = 1; i < uriEncoded.length; i++) {
      const a = blackbox[i - 1];
      const b = uriEncoded[i];
      const c = (a + b) & 0xFF; // Ensure byte range
      blackbox[i] = c;
    }

    let base64 = blackbox.toString('base64');
    base64 = base64.replace(/\//g, '_').replace(/\+/g, '-').replace(/=/g, '');
    
    return 'tra:' + base64;
  }

  protected fingerprintArrayToBuffer(): Buffer {
    const fingerprintData = this.identity.getFingerprint().json();
    const fingerprintArray: any[] = [];

    for (const field of BlackBox.BLACKBOX_FIELDS) {
      fingerprintArray.push((fingerprintData as any)[field]);
    }

    return Buffer.from(JSON.stringify(fingerprintArray));
  }
}

export class EncryptedBlackBox extends BlackBox {
  private accountId: string;
  private gsid: string;

  constructor(identity: Identity, accountId: string, gsid: string, installationId: string) {
    const request = EncryptedBlackBox.createRequest(gsid, installationId);
    super(identity, request);
    this.accountId = accountId;
    this.gsid = gsid;
  }

  public encrypted(): string {
    const key = this.gsid + '-' + this.accountId;
    const keyHash = crypto.createHash('sha512').update(key).digest('hex');
    
    const blackbox = this.fingerprintArrayToBuffer();
    const encrypted = this.encrypt(blackbox, Buffer.from(keyHash, 'hex'));
    
    return encrypted.toString('base64');
  }

  private encrypt(data: Buffer, key: Buffer): Buffer {
    // Use AES-256-CBC encryption similar to the original implementation
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-cbc', key.subarray(0, 32), iv);
    
    let encrypted = cipher.update(data);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    
    return Buffer.concat([iv, encrypted]);
  }

  private static createRequest(gsid: string, installationId: string): any {
    return {
      gsid: gsid,
      installationId: installationId,
      timestamp: Date.now()
    };
  }
}