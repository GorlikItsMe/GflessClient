import { BlackBox, EncryptedBlackBox } from '../blackbox';
import { Identity } from '../identity';
import { Fingerprint } from '../fingerprint';
import * as fs from 'fs';
import * as path from 'path';

describe('BlackBox', () => {
  let identity: Identity;
  let tempIdentityPath: string;

  beforeEach(() => {
    tempIdentityPath = path.join(__dirname, 'temp-identity-test.json');
    identity = new Identity(tempIdentityPath);
  });

  afterEach(() => {
    // Clean up temp files
    if (fs.existsSync(tempIdentityPath)) {
      fs.unlinkSync(tempIdentityPath);
    }
  });

  describe('encoding and decoding', () => {
    it('should encode fingerprint to blackbox string', () => {
      const blackbox = new BlackBox(identity);
      const encoded = blackbox.encoded();

      expect(encoded).toMatch(/^tra:/);
      expect(encoded).toBeTruthy();
      expect(encoded.length).toBeGreaterThan(10);
    });

    it('should decode blackbox string back to fingerprint data', () => {
      const blackbox = new BlackBox(identity);
      const encoded = blackbox.encoded();
      
      const decoded = BlackBox.decode(encoded);
      expect(decoded).toBeInstanceOf(Buffer);

      const decodedData = JSON.parse(decoded.toString());
      expect(decodedData).toHaveProperty('v');
      expect(decodedData).toHaveProperty('osType');
      expect(decodedData).toHaveProperty('userAgent');
    });

    it('should produce consistent encoding for same fingerprint', () => {
      const blackbox1 = new BlackBox(identity);
      const blackbox2 = new BlackBox(identity);

      const encoded1 = blackbox1.encoded();
      const encoded2 = blackbox2.encoded();

      // Should be different due to timestamp updates, but format should be consistent
      expect(encoded1).toMatch(/^tra:/);
      expect(encoded2).toMatch(/^tra:/);
    });

    it('should handle blackbox without tra: prefix', () => {
      const blackbox = new BlackBox(identity);
      const encoded = blackbox.encoded();
      const withoutPrefix = encoded.replace('tra:', '');

      expect(() => BlackBox.decode(withoutPrefix)).not.toThrow();
    });

    it('should encode and decode round-trip successfully', () => {
      const blackbox = new BlackBox(identity);
      const original = identity.getFingerprint().json();
      
      const encoded = blackbox.encoded();
      const decoded = BlackBox.decode(encoded);
      const decodedData = JSON.parse(decoded.toString());

      expect(decodedData.v).toBe(original.v);
      expect(decodedData.osType).toBe(original.osType);
      expect(decodedData.userAgent).toBe(original.userAgent);
    });
  });

  describe('request handling', () => {
    it('should set request data in fingerprint', () => {
      const requestData = { type: 'auth', timestamp: Date.now() };
      const blackbox = new BlackBox(identity, requestData);

      const fingerprint = identity.getFingerprint().json();
      expect(fingerprint.request).toEqual(requestData);
    });
  });

  describe('static encode/decode methods', () => {
    it('should encode buffer data correctly', () => {
      const testData = Buffer.from(JSON.stringify(['test', 'data', 123]));
      const encoded = BlackBox.encode(testData);

      expect(encoded).toMatch(/^tra:/);
      expect(encoded).toBeTruthy();
    });

    it('should handle URL-safe base64 characters', () => {
      const testData = Buffer.from('test data with special chars');
      const encoded = BlackBox.encode(testData);
      
      // Should not contain standard base64 chars that are replaced
      expect(encoded).not.toContain('/');
      expect(encoded).not.toContain('+');
      expect(encoded).not.toContain('=');
    });
  });
});

describe('EncryptedBlackBox', () => {
  let identity: Identity;
  let tempIdentityPath: string;

  beforeEach(() => {
    tempIdentityPath = path.join(__dirname, 'temp-encrypted-identity-test.json');
    identity = new Identity(tempIdentityPath);
  });

  afterEach(() => {
    if (fs.existsSync(tempIdentityPath)) {
      fs.unlinkSync(tempIdentityPath);
    }
  });

  describe('encryption', () => {
    it('should create encrypted blackbox', () => {
      const accountId = 'test-account-123';
      const gsid = 'test-gsid-456';
      const installationId = 'test-installation-789';

      const encryptedBlackbox = new EncryptedBlackBox(identity, accountId, gsid, installationId);
      const encrypted = encryptedBlackbox.encrypted();

      expect(encrypted).toBeTruthy();
      expect(encrypted.length).toBeGreaterThan(0);
      expect(() => Buffer.from(encrypted, 'base64')).not.toThrow();
    });

    it('should produce different encryption for different account IDs', () => {
      const gsid = 'test-gsid-456';
      const installationId = 'test-installation-789';

      const encrypted1 = new EncryptedBlackBox(identity, 'account1', gsid, installationId);
      const encrypted2 = new EncryptedBlackBox(identity, 'account2', gsid, installationId);

      expect(encrypted1.encrypted()).not.toBe(encrypted2.encrypted());
    });

    it('should produce different encryption for different gsids', () => {
      const accountId = 'test-account-123';
      const installationId = 'test-installation-789';

      const encrypted1 = new EncryptedBlackBox(identity, accountId, 'gsid1', installationId);
      const encrypted2 = new EncryptedBlackBox(identity, accountId, 'gsid2', installationId);

      expect(encrypted1.encrypted()).not.toBe(encrypted2.encrypted());
    });

    it('should set request data with gsid and installation ID', () => {
      const accountId = 'test-account-123';
      const gsid = 'test-gsid-456';
      const installationId = 'test-installation-789';

      new EncryptedBlackBox(identity, accountId, gsid, installationId);
      
      const fingerprint = identity.getFingerprint().json();
      expect(fingerprint.request).toHaveProperty('gsid', gsid);
      expect(fingerprint.request).toHaveProperty('installationId', installationId);
      expect(fingerprint.request).toHaveProperty('timestamp');
    });
  });

  describe('inheritance', () => {
    it('should inherit from BlackBox', () => {
      const accountId = 'test-account-123';
      const gsid = 'test-gsid-456';
      const installationId = 'test-installation-789';

      const encryptedBlackbox = new EncryptedBlackBox(identity, accountId, gsid, installationId);
      
      expect(encryptedBlackbox).toBeInstanceOf(BlackBox);
      expect(encryptedBlackbox.encoded).toBeDefined();
    });

    it('should be able to use parent methods', () => {
      const accountId = 'test-account-123';
      const gsid = 'test-gsid-456';
      const installationId = 'test-installation-789';

      const encryptedBlackbox = new EncryptedBlackBox(identity, accountId, gsid, installationId);
      const encoded = encryptedBlackbox.encoded();

      expect(encoded).toMatch(/^tra:/);
    });
  });
});