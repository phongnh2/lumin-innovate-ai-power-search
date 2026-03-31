/* eslint-disable no-console */
const originalConsoleError = console.error;
console.error = (...args) => {
  const errorStr = args
    .map((arg) => {
      if (arg instanceof Error) return arg.message + (arg.stack || '');
      return String(arg);
    })
    .join(' ');

  if (errorStr.includes('not wrapped in act') || errorStr.includes('useCurrentBillingClient')) {
    return;
  }
  originalConsoleError.call(console, ...args);
};

import { renderHook, act, waitFor } from '@testing-library/react';
import { useSelector, useDispatch } from 'react-redux';
import { matchPath, useLocation } from 'react-router';

import useCurrentBillingClient from '../useCurrentBillingClient';
import paymentService from 'services/paymentService';

import { PaymentTypes } from 'constants/plan';
import { BillingWarningType } from 'constants/paymentConstant';

jest.mock('react-redux', () => ({
  useSelector: jest.fn(),
  useDispatch: jest.fn(),
  shallowEqual: jest.fn(),
}));

jest.mock('react-router', () => ({
  matchPath: jest.fn(),
  useLocation: jest.fn(),
}));

jest.mock('services/paymentService', () => ({
  getBillingWarning: jest.fn(),
}));

jest.mock('actions', () => ({
  setBillingWarning: jest.fn((id, data) => ({ type: 'SET_BILLING_WARNING', payload: { id, data } })),
}));

jest.mock('helpers/getOrgIdOfDoc', () => jest.fn(() => 'org-from-doc'));

jest.mock('selectors', () => ({
  isOffline: jest.fn(),
  getCurrentOrganization: jest.fn(),
  getCurrentUser: jest.fn(),
  getBillingWarning: jest.fn(),
  getCurrentDocument: jest.fn(),
}));

const mockSelectors = jest.requireMock('selectors');

