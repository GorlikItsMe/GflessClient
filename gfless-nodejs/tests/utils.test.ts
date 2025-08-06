import { Utils, Crypto } from '../src';

describe('Utils', () => {
  test('getCurrentTimeISO should return valid ISO timestamp', () => {
    const time = Utils.getCurrentTimeISO();
    expect(time).toBeDefined();
    expect(typeof time).toBe('string');
    expect(time).toMatch(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z/);
  });

  test('getCurrentTimeMs should return current timestamp in milliseconds', () => {
    const time1 = Utils.getCurrentTimeMs();
    const time2 = Date.now();
    
    expect(typeof time1).toBe('number');
    expect(Math.abs(time1 - time2)).toBeLessThan(1000); // Should be within 1 second
  });

  test('randomString should generate string of correct length', () => {
    const str1 = Utils.randomString(10);
    const str2 = Utils.randomString(10);
    
    expect(str1).toHaveLength(10);
    expect(str2).toHaveLength(10);
    expect(str1).not.toBe(str2); // Should be different
  });

  test('base64 encode/decode should work correctly', () => {
    const original = 'Hello, World!';
    const encoded = Utils.base64Encode(original);
    const decoded = Utils.base64Decode(encoded);
    
    expect(decoded).toBe(original);
    expect(encoded).toBe('SGVsbG8sIFdvcmxkIQ==');
  });

  test('URL encode/decode should work correctly', () => {
    const original = 'Hello World!@#$%';
    const encoded = Utils.urlEncode(original);
    const decoded = Utils.urlDecode(encoded);
    
    expect(decoded).toBe(original);
    expect(encoded).not.toBe(original);
  });
});

describe('Crypto', () => {
  test('sha512Hex should generate consistent hashes', () => {
    const input = 'test string';
    const hash1 = Crypto.sha512Hex(input);
    const hash2 = Crypto.sha512Hex(input);
    
    expect(hash1).toBe(hash2);
    expect(hash1).toHaveLength(128); // SHA512 hex is 128 characters
    expect(hash1).toMatch(/^[a-f0-9]+$/); // Should be hex
  });

  test('xorEncrypt/xorDecrypt should be symmetric', () => {
    const plaintext = 'Secret message';
    const key = 'encryption key';
    
    const encrypted = Crypto.xorEncrypt(plaintext, key);
    const decrypted = Crypto.xorDecrypt(encrypted, key);
    
    expect(decrypted).toBe(plaintext);
    expect(encrypted).not.toBe(plaintext);
  });
});