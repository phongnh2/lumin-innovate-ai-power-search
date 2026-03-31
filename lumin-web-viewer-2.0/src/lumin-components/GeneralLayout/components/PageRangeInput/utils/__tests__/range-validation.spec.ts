import { rangeRegex, validateRangeFormatExpression } from '../range-validation';

describe('range-validation', () => {
  describe('validateRangeExpression', () => {
    it('should return true for empty string', () => {
      expect(validateRangeFormatExpression('')).toBe(true);
    });

    it('should return true for valid single pages', () => {
      expect(validateRangeFormatExpression('1')).toBe(true);
      expect(validateRangeFormatExpression('10')).toBe(true);
      expect(validateRangeFormatExpression('999')).toBe(true);
    });

    it('should return true for valid page ranges', () => {
      expect(validateRangeFormatExpression('1-5')).toBe(true);
      expect(validateRangeFormatExpression('10-20')).toBe(true);
      expect(validateRangeFormatExpression('100-999')).toBe(true);
    });

    it('should return true for valid comma-separated values', () => {
      expect(validateRangeFormatExpression('1,2,3')).toBe(true);
      expect(validateRangeFormatExpression('1, 2, 3')).toBe(true);
      expect(validateRangeFormatExpression('1-5,10-15')).toBe(true);
      expect(validateRangeFormatExpression('1-5, 10-15')).toBe(true);
      expect(validateRangeFormatExpression('1,3-5,7')).toBe(true);
    });

    it('should return false for invalid formats', () => {
      expect(validateRangeFormatExpression('a')).toBe(false);
      expect(validateRangeFormatExpression('1-')).toBe(false);
      expect(validateRangeFormatExpression('-5')).toBe(false);
      expect(validateRangeFormatExpression('1--5')).toBe(false);
      expect(validateRangeFormatExpression('1,,')).toBe(false);
      expect(validateRangeFormatExpression(',1')).toBe(false);
      expect(validateRangeFormatExpression('1,')).toBe(false);
      expect(validateRangeFormatExpression('1 2')).toBe(false);
      expect(validateRangeFormatExpression('1.5')).toBe(false);
      expect(validateRangeFormatExpression('1-2-3')).toBe(false);
    });

    it('should return false for negative numbers', () => {
      expect(validateRangeFormatExpression('-1')).toBe(false);
      expect(validateRangeFormatExpression('1--2')).toBe(false);
    });

    it('should return true for leading zeros (regex allows them)', () => {
      expect(validateRangeFormatExpression('01')).toBe(true);
      expect(validateRangeFormatExpression('001-005')).toBe(true);
    });

    it('should handle edge cases', () => {
      expect(validateRangeFormatExpression('0')).toBe(true);
      expect(validateRangeFormatExpression('0-1')).toBe(true);
      expect(validateRangeFormatExpression('1-0')).toBe(true); // regex doesn't validate logical order
    });
  });
});
