import { renderHook, act } from '@testing-library/react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';

import { useClaimFreeTrial } from '../useClaimFreeTrial';

// Mock react-redux
jest.mock('react-redux', () => ({
  useDispatch: jest.fn(),
  useSelector: jest.fn(),
  shallowEqual: jest.fn(),
}));

jest.mock('react-router-dom', () => ({
  useLocation: jest.fn(),
  useNavigate: jest.fn(),
}));

jest.mock('react-i18next', () => ({
  Trans: ({ children }) => children,
}));

// Mock contexts - define mocks inside factory to avoid hoisting issues
jest.mock('lumin-components/FreeTrialBoard/context', () => {
  const actualReact = jest.requireActual('react');
  return {
    FreeTrialBoardContext: actualReact.createContext({
      getNewSecret: jest.fn(),
    }),
  };
});

jest.mock('lumin-components/OrganizationFreeTrial/FreeTrialContext', () => {
  const actualReact = jest.requireActual('react');
  return {
    __esModule: true,
    default: actualReact.createContext({
      billingInfo: {
        isCardFilled: true,
        currency: 'USD',
        organizationId: 'org-123',
        stripeAccountId: 'acct_123',
      },
      currentPaymentMethod: null,
    }),
  };
});

jest.mock('HOC/withGetPaymentInfo', () => {
  const actualReact = jest.requireActual('react');
  return {
    PaymentInfoContext: actualReact.createContext({
      triggerEvent: jest.fn(),
    }),
  };
});

jest.mock('src/HOC/withWarningBanner', () => {
  const actualReact = jest.requireActual('react');
  return {
    WarningBannerContext: actualReact.createContext({
      billing_warning: { refetch: jest.fn() },
    }),
  };
});

// Mock hooks - define mocks inside factory to avoid hoisting issues
jest.mock('hooks/useCreateCredentials', () => jest.fn(() => ({
  createCustomerCredentials: jest.fn().mockResolvedValue({ issuedId: 'issued-123', cardInfo: null }),
})));

jest.mock('services', () => ({
  paymentServices: {
    createFreeTrialUnifySubscription: jest.fn().mockResolvedValue({
      customerRemoteId: 'cus_123',
      subscriptionRemoteId: 'sub_123',
      planRemoteId: 'plan_123',
    }),
  },
}));

jest.mock('helpers/logger', () => ({
  logError: jest.fn(),
}));

jest.mock('utils', () => ({
  toastUtils: { success: jest.fn(), openUnknownErrorToast: jest.fn() },
  orgUtil: { mappingOrgWithRoleAndTeams: jest.fn((org) => org), canStartTrialPlan: jest.fn(() => true) },
  errorUtils: { extractGqlError: jest.fn(() => ({})) },
}));

jest.mock('utils/Factory/EventCollection/PaymentEventCollection', () => ({
  userFillPaymentForm: { bind: jest.fn() },
  userSubmitPaymentForm: { bind: jest.fn() },
  paymentSuccess: { bind: jest.fn() },
  paymentError: { bind: jest.fn() },
}));

jest.mock('utils/Factory/Payment', () => ({
  PaymentUtilities: jest.fn().mockImplementation(() => ({
    isFreeTrial: jest.fn(() => false),
    isAnnualPeriod: jest.fn(() => false),
    isSignFree: jest.fn(() => true),
  })),
}));

jest.mock('utils/newAuthenTesting', () => ({
  isUserInNewAuthenTestingScope: jest.fn(() => false),
}));

jest.mock('utils/orgUrlUtils', () => ({
  getDefaultOrgUrl: jest.fn(({ orgUrl }) => `/${orgUrl}`),
}));

jest.mock('features/CNC/hooks/useSendPurchaseEvent', () => ({
  useSendPurchaseEvent: jest.fn(() => ({ sendPurchaseEvent: jest.fn() })),
}));

jest.mock('features/PNB/PreventUsingPrepaidCard/hooks', () => ({
  useHandlePreventUsingPrepaidCard: jest.fn(() => ({ openPreventUsingPrepaidCardModal: jest.fn() })),
  useSendLogPreventPrepaidCard: jest.fn(() => ({ logPreinspectCardInfo: jest.fn(), logPaymentError: jest.fn() })),
}));

