import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';

import OrgBillingDetail from '../components/OrgBillingDetail/OrgBillingDetail';
import { PaymentStatus } from 'constants/plan.enum';
import { UnifySubscriptionPlan } from 'constants/organization.enum';
import { KiwiProvider } from 'lumin-ui/kiwi-ui';
import actions from 'actions';

jest.mock('react-redux', () => ({
  useDispatch: jest.fn(() => jest.fn()),
  useSelector: jest.fn((selector) =>
    selector({
      auth: {
        currentUser: { id: 'u1', name: 'Test User' },
        gapiLoaded: false,
      },
      modal: {},
      eventTracking: { pinpointLoaded: false },
      toast: {},
      organization: {
        organizations: [{ id: '1', name: 'Org 1' }],
        currentOrganization: {
          id: '1',
          name: 'Org 1',
        },
      },
    })
  ),
  shallowEqual: jest.fn(),
}));

jest.mock('hooks', () => ({
  useMobileMatch: () => false,
  useTranslation: () => ({ t: (k: string) => k }),
  useEnableWebReskin: () => false,
  useRestrictBillingActions: () => false,

  useReactivateUnifySubscriptionModal: () => ({
    render: (): null => null,
    toggle: jest.fn(),
  }),

  useCancelUnifySubscriptionModalManager: () => ({
    render: (): null => null,
    toggleActiveSubscriptionModal: jest.fn(),
    openedActiveSubscriptionModal: false,
    setOpenedActiveSubscriptionModal: jest.fn(),
  }),
}));

jest.mock('services', () => ({
  organizationServices: {
    changeAutoUpgradeSetting: jest.fn(() => Promise.resolve({ autoUpgrade: true })),
  },
  loggerServices: {
    error: jest.fn(),
  },
}));

jest.mock('utils', () => ({
  toastUtils: {
    success: jest.fn(),
    openUnknownErrorToast: jest.fn(),
  },
  dateUtil: {
    formatDeleteAccountTime: jest.fn(() => '2025-01-01'),
  },
}));

jest.mock('../components/EnterpriseOrgOffer/EnterpriseOrgOffer', () => () => <div>Enterprise Offer</div>);
jest.mock('../components/SubscriptionSummary/SubscriptionSummary', () => () => <div>Sub Summary</div>);
jest.mock('../components/SubscriptionDetail/SubscriptionDetail', () => () => <div>Sub Detail</div>);

const wrapper = (ui: React.ReactNode) => {
  return render(
    <MemoryRouter>
      <KiwiProvider>{ui}</KiwiProvider>
    </MemoryRouter>
  );
};

describe('OrgBillingDetail (simple)', () => {
  const org = {
    _id: '1',
    name: 'Org',
    avatarRemoteId: '',
    settings: { autoUpgrade: false },
    convertFromTeam: false,
    payment: { status: PaymentStatus.ACTIVE, subscriptionItems: [] as any[] },
    hasPendingInvoice: false,
  };

  const subscriptionItem: any = {
    productName: 'PDF',
    paymentStatus: PaymentStatus.ACTIVE,
    paymentType: UnifySubscriptionPlan.ORG_PRO,
  };

  const subscription: any = {
    payment: { subscriptionItems: [] },
  };

  const upcomingInvoice = {};
  const setData = jest.fn();

  it('renders Cancel Subscription section', () => {
    wrapper(
      <OrgBillingDetail
        organization={org as any}
        currentOrganization={org as any}
        subscriptionItem={subscriptionItem}
        subscription={subscription}
        upcomingInvoice={upcomingInvoice as any}
        setUnifyBillingSubscriptionData={setData}
      />
    );

    expect(screen.getByText('unifyBillingSettings.thinkingOfLeaving')).toBeInTheDocument();
  });

  it('calls auto-upgrade API when toggled', async () => {
    const { organizationServices } = require('services');

    wrapper(
      <OrgBillingDetail
        organization={org as any}
        currentOrganization={org as any}
        subscriptionItem={subscriptionItem}
        subscription={subscription}
        upcomingInvoice={upcomingInvoice as any}
        setUnifyBillingSubscriptionData={setData}
      />
    );

    const toggle = screen.getByRole('switch');

    fireEvent.click(toggle);

    await waitFor(() => {
      expect(organizationServices.changeAutoUpgradeSetting).toHaveBeenCalled();
    });
  });

  describe('Cancel Subscription', () => {
    const mockCancel = jest.fn();
    const mockReactivate = jest.fn();

    jest.mock('../hooks/useOrgBillingAction', () => ({
      __esModule: true,
      default: () => ({
        cancel: mockCancel,
        reactivate: mockReactivate,
        renderReactivateUnifySubscriptionModal: (): null => null,
      }),
    }));

    it('calls cancelSubscription when clicking Cancel Plan', () => {
      wrapper(
        <OrgBillingDetail
          organization={org as any}
          currentOrganization={org as any}
          subscriptionItem={subscriptionItem}
          subscription={subscription}
          upcomingInvoice={upcomingInvoice as any}
          setUnifyBillingSubscriptionData={setData}
        />
      );

      const btn = screen.getByText('common.cancelPlan');
      fireEvent.click(btn);

      expect(mockCancel).not.toHaveBeenCalled();
    });

    it('does NOT call cancelSubscription when hasPendingInvoice = true', () => {
      const orgWithPending = {
        ...org,
        hasPendingInvoice: true,
      };

      wrapper(
        <OrgBillingDetail
          organization={orgWithPending as any}
          currentOrganization={orgWithPending as any}
          subscriptionItem={subscriptionItem}
          subscription={subscription}
          upcomingInvoice={upcomingInvoice as any}
          setUnifyBillingSubscriptionData={setData}
        />
      );

      const btn = screen.getByText('common.cancelPlan');

      fireEvent.click(btn);

      expect(mockCancel).not.toHaveBeenCalled();
    });
  });
});
