import { renderHook, act } from '@testing-library/react';

import { IOrganization } from 'interfaces/organization/organization.interface';
import { PaymentCurrency, PaymentPeriod, PaymentPlans, PaymentStatus, PaymentTypes } from 'constants/plan.enum';

import useReactivateCanceledCircle from '../useReactivateCanceledCircle';

// Mock dependencies
jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: jest.fn(),
  batch: jest.fn((fn) => fn()),
}));

jest.mock('react-router', () => ({
  ...jest.requireActual('react-router'),
  useMatch: jest.fn(),
  useNavigate: jest.fn(),
}));

jest.mock('screens/Viewer/Context', () => ({
  __esModule: true,
  default: {
    _currentValue: {
      refetchDocument: jest.fn(),
    },
  },
}));

jest.mock('services', () => ({
  organizationServices: {
    createOrganizationSubscription: jest.fn(),
  },
  paymentServices: {
    getPaymentMethodAndCustomerInfo: jest.fn(),
  },
}));

jest.mock('services/awsTracking/organizationTracking', () => ({
  __esModule: true,
  default: {
    trackReactivateCanceledCircle: jest.fn(),
  },
}));

jest.mock('helpers/logger', () => ({
  __esModule: true,
  default: {
    logError: jest.fn(),
  },
}));