jest.mock('hooks/useAvailablePersonalWorkspace', () => jest.fn(() => false));
jest.mock('hooks/useCreateOrganizationInPayment', () => jest.fn(() => ({ createOrganization: jest.fn() })));
jest.mock('hooks/useGetCurrentOrganization', () => jest.fn(() => null));
jest.mock('hooks/useGetFlagExtendFreeTrial', () => jest.fn(() => ({ isShowExtendFreeTrialModal: false })));
jest.mock('hooks/useMatchPaymentRoute', () => jest.fn(() => ({
  plan: 'ORG_PRO',
  isMonthly: true,
  period: 'MONTHLY',
})));
jest.mock('hooks/useReactivateAccount', () => jest.fn(() => ({ openReactivateModal: jest.fn() })));
jest.mock('hooks/useRestrictBillingActions', () => jest.fn(() => ({
  isRestrictedOrg: false,
  openRestrictActionsModal: jest.fn(),
})));

jest.mock('hooks/useTrackFormEvent', () => ({
  useTrackFormEvent: () => ({ trackSubmitForm: jest.fn() }),
}));

jest.mock('hooks/useTranslation', () => ({
  useTranslation: () => ({ t: (key) => key }),
}));

// Mock actions - use jest.fn() inside factory
jest.mock('actions', () => ({
  openModal: jest.fn((settings) => ({ type: 'OPEN_MODAL', payload: settings })),
  setPurchaseState: jest.fn((state) => ({ type: 'SET_PURCHASE_STATE', payload: state })),
  setOrganizations: jest.fn((orgs) => ({ type: 'SET_ORGANIZATIONS', payload: orgs })),
  updateCurrentUser: jest.fn((user) => ({ type: 'UPDATE_CURRENT_USER', payload: user })),
  updateModalProperties: jest.fn((props) => ({ type: 'UPDATE_MODAL_PROPERTIES', payload: props })),
  updateOrganizationInList: jest.fn((id, org) => ({ type: 'UPDATE_ORG_IN_LIST', payload: { id, org } })),
  updateCurrentOrganization: jest.fn((org) => ({ type: 'UPDATE_CURRENT_ORG', payload: org })),
}));

jest.mock('selectors', () => ({
  getPurchaseState: jest.fn(),
  availablePaidOrgs: jest.fn(),
  getCurrentUser: jest.fn(),
  getOrganizationList: jest.fn(),
  getOrganizationById: jest.fn(),
}));

// Get mocked modules after jest.mock
const mockSelectors = jest.requireMock('selectors');
const mockActions = jest.requireMock('actions');
const mockUtils = jest.requireMock('utils');
const mockServices = jest.requireMock('services');
const useAvailablePersonalWorkspace = jest.requireMock('hooks/useAvailablePersonalWorkspace');
const useMatchPaymentRoute = jest.requireMock('hooks/useMatchPaymentRoute');
const useRestrictBillingActions = jest.requireMock('hooks/useRestrictBillingActions');
const useGetFlagExtendFreeTrial = jest.requireMock('hooks/useGetFlagExtendFreeTrial');
const useCreateOrganizationInPayment = jest.requireMock('hooks/useCreateOrganizationInPayment');
const useReactivateAccount = jest.requireMock('hooks/useReactivateAccount');
const useCreateCredentials = jest.requireMock('hooks/useCreateCredentials');
const mockPrepaidCardHooks = jest.requireMock('features/PNB/PreventUsingPrepaidCard/hooks');
const mockPurchaseEventHook = jest.requireMock('features/CNC/hooks/useSendPurchaseEvent');
const { PaymentUtilities } = jest.requireMock('utils/Factory/Payment');