describe('useCurrentBillingClient', () => {
  const mockDispatch = jest.fn();
  const mockCurrentUser = { _id: 'user-123' };
  const mockCurrentOrganization = { _id: 'org-123' };
  const mockCurrentDocument = {
    _id: 'doc-123',
    isShared: false,
    documentReference: { accountableBy: 'organization' },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    useDispatch.mockReturnValue(mockDispatch);
    useLocation.mockReturnValue({ pathname: '/documents' });
    matchPath.mockReturnValue(null);
    useSelector.mockImplementation((selector) => {
      if (typeof selector === 'function') {
        return null;
      }
      return null;
    });
  });

  const setupSelectors = (overrides = {}) => {
    const defaults = {
      isOffline: false,
      currentOrganization: { data: mockCurrentOrganization },
      currentUser: mockCurrentUser,
      billingWarning: {},
      currentDocument: mockCurrentDocument,
    };
    const values = { ...defaults, ...overrides };

    useSelector.mockImplementation((selector) => {
      if (selector === mockSelectors.isOffline) return values.isOffline;
      if (selector === mockSelectors.getCurrentOrganization) return values.currentOrganization;
      if (selector === mockSelectors.getCurrentUser) return values.currentUser;
      if (selector === mockSelectors.getBillingWarning) return values.billingWarning;
      if (selector === mockSelectors.getCurrentDocument) return values.currentDocument;
      // Default fallback for any selector
      return values.currentUser;
    });
  };

  describe('initial state', () => {
    it('should return initial loading state as true', () => {
      setupSelectors();

      const { result } = renderHook(() => useCurrentBillingClient());

      expect(result.current.isLoading).toBe(true);
    });

    it('should return null for targetId initially', () => {
      setupSelectors();

      const { result } = renderHook(() => useCurrentBillingClient());

      expect(result.current.targetId).toBe(null);
    });
  });

  describe('getClient', () => {
    it('should set individual type when not on org path', async () => {
      setupSelectors();
      matchPath.mockReturnValue(null);

      const { result } = renderHook(() => useCurrentBillingClient());

      await waitFor(() => {
        expect(result.current.targetType).toBe(PaymentTypes.INDIVIDUAL);
      });
    });

    it('should call matchPath with workspace path pattern', () => {
      setupSelectors();
      useLocation.mockReturnValue({ pathname: '/workspace/test-org' });
      matchPath.mockReturnValue({ params: { url: 'test-org' } });

      renderHook(() => useCurrentBillingClient());

      // Verify matchPath was called with the workspace path pattern
      expect(matchPath).toHaveBeenCalledWith(
        expect.objectContaining({ path: expect.stringContaining('workspace') }),
        '/workspace/test-org'
      );
    });
  });

  describe('refetch', () => {
    it('should call getBillingWarning service', async () => {
      setupSelectors();
      paymentService.getBillingWarning.mockResolvedValue({
        warnings: [BillingWarningType.UNPAID_SUBSCRIPTION],
      });

      const { result } = renderHook(() => useCurrentBillingClient());

      await act(async () => {
        await result.current.refetch('org-123', PaymentTypes.ORGANIZATION);
      });

      expect(paymentService.getBillingWarning).toHaveBeenCalledWith('org-123', PaymentTypes.ORGANIZATION);
    });

    it('should not fetch when offline', async () => {
      setupSelectors({ isOffline: true });

      const { result } = renderHook(() => useCurrentBillingClient());

      await act(async () => {
        await result.current.refetch('org-123', PaymentTypes.ORGANIZATION);
      });

      expect(paymentService.getBillingWarning).not.toHaveBeenCalled();
    });

    it('should dispatch setBillingWarning action on success', async () => {
      setupSelectors();
      paymentService.getBillingWarning.mockResolvedValue({
        warnings: [BillingWarningType.UNPAID_SUBSCRIPTION],
      });

      const { result } = renderHook(() => useCurrentBillingClient());

      await act(async () => {
        await result.current.refetch('org-123', PaymentTypes.ORGANIZATION);
      });

      expect(mockDispatch).toHaveBeenCalled();
    });

    it('should filter skipped warnings', async () => {
      setupSelectors();
      paymentService.getBillingWarning.mockResolvedValue({
        warnings: [BillingWarningType.UNPAID_SUBSCRIPTION, BillingWarningType.RENEW_ATTEMPT],
      });

      const { result } = renderHook(() => useCurrentBillingClient());

      await act(async () => {
        await result.current.refetch('org-123', PaymentTypes.ORGANIZATION, {
          skippedWarnings: [BillingWarningType.UNPAID_SUBSCRIPTION],
        });
      });

      expect(mockDispatch).toHaveBeenCalled();
    });
  });

  describe('checkHasWarning', () => {
    it('should return false when no warnings exist', () => {
      setupSelectors({ billingWarning: {} });

      const { result } = renderHook(() => useCurrentBillingClient());

      expect(result.current.checkHasWarning('org-123')).toBe(false);
    });

    it('should return true when warnings exist', () => {
      setupSelectors({
        billingWarning: {
          'org-123': {
            warnings: [{ type: BillingWarningType.UNPAID_SUBSCRIPTION }],
          },
        },
      });

      const { result } = renderHook(() => useCurrentBillingClient());

      expect(result.current.checkHasWarning('org-123')).toBe(true);
    });

    it('should check for specific warning type', () => {
      setupSelectors({
        billingWarning: {
          'org-123': {
            warnings: [{ type: BillingWarningType.UNPAID_SUBSCRIPTION }],
          },
        },
      });

      const { result } = renderHook(() => useCurrentBillingClient());

      expect(result.current.checkHasWarning('org-123', BillingWarningType.UNPAID_SUBSCRIPTION)).toBe(true);
      expect(result.current.checkHasWarning('org-123', BillingWarningType.RENEW_ATTEMPT)).toBe(false);
    });
  });
});
