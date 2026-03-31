import { formatDocumentSizeInMB } from '../documentFormatter';

describe('documentFormatter', () => {
  describe('formatDocumentSizeInMB', () => {
    it('should format 0 bytes as 0MB', () => {
      const result = formatDocumentSizeInMB(0);
      expect(result).toBe('0MB');
    });

    it('should format exactly 1 million bytes as 1MB', () => {
      // 1,000,000 bytes / 1,000,000 = 1
      const result = formatDocumentSizeInMB(1000000);
      expect(result).toBe('1MB');
    });

    it('should format half a megabyte correctly without rounding needed', () => {
      // 500,000 bytes / 1,000,000 = 0.5
      const result = formatDocumentSizeInMB(500000);
      expect(result).toBe('0.5MB');
    });

    it('should round down to 2 decimal places correctly', () => {
      // 1,234,000 bytes / 1,000,000 = 1.234 -> rounds to 1.23
      const result = formatDocumentSizeInMB(1234000);
      expect(result).toBe('1.23MB');
    });

    it('should round up to 2 decimal places correctly', () => {
      // 1,236,000 bytes / 1,000,000 = 1.236 -> rounds to 1.24
      const result = formatDocumentSizeInMB(1236000);
      expect(result).toBe('1.24MB');
    });

    it('should handle standard rounding edge case (x.xx5)', () => {
      // 1,235,000 bytes / 1,000,000 = 1.235 -> rounds to 1.24 via Math.round
      const result = formatDocumentSizeInMB(1235000);
      expect(result).toBe('1.24MB');
    });

    it('should format very large sizes correctly', () => {
      // 1,500,000,000 bytes = 1500 MB
      const result = formatDocumentSizeInMB(1500000000);
      expect(result).toBe('1500MB');
    });

    it('should return 0MB for very small byte values that round to 0', () => {
      // 100 bytes / 1,000,000 = 0.0001 -> rounds to 0
      const result = formatDocumentSizeInMB(100);
      expect(result).toBe('0MB');
    });

    it('should handle small values that round up to 0.01MB', () => {
      // 5000 bytes / 1,000,000 = 0.005 -> rounds to 0.01
      const result = formatDocumentSizeInMB(5000);
      expect(result).toBe('0.01MB');
    });

    it('should handle negative numbers gracefully (robustness check)', () => {
      const result = formatDocumentSizeInMB(-1000000);
      expect(result).toBe('-1MB');
    });

    it('should handle decimal byte inputs (though unlikely in practice)', () => {
      // 1,500,000.5 bytes -> 1.5000005 MB -> rounds to 1.5
      const result = formatDocumentSizeInMB(1500000.5);
      expect(result).toBe('1.5MB');
    });
  });
});