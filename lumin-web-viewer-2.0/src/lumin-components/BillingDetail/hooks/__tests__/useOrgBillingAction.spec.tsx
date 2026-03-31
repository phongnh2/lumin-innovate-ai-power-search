import React from 'react';
import { renderHook } from '@testing-library/react';
import useOrgBillingAction from '../useOrgBillingAction';
import { WarningBannerContext } from 'HOC/withWarningBanner';
import { WarningBannerType } from 'constants/banner';
import { PaymentStatus } from 'constants/plan.enum';
import organizationTracking from 'services/awsTracking/organizationTracking';
import { act } from '@testing-library/react';
import { organizationServices, paymentServices } from 'services';
import { ErrorCode } from 'constants/errorCode';
import actions from 'actions';
import { useEnableWebReskin } from 'hooks';

const mockNavigate = jest.fn();
const mockRefetch = jest.fn();
const mockUpdateOrganizationPayment = jest.fn();
const mockToggleReactivateModal = jest.fn();

jest.mock('utils/error', () => ({
  extractGqlError: () => ({
    code: 'scheduled_delete',
  }),
}));

jest.mock('react-redux', () => ({
  useDispatch: () => jest.fn(),
  batch: (fn: () => void) => fn(),
  useSelector: jest.fn(() => ({ deletedAt: null } as any)),
  shallowEqual: jest.fn(),
}));

jest.mock('react-router', () => ({
  useNavigate: () => mockNavigate,
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
  Trans: ({ children }: any) => children,
}));

jest.mock('../useUpdateOrgPayment', () =>
  jest.fn(() => ({
    updateOrganizationPayment: mockUpdateOrganizationPayment,
  }))
);

jest.mock('hooks', () => ({
  useEnableWebReskin: jest.fn(),
}));

jest.mock('hooks/useRestrictBillingActions', () =>
  jest.fn(() => ({
    isRestrictedOrg: false,
    openRestrictActionsModal: jest.fn(),
  }))
);

jest.mock('hooks/useReactivateAccount', () =>
  jest.fn(() => ({
    openReactivateModal: jest.fn(),
  }))
);

jest.mock('features/ReactivateUnifySubscription/hooks', () => ({
  useReactivateUnifySubscriptionModal: jest.fn(() => ({
    render: jest.fn((): null => null),
    toggle: mockToggleReactivateModal,
  })),
}));

jest.mock('services/awsTracking/organizationTracking', () => ({
  trackReactivateSetToCancelCircle: jest.fn(),
}));

jest.mock('utils/getLanguage', () => ({
  getLanguage: () => 'en',
}));

