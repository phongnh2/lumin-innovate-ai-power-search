import { renderHook } from '@testing-library/react';
import { useTranslation } from 'react-i18next';
import { useFormFieldDetectionUsage } from '../useFormFieldDetectionUsage';
import { useShallowSelector } from 'hooks/useShallowSelector';

jest.mock('react-i18next', () => ({
  useTranslation: jest.fn(),
}));

jest.mock('hooks/useShallowSelector', () => ({
  useShallowSelector: jest.fn(),
}));

const mockGetFeatureResetTime = jest.fn();

jest.mock('../../utils/date', () => ({
  getFeatureResetTime: (...args: any[]) => mockGetFeatureResetTime(...args),
}));

describe('useFormFieldDetectionUsage', () => {
  const mockT = jest.fn((key: string, options?: Record<string, any>) => {
    if (key === 'viewer.formFieldDetection.overQuotaTooltip.message') {
      return `Over quota message. Reset time: ${options?.resetTime || ''}`;
    }
    return key;
  });

  beforeEach(() => {
    jest.clearAllMocks();
    (useTranslation as jest.Mock).mockReturnValue({ t: mockT });
    mockGetFeatureResetTime.mockReturnValue('2024-01-01 12:00');
  });

  describe('when user is over FFD quota', () => {
    it('should return isOverFFDQuota as true and generate overFFDQuotaMessage with resetTime', () => {
      const mockCurrentUser = {
        toolQuota: {
          formFieldDetection: {
            blockTime: 3600,
            isExceeded: true,
          },
        },
      };

      (useShallowSelector as jest.Mock).mockReturnValue(mockCurrentUser);

      const { result } = renderHook(() => useFormFieldDetectionUsage());

      expect(result.current.isOverFFDQuota).toBe(true);
      expect(result.current.isLoadingFFDUsage).toBe(false);
      expect(result.current.overFFDQuotaMessage).toBeTruthy();
      expect(result.current.overFFDQuotaMessage).toContain('Reset time:');
      expect(mockGetFeatureResetTime).toHaveBeenCalledWith({
        blockTime: 3600,
        dataUpdatedAt: expect.any(Number),
      });
      expect(mockT).toHaveBeenCalledWith(
        'viewer.formFieldDetection.overQuotaTooltip.message',
        expect.objectContaining({
          resetTime: '2024-01-01 12:00',
        })
      );
    });

    it('should handle null blockTime when user is over quota', () => {
      const mockCurrentUser = {
        toolQuota: {
          formFieldDetection: {
            blockTime: null as number | null,
            isExceeded: true,
          },
        },
      };

      (useShallowSelector as jest.Mock).mockReturnValue(mockCurrentUser);
      mockGetFeatureResetTime.mockReturnValue('');

      const { result } = renderHook(() => useFormFieldDetectionUsage());

      expect(result.current.isOverFFDQuota).toBe(true);
      expect(result.current.overFFDQuotaMessage).toBeTruthy();
      expect(mockGetFeatureResetTime).toHaveBeenCalledWith({
        blockTime: null,
        dataUpdatedAt: expect.any(Number),
      });
      expect(mockT).toHaveBeenCalledWith(
        'viewer.formFieldDetection.overQuotaTooltip.message',
        expect.objectContaining({
          resetTime: '',
        })
      );
    });

    it('should handle undefined blockTime when user is over quota', () => {
      const mockCurrentUser = {
        toolQuota: {
          formFieldDetection: {
            isExceeded: true,
          },
        },
      };

      (useShallowSelector as jest.Mock).mockReturnValue(mockCurrentUser);
      mockGetFeatureResetTime.mockReturnValue('');

      const { result } = renderHook(() => useFormFieldDetectionUsage());

      expect(result.current.isOverFFDQuota).toBe(true);
      expect(result.current.overFFDQuotaMessage).toBeTruthy();
      expect(mockGetFeatureResetTime).toHaveBeenCalledWith({
        blockTime: null,
        dataUpdatedAt: expect.any(Number),
      });
    });

    it('should handle zero blockTime when user is over quota', () => {
      const mockCurrentUser = {
        toolQuota: {
          formFieldDetection: {
            blockTime: 0,
            isExceeded: true,
          },
        },
      };

      (useShallowSelector as jest.Mock).mockReturnValue(mockCurrentUser);
      mockGetFeatureResetTime.mockReturnValue('');

      const { result } = renderHook(() => useFormFieldDetectionUsage());

      expect(result.current.isOverFFDQuota).toBe(true);
      expect(result.current.overFFDQuotaMessage).toBeTruthy();
      expect(mockGetFeatureResetTime).toHaveBeenCalledWith({
        blockTime: 0,
        dataUpdatedAt: expect.any(Number),
      });
    });
  });

  describe('when user is not over FFD quota', () => {
    it('should return isOverFFDQuota as false and empty overFFDQuotaMessage', () => {
      const mockCurrentUser = {
        toolQuota: {
          formFieldDetection: {
            blockTime: 3600,
            isExceeded: false,
          },
        },
      };

      (useShallowSelector as jest.Mock).mockReturnValue(mockCurrentUser);

      const { result } = renderHook(() => useFormFieldDetectionUsage());

      expect(result.current.isOverFFDQuota).toBe(false);
      expect(result.current.isLoadingFFDUsage).toBe(false);
      expect(result.current.overFFDQuotaMessage).toBe('');
      expect(mockGetFeatureResetTime).not.toHaveBeenCalled();
      expect(mockT).not.toHaveBeenCalledWith(
        'viewer.formFieldDetection.overQuotaTooltip.message',
        expect.any(Object)
      );
    });

    it('should return empty message when isExceeded is undefined', () => {
      const mockCurrentUser = {
        toolQuota: {
          formFieldDetection: {
            blockTime: 3600,
          },
        },
      };

      (useShallowSelector as jest.Mock).mockReturnValue(mockCurrentUser);

      const { result } = renderHook(() => useFormFieldDetectionUsage());

      expect(result.current.isOverFFDQuota).toBe(false);
      expect(result.current.overFFDQuotaMessage).toBe('');
      expect(mockGetFeatureResetTime).not.toHaveBeenCalled();
    });
  });

  describe('when user data structure is incomplete', () => {
    it('should handle missing toolQuota', () => {
      const mockCurrentUser = {};

      (useShallowSelector as jest.Mock).mockReturnValue(mockCurrentUser);

      const { result } = renderHook(() => useFormFieldDetectionUsage());

      expect(result.current.isOverFFDQuota).toBe(false);
      expect(result.current.overFFDQuotaMessage).toBe('');
      expect(result.current.isLoadingFFDUsage).toBe(false);
    });

    it('should handle missing formFieldDetection', () => {
      const mockCurrentUser = {
        toolQuota: {},
      };

      (useShallowSelector as jest.Mock).mockReturnValue(mockCurrentUser);

      const { result } = renderHook(() => useFormFieldDetectionUsage());

      expect(result.current.isOverFFDQuota).toBe(false);
      expect(result.current.overFFDQuotaMessage).toBe('');
    });

    it('should handle null currentUser', () => {
      (useShallowSelector as jest.Mock).mockReturnValue(null);

      const { result } = renderHook(() => useFormFieldDetectionUsage());

      expect(result.current.isOverFFDQuota).toBe(false);
      expect(result.current.overFFDQuotaMessage).toBe('');
      expect(result.current.isLoadingFFDUsage).toBe(false);
    });
  });

  describe('memoization behavior', () => {
    it('should recompute overFFDQuotaMessage when blockTime changes', () => {
      const mockCurrentUser1 = {
        toolQuota: {
          formFieldDetection: {
            blockTime: 3600,
            isExceeded: true,
          },
        },
      };

      const mockCurrentUser2 = {
        toolQuota: {
          formFieldDetection: {
            blockTime: 7200,
            isExceeded: true,
          },
        },
      };

      (useShallowSelector as jest.Mock).mockReturnValue(mockCurrentUser1);

      const { result, rerender } = renderHook(() => useFormFieldDetectionUsage());

      expect(mockGetFeatureResetTime).toHaveBeenCalledWith({
        blockTime: 3600,
        dataUpdatedAt: expect.any(Number),
      });

      jest.clearAllMocks();

      (useShallowSelector as jest.Mock).mockReturnValue(mockCurrentUser2);
      rerender();

      expect(mockGetFeatureResetTime).toHaveBeenCalledWith({
        blockTime: 7200,
        dataUpdatedAt: expect.any(Number),
      });
    });

    it('should recompute overFFDQuotaMessage when isOverFFDQuota changes', () => {
      const mockCurrentUser1 = {
        toolQuota: {
          formFieldDetection: {
            blockTime: 3600,
            isExceeded: false,
          },
        },
      };

      const mockCurrentUser2 = {
        toolQuota: {
          formFieldDetection: {
            blockTime: 3600,
            isExceeded: true,
          },
        },
      };

      (useShallowSelector as jest.Mock).mockReturnValue(mockCurrentUser1);

      const { result, rerender } = renderHook(() => useFormFieldDetectionUsage());

      expect(result.current.overFFDQuotaMessage).toBe('');

      (useShallowSelector as jest.Mock).mockReturnValue(mockCurrentUser2);
      rerender();

      expect(result.current.overFFDQuotaMessage).toBeTruthy();
      expect(result.current.overFFDQuotaMessage).toContain('Reset time:');
    });
  });

  describe('return value structure', () => {
    it('should always return isLoadingFFDUsage as false', () => {
      const mockCurrentUser = {
        toolQuota: {
          formFieldDetection: {
            blockTime: 3600,
            isExceeded: true,
          },
        },
      };

      (useShallowSelector as jest.Mock).mockReturnValue(mockCurrentUser);

      const { result } = renderHook(() => useFormFieldDetectionUsage());

      expect(result.current).toHaveProperty('isOverFFDQuota');
      expect(result.current).toHaveProperty('overFFDQuotaMessage');
      expect(result.current).toHaveProperty('isLoadingFFDUsage');
      expect(result.current.isLoadingFFDUsage).toBe(false);
    });
  });
});

