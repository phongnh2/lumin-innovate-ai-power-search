import { renderHook } from '@testing-library/react';

import useMatchPaymentRoute from '../useMatchPaymentRoute';

const mockUseParams = jest.fn();
const mockUseLocation = jest.fn();
const mockUseMatch = jest.fn();

jest.mock('react-router', () => ({
  useParams: () => mockUseParams(),
}));

jest.mock('react-router-dom', () => ({
  useMatch: (config: { path: string }) => mockUseMatch(config),
  useLocation: () => mockUseLocation(),
}));

describe('useMatchPaymentRoute', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Default mocks
    mockUseParams.mockReturnValue({});
    mockUseLocation.mockReturnValue({ search: '' });
    mockUseMatch.mockReturnValue(null);
  });

  describe('plan mapping', () => {
    it('should return undefined plan when planName param is not provided', () => {
      mockUseParams.mockReturnValue({});
      mockUseLocation.mockReturnValue({ search: '' });

      const { result } = renderHook(() => useMatchPaymentRoute());

      expect(result.current.plan).toBeUndefined();
    });

    it('should map "starter" planName to ORG_STARTER plan', () => {
      mockUseParams.mockReturnValue({ planName: 'starter', period: 'monthly' });
      mockUseLocation.mockReturnValue({ search: '' });

      const { result } = renderHook(() => useMatchPaymentRoute());

      expect(result.current.plan).toBe('ORG_STARTER');
    });

    it('should map "pro" planName to ORG_PRO plan', () => {
      mockUseParams.mockReturnValue({ planName: 'pro', period: 'annual' });
      mockUseLocation.mockReturnValue({ search: '' });

      const { result } = renderHook(() => useMatchPaymentRoute());

      expect(result.current.plan).toBe('ORG_PRO');
    });

    it('should map "business" planName to ORG_BUSINESS plan', () => {
      mockUseParams.mockReturnValue({ planName: 'business', period: 'monthly' });
      mockUseLocation.mockReturnValue({ search: '' });

      const { result } = renderHook(() => useMatchPaymentRoute());

      expect(result.current.plan).toBe('ORG_BUSINESS');
    });

    it('should map "old-business" planName to BUSINESS plan', () => {
      mockUseParams.mockReturnValue({ planName: 'old-business', period: 'monthly' });
      mockUseLocation.mockReturnValue({ search: '' });

      const { result } = renderHook(() => useMatchPaymentRoute());

      expect(result.current.plan).toBe('BUSINESS');
    });

    it('should map "free" planName to FREE plan', () => {
      mockUseParams.mockReturnValue({ planName: 'free', period: 'monthly' });
      mockUseLocation.mockReturnValue({ search: '' });

      const { result } = renderHook(() => useMatchPaymentRoute());

      expect(result.current.plan).toBe('FREE');
    });

    it('should handle case-insensitive planName matching', () => {
      mockUseParams.mockReturnValue({ planName: 'STARTER', period: 'monthly' });
      mockUseLocation.mockReturnValue({ search: '' });

      const { result } = renderHook(() => useMatchPaymentRoute());

      expect(result.current.plan).toBe('ORG_STARTER');
    });

    it('should handle mixed case planName matching', () => {
      mockUseParams.mockReturnValue({ planName: 'Pro', period: 'monthly' });
      mockUseLocation.mockReturnValue({ search: '' });

      const { result } = renderHook(() => useMatchPaymentRoute());

      expect(result.current.plan).toBe('ORG_PRO');
    });

    it('should return undefined for unrecognized planName', () => {
      mockUseParams.mockReturnValue({ planName: 'unknown-plan', period: 'monthly' });
      mockUseLocation.mockReturnValue({ search: '' });

      const { result } = renderHook(() => useMatchPaymentRoute());

      expect(result.current.plan).toBeUndefined();
    });
  });

  describe('period handling', () => {
    it('should return undefined period when not provided', () => {
      mockUseParams.mockReturnValue({ planName: 'pro' });
      mockUseLocation.mockReturnValue({ search: '' });

      const { result } = renderHook(() => useMatchPaymentRoute());

      expect(result.current.period).toBeUndefined();
    });

    it('should return uppercase MONTHLY period', () => {
      mockUseParams.mockReturnValue({ planName: 'pro', period: 'monthly' });
      mockUseLocation.mockReturnValue({ search: '' });

      const { result } = renderHook(() => useMatchPaymentRoute());

      expect(result.current.period).toBe('MONTHLY');
    });

    it('should return uppercase ANNUAL period', () => {
      mockUseParams.mockReturnValue({ planName: 'pro', period: 'annual' });
      mockUseLocation.mockReturnValue({ search: '' });

      const { result } = renderHook(() => useMatchPaymentRoute());

      expect(result.current.period).toBe('ANNUAL');
    });

    it('should convert mixed case period to uppercase', () => {
      mockUseParams.mockReturnValue({ planName: 'pro', period: 'Annual' });
      mockUseLocation.mockReturnValue({ search: '' });

      const { result } = renderHook(() => useMatchPaymentRoute());

      expect(result.current.period).toBe('ANNUAL');
    });
  });

  describe('isMonthly and isAnnual flags', () => {
    it('should set isMonthly true and isAnnual false for monthly period', () => {
      mockUseParams.mockReturnValue({ planName: 'pro', period: 'monthly' });
      mockUseLocation.mockReturnValue({ search: '' });

      const { result } = renderHook(() => useMatchPaymentRoute());

      expect(result.current.isMonthly).toBe(true);
      expect(result.current.isAnnual).toBe(false);
    });

    it('should set isAnnual true and isMonthly false for annual period', () => {
      mockUseParams.mockReturnValue({ planName: 'pro', period: 'annual' });
      mockUseLocation.mockReturnValue({ search: '' });

      const { result } = renderHook(() => useMatchPaymentRoute());

      expect(result.current.isAnnual).toBe(true);
      expect(result.current.isMonthly).toBe(false);
    });

    it('should set both isMonthly and isAnnual to false when period is undefined', () => {
      mockUseParams.mockReturnValue({ planName: 'pro' });
      mockUseLocation.mockReturnValue({ search: '' });

      const { result } = renderHook(() => useMatchPaymentRoute());

      expect(result.current.isMonthly).toBe(false);
      expect(result.current.isAnnual).toBe(false);
    });

    it('should set both isMonthly and isAnnual to false for unknown period', () => {
      mockUseParams.mockReturnValue({ planName: 'pro', period: 'weekly' });
      mockUseLocation.mockReturnValue({ search: '' });

      const { result } = renderHook(() => useMatchPaymentRoute());

      expect(result.current.isMonthly).toBe(false);
      expect(result.current.isAnnual).toBe(false);
    });
  });

  describe('isFreeTrial flag', () => {
    it('should return isFreeTrial false when not on free trial route', () => {
      mockUseParams.mockReturnValue({ planName: 'pro', period: 'monthly' });
      mockUseLocation.mockReturnValue({ search: '' });
      mockUseMatch.mockImplementation((config) => {
        if (config.path === '/payment/free-trial') return null;
        if (config.path === '/payment') return { path: '/payment' };
        return null;
      });

      const { result } = renderHook(() => useMatchPaymentRoute());

      expect(result.current.isFreeTrial).toBe(false);
    });

    it('should return isFreeTrial true when on free trial route', () => {
      mockUseParams.mockReturnValue({ planName: 'pro', period: 'monthly' });
      mockUseLocation.mockReturnValue({ search: '' });
      mockUseMatch.mockImplementation((config) => {
        if (config.path === '/payment/free-trial') return { path: '/payment/free-trial' };
        if (config.path === '/payment') return { path: '/payment' };
        return null;
      });

      const { result } = renderHook(() => useMatchPaymentRoute());

      expect(result.current.isFreeTrial).toBe(true);
    });
  });

  describe('isPaymentPage flag', () => {
    it('should return isPaymentPage false when not on payment route', () => {
      mockUseParams.mockReturnValue({});
      mockUseLocation.mockReturnValue({ search: '' });
      mockUseMatch.mockReturnValue(null);

      const { result } = renderHook(() => useMatchPaymentRoute());

      expect(result.current.isPaymentPage).toBe(false);
    });

    it('should return isPaymentPage true when on payment route', () => {
      mockUseParams.mockReturnValue({ planName: 'pro', period: 'monthly' });
      mockUseLocation.mockReturnValue({ search: '' });
      mockUseMatch.mockImplementation((config) => {
        if (config.path === '/payment') return { path: '/payment' };
        return null;
      });

      const { result } = renderHook(() => useMatchPaymentRoute());

      expect(result.current.isPaymentPage).toBe(true);
    });
  });

  describe('search string and URL params', () => {
    it('should return the search string from location', () => {
      mockUseParams.mockReturnValue({ planName: 'pro', period: 'monthly' });
      mockUseLocation.mockReturnValue({ search: '?workspace_id=123&returnUrl=/dashboard' });

      const { result } = renderHook(() => useMatchPaymentRoute());

      expect(result.current.search).toBe('?workspace_id=123&returnUrl=/dashboard');
    });

    it('should extract workspace_id as targetUrl', () => {
      mockUseParams.mockReturnValue({ planName: 'pro', period: 'monthly' });
      mockUseLocation.mockReturnValue({ search: '?workspace_id=org-123' });

      const { result } = renderHook(() => useMatchPaymentRoute());

      expect(result.current.targetUrl).toBe('org-123');
    });

    it('should return null for targetUrl when workspace_id is not present', () => {
      mockUseParams.mockReturnValue({ planName: 'pro', period: 'monthly' });
      mockUseLocation.mockReturnValue({ search: '' });

      const { result } = renderHook(() => useMatchPaymentRoute());

      expect(result.current.targetUrl).toBeNull();
    });

    it('should extract returnUrl from search params', () => {
      mockUseParams.mockReturnValue({ planName: 'pro', period: 'monthly' });
      mockUseLocation.mockReturnValue({ search: '?returnUrl=/documents/personal' });

      const { result } = renderHook(() => useMatchPaymentRoute());

      expect(result.current.returnUrl).toBe('/documents/personal');
    });

    it('should return null for returnUrl when not present', () => {
      mockUseParams.mockReturnValue({ planName: 'pro', period: 'monthly' });
      mockUseLocation.mockReturnValue({ search: '' });

      const { result } = renderHook(() => useMatchPaymentRoute());

      expect(result.current.returnUrl).toBeNull();
    });

    it('should extract promotion code from search params', () => {
      mockUseParams.mockReturnValue({ planName: 'pro', period: 'monthly' });
      mockUseLocation.mockReturnValue({ search: '?promotion=SAVE20' });

      const { result } = renderHook(() => useMatchPaymentRoute());

      expect(result.current.promotion).toBe('SAVE20');
    });

    it('should return empty string for promotion when not present', () => {
      mockUseParams.mockReturnValue({ planName: 'pro', period: 'monthly' });
      mockUseLocation.mockReturnValue({ search: '' });

      const { result } = renderHook(() => useMatchPaymentRoute());

      expect(result.current.promotion).toBe('');
    });

    it('should extract trial param from search params', () => {
      mockUseParams.mockReturnValue({ planName: 'pro', period: 'monthly' });
      mockUseLocation.mockReturnValue({ search: '?trial=30' });

      const { result } = renderHook(() => useMatchPaymentRoute());

      expect(result.current.trial).toBe('30');
    });

    it('should return null for trial when not present', () => {
      mockUseParams.mockReturnValue({ planName: 'pro', period: 'monthly' });
      mockUseLocation.mockReturnValue({ search: '' });

      const { result } = renderHook(() => useMatchPaymentRoute());

      expect(result.current.trial).toBeNull();
    });
  });

  describe('combined scenarios', () => {
    it('should handle complete payment route with all params', () => {
      mockUseParams.mockReturnValue({ planName: 'pro', period: 'annual' });
      mockUseLocation.mockReturnValue({
        search: '?workspace_id=org-456&returnUrl=/home&promotion=PROMO50&trial=14',
      });
      mockUseMatch.mockImplementation((config) => {
        if (config.path === '/payment') return { path: '/payment' };
        return null;
      });

      const { result } = renderHook(() => useMatchPaymentRoute());

      expect(result.current.plan).toBe('ORG_PRO');
      expect(result.current.period).toBe('ANNUAL');
      expect(result.current.isAnnual).toBe(true);
      expect(result.current.isMonthly).toBe(false);
      expect(result.current.isFreeTrial).toBe(false);
      expect(result.current.isPaymentPage).toBe(true);
      expect(result.current.targetUrl).toBe('org-456');
      expect(result.current.returnUrl).toBe('/home');
      expect(result.current.promotion).toBe('PROMO50');
      expect(result.current.trial).toBe('14');
    });

    it('should handle free trial route with all params', () => {
      mockUseParams.mockReturnValue({ planName: 'starter', period: 'monthly' });
      mockUseLocation.mockReturnValue({
        search: '?workspace_id=trial-org&trial=30',
      });
      mockUseMatch.mockImplementation((config) => {
        if (config.path === '/payment/free-trial') return { path: '/payment/free-trial' };
        if (config.path === '/payment') return { path: '/payment' };
        return null;
      });

      const { result } = renderHook(() => useMatchPaymentRoute());

      expect(result.current.plan).toBe('ORG_STARTER');
      expect(result.current.period).toBe('MONTHLY');
      expect(result.current.isMonthly).toBe(true);
      expect(result.current.isAnnual).toBe(false);
      expect(result.current.isFreeTrial).toBe(true);
      expect(result.current.isPaymentPage).toBe(true);
      expect(result.current.targetUrl).toBe('trial-org');
      expect(result.current.trial).toBe('30');
    });

    it('should handle non-payment page correctly', () => {
      mockUseParams.mockReturnValue({});
      mockUseLocation.mockReturnValue({ search: '' });
      mockUseMatch.mockReturnValue(null);

      const { result } = renderHook(() => useMatchPaymentRoute());

      expect(result.current.plan).toBeUndefined();
      expect(result.current.period).toBeUndefined();
      expect(result.current.isMonthly).toBe(false);
      expect(result.current.isAnnual).toBe(false);
      expect(result.current.isFreeTrial).toBe(false);
      expect(result.current.isPaymentPage).toBe(false);
      expect(result.current.targetUrl).toBeNull();
      expect(result.current.returnUrl).toBeNull();
      expect(result.current.promotion).toBe('');
      expect(result.current.trial).toBeNull();
      expect(result.current.search).toBe('');
    });
  });

  describe('edge cases', () => {
    it('should handle empty string planName', () => {
      mockUseParams.mockReturnValue({ planName: '', period: 'monthly' });
      mockUseLocation.mockReturnValue({ search: '' });

      const { result } = renderHook(() => useMatchPaymentRoute());

      expect(result.current.plan).toBeUndefined();
    });

    it('should handle special characters in search params', () => {
      mockUseParams.mockReturnValue({ planName: 'pro', period: 'monthly' });
      mockUseLocation.mockReturnValue({
        search: '?returnUrl=%2Fdocuments%2Fpersonal&promotion=SAVE%2620',
      });

      const { result } = renderHook(() => useMatchPaymentRoute());

      expect(result.current.returnUrl).toBe('/documents/personal');
      expect(result.current.promotion).toBe('SAVE&20');
    });

    it('should handle multiple same-name params (takes first value)', () => {
      mockUseParams.mockReturnValue({ planName: 'pro', period: 'monthly' });
      mockUseLocation.mockReturnValue({
        search: '?promotion=FIRST&promotion=SECOND',
      });

      const { result } = renderHook(() => useMatchPaymentRoute());

      expect(result.current.promotion).toBe('FIRST');
    });
  });
});

