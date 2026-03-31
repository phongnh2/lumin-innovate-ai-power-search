import numberUtils from '../numberUtils';
import { getLanguage } from '../getLanguage';

jest.mock('../getLanguage', () => ({
  getLanguage: jest.fn(),
}));

describe('numberUtils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('formatTwoDigits', () => {
    it('returns number when integer', () => {
      expect(numberUtils.formatTwoDigits(10)).toBe(10);
    });

    it('formats float to 2 digits', () => {
      expect(numberUtils.formatTwoDigits('12.345')).toBe('12.35');
    });
  });

  describe('formatDecimal', () => {
    it('formats number using locale undefined', () => {
      getLanguage.mockReturnValue(undefined);
      expect(numberUtils.formatDecimal(1000)).toBe('1,000');
    });

    it('formats number using specific locale', () => {
      getLanguage.mockReturnValue('vi');
      expect(numberUtils.formatDecimal(1000)).toBe('1.000');
    });
  });

  describe('formatTwoDigitsDecimal', () => {
    it('formats with 2 digits, locale undefined', () => {
      getLanguage.mockReturnValue(undefined);
      expect(numberUtils.formatTwoDigitsDecimal(10)).toBe('10.00');
    });

    it('formats with locale vi', () => {
      getLanguage.mockReturnValue('vi');
      expect(numberUtils.formatTwoDigitsDecimal(1234.5)).toBe('1.234,50');
    });
  });
});