jest.mock('utils', () => ({
  paymentUtil: {
    getNextDocStack: jest.fn(),
  },
  toastUtils: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

jest.mock('utils/payment', () => ({
  PaymentUrlSerializer: jest.fn(),
}));

jest.mock('actions', () => ({
  setCurrentDocument: jest.fn(),
  updateCurrentOrganization: jest.fn(),
  updateOrganizationInList: jest.fn(),
}));

const mockOrganization: IOrganization = {
  _id: 'org-123',
  name: 'Test Organization',
  payment: {
    type: PaymentPlans.ORG_PRO,
    status: PaymentStatus.ACTIVE,
    period: PaymentPeriod.MONTHLY,
    customerRemoteId: 'customer-123',
  },
  docStackStorage: {
    totalUsed: 10,
    totalStack: 100,
  },
  settings: {
    autoUpgrade: true,
  },
} as IOrganization;

const mockPaymentMethod = {
  id: 'pm-123',
  type: 'card',
};

const mockCustomerInfo = {
  id: 'cus-123',
  email: 'test@example.com',
};

const mockSubscriptionResult = {
  customerRemoteId: 'customer-123',
  subscriptionRemoteId: 'sub-123',
  planRemoteId: 'plan-123',
};

const mockNextDocStack = {
  nextDocStack: 200,
};

describe('useReactivateCanceledCircle', () => {
  const mockDispatch = jest.fn();
  const mockNavigate = jest.fn();
  const mockRefetchDocument = jest.fn();
  const mockCreateOrganizationSubscription = require('services').organizationServices.createOrganizationSubscription;
  const mockGetPaymentMethodAndCustomerInfo = require('services').paymentServices.getPaymentMethodAndCustomerInfo;
  const mockTrackReactivateCanceledCircle = require('services/awsTracking/organizationTracking').default.trackReactivateCanceledCircle;
  const mockLogError = require('helpers/logger').default.logError;
  const mockPaymentUtil = require('utils').paymentUtil;
  const mockToastUtils = require('utils').toastUtils;
  const mockPaymentUrlSerializer = require('utils/payment').PaymentUrlSerializer;
  const mockActions = require('actions');

  beforeEach(() => {
    const { useDispatch, batch } = require('react-redux');
    const { useMatch, useNavigate } = require('react-router');
    const ViewerContext = require('screens/Viewer/Context').default;

    useDispatch.mockReturnValue(mockDispatch);
    batch.mockImplementation((fn: () => void) => fn());
    useMatch.mockReturnValue(null); // Not in viewer by default
    useNavigate.mockReturnValue(mockNavigate);

    // Mock ViewerContext
    const mockContextValue = {
      refetchDocument: mockRefetchDocument,
    };
    ViewerContext._currentValue = mockContextValue;

    mockCreateOrganizationSubscription.mockResolvedValue(mockSubscriptionResult);
    mockGetPaymentMethodAndCustomerInfo.mockResolvedValue([mockPaymentMethod, mockCustomerInfo]);
    mockTrackReactivateCanceledCircle.mockResolvedValue(undefined);
    mockPaymentUtil.getNextDocStack.mockReturnValue(mockNextDocStack);
    mockToastUtils.success.mockImplementation(() => {});
    mockToastUtils.error.mockImplementation(() => {});

    // Mock PaymentUrlSerializer
    const mockSerializer = {
      of: jest.fn().mockReturnThis(),
      plan: jest.fn().mockReturnThis(),
      period: jest.fn().mockReturnThis(),
      returnUrlParam: jest.fn().mockReturnThis(),
      get: jest.fn().mockReturnValue('/payment-url'),
    };
    mockPaymentUrlSerializer.mockImplementation(() => mockSerializer);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('reactivate function', () => {
    it('should successfully reactivate subscription when payment method exists', async () => {
      const { result } = renderHook(() =>
        useReactivateCanceledCircle({
          currentOrganization: mockOrganization,
          onClose: jest.fn(),
        })
      );

      await act(async () => {
        await result.current.reactivate();
      });

      expect(mockGetPaymentMethodAndCustomerInfo).toHaveBeenCalledWith({
        clientId: mockOrganization._id,
        type: PaymentTypes.ORGANIZATION,
        fetchOptions: null,
      });

      expect(mockCreateOrganizationSubscription).toHaveBeenCalledWith(mockOrganization._id, {
        couponCode: '',
        currency: PaymentCurrency.USD,
        period: PaymentPeriod.MONTHLY,
        plan: PaymentPlans.ORG_PRO,
        quantity: 0,
      });

      expect(mockToastUtils.success).toHaveBeenCalledWith({
        message: 'Renew subscription successfully.',
      });

      expect(mockTrackReactivateCanceledCircle).toHaveBeenCalledWith({
        organizationId: mockOrganization._id,
        customerRemoteId: mockSubscriptionResult.customerRemoteId,
        subscriptionRemoteId: mockSubscriptionResult.subscriptionRemoteId,
        planRemoteId: mockSubscriptionResult.planRemoteId,
      });
    });

    it('should redirect to payment page when payment method does not exist', async () => {
      mockGetPaymentMethodAndCustomerInfo.mockResolvedValue([null, null]);

      const mockOnClose = jest.fn();
      const { result } = renderHook(() =>
        useReactivateCanceledCircle({
          currentOrganization: mockOrganization,
          onClose: mockOnClose,
        })
      );

      await act(async () => {
        await result.current.reactivate();
      });

      expect(mockNavigate).toHaveBeenCalledWith('/payment-url');
      expect(mockOnClose).toHaveBeenCalledTimes(1);
      expect(mockCreateOrganizationSubscription).not.toHaveBeenCalled();
    });

    it('should handle subscription creation failure', async () => {
      const error = new Error('Subscription creation failed');
      mockCreateOrganizationSubscription.mockRejectedValue(error);

      const mockOnClose = jest.fn();
      const { result } = renderHook(() =>
        useReactivateCanceledCircle({
          currentOrganization: mockOrganization,
          onClose: mockOnClose,
        })
      );

      await act(async () => {
        await result.current.reactivate();
      });

      expect(mockToastUtils.error).toHaveBeenCalledWith({
        message: 'Failed to reactivate your subscription.',
      });

      expect(mockLogError).toHaveBeenCalledWith({
        reason: 'GRAPHQL_ERROR',
        message: 'Failed to charge new subscription.',
        error,
      });

      expect(mockNavigate).toHaveBeenCalledWith('/payment-url');
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('loading states', () => {
    it('should return loading true when fetching card', async () => {
      let resolvePaymentMethod: (value: any) => void;
      const paymentMethodPromise = new Promise((resolve) => {
        resolvePaymentMethod = resolve;
      });
      mockGetPaymentMethodAndCustomerInfo.mockReturnValue(paymentMethodPromise);

      const { result } = renderHook(() =>
        useReactivateCanceledCircle({
          currentOrganization: mockOrganization,
          onClose: jest.fn(),
        })
      );

      expect(result.current.loading).toBe(false);

      act(() => {
        result.current.reactivate();
      });

      expect(result.current.loading).toBe(true);

      await act(async () => {
        resolvePaymentMethod!([mockPaymentMethod, mockCustomerInfo]);
        await paymentMethodPromise;
      });

      expect(result.current.loading).toBe(false);
    });

    it('should return loading true when charging subscription', async () => {
      let resolveSubscription: (value: any) => void;
      const subscriptionPromise = new Promise((resolve) => {
        resolveSubscription = resolve;
      });
      mockCreateOrganizationSubscription.mockReturnValue(subscriptionPromise);

      const { result } = renderHook(() =>
        useReactivateCanceledCircle({
          currentOrganization: mockOrganization,
          onClose: jest.fn(),
        })
      );

      act(() => {
        result.current.reactivate();
      });

      expect(result.current.loading).toBe(true);

      await act(async () => {
        resolveSubscription!(mockSubscriptionResult);
        await subscriptionPromise;
      });

      expect(result.current.loading).toBe(false);
    });
  });
});
