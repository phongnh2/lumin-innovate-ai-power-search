import { renderHook } from '@testing-library/react';
import { useSelector } from 'react-redux';
import selectors from 'selectors';
import { useMatchPaymentRoute } from 'hooks';
import { paymentServices } from 'services';
import { PaymentUtilities } from 'utils/Factory/Payment';
import { Plans, PERIOD } from 'constants/plan';

import { usePaymentPermissions } from '../usePaymentPermissions';

jest.mock('react-redux', () => ({
  useSelector: jest.fn(),
}));

jest.mock('selectors', () => ({
  getPurchaseState: jest.fn(),
  availablePaidOrgs: jest.fn(),
}));

jest.mock('hooks', () => ({
  useMatchPaymentRoute: jest.fn(),
}));

jest.mock('services', () => ({
  paymentServices: {
    canOrganizationUpgrade: jest.fn(),
  },
}));

jest.mock('utils/Factory/Payment');

describe('usePaymentPermissions full coverage', () => {
  const mockPaymentUtils = ({
    period = PERIOD.MONTHLY,
    type = Plans.ORG_STARTER,
    isTrial = false,
    isBusiness = false,
  }) => {
    PaymentUtilities.mockImplementation(() => ({
      getPeriod: () => period,
      getType: () => type,
      isFreeTrial: () => isTrial,
      isBusiness: () => isBusiness,
    }));
  };

  beforeEach(() => {
    jest.clearAllMocks();

    useSelector.mockImplementation((fn) => {
      if (fn === selectors.getPurchaseState) return false;
      if (fn === selectors.availablePaidOrgs) return [];
      return undefined;
    });

    paymentServices.canOrganizationUpgrade.mockReturnValue(true);
  });

  it('canUpgrade = true when no joined orgs', () => {
    useMatchPaymentRoute.mockReturnValue({
      period: PERIOD.MONTHLY,
      isFreeTrial: false,
      plan: Plans.ORG_STARTER,
    });
    mockPaymentUtils({ period: PERIOD.MONTHLY, type: Plans.ORG_STARTER });

    const { result } = renderHook(() =>
      usePaymentPermissions({
        billingInfo: { organizationId: '123', quantity: 1 },
        currentOrganization: { payment: {} },
      })
    );

    expect(result.current.canUpgrade).toBe(true);
  });

  it('canUpgrade = true when upgrading from trial', () => {
    useSelector.mockReturnValue([1]);
    useMatchPaymentRoute.mockReturnValue({
      period: PERIOD.MONTHLY,
      isFreeTrial: false,
      plan: Plans.ORG_STARTER,
    });

    mockPaymentUtils({ isTrial: true });

    const { result } = renderHook(() =>
      usePaymentPermissions({
        billingInfo: { organizationId: '1', quantity: 1 },
        currentOrganization: { payment: {} },
      })
    );

    expect(result.current.canUpgrade).toBe(true);
  });

  it('old payment route → call paymentServices.canOrganizationUpgrade', () => {
    useSelector.mockImplementation((fn) => {
      if (fn === selectors.getPurchaseState) return false;
      if (fn === selectors.availablePaidOrgs) return [1];
      return undefined;
    });

    useMatchPaymentRoute.mockReturnValue({
      period: PERIOD.MONTHLY,
      isFreeTrial: false,
      plan: Plans.BUSINESS,
    });

    mockPaymentUtils({
      isBusiness: true,
      period: PERIOD.MONTHLY,
    });

    const { result } = renderHook(() =>
      usePaymentPermissions({
        billingInfo: { organizationId: '5', quantity: 10 },
        currentOrganization: { payment: {} },
      })
    );

    expect(paymentServices.canOrganizationUpgrade).toHaveBeenCalled();
    expect(result.current.canUpgrade).toBe(true);
  });

  it('new route: only higher/same plan & period allowed', () => {
    useSelector.mockImplementation((fn) => {
      if (fn === selectors.getPurchaseState) return false;
      if (fn === selectors.availablePaidOrgs) return [1];
      return undefined;
    });

    useMatchPaymentRoute.mockReturnValue({
      period: PERIOD.ANNUAL,
      plan: Plans.ORG_PRO,
      isFreeTrial: false,
    });

    mockPaymentUtils({
      period: PERIOD.MONTHLY,
      type: Plans.ORG_STARTER,
    });

    const { result } = renderHook(() =>
      usePaymentPermissions({
        billingInfo: { organizationId: '9', quantity: 1 },
        currentOrganization: { payment: {} },
      })
    );

    expect(result.current.canUpgrade).toBe(true);
  });

  it('isInputDisabled = true when isPurchasing', () => {
    useSelector.mockImplementation((fn) => {
      if (fn === selectors.getPurchaseState) return true;
      if (fn === selectors.availablePaidOrgs) return [];
      return undefined;
    });

    useMatchPaymentRoute.mockReturnValue({
      period: PERIOD.MONTHLY,
      plan: Plans.ORG_STARTER,
      isFreeTrial: false,
    });

    mockPaymentUtils({});

    const { result } = renderHook(() =>
      usePaymentPermissions({
        billingInfo: { organizationId: '1', quantity: 1 },
        currentOrganization: null,
      })
    );

    expect(result.current.isInputDisabled).toBe(true);
  });

  it('isCurrencyDisabled = true when stripe limit', () => {
    process.env.STRIPE_US_ACCOUNT_ID = 'us_123';

    useMatchPaymentRoute.mockReturnValue({
      period: PERIOD.MONTHLY,
      plan: Plans.ORG_STARTER,
      isFreeTrial: false,
    });

    mockPaymentUtils({});

    const { result } = renderHook(() =>
      usePaymentPermissions({
        billingInfo: {
          organizationId: '1',
          quantity: 1,
          stripeAccountId: 'us_123',
        },
        currentOrganization: { payment: {} },
      })
    );

    expect(result.current.isCurrencyDisabled).toBe(true);
  });

  it('isCurrencyDisabled = true when subscribed to any plan', () => {
    useMatchPaymentRoute.mockReturnValue({
      period: PERIOD.MONTHLY,
      plan: Plans.ORG_STARTER,
      isFreeTrial: false,
    });

    mockPaymentUtils({});

    useSelector.mockImplementation((fn) => {
      if (fn === selectors.getPurchaseState) return false;
      if (fn === selectors.availablePaidOrgs) return [1];
      return undefined;
    });

    const { result } = renderHook(() =>
      usePaymentPermissions({
        billingInfo: { organizationId: '44', quantity: 1 },
        currentOrganization: { payment: { type: Plans.ORG_PRO } },
      })
    );

    expect(result.current.isCurrencyDisabled).toBe(true);
  });

  it('should set plan index = 0 when plan is invalid', () => {
    useMatchPaymentRoute.mockReturnValue({
      period: PERIOD.MONTHLY,
      plan: 'INVALID_PLAN',
      isFreeTrial: false,
    });
  
    mockPaymentUtils({
      type: Plans.ORG_STARTER,
    });
  
    useSelector.mockImplementation((fn) => {
      if (fn === selectors.getPurchaseState) return false;
      if (fn === selectors.availablePaidOrgs) return [1];
      return undefined;
    });
  
    const { result } = renderHook(() =>
      usePaymentPermissions({
        billingInfo: { organizationId: 'X1', quantity: 1 },
        currentOrganization: { payment: {} },
      })
    );
  
    expect(result.current.canUpgrade).toBe(false);
  });

  it('should set period index = 0 when period is invalid', () => {
    useMatchPaymentRoute.mockReturnValue({
      period: 'UNKNOWN_PERIOD',
      plan: Plans.ORG_STARTER,
      isFreeTrial: false,
    });
  
    mockPaymentUtils({
      period: PERIOD.MONTHLY,
    });
  
    useSelector.mockImplementation((fn) => {
      if (fn === selectors.getPurchaseState) return false;
      if (fn === selectors.availablePaidOrgs) return [1];
      return undefined;
    });
  
    const { result } = renderHook(() =>
      usePaymentPermissions({
        billingInfo: { organizationId: 'X2', quantity: 1 },
        currentOrganization: { payment: {} },
      })
    );
  
    expect(result.current.canUpgrade).toBe(false);
  });
  
  it('covers stripe limit currency branch', () => {
    process.env.STRIPE_US_ACCOUNT_ID = 'us_999';
  
    useMatchPaymentRoute.mockReturnValue({
      period: PERIOD.MONTHLY,
      plan: Plans.ORG_STARTER,
      isFreeTrial: false,
    });
  
    mockPaymentUtils({});
  
    const { result } = renderHook(() =>
      usePaymentPermissions({
        billingInfo: { organizationId: '1', quantity: 1, stripeAccountId: 'us_999' },
        currentOrganization: { payment: {} },
      })
    );
  
    expect(result.current.isCurrencyDisabled).toBe(true);
  });
  
  it('covers customerRemoteId branch', () => {
    useSelector.mockImplementation((fn) => {
      if (fn === selectors.getPurchaseState) return false;
      if (fn === selectors.availablePaidOrgs) return [1];
      return undefined;
    });
  
    useMatchPaymentRoute.mockReturnValue({
      period: PERIOD.MONTHLY,
      plan: Plans.ORG_STARTER,
      isFreeTrial: false,
    });
  
    mockPaymentUtils({});
  
    const { result } = renderHook(() =>
      usePaymentPermissions({
        billingInfo: { organizationId: '2', quantity: 1 },
        currentOrganization: { payment: { type: Plans.FREE, customerRemoteId: 'cus_123' } },
      })
    );
  
    expect(result.current.isCurrencyDisabled).toBe(true);
  });
  
  it('covers old payment route early return when no currentOrganization', () => {
    useSelector.mockImplementation((fn) => {
      if (fn === selectors.getPurchaseState) return false;
      if (fn === selectors.availablePaidOrgs) return [1];
      return undefined;
    });
  
    useMatchPaymentRoute.mockReturnValue({
      period: PERIOD.MONTHLY,
      plan: Plans.BUSINESS,
      isFreeTrial: false,
    });
  
    mockPaymentUtils({});
  
    const { result } = renderHook(() =>
      usePaymentPermissions({
        billingInfo: { organizationId: '3', quantity: 1 },
        currentOrganization: null,
      })
    );
  
    expect(result.current.canUpgrade).toBe(false);
  });
  
  it('covers business + higherPeriod branch returning false', () => {
    useSelector.mockImplementation((fn) => {
      if (fn === selectors.getPurchaseState) return false;
      if (fn === selectors.availablePaidOrgs) return [1];
      return undefined;
    });
  
    useMatchPaymentRoute.mockReturnValue({
      period: PERIOD.ANNUAL,
      plan: Plans.BUSINESS,
      isFreeTrial: false,
    });
  
    mockPaymentUtils({
      isBusiness: true,
      period: PERIOD.MONTHLY,
    });
  
    const { result } = renderHook(() =>
      usePaymentPermissions({
        billingInfo: { organizationId: '4', quantity: 1 },
        currentOrganization: { payment: {} },
      })
    );
  
    expect(result.current.canUpgrade).toBe(false);
  });
});