describe('useOrgBillingAction', () => {
  const mockOrganization = {
    _id: 'org-123',
    url: 'test-org',
    name: 'Test Org',
    payment: {
      subscriptionItems: [{ productName: 'PDF', paymentStatus: PaymentStatus.ACTIVE }],
    },
  };

  const contextValue = {
    [WarningBannerType.BILLING_WARNING.value]: {
      refetch: mockRefetch,
    },
  };

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <WarningBannerContext.Provider value={contextValue as any}>{children}</WarningBannerContext.Provider>
  );

  beforeEach(() => {
    jest.clearAllMocks();

    (useEnableWebReskin as jest.Mock).mockReturnValue({
      isEnableReskin: false,
    });
    jest.spyOn(actions, 'openModal').mockImplementation(jest.fn());
  });

  it('toggles reactivate modal if multiple canceled subscriptions', async () => {
    const toggleReactivateUnifySubscriptionModal = jest.fn();

    jest
      .mocked(require('features/ReactivateUnifySubscription/hooks').useReactivateUnifySubscriptionModal)
      .mockReturnValueOnce({
        render: jest.fn(),
        toggle: toggleReactivateUnifySubscriptionModal,
      });

    const orgWithCanceledSubs = {
      ...mockOrganization,
      payment: {
        subscriptionItems: [
          { productName: 'PDF', paymentStatus: PaymentStatus.CANCELED },
          { productName: 'DOC', paymentStatus: PaymentStatus.CANCELED },
        ],
      },
    };

    const { result } = renderHook(() => useOrgBillingAction({ organization: orgWithCanceledSubs as any }), { wrapper });

    await act(async () => {
      await result.current.reactivate();
    });

    expect(toggleReactivateUnifySubscriptionModal).toHaveBeenCalled();
  });

  it('sets modal type to null when reskin is enabled', async () => {
    (useEnableWebReskin as jest.Mock).mockReturnValueOnce({ isEnableReskin: true });

    const setUnifyBillingSubscriptionData = jest.fn();

    jest.spyOn(organizationServices, 'reactivateUnifyOrganizationSubscription').mockResolvedValue({
      data: {},
    } as any);

    jest.spyOn(paymentServices, 'getUnifySubscription').mockResolvedValue({} as any);

    const { result } = renderHook(
      () =>
        useOrgBillingAction({
          organization: mockOrganization as any,
          setUnifyBillingSubscriptionData,
        }),
      { wrapper }
    );

    await act(async () => {
      await result.current.reactivate();
    });

    expect(actions.openModal).toHaveBeenCalled();
  });

  it('opens scheduled delete modal on scheduled delete error', async () => {
    jest
      .spyOn(organizationServices, 'reactivateUnifyOrganizationSubscription')
      .mockRejectedValue(new Error('scheduled delete'));

    const { result } = renderHook(
      () =>
        useOrgBillingAction({
          organization: {
            ...mockOrganization,
            userRole: 'OWNER',
            deletedAt: '2024-01-01',
          } as any,
        }),
      { wrapper }
    );

    await act(async () => {
      await result.current.reactivate();
    });

    expect(actions.openModal).toBeDefined();
  });

  it('reactivates plan successfully', async () => {
    const setUnifyBillingSubscriptionData = jest.fn();

    jest.spyOn(organizationServices, 'reactivateUnifyOrganizationSubscription').mockResolvedValue({
      data: {},
    } as any);

    jest.spyOn(paymentServices, 'getUnifySubscription').mockResolvedValue({} as any);

    const { result } = renderHook(
      () =>
        useOrgBillingAction({
          organization: mockOrganization as any,
          setUnifyBillingSubscriptionData,
        }),
      { wrapper }
    );

    await act(async () => {
      await result.current.reactivate();
    });

    expect(setUnifyBillingSubscriptionData).toHaveBeenCalled();
  });

  it('tracks event when isTrackEvent = true', async () => {
    const reactivateResponse = {
      customerRemoteId: 'cus_1',
      subscriptionRemoteId: 'sub_1',
      planRemoteId: 'plan_1',
    };

    jest.spyOn(organizationServices, 'reactivateUnifyOrganizationSubscription').mockResolvedValue({
      data: reactivateResponse,
    } as any);

    jest.spyOn(paymentServices, 'getUnifySubscription').mockResolvedValue({} as any);

    const setUnifyBillingSubscriptionData = jest.fn();

    const { result } = renderHook(
      () =>
        useOrgBillingAction({
          organization: mockOrganization as any,
          isTrackEvent: true,
          setUnifyBillingSubscriptionData,
        }),
      { wrapper }
    );

    await act(async () => {
      await result.current.reactivate();
    });

    expect(organizationTracking.trackReactivateSetToCancelCircle).toHaveBeenCalledWith({
      organizationId: mockOrganization._id,
      customerRemoteId: 'cus_1',
      subscriptionRemoteId: 'sub_1',
      planRemoteId: 'plan_1',
    });
  });

  it('returns cancel, reactivate and render function', () => {
    const { result } = renderHook(() => useOrgBillingAction({ organization: mockOrganization as any }), { wrapper });

    expect(result.current.cancel).toBeDefined();
    expect(result.current.reactivate).toBeDefined();
    expect(result.current.renderReactivateUnifySubscriptionModal).toBeDefined();
  });

  it('navigates to cancel page when calling cancel', () => {
    const { result } = renderHook(() => useOrgBillingAction({ organization: mockOrganization as any }), { wrapper });

    result.current.cancel();

    expect(mockNavigate).toHaveBeenCalledWith('/workspace/test-org/subscription/survey');
  });

  it('calls cancelAction if provided', () => {
    const mockCancelAction = jest.fn();

    const { result } = renderHook(
      () =>
        useOrgBillingAction({
          organization: mockOrganization as any,
          cancelAction: mockCancelAction,
        }),
      { wrapper }
    );

    result.current.cancel();

    expect(mockCancelAction).toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalled();
  });
});
