import { Fingerprint } from '../fingerprint';
import { FingerprintData } from '../types';

describe('Fingerprint', () => {
  let fingerprint: Fingerprint;

  beforeEach(() => {
    fingerprint = new Fingerprint();
  });

  describe('initialization', () => {
    it('should create a fingerprint with default values', () => {
      const data = fingerprint.json();
      
      expect(data.v).toBe(7);
      expect(data.osType).toBe('Windows');
      expect(data.app).toBe('Gecko');
      expect(data.vendor).toBe('Google Inc.');
      expect(data.mem).toBe(8192);
      expect(data.con).toBe(4);
      expect(data.lang).toBe('en-US,en;q=0.9');
      expect(data.plugins).toEqual(['PDF Viewer', 'Chrome PDF Viewer', 'Chromium PDF Viewer']);
      expect(data.audioC).toBe(2);
      expect(data.width).toBe(1920);
      expect(data.height).toBe(1080);
      expect(data.osVersion).toBe('10.0');
    });

    it('should create a fingerprint with custom values', () => {
      const customData: Partial<FingerprintData> = {
        width: 1366,
        height: 768,
        mem: 4096,
        osVersion: '11.0'
      };

      const customFingerprint = new Fingerprint(customData);
      const data = customFingerprint.json();

      expect(data.width).toBe(1366);
      expect(data.height).toBe(768);
      expect(data.mem).toBe(4096);
      expect(data.osVersion).toBe('11.0');
      // Should keep default values for non-specified fields
      expect(data.osType).toBe('Windows');
      expect(data.vendor).toBe('Google Inc.');
    });
  });

  describe('vector management', () => {
    it('should update vector with current timestamp', () => {
      const originalData = fingerprint.json();
      const originalVector = originalData.vector;

      // Wait a moment to ensure different timestamp
      setTimeout(() => {
        fingerprint.updateVector();
        const updatedData = fingerprint.json();
        
        expect(updatedData.vector).not.toBe(originalVector);
        
        // Decode and check that timestamp is updated
        const vectorData = Buffer.from(updatedData.vector, 'base64').toString();
        const timestamp = parseInt(vectorData.split(' ').pop() || '0');
        expect(timestamp).toBeGreaterThan(Date.now() - 1000);
      }, 10);
    });

    it('should modify vector content when enough time has passed', () => {
      // Create a vector with old timestamp
      const oldTimestamp = Date.now() - 2000; // 2 seconds ago
      const oldVectorContent = 'test_content_12345';
      const oldVector = Buffer.from(`${oldVectorContent} ${oldTimestamp}`).toString('base64');
      
      const fingerprintWithOldVector = new Fingerprint({ vector: oldVector });
      fingerprintWithOldVector.updateVector();
      
      const newData = fingerprintWithOldVector.json();
      const newVectorData = Buffer.from(newData.vector, 'base64').toString();
      const newContent = newVectorData.split(' ')[0];
      
      expect(newContent).not.toBe(oldVectorContent);
      expect(newContent.length).toBe(oldVectorContent.length);
    });
  });

  describe('timing updates', () => {
    it('should update creation timestamp', () => {
      const originalData = fingerprint.json();
      const originalCreation = originalData.creation;

      fingerprint.updateCreation();
      const updatedData = fingerprint.json();

      expect(updatedData.creation).not.toBe(originalCreation);
      expect(new Date(updatedData.creation).getTime()).toBeGreaterThan(new Date(originalCreation).getTime());
    });

    it('should update timing values within expected range', () => {
      fingerprint.updateTimings();
      const data = fingerprint.json();

      expect(data.d).toBeGreaterThanOrEqual(150);
      expect(data.d).toBeLessThanOrEqual(300);
    });
  });

  describe('request handling', () => {
    it('should set request data', () => {
      const requestData = { test: 'data', id: 123 };
      
      fingerprint.setRequest(requestData);
      const data = fingerprint.json();

      expect(data.request).toEqual(requestData);
    });
  });

  describe('serialization', () => {
    it('should convert to JSON string', () => {
      const jsonString = fingerprint.toString();
      
      expect(() => JSON.parse(jsonString)).not.toThrow();
      
      const parsed = JSON.parse(jsonString);
      expect(parsed.v).toBe(7);
      expect(parsed.osType).toBe('Windows');
    });

    it('should return copy of internal data', () => {
      const data1 = fingerprint.json();
      const data2 = fingerprint.json();

      // Modify one copy
      data1.width = 999;

      // Should not affect the other
      expect(data2.width).not.toBe(999);
      expect(fingerprint.json().width).not.toBe(999);
    });
  });

  describe('random generation', () => {
    it('should generate unique UUIDs', () => {
      const fp1 = new Fingerprint();
      const fp2 = new Fingerprint();

      expect(fp1.json().uuid).not.toBe(fp2.json().uuid);
    });

    it('should generate unique vectors', () => {
      const fp1 = new Fingerprint();
      const fp2 = new Fingerprint();

      expect(fp1.json().vector).not.toBe(fp2.json().vector);
    });

    it('should generate unique fingerprint hashes', () => {
      const fp1 = new Fingerprint();
      const fp2 = new Fingerprint();

      expect(fp1.json().audioFP).not.toBe(fp2.json().audioFP);
      expect(fp1.json().webglFP).not.toBe(fp2.json().webglFP);
      expect(fp1.json().canvasFP).not.toBe(fp2.json().canvasFP);
    });
  });
});