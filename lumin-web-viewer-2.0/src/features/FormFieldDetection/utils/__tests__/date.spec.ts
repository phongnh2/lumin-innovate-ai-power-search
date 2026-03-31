import dayjs from 'dayjs';
import { t } from 'i18next';

import { getFeatureResetTime } from '../date';

// Mock i18next
jest.mock('i18next', () => ({
  t: jest.fn((key: string) => {
    const translations: Record<string, string> = {
      'viewer.formFieldDetection.overQuotaTooltip.today': 'today',
      'viewer.formFieldDetection.overQuotaTooltip.tomorrow': 'tomorrow',
    };
    return translations[key] || key;
  }),
}));

describe('getFeatureResetTime', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('when blockTime is falsy', () => {
    it('should return empty string when blockTime is 0', () => {
      const result = getFeatureResetTime({
        blockTime: 0,
        dataUpdatedAt: 1000000,
      });

      expect(result).toBe('');
    });

    it('should return empty string when blockTime is null', () => {
      const result = getFeatureResetTime({
        blockTime: null as unknown as number,
        dataUpdatedAt: 1000000,
      });

      expect(result).toBe('');
    });

    it('should return empty string when blockTime is undefined', () => {
      const result = getFeatureResetTime({
        blockTime: undefined as unknown as number,
        dataUpdatedAt: 1000000,
      });

      expect(result).toBe('');
    });

    it('should return empty string when blockTime is NaN', () => {
      const result = getFeatureResetTime({
        blockTime: NaN,
        dataUpdatedAt: 1000000,
      });

      expect(result).toBe('');
    });
  });

  describe('when dataUpdatedAt is falsy', () => {
    it('should return empty string when dataUpdatedAt is 0', () => {
      const result = getFeatureResetTime({
        blockTime: 3600,
        dataUpdatedAt: 0,
      });

      expect(result).toBe('');
    });

    it('should return empty string when dataUpdatedAt is null', () => {
      const result = getFeatureResetTime({
        blockTime: 3600,
        dataUpdatedAt: null as unknown as number,
      });

      expect(result).toBe('');
    });

    it('should return empty string when dataUpdatedAt is undefined', () => {
      const result = getFeatureResetTime({
        blockTime: 3600,
        dataUpdatedAt: undefined as unknown as number,
      });

      expect(result).toBe('');
    });

    it('should return empty string when dataUpdatedAt is NaN', () => {
      const result = getFeatureResetTime({
        blockTime: 3600,
        dataUpdatedAt: NaN,
      });

      expect(result).toBe('');
    });
  });

  describe('when both blockTime and dataUpdatedAt are truthy', () => {
    let addSpy: jest.SpyInstance;
    let calendarSpy: jest.SpyInstance;

    beforeEach(() => {
      addSpy = jest.spyOn(dayjs.prototype, 'add');
      calendarSpy = jest.spyOn(dayjs.prototype, 'calendar');
    });

    afterEach(() => {
      addSpy.mockRestore();
      calendarSpy.mockRestore();
    });

    it('should return formatted time with "today" when sameDay', () => {
      const dataUpdatedAt = Date.now();
      const blockTime = 3600;

      // Mock the chain: dayjs().add().calendar() returns "14:30 today"
      const mockCalendarReturn = '14:30 today';
      addSpy.mockReturnThis();
      calendarSpy.mockReturnValue(mockCalendarReturn);

      const result = getFeatureResetTime({
        blockTime,
        dataUpdatedAt,
      });

      expect(addSpy).toHaveBeenCalledWith(3600, 'second');
      expect(calendarSpy).toHaveBeenCalledWith(null, {
        sameDay: 'HH:mm [today]',
        nextDay: 'HH:mm [tomorrow]',
        sameElse: 'HH:mm',
      });
      expect(result).toBe(mockCalendarReturn);
      expect(t).toHaveBeenCalledWith('viewer.formFieldDetection.overQuotaTooltip.today');
    });

    it('should return formatted time with "tomorrow" when nextDay', () => {
      const dataUpdatedAt = Date.now();
      const blockTime = 3600;

      // Mock the chain: dayjs().add().calendar() returns "14:30 tomorrow"
      const mockCalendarReturn = '14:30 tomorrow';
      addSpy.mockReturnThis();
      calendarSpy.mockReturnValue(mockCalendarReturn);

      const result = getFeatureResetTime({
        blockTime,
        dataUpdatedAt,
      });

      expect(addSpy).toHaveBeenCalledWith(3600, 'second');
      expect(calendarSpy).toHaveBeenCalledWith(null, {
        sameDay: 'HH:mm [today]',
        nextDay: 'HH:mm [tomorrow]',
        sameElse: 'HH:mm',
      });
      expect(result).toBe(mockCalendarReturn);
      expect(t).toHaveBeenCalledWith('viewer.formFieldDetection.overQuotaTooltip.tomorrow');
    });

    it('should return formatted time without suffix when sameElse', () => {
      const dataUpdatedAt = Date.now();
      const blockTime = 3600;

      // Mock the chain: dayjs().add().calendar() returns "14:30" (sameElse case)
      const mockCalendarReturn = '14:30';
      addSpy.mockReturnThis();
      calendarSpy.mockReturnValue(mockCalendarReturn);

      const result = getFeatureResetTime({
        blockTime,
        dataUpdatedAt,
      });

      expect(addSpy).toHaveBeenCalledWith(3600, 'second');
      expect(calendarSpy).toHaveBeenCalledWith(null, {
        sameDay: 'HH:mm [today]',
        nextDay: 'HH:mm [tomorrow]',
        sameElse: 'HH:mm',
      });
      expect(result).toBe(mockCalendarReturn);
      // t should not be called for sameElse case (only called during format string construction)
    });

    it('should call add with blockTime in seconds', () => {
      const dataUpdatedAt = Date.now();
      const blockTime = 7200; // 2 hours

      addSpy.mockReturnThis();
      calendarSpy.mockReturnValue('15:00');

      getFeatureResetTime({
        blockTime,
        dataUpdatedAt,
      });

      expect(addSpy).toHaveBeenCalledWith(7200, 'second');
    });

    it('should call calendar with correct format options including translated strings', () => {
      const dataUpdatedAt = Date.now();
      const blockTime = 3600;

      addSpy.mockReturnThis();
      calendarSpy.mockReturnValue('14:30 today');

      getFeatureResetTime({
        blockTime,
        dataUpdatedAt,
      });

      expect(calendarSpy).toHaveBeenCalledWith(null, {
        sameDay: 'HH:mm [today]',
        nextDay: 'HH:mm [tomorrow]',
        sameElse: 'HH:mm',
      });
      // Verify translation keys were called (called during format string construction)
      expect(t).toHaveBeenCalledWith('viewer.formFieldDetection.overQuotaTooltip.today');
      expect(t).toHaveBeenCalledWith('viewer.formFieldDetection.overQuotaTooltip.tomorrow');
    });
  });

  describe('edge cases', () => {
    it('should return empty string when both blockTime and dataUpdatedAt are falsy', () => {
      const result = getFeatureResetTime({
        blockTime: 0,
        dataUpdatedAt: 0,
      });

      expect(result).toBe('');
    });

    it('should handle negative blockTime', () => {
      const now = Date.now();
      const result = getFeatureResetTime({
        blockTime: -100,
        dataUpdatedAt: now,
      });

      // Negative blockTime is truthy (not 0, null, undefined, or NaN), so it should proceed
      expect(result).not.toBe('');
    });

    it('should handle very large blockTime values', () => {
      const now = Date.now();
      const result = getFeatureResetTime({
        blockTime: Number.MAX_SAFE_INTEGER,
        dataUpdatedAt: now,
      });

      // Large blockTime is truthy, so it should proceed
      expect(result).not.toBe('');
    });
  });
});
