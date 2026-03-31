import { encoder } from '..';

describe('encoder', () => {
  describe('btoa (base64 encode)', () => {
    it('should encode basic ASCII strings', () => {
      const input = 'Hello World';
      const result = encoder.btoa(input);
      expect(result).toBe('SGVsbG8gV29ybGQ=');
    });

    it('should encode Unicode characters', () => {
      const input = 'Hello 世界';
      const result = encoder.btoa(input);
      // Enhanced btoa should handle Unicode properly
      expect(result).toBe('SGVsbG8g5LiW55WM');
    });

    it('should encode emojis', () => {
      const input = 'Hello 👋🌍';
      const result = encoder.btoa(input);
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });

    it('should encode empty string', () => {
      const result = encoder.btoa('');
      expect(result).toBe('');
    });

    it('should encode special characters', () => {
      const input = '!@#$%^&*()_+-=[]{}|;:,.<>?';
      const result = encoder.btoa(input);
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });

    it('should encode multiline strings', () => {
      const input = 'Line 1\nLine 2\rLine 3\r\nLine 4';
      const result = encoder.btoa(input);
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });
  });

  describe('atob (base64 decode)', () => {
    it('should decode basic ASCII strings', () => {
      const input = 'SGVsbG8gV29ybGQ=';
      const result = encoder.atob(input);
      expect(result).toBe('Hello World');
    });

    it('should decode Unicode characters', () => {
      const input = 'SGVsbG8g5LiW55WM';
      const result = encoder.atob(input);
      expect(result).toBe('Hello 世界');
    });

    it('should decode empty string', () => {
      const result = encoder.atob('');
      expect(result).toBe('');
    });

    it('should handle invalid base64 input gracefully', () => {
      expect(() => {
        encoder.atob('invalid base64!@#');
      }).toThrow();
    });
  });

  describe('round-trip encoding/decoding', () => {
    it('should preserve ASCII text through encode/decode cycle', () => {
      const original = 'Hello World! This is a test.';
      const encoded = encoder.btoa(original);
      const decoded = encoder.atob(encoded);
      expect(decoded).toBe(original);
    });

    it('should preserve Unicode text through encode/decode cycle', () => {
      const original = 'Hello 世界! Café, naïve résumé 🌍';
      const encoded = encoder.btoa(original);
      const decoded = encoder.atob(encoded);
      expect(decoded).toBe(original);
    });

    it('should preserve special characters through encode/decode cycle', () => {
      const original = '!@#$%^&*()_+-=[]{}|;:,.<>?/~`';
      const encoded = encoder.btoa(original);
      const decoded = encoder.atob(encoded);
      expect(decoded).toBe(original);
    });

    it('should preserve multiline text through encode/decode cycle', () => {
      const original = 'Line 1\nLine 2\rLine 3\r\nLine 4\tTabbed';
      const encoded = encoder.btoa(original);
      const decoded = encoder.atob(encoded);
      expect(decoded).toBe(original);
    });

    it('should preserve JSON strings through encode/decode cycle', () => {
      const original = JSON.stringify({
        name: 'Test User',
        email: 'test@example.com',
        unicode: '测试数据',
        emoji: '🚀',
        nested: { value: 123, flag: true }
      });
      const encoded = encoder.btoa(original);
      const decoded = encoder.atob(encoded);
      expect(decoded).toBe(original);
      expect(JSON.parse(decoded)).toEqual(JSON.parse(original));
    });
  });

  describe('edge cases', () => {
    it('should handle very long strings', () => {
      const longString = 'A'.repeat(10000) + '世界'.repeat(1000);
      const encoded = encoder.btoa(longString);
      const decoded = encoder.atob(encoded);
      expect(decoded).toBe(longString);
    });

    it('should handle strings with null characters', () => {
      const stringWithNull = 'Hello\0World';
      const encoded = encoder.btoa(stringWithNull);
      const decoded = encoder.atob(encoded);
      expect(decoded).toBe(stringWithNull);
    });
  });

  describe('type safety', () => {
    it('should return strings from both methods', () => {
      const encoded = encoder.btoa('test');
      const decoded = encoder.atob('dGVzdA==');
      
      expect(typeof encoded).toBe('string');
      expect(typeof decoded).toBe('string');
    });
  });
});
