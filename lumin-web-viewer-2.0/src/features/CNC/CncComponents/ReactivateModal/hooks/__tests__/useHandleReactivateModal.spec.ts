import { renderHook, act } from '@testing-library/react';

import { IOrganization } from 'interfaces/organization/organization.interface';
import { Plans, STATUS } from 'constants/plan';

import useHandleReactivateModal from '../useHandleReactivateModal';

// Mock dependencies
jest.mock('luminComponents/BillingDetail/hooks/useOrgBillingAction', () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock('features/CNC/hooks/useTrackingABTestModalEvent', () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock('../useReactivateCanceledCircle', () => ({
  __esModule: true,
  default: jest.fn(),
}));

describe('useHandleReactivateModal', () => {
  const mockOnClose = jest.fn();
  const mockTrackModalConfirmation = jest.fn();
  const mockTrackModalDismiss = jest.fn();
  const mockReactivateSetToCancelCircle = jest.fn();
  const mockReactivateCanceledCircle = jest.fn();

  const mockUseOrgBillingAction = require('luminComponents/BillingDetail/hooks/useOrgBillingAction').default;
  const mockUseTrackingABTestModalEvent = require('features/CNC/hooks/useTrackingABTestModalEvent').default;
  const mockUseReactivateCanceledCircle = require('../useReactivateCanceledCircle').default;

  beforeEach(() => {
    mockUseOrgBillingAction.mockReturnValue({
      reactivate: mockReactivateSetToCancelCircle,
    });

    mockUseTrackingABTestModalEvent.mockReturnValue({
      trackModalConfirmation: mockTrackModalConfirmation,
      trackModalDismiss: mockTrackModalDismiss,
    });

    mockUseReactivateCanceledCircle.mockReturnValue({
      reactivate: mockReactivateCanceledCircle,
      loading: false,
    });

    mockTrackModalConfirmation.mockResolvedValue(undefined);
    mockTrackModalDismiss.mockResolvedValue(undefined);
    mockReactivateSetToCancelCircle.mockResolvedValue(undefined);
    mockReactivateCanceledCircle.mockResolvedValue(undefined);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getTextButton', () => {
    it('should return correct text for circle canceled plan', () => {
      const organization: IOrganization = {
        _id: 'org-123',
        payment: {
          type: Plans.FREE,
          status: STATUS.ACTIVE,
          customerRemoteId: 'customer-123',
        },
      } as IOrganization;

      const { result } = renderHook(() =>
        useHandleReactivateModal({
          currentOrganization: organization,
          onClose: mockOnClose,
        })
      );

      expect(result.current.getTextButton()).toBe('Renew subscription ($30 / month)');
    });

    it('should return correct text for set to cancel circle plan', () => {
      const organization: IOrganization = {
        _id: 'org-123',
        payment: {
          type: Plans.ORG_PRO,
          status: STATUS.CANCELED,
          customerRemoteId: 'customer-123',
        },
      } as IOrganization;

      const { result } = renderHook(() =>
        useHandleReactivateModal({
          currentOrganization: organization,
          onClose: mockOnClose,
        })
      );

      expect(result.current.getTextButton()).toBe('Renew subscription');
    });

    it('should return empty string for other payment types', () => {
      const organization: IOrganization = {
        _id: 'org-123',
        payment: {
          type: Plans.ORG_PRO,
          status: STATUS.ACTIVE,
          customerRemoteId: 'customer-123',
        },
      } as IOrganization;

      const { result } = renderHook(() =>
        useHandleReactivateModal({
          currentOrganization: organization,
          onClose: mockOnClose,
        })
      );

      expect(result.current.getTextButton()).toBe('');
    });

    it('should return empty string when payment is undefined', () => {
      const organization: IOrganization = {
        _id: 'org-123',
        payment: undefined,
      } as IOrganization;

      const { result } = renderHook(() =>
        useHandleReactivateModal({
          currentOrganization: organization,
          onClose: mockOnClose,
        })
      );

      expect(result.current.getTextButton()).toBe('');
    });
  });

  describe('onClickButton', () => {
    it('should call reactivateCanceledCircle for circle canceled plan', async () => {
      const organization: IOrganization = {
        _id: 'org-123',
        payment: {
          type: Plans.FREE,
          status: STATUS.ACTIVE,
          customerRemoteId: 'customer-123',
        },
      } as IOrganization;

      const { result } = renderHook(() =>
        useHandleReactivateModal({
          currentOrganization: organization,
          onClose: mockOnClose,
        })
      );

      await act(async () => {
        result.current.onClickButton();
      });

      expect(mockTrackModalConfirmation).toHaveBeenCalledTimes(1);
      expect(mockReactivateCanceledCircle).toHaveBeenCalledTimes(1);
      expect(mockReactivateSetToCancelCircle).not.toHaveBeenCalled();
    });

    it('should call reactivateSetToCancelCircle for set to cancel circle plan', async () => {
      const organization: IOrganization = {
        _id: 'org-123',
        payment: {
          type: Plans.ORG_PRO,
          status: STATUS.CANCELED,
          customerRemoteId: 'customer-123',
        },
      } as IOrganization;

      const { result } = renderHook(() =>
        useHandleReactivateModal({
          currentOrganization: organization,
          onClose: mockOnClose,
        })
      );

      await act(async () => {
        result.current.onClickButton();
      });

      expect(mockTrackModalConfirmation).toHaveBeenCalledTimes(1);
      expect(mockReactivateSetToCancelCircle).toHaveBeenCalledTimes(1);
      expect(mockReactivateCanceledCircle).not.toHaveBeenCalled();
    });

    it('should handle errors gracefully when tracking fails', async () => {
      const organization: IOrganization = {
        _id: 'org-123',
        payment: {
          type: Plans.FREE,
          status: STATUS.ACTIVE,
          customerRemoteId: 'customer-123',
        },
      } as IOrganization;

      mockTrackModalConfirmation.mockRejectedValue(new Error('Tracking failed'));

      const { result } = renderHook(() =>
        useHandleReactivateModal({
          currentOrganization: organization,
          onClose: mockOnClose,
        })
      );

      await act(async () => {
        result.current.onClickButton();
      });

      expect(mockTrackModalConfirmation).toHaveBeenCalledTimes(1);
      expect(mockReactivateCanceledCircle).toHaveBeenCalledTimes(1);
    });

    it('should handle errors gracefully when reactivate fails', async () => {
      const organization: IOrganization = {
        _id: 'org-123',
        payment: {
          type: Plans.FREE,
          status: STATUS.ACTIVE,
          customerRemoteId: 'customer-123',
        },
      } as IOrganization;

      mockReactivateCanceledCircle.mockRejectedValue(new Error('Reactivate failed'));

      const { result } = renderHook(() =>
        useHandleReactivateModal({
          currentOrganization: organization,
          onClose: mockOnClose,
        })
      );

      await act(async () => {
        result.current.onClickButton();
      });

      expect(mockTrackModalConfirmation).toHaveBeenCalledTimes(1);
      expect(mockReactivateCanceledCircle).toHaveBeenCalledTimes(1);
    });
  });

  describe('onCloseModal', () => {
    it('should call trackModalDismiss and onClose', async () => {
      const organization: IOrganization = {
        _id: 'org-123',
        payment: {
          type: Plans.ORG_PRO,
          status: STATUS.ACTIVE,
          customerRemoteId: 'customer-123',
        },
      } as IOrganization;

      const { result } = renderHook(() =>
        useHandleReactivateModal({
          currentOrganization: organization,
          onClose: mockOnClose,
        })
      );

      await act(async () => {
        result.current.onCloseModal();
      });

      expect(mockTrackModalDismiss).toHaveBeenCalledTimes(1);
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('should handle errors gracefully when tracking dismiss fails', async () => {
      const organization: IOrganization = {
        _id: 'org-123',
        payment: {
          type: Plans.ORG_PRO,
          status: STATUS.ACTIVE,
          customerRemoteId: 'customer-123',
        },
      } as IOrganization;

      mockTrackModalDismiss.mockRejectedValue(new Error('Tracking dismiss failed'));

      const { result } = renderHook(() =>
        useHandleReactivateModal({
          currentOrganization: organization,
          onClose: mockOnClose,
        })
      );

      await act(async () => {
        result.current.onCloseModal();
      });

      expect(mockTrackModalDismiss).toHaveBeenCalledTimes(1);
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('loading state', () => {
    it('should return loading state from useReactivateCanceledCircle', () => {
      mockUseReactivateCanceledCircle.mockReturnValue({
        reactivate: mockReactivateCanceledCircle,
        loading: true,
      });

      const organization: IOrganization = {
        _id: 'org-123',
        payment: {
          type: Plans.FREE,
          status: STATUS.ACTIVE,
          customerRemoteId: 'customer-123',
        },
      } as IOrganization;

      const { result } = renderHook(() =>
        useHandleReactivateModal({
          currentOrganization: organization,
          onClose: mockOnClose,
        })
      );

      expect(result.current.loading).toBe(true);
    });

    it('should return false loading state when not loading', () => {
      mockUseReactivateCanceledCircle.mockReturnValue({
        reactivate: mockReactivateCanceledCircle,
        loading: false,
      });

      const organization: IOrganization = {
        _id: 'org-123',
        payment: {
          type: Plans.ORG_PRO,
          status: STATUS.ACTIVE,
          customerRemoteId: 'customer-123',
        },
      } as IOrganization;

      const { result } = renderHook(() =>
        useHandleReactivateModal({
          currentOrganization: organization,
          onClose: mockOnClose,
        })
      );

      expect(result.current.loading).toBe(false);
    });
  });

  describe('hook initialization', () => {
    it('should initialize with correct parameters', () => {
      const organization: IOrganization = {
        _id: 'org-123',
        payment: {
          type: Plans.ORG_PRO,
          status: STATUS.ACTIVE,
          customerRemoteId: 'customer-123',
        },
      } as IOrganization;

      renderHook(() =>
        useHandleReactivateModal({
          currentOrganization: organization,
          onClose: mockOnClose,
        })
      );

      expect(mockUseOrgBillingAction).toHaveBeenCalledWith({
        organization,
        isTrackEvent: true,
      });

      expect(mockUseReactivateCanceledCircle).toHaveBeenCalledWith({
        currentOrganization: organization,
        onClose: mockOnClose,
      });
    });
  });
});