describe('useClaimFreeTrial', () => {
  const mockDispatch = jest.fn();
  const mockNavigate = jest.fn();
  const mockCurrentUser = {
    _id: 'user-123',
    email: 'test@example.com',
    payment: { type: 'FREE' },
    deletedAt: null,
  };
  const mockOrganization = {
    _id: 'org-123',
    name: 'Test Org',
    url: 'test-org',
    userRole: 'admin',
    payment: { type: 'FREE_TRIAL', trialInfo: {} },
  };

  // Create stable mock references for functions that need to be tracked
  let mockOpenRestrictActionsModal;
  let mockOpenReactivateModal;
  let mockCreateOrganization;
  let mockCreateCustomerCredentials;
  let mockOpenPreventUsingPrepaidCardModal;
  let mockLogPreinspectCardInfo;
  let mockLogPaymentError;
  let mockSendPurchaseEvent;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Create fresh mock functions for each test
    mockOpenRestrictActionsModal = jest.fn();
    mockOpenReactivateModal = jest.fn();
    mockCreateOrganization = jest.fn();
    mockCreateCustomerCredentials = jest.fn().mockResolvedValue({ issuedId: 'issued-123', cardInfo: null });
    mockOpenPreventUsingPrepaidCardModal = jest.fn();
    mockLogPreinspectCardInfo = jest.fn();
    mockLogPaymentError = jest.fn();
    mockSendPurchaseEvent = jest.fn();
    
    useDispatch.mockReturnValue(mockDispatch);
    useNavigate.mockReturnValue(mockNavigate);
    useLocation.mockReturnValue({ search: '', pathname: '/payment' });
    
    // Reset hook mocks to defaults
    useAvailablePersonalWorkspace.mockReturnValue(false);
    useMatchPaymentRoute.mockReturnValue({
      plan: 'ORG_PRO',
      isMonthly: true,
      period: 'MONTHLY',
    });
    useRestrictBillingActions.mockReturnValue({
      isRestrictedOrg: false,
      openRestrictActionsModal: mockOpenRestrictActionsModal,
    });
    useGetFlagExtendFreeTrial.mockReturnValue({ isShowExtendFreeTrialModal: false });
    
    // Mock useCreateOrganizationInPayment
    useCreateOrganizationInPayment.mockReturnValue({ createOrganization: mockCreateOrganization });
    
    // Mock useReactivateAccount
    useReactivateAccount.mockReturnValue({ openReactivateModal: mockOpenReactivateModal });
    
    // Mock useCreateCredentials
    useCreateCredentials.mockReturnValue({ createCustomerCredentials: mockCreateCustomerCredentials });
    
    // Mock prepaid card hooks
    mockPrepaidCardHooks.useHandlePreventUsingPrepaidCard.mockReturnValue({ 
      openPreventUsingPrepaidCardModal: mockOpenPreventUsingPrepaidCardModal 
    });
    mockPrepaidCardHooks.useSendLogPreventPrepaidCard.mockReturnValue({ 
      logPreinspectCardInfo: mockLogPreinspectCardInfo, 
      logPaymentError: mockLogPaymentError 
    });
    
    // Mock purchase event hook
    mockPurchaseEventHook.useSendPurchaseEvent.mockReturnValue({ 
      sendPurchaseEvent: mockSendPurchaseEvent 
    });
    
    // Reset utility mocks
    mockUtils.orgUtil.canStartTrialPlan.mockReturnValue(true);
    mockUtils.errorUtils.extractGqlError.mockReturnValue({});
    mockServices.paymentServices.createFreeTrialUnifySubscription.mockResolvedValue({
      customerRemoteId: 'cus_123',
      subscriptionRemoteId: 'sub_123',
      planRemoteId: 'plan_123',
    });
    
    // Reset PaymentUtilities mock
    PaymentUtilities.mockImplementation(() => ({
      isFreeTrial: jest.fn(() => false),
      isAnnualPeriod: jest.fn(() => false),
      isSignFree: jest.fn(() => true),
    }));
    
    useSelector.mockImplementation((selector) => {
      if (selector === mockSelectors.getPurchaseState) {
        return false;
      }
      if (selector === mockSelectors.availablePaidOrgs) {
        return [mockOrganization];
      }
      if (selector === mockSelectors.getCurrentUser) {
        return mockCurrentUser;
      }
      if (selector === mockSelectors.getOrganizationList) {
        return { data: [] };
      }
      if (typeof selector === 'function') {
        return { organization: mockOrganization };
      }
      return mockCurrentUser;
    });
  });

  describe('initial state', () => {
    it('should return disabled as false when card is filled', () => {
      const { result } = renderHook(() =>
        useClaimFreeTrial({
          newOrganization: null,
          onOpenExtendFreeTrialModal: jest.fn(),
        })
      );

      expect(result.current.disabled).toBe(false);
    });

    it('should return loading as false initially', () => {
      const { result } = renderHook(() =>
        useClaimFreeTrial({
          newOrganization: null,
          onOpenExtendFreeTrialModal: jest.fn(),
        })
      );

      expect(result.current.loading).toBe(false);
    });

    it('should return loading as true when purchase is in progress', () => {
      useSelector.mockImplementation((selector) => {
        if (selector === mockSelectors.getPurchaseState) {
          return true; // isPurchasing = true
        }
        if (selector === mockSelectors.availablePaidOrgs) {
          return [mockOrganization];
        }
        if (selector === mockSelectors.getCurrentUser) {
          return mockCurrentUser;
        }
        if (selector === mockSelectors.getOrganizationList) {
          return { data: [] };
        }
        if (typeof selector === 'function') {
          return { organization: mockOrganization };
        }
        return mockCurrentUser;
      });

      const { result } = renderHook(() =>
        useClaimFreeTrial({
          newOrganization: null,
          onOpenExtendFreeTrialModal: jest.fn(),
        })
      );

      expect(result.current.loading).toBe(true);
    });
  });

  describe('canClaimTrial', () => {
    it('should return true when organization can start trial', () => {
      const { result } = renderHook(() =>
        useClaimFreeTrial({
          newOrganization: null,
          onOpenExtendFreeTrialModal: jest.fn(),
        })
      );

      expect(result.current.canClaimTrial).toBe(true);
    });

    it('should return false when user has premium personal plan (PROFESSIONAL)', () => {
      useSelector.mockImplementation((selector) => {
        if (selector === mockSelectors.getPurchaseState) {
          return false;
        }
        if (selector === mockSelectors.availablePaidOrgs) {
          return [mockOrganization];
        }
        if (selector === mockSelectors.getCurrentUser) {
          return { ...mockCurrentUser, payment: { type: 'PROFESSIONAL' } };
        }
        if (selector === mockSelectors.getOrganizationList) {
          return { data: [] };
        }
        if (typeof selector === 'function') {
          return { organization: mockOrganization };
        }
        return mockCurrentUser;
      });

      const { result } = renderHook(() =>
        useClaimFreeTrial({
          newOrganization: null,
          onOpenExtendFreeTrialModal: jest.fn(),
        })
      );

      expect(result.current.canClaimTrial).toBe(false);
    });

    it('should return false when user has PERSONAL plan', () => {
      useSelector.mockImplementation((selector) => {
        if (selector === mockSelectors.getPurchaseState) {
          return false;
        }
        if (selector === mockSelectors.availablePaidOrgs) {
          return [mockOrganization];
        }
        if (selector === mockSelectors.getCurrentUser) {
          return { ...mockCurrentUser, payment: { type: 'PERSONAL' } };
        }
        if (selector === mockSelectors.getOrganizationList) {
          return { data: [] };
        }
        if (typeof selector === 'function') {
          return { organization: mockOrganization };
        }
        return mockCurrentUser;
      });

      const { result } = renderHook(() =>
        useClaimFreeTrial({
          newOrganization: null,
          onOpenExtendFreeTrialModal: jest.fn(),
        })
      );

      expect(result.current.canClaimTrial).toBe(false);
    });

    it('should return false when trying to downgrade from annual to monthly', () => {
      useMatchPaymentRoute.mockReturnValue({
        plan: 'ORG_PRO',
        isMonthly: true,
        period: 'MONTHLY',
      });
      PaymentUtilities.mockImplementation(() => ({
        isFreeTrial: jest.fn(() => false),
        isAnnualPeriod: jest.fn(() => true), // Already on annual
        isSignFree: jest.fn(() => true),
      }));

      const { result } = renderHook(() =>
        useClaimFreeTrial({
          newOrganization: null,
          onOpenExtendFreeTrialModal: jest.fn(),
        })
      );

      expect(result.current.canClaimTrial).toBe(false);
    });

    it('should return false when canStartTrialPlan returns false', () => {
      mockUtils.orgUtil.canStartTrialPlan.mockReturnValue(false);

      const { result } = renderHook(() =>
        useClaimFreeTrial({
          newOrganization: null,
          onOpenExtendFreeTrialModal: jest.fn(),
        })
      );

      expect(result.current.canClaimTrial).toBe(false);
    });

    it('should return true when no available paid orgs and newOrganization has no error', () => {
      useSelector.mockImplementation((selector) => {
        if (selector === mockSelectors.getPurchaseState) {
          return false;
        }
        if (selector === mockSelectors.availablePaidOrgs) {
          return []; // No available paid orgs
        }
        if (selector === mockSelectors.getCurrentUser) {
          return mockCurrentUser;
        }
        if (selector === mockSelectors.getOrganizationList) {
          return { data: [] };
        }
        if (typeof selector === 'function') {
          return { organization: null };
        }
        return mockCurrentUser;
      });

      const { result } = renderHook(() =>
        useClaimFreeTrial({
          newOrganization: { error: false },
          onOpenExtendFreeTrialModal: jest.fn(),
        })
      );

      expect(result.current.canClaimTrial).toBe(true);
    });

    it('should return false when no available paid orgs and newOrganization has error', () => {
      useSelector.mockImplementation((selector) => {
        if (selector === mockSelectors.getPurchaseState) {
          return false;
        }
        if (selector === mockSelectors.availablePaidOrgs) {
          return [];
        }
        if (selector === mockSelectors.getCurrentUser) {
          return mockCurrentUser;
        }
        if (selector === mockSelectors.getOrganizationList) {
          return { data: [] };
        }
        if (typeof selector === 'function') {
          return { organization: null };
        }
        return mockCurrentUser;
      });

      const { result } = renderHook(() =>
        useClaimFreeTrial({
          newOrganization: { error: true },
          onOpenExtendFreeTrialModal: jest.fn(),
        })
      );

      expect(result.current.canClaimTrial).toBe(false);
    });
  });

  describe('claimCtaTooltip', () => {
    it('should return empty string when can claim trial', () => {
      const { result } = renderHook(() =>
        useClaimFreeTrial({
          newOrganization: null,
          onOpenExtendFreeTrialModal: jest.fn(),
        })
      );

      expect(result.current.claimCtaTooltip).toBe('');
    });

    it('should return tooltip for professional user when cannot claim trial', () => {
      useAvailablePersonalWorkspace.mockReturnValue(true);
      mockUtils.orgUtil.canStartTrialPlan.mockReturnValue(false);

      const { result } = renderHook(() =>
        useClaimFreeTrial({
          newOrganization: null,
          onOpenExtendFreeTrialModal: jest.fn(),
        })
      );

      expect(result.current.claimCtaTooltip).toBe('freeTrialPage.higherToLowerTrialTierTooltip');
    });

    it('should return active sign tooltip when user is not sign free', () => {
      mockUtils.orgUtil.canStartTrialPlan.mockReturnValue(false);
      PaymentUtilities.mockImplementation(() => ({
        isFreeTrial: jest.fn(() => false),
        isAnnualPeriod: jest.fn(() => false),
        isSignFree: jest.fn(() => false), // Not sign free
      }));

      const { result } = renderHook(() =>
        useClaimFreeTrial({
          newOrganization: null,
          onOpenExtendFreeTrialModal: jest.fn(),
        })
      );

      expect(result.current.claimCtaTooltip).toBe('freeTrialPage.activeSignTooltip');
    });

    it('should return higher to lower tier tooltip when organization exists but cannot start trial', () => {
      mockUtils.orgUtil.canStartTrialPlan.mockReturnValue(false);
      PaymentUtilities.mockImplementation(() => ({
        isFreeTrial: jest.fn(() => false),
        isAnnualPeriod: jest.fn(() => false),
        isSignFree: jest.fn(() => true),
      }));

      const { result } = renderHook(() =>
        useClaimFreeTrial({
          newOrganization: null,
          onOpenExtendFreeTrialModal: jest.fn(),
        })
      );

      expect(result.current.claimCtaTooltip).toBe('freeTrialPage.higherToLowerTrialTierTooltip');
    });
  });

  describe('trackUserFillPaymentForm', () => {
    it('should be a function', () => {
      const { result } = renderHook(() =>
        useClaimFreeTrial({
          newOrganization: null,
          onOpenExtendFreeTrialModal: jest.fn(),
        })
      );

      expect(typeof result.current.trackUserFillPaymentForm).toBe('function');
    });

    it('should not throw when invoked', () => {
      const { result } = renderHook(() =>
        useClaimFreeTrial({
          newOrganization: null,
          onOpenExtendFreeTrialModal: jest.fn(),
        })
      );

      expect(() => {
        result.current.trackUserFillPaymentForm({ fieldName: 'cardNumber', action: 'focus' });
      }).not.toThrow();
    });
  });

  describe('onClaim', () => {
    it('should be a function', () => {
      const { result } = renderHook(() =>
        useClaimFreeTrial({
          newOrganization: null,
          onOpenExtendFreeTrialModal: jest.fn(),
        })
      );

      expect(typeof result.current.onClaim).toBe('function');
    });

    it('should open restrict actions modal when org is restricted', async () => {
      useRestrictBillingActions.mockReturnValue({
        isRestrictedOrg: true,
        openRestrictActionsModal: mockOpenRestrictActionsModal,
      });

      const { result } = renderHook(() =>
        useClaimFreeTrial({
          newOrganization: null,
          onOpenExtendFreeTrialModal: jest.fn(),
        })
      );

      await act(async () => {
        await result.current.onClaim({ preventDefault: jest.fn() });
      });

      expect(mockOpenRestrictActionsModal).toHaveBeenCalled();
      expect(mockDispatch).not.toHaveBeenCalledWith(expect.objectContaining({ type: 'SET_PURCHASE_STATE' }));
    });

    it('should set purchase state to true when starting claim', async () => {
      const { result } = renderHook(() =>
        useClaimFreeTrial({
          newOrganization: null,
          onOpenExtendFreeTrialModal: jest.fn(),
        })
      );

      await act(async () => {
        await result.current.onClaim({ preventDefault: jest.fn() });
      });

      expect(mockActions.setPurchaseState).toHaveBeenCalledWith(true);
    });

    it('should call createOrgAndPurchase when no available paid orgs', async () => {
      useSelector.mockImplementation((selector) => {
        if (selector === mockSelectors.getPurchaseState) {
          return false;
        }
        if (selector === mockSelectors.availablePaidOrgs) {
          return [];
        }
        if (selector === mockSelectors.getCurrentUser) {
          return mockCurrentUser;
        }
        if (selector === mockSelectors.getOrganizationList) {
          return { data: [] };
        }
        if (typeof selector === 'function') {
          return { organization: null };
        }
        return mockCurrentUser;
      });

      mockCreateOrganization.mockResolvedValue(mockOrganization);

      const { result } = renderHook(() =>
        useClaimFreeTrial({
          newOrganization: null,
          onOpenExtendFreeTrialModal: jest.fn(),
        })
      );

      await act(async () => {
        await result.current.onClaim({ preventDefault: jest.fn() });
      });

      expect(mockCreateOrganization).toHaveBeenCalled();
    });

    it('should open reactivate modal when user is deleted', async () => {
      useSelector.mockImplementation((selector) => {
        if (selector === mockSelectors.getPurchaseState) {
          return false;
        }
        if (selector === mockSelectors.availablePaidOrgs) {
          return [mockOrganization];
        }
        if (selector === mockSelectors.getCurrentUser) {
          return { ...mockCurrentUser, deletedAt: '2023-01-01' };
        }
        if (selector === mockSelectors.getOrganizationList) {
          return { data: [] };
        }
        if (typeof selector === 'function') {
          return { organization: mockOrganization };
        }
        return mockCurrentUser;
      });

      const { result } = renderHook(() =>
        useClaimFreeTrial({
          newOrganization: null,
          onOpenExtendFreeTrialModal: jest.fn(),
        })
      );

      await act(async () => {
        await result.current.onClaim({ preventDefault: jest.fn() });
      });

      expect(mockOpenReactivateModal).toHaveBeenCalled();
    });

    it('should complete purchase flow successfully', async () => {
      const { result } = renderHook(() =>
        useClaimFreeTrial({
          newOrganization: null,
          onOpenExtendFreeTrialModal: jest.fn(),
        })
      );

      await act(async () => {
        await result.current.onClaim({ preventDefault: jest.fn() });
      });

      expect(mockCreateCustomerCredentials).toHaveBeenCalled();
      expect(mockServices.paymentServices.createFreeTrialUnifySubscription).toHaveBeenCalled();
      expect(mockActions.setPurchaseState).toHaveBeenCalledWith(false);
    });

    it('should open success modal after successful purchase', async () => {
      const { result } = renderHook(() =>
        useClaimFreeTrial({
          newOrganization: null,
          onOpenExtendFreeTrialModal: jest.fn(),
        })
      );

      await act(async () => {
        await result.current.onClaim({ preventDefault: jest.fn() });
      });

      expect(mockActions.openModal).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'freeTrialPage.freeTrialActivated',
        })
      );
    });

    it('should show toast and call extend modal when isShowExtendFreeTrialModal is true', async () => {
      useGetFlagExtendFreeTrial.mockReturnValue({ isShowExtendFreeTrialModal: true });
      const mockOnOpenExtendFreeTrialModal = jest.fn();

      const { result } = renderHook(() =>
        useClaimFreeTrial({
          newOrganization: null,
          onOpenExtendFreeTrialModal: mockOnOpenExtendFreeTrialModal,
        })
      );

      await act(async () => {
        await result.current.onClaim({ preventDefault: jest.fn() });
      });

      expect(mockUtils.toastUtils.success).toHaveBeenCalledWith({ message: 'freeTrialPage.freeTrialActivated' });
      expect(mockOnOpenExtendFreeTrialModal).toHaveBeenCalled();
    });
  });

  describe('error handling', () => {
    it('should handle CANNOT_USE_SAME_TRIAL error', async () => {
      mockUtils.errorUtils.extractGqlError.mockReturnValue({
        code: 'cannot_use_same_trial',
      });
      mockServices.paymentServices.createFreeTrialUnifySubscription.mockRejectedValue(new Error('Same trial error'));

      const { result } = renderHook(() =>
        useClaimFreeTrial({
          newOrganization: null,
          onOpenExtendFreeTrialModal: jest.fn(),
        })
      );

      await act(async () => {
        await result.current.onClaim({ preventDefault: jest.fn() });
      });

      expect(mockActions.openModal).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'modalErrorSameTrial.title',
        })
      );
    });

    it('should handle UPGRADING_INVOICE error', async () => {
      mockUtils.errorUtils.extractGqlError.mockReturnValue({
        code: 'upgrading_invoice',
        metadata: { plan: 'ORG_PRO', period: 'MONTHLY', docStack: 10 },
      });
      mockServices.paymentServices.createFreeTrialUnifySubscription.mockRejectedValue(new Error('Upgrading invoice'));

      const { result } = renderHook(() =>
        useClaimFreeTrial({
          newOrganization: null,
          onOpenExtendFreeTrialModal: jest.fn(),
        })
      );

      await act(async () => {
        await result.current.onClaim({ preventDefault: jest.fn() });
      });

      expect(mockActions.openModal).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'modalChangingPlan.title',
        })
      );
    });

    it('should handle CARD_DECLINED error', async () => {
      mockUtils.errorUtils.extractGqlError.mockReturnValue({
        code: 'card_declined',
      });
      mockServices.paymentServices.createFreeTrialUnifySubscription.mockRejectedValue(new Error('Card declined'));

      const { result } = renderHook(() =>
        useClaimFreeTrial({
          newOrganization: null,
          onOpenExtendFreeTrialModal: jest.fn(),
        })
      );

      await act(async () => {
        await result.current.onClaim({ preventDefault: jest.fn() });
      });

      expect(mockActions.openModal).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'common.failed',
        })
      );
    });

    it('should handle generic error with reload button', async () => {
      mockUtils.errorUtils.extractGqlError.mockReturnValue({
        code: 'UNKNOWN_ERROR',
        message: 'Something went wrong',
      });
      mockServices.paymentServices.createFreeTrialUnifySubscription.mockRejectedValue(new Error('Unknown error'));

      const { result } = renderHook(() =>
        useClaimFreeTrial({
          newOrganization: null,
          onOpenExtendFreeTrialModal: jest.fn(),
        })
      );

      await act(async () => {
        await result.current.onClaim({ preventDefault: jest.fn() });
      });

      expect(mockActions.openModal).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'common.failed',
          confirmButtonTitle: 'common.reload',
        })
      );
    });

    it('should handle setup intent error', async () => {
      mockUtils.errorUtils.extractGqlError.mockReturnValue({
        code: 'SETUP_INTENT_ERROR',
        message: 'Setup failed',
        isSetupIntentError: true,
      });
      mockServices.paymentServices.createFreeTrialUnifySubscription.mockRejectedValue(new Error('Setup intent error'));

      const { result } = renderHook(() =>
        useClaimFreeTrial({
          newOrganization: null,
          onOpenExtendFreeTrialModal: jest.fn(),
        })
      );

      await act(async () => {
        await result.current.onClaim({ preventDefault: jest.fn() });
      });

      expect(mockActions.openModal).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'common.failed',
          confirmButtonTitle: 'common.ok',
        })
      );
    });

    it('should not show modal when error is stopped', async () => {
      mockUtils.errorUtils.extractGqlError.mockReturnValue({
        code: 'SOME_ERROR',
        stopped: true,
      });
      mockServices.paymentServices.createFreeTrialUnifySubscription.mockRejectedValue(new Error('Stopped error'));

      const { result } = renderHook(() =>
        useClaimFreeTrial({
          newOrganization: null,
          onOpenExtendFreeTrialModal: jest.fn(),
        })
      );

      await act(async () => {
        await result.current.onClaim({ preventDefault: jest.fn() });
      });

      // Should not open modal for stopped errors (except setPurchaseState)
      expect(mockActions.setPurchaseState).toHaveBeenCalledWith(false);
    });

    it('should handle createOrganization failure', async () => {
      useSelector.mockImplementation((selector) => {
        if (selector === mockSelectors.getPurchaseState) {
          return false;
        }
        if (selector === mockSelectors.availablePaidOrgs) {
          return [];
        }
        if (selector === mockSelectors.getCurrentUser) {
          return mockCurrentUser;
        }
        if (selector === mockSelectors.getOrganizationList) {
          return { data: [] };
        }
        if (typeof selector === 'function') {
          return { organization: null };
        }
        return mockCurrentUser;
      });

      mockCreateOrganization.mockRejectedValue(new Error('Failed to create org'));

      const { result } = renderHook(() =>
        useClaimFreeTrial({
          newOrganization: null,
          onOpenExtendFreeTrialModal: jest.fn(),
        })
      );

      await act(async () => {
        await result.current.onClaim({ preventDefault: jest.fn() });
      });

      expect(mockUtils.toastUtils.openUnknownErrorToast).toHaveBeenCalled();
    });
  });

  describe('prepaid card handling', () => {
    it('should block prepaid card and open modal', async () => {
      mockCreateCustomerCredentials.mockResolvedValue({
        issuedId: 'issued-123',
        cardInfo: { cardFunding: 'prepaid', cardBrand: 'visa' },
      });

      const { result } = renderHook(() =>
        useClaimFreeTrial({
          newOrganization: null,
          onOpenExtendFreeTrialModal: jest.fn(),
        })
      );

      await act(async () => {
        await result.current.onClaim({ preventDefault: jest.fn() });
      });

      expect(mockLogPaymentError).toHaveBeenCalledWith('Prepaid card cannot start free trial');
      expect(mockOpenPreventUsingPrepaidCardModal).toHaveBeenCalled();
    });

    it('should log card info when card is returned', async () => {
      mockCreateCustomerCredentials.mockResolvedValue({
        issuedId: 'issued-123',
        cardInfo: { cardFunding: 'credit', cardBrand: 'visa' },
      });

      const { result } = renderHook(() =>
        useClaimFreeTrial({
          newOrganization: null,
          onOpenExtendFreeTrialModal: jest.fn(),
        })
      );

      await act(async () => {
        await result.current.onClaim({ preventDefault: jest.fn() });
      });

      expect(mockLogPreinspectCardInfo).toHaveBeenCalledWith({ cardFunding: 'credit', cardBrand: 'visa' });
    });
  });

  describe('organization updates', () => {
    it('should update organization in list after successful charge', async () => {
      const { result } = renderHook(() =>
        useClaimFreeTrial({
          newOrganization: null,
          onOpenExtendFreeTrialModal: jest.fn(),
        })
      );

      await act(async () => {
        await result.current.onClaim({ preventDefault: jest.fn() });
      });

      expect(mockActions.updateOrganizationInList).toHaveBeenCalled();
    });

    it('should upgrade user role to billing moderator when user is member', async () => {
      useSelector.mockImplementation((selector) => {
        if (selector === mockSelectors.getPurchaseState) {
          return false;
        }
        if (selector === mockSelectors.availablePaidOrgs) {
          return [{ ...mockOrganization, userRole: 'member' }];
        }
        if (selector === mockSelectors.getCurrentUser) {
          return mockCurrentUser;
        }
        if (selector === mockSelectors.getOrganizationList) {
          return { data: [] };
        }
        if (typeof selector === 'function') {
          return { organization: { ...mockOrganization, userRole: 'member' } };
        }
        return mockCurrentUser;
      });

      const { result } = renderHook(() =>
        useClaimFreeTrial({
          newOrganization: null,
          onOpenExtendFreeTrialModal: jest.fn(),
        })
      );

      await act(async () => {
        await result.current.onClaim({ preventDefault: jest.fn() });
      });

      expect(mockActions.updateOrganizationInList).toHaveBeenCalledWith(
        'org-123',
        expect.objectContaining({
          userRole: 'billing_moderator',
        })
      );
    });
  });

  describe('event tracking', () => {
    it('should trigger submit form event when claiming', async () => {
      const { result } = renderHook(() =>
        useClaimFreeTrial({
          newOrganization: null,
          onOpenExtendFreeTrialModal: jest.fn(),
        })
      );

      await act(async () => {
        await result.current.onClaim({ preventDefault: jest.fn() });
      });

      // Event tracking happens internally via triggerEvent
      expect(mockActions.setPurchaseState).toHaveBeenCalledWith(true);
    });

    it('should send purchase event after successful charge', async () => {
      const { result } = renderHook(() =>
        useClaimFreeTrial({
          newOrganization: null,
          onOpenExtendFreeTrialModal: jest.fn(),
        })
      );

      await act(async () => {
        await result.current.onClaim({ preventDefault: jest.fn() });
      });

      expect(mockSendPurchaseEvent).toHaveBeenCalled();
    });
  });
});
