// Import the native addon
const native = require('../build/Release/gfless.node');

/**
 * Options for creating an Identity with proxy support
 */
export interface ProxyOptions {
  proxyIp?: string;
  proxyPort?: string;
  proxyUsername?: string;
  proxyPassword?: string;
  useProxy?: boolean;
}

/**
 * Fingerprint data structure
 */
export interface Fingerprint {
  v?: number;
  tz?: string;
  osType?: string;
  app?: string;
  vendor?: string;
  mem?: number;
  con?: string;
  lang?: string;
  plugins?: any[];
  gpu?: string;
  fonts?: string[];
  audioC?: number;
  width?: number;
  height?: number;
  video?: string;
  audio?: string;
  media?: any;
  permissions?: any;
  audioFP?: string;
  webglFP?: string;
  canvasFP?: string;
  creation?: string;
  uuid?: string;
  d?: number;
  osVersion?: string;
  vector?: string;
  userAgent?: string;
  serverTimeInMS?: string;
  request?: any;
}

/**
 * Identity class for managing device fingerprints
 */
export class Identity {
  private _native: any;

  constructor(filePath: string, options: ProxyOptions = {}) {
    this._native = new native.Identity(filePath, options);
  }

  /**
   * Update the identity with current timestamps and server data
   */
  update(): void {
    this._native.update();
  }

  /**
   * Get the current fingerprint data
   */
  getFingerprint(): Fingerprint {
    return this._native.getFingerprint();
  }

  /**
   * Set request data in the fingerprint
   */
  setRequest(request: any): void {
    this._native.setRequest(request);
  }
}

/**
 * BlackBox class for encoding fingerprint data
 */
export class BlackBox {
  private _native: any;

  constructor(identity: Identity, request: any = {}) {
    // Note: This is simplified - the native wrapper needs to be completed
    // to properly pass the Identity object to the C++ layer
    this._native = new native.BlackBox(identity, request);
  }

  /**
   * Get the encoded blackbox string
   */
  encoded(): string {
    return this._native.encoded();
  }

  /**
   * Static method to encode data
   */
  static encode(data: string): string {
    return native.encodeBlackBox(data);
  }

  /**
   * Static method to decode blackbox data
   */
  static decode(blackbox: string): string {
    return native.decodeBlackBox(blackbox);
  }
}

/**
 * EncryptedBlackBox class for authentication
 */
export class EncryptedBlackBox {
  private _native: any;

  constructor(
    identity: Identity,
    accountId: string,
    gsid: string,
    installationId: string
  ) {
    this._native = new native.EncryptedBlackBox(identity, accountId, gsid, installationId);
  }

  /**
   * Get the encrypted blackbox string
   */
  encrypted(): string {
    return this._native.encrypted();
  }
}

/**
 * Utility functions
 */
export class Utils {
  /**
   * Get current time in ISO format
   */
  static getCurrentTimeISO(): string {
    return native.Utils.getCurrentTimeISO();
  }

  /**
   * Get current time in milliseconds since epoch
   */
  static getCurrentTimeMs(): number {
    return native.Utils.getCurrentTimeMs();
  }

  /**
   * Generate a random string of specified length
   */
  static randomString(length: number): string {
    return native.Utils.randomString(length);
  }

  /**
   * Base64 encode a string
   */
  static base64Encode(data: string): string {
    return native.Utils.base64Encode(data);
  }

  /**
   * Base64 decode a string
   */
  static base64Decode(encoded: string): string {
    return native.Utils.base64Decode(encoded);
  }

  /**
   * URL encode a string
   */
  static urlEncode(data: string): string {
    return native.Utils.urlEncode(data);
  }

  /**
   * URL decode a string
   */
  static urlDecode(encoded: string): string {
    return native.Utils.urlDecode(encoded);
  }
}

/**
 * Cryptographic utility functions
 */
export class Crypto {
  /**
   * Calculate SHA512 hash in hexadecimal format
   */
  static sha512Hex(data: string): string {
    return native.Crypto.sha512Hex(data);
  }

  /**
   * XOR encrypt/decrypt data with a key
   */
  static xorEncrypt(data: string, key: string): string {
    return native.Crypto.xorEncrypt(data, key);
  }

  /**
   * XOR decrypt (same as encrypt since XOR is symmetric)
   */
  static xorDecrypt(data: string, key: string): string {
    return native.Crypto.xorEncrypt(data, key);
  }
}

/**
 * Get the library version
 */
export function getVersion(): string {
  return native.getVersion();
}

/**
 * Convenience function to create an Identity
 */
export function createIdentity(filePath: string, options: ProxyOptions = {}): Identity {
  return new Identity(filePath, options);
}

/**
 * Convenience function to create a BlackBox
 */
export function createBlackBox(identity: Identity, request: any = {}): BlackBox {
  return new BlackBox(identity, request);
}

/**
 * Convenience function to create an EncryptedBlackBox
 */
export function createEncryptedBlackBox(
  identity: Identity,
  accountId: string,
  gsid: string,
  installationId: string
): EncryptedBlackBox {
  return new EncryptedBlackBox(identity, accountId, gsid, installationId);
}

// Export everything
export default {
  Identity,
  BlackBox,
  EncryptedBlackBox,
  Utils,
  Crypto,
  getVersion,
  createIdentity,
  createBlackBox,
  createEncryptedBlackBox,
};