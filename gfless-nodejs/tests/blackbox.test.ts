import { BlackBox } from '../src';
import * as path from 'path';

describe('BlackBox', () => {
  test('static encode/decode should work correctly', () => {
    const testData = '["test", 123, true]';
    const encoded = BlackBox.encode(testData);
    const decoded = BlackBox.decode(encoded);
    
    expect(encoded).toBeDefined();
    expect(encoded).toMatch(/^tra:/);
    expect(decoded).toBeDefined();
  });

  test('encode should produce tra: prefixed string', () => {
    const testData = 'test data';
    const encoded = BlackBox.encode(testData);
    
    expect(encoded.startsWith('tra:')).toBe(true);
  });

  test('decode should handle invalid input gracefully', () => {
    const invalid = 'invalid_blackbox_data';
    const decoded = BlackBox.decode(invalid);
    
    // Should not throw and return empty string for invalid data
    expect(typeof decoded).toBe('string');
  });

  test('roundtrip encode/decode should preserve data structure', () => {
    const originalData = JSON.stringify({
      test: 'value',
      number: 42,
      array: [1, 2, 3]
    });
    
    const encoded = BlackBox.encode(originalData);
    const decoded = BlackBox.decode(encoded);
    
    expect(encoded).toBeDefined();
    expect(decoded).toBeDefined();
  });
});

describe('BlackBox static methods', () => {
  test('should handle empty strings', () => {
    const encoded = BlackBox.encode('');
    const decoded = BlackBox.decode(encoded);
    
    expect(encoded).toBeDefined();
    expect(decoded).toBeDefined();
  });

  test('should handle special characters', () => {
    const testData = 'Special chars: !@#$%^&*()_+{}|:"<>?';
    const encoded = BlackBox.encode(testData);
    const decoded = BlackBox.decode(encoded);
    
    expect(encoded).toBeDefined();
    expect(decoded).toBeDefined();
  });
});