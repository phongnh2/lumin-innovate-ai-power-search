import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';

import PremiumSubscription from '../components/SubscriptionDetail/PremiumSubscription';
import { PaymentStatus } from 'constants/plan.enum';
import { UnifySubscriptionPlan, UnifySubscriptionProduct } from 'constants/organization.enum';
import { PERIOD, Plans } from 'constants/plan';

jest.mock('utils/getLanguage', () => ({
  getLanguage: () => 'en',
  getFullPathWithPresetLang: (path: string) => path,
}));

jest.mock('hooks', () => ({
  useTranslation: () => ({ t: (s: string) => s }),
}));

jest.mock('hooks/useTrackingBillingEventName', () => ({
  useTrackingBillingEventName: () => ({
    getTrackGoPremiumEventName: () => 'go_premium_event',
  }),
}));

jest.mock('utils/date', () => ({
  formatMDYTime: () => '01/15/2025',
}));

jest.mock('utils/numberUtils', () => ({
  formatDecimal: (num: number) => num.toFixed(2),
}));

jest.mock('utils/paymentUtil', () => ({
  convertCurrencySymbol: () => '$',
}));

jest.mock('utils/payment', () => ({
  PaymentHelpers: {
    isDocStackPlan: jest.fn((plan: string) => ['ORG_PRO', 'ORG_STARTER', 'ORG_BUSINESS'].includes(plan)),
    isSignProduct: jest.fn((name: string) => name === 'SIGN'),
    isMatchingUnifyPaymentStatus: jest.fn(),
  },
  PaymentUrlSerializer: class {
    of() {
      return this;
    }
    product() {
      return this;
    }
    plan() {
      return this;
    }
    returnUrlParam() {
      return this;
    }
    get() {
      return '/mock-url';
    }
  },
}));

jest.mock('../components/SubscriptionDetail/PremiumButtonGroup', () => (props: any) => (
  <div data-testid="premium-btn-group">
    <span data-testid="btn-text">{props.upgradeButtonProps?.text}</span>
    <span data-testid="has-pending">{String(props.hasPendingInvoice)}</span>
  </div>
));

jest.mock('react-i18next', () => ({
  Trans: ({ i18nKey, values }: any) => (
    <span data-testid="trans">
      {i18nKey} {values && JSON.stringify(values)}
    </span>
  ),
}));

const { PaymentHelpers } = require('utils/payment');

describe('PremiumSubscription', () => {
  const baseOrganization = {
    _id: 'org-1',
    payment: {
      status: PaymentStatus.ACTIVE,
      type: UnifySubscriptionPlan.ORG_PRO,
      period: PERIOD.ANNUAL,
      quantity: 10,
      subscriptionItems: [] as any,
    },
    docStackStorage: {
      totalStack: 5,
    },
    hasPendingInvoice: false,
  };

  const baseSubscriptionItem = {
    productName: UnifySubscriptionProduct.PDF,
    paymentType: UnifySubscriptionPlan.ORG_PRO,
    paymentStatus: PaymentStatus.ACTIVE,
    amount: 9900,
    quantity: 5,
  };

  const baseSubscription = {
    nextInvoice: 1737000000,
  };

  const baseUpcomingInvoice = {
    nextInvoice: 1737000000,
    currency: 'USD',
    creditBalance: 0,
  };

  const reactivateSubscription = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    PaymentHelpers.isMatchingUnifyPaymentStatus.mockReturnValue(false);
    PaymentHelpers.isDocStackPlan.mockReturnValue(true);
    PaymentHelpers.isSignProduct.mockReturnValue(false);
  });

  const renderComponent = (props: Partial<Parameters<typeof PremiumSubscription>[0]> = {}) =>
    render(
      <BrowserRouter>
        <PremiumSubscription
          organization={baseOrganization as any}
          subscriptionItem={baseSubscriptionItem as any}
          subscription={baseSubscription as any}
          upcomingInvoice={baseUpcomingInvoice as any}
          reactivateSubscription={reactivateSubscription}
          {...props}
        />
      </BrowserRouter>
    );

  describe('Plan description', () => {
    it('renders annual premium plan description for DocStack plan', () => {
      renderComponent();

      expect(screen.getByText(/settingBilling\.autoRenewAnnualPremiumPlan/)).toBeInTheDocument();
    });

    it('renders monthly premium plan description for DocStack plan', () => {
      const org = {
        ...baseOrganization,
        payment: { ...baseOrganization.payment, period: PERIOD.MONTHLY },
      };

      renderComponent({ organization: org as any });

      expect(screen.getByText(/settingBilling\.autoRenewMonthlyPremiumPlan/)).toBeInTheDocument();
    });

    it('renders trial annual description when trialing', () => {
      PaymentHelpers.isMatchingUnifyPaymentStatus.mockImplementation(
        ({ status }: any) => status === PaymentStatus.TRIALING
      );

      renderComponent();

      expect(screen.getByText(/settingBilling\.autoRenewTrialAnnualPremiumPlan/)).toBeInTheDocument();
    });

    it('renders trial monthly description when trialing with monthly period', () => {
      PaymentHelpers.isMatchingUnifyPaymentStatus.mockImplementation(
        ({ status }: any) => status === PaymentStatus.TRIALING
      );
      const org = {
        ...baseOrganization,
        payment: { ...baseOrganization.payment, period: PERIOD.MONTHLY },
      };

      renderComponent({ organization: org as any });

      expect(screen.getByText(/settingBilling\.autoRenewTrialMonthlyPremiumPlan/)).toBeInTheDocument();
    });

    it('renders Sign product annual description', () => {
      PaymentHelpers.isSignProduct.mockReturnValue(true);
      const signItem = {
        ...baseSubscriptionItem,
        productName: UnifySubscriptionProduct.SIGN,
        paymentType: UnifySubscriptionPlan.ORG_SIGN_PRO,
      };

      renderComponent({ subscriptionItem: signItem as any });

      expect(screen.getByText(/settingBilling\.autoRenewAnnualPremiumSignPlanPlural/)).toBeInTheDocument();
    });

    it('renders Sign product monthly description', () => {
      PaymentHelpers.isSignProduct.mockReturnValue(true);
      const org = {
        ...baseOrganization,
        payment: { ...baseOrganization.payment, period: PERIOD.MONTHLY },
      };
      const signItem = {
        ...baseSubscriptionItem,
        productName: UnifySubscriptionProduct.SIGN,
        paymentType: UnifySubscriptionPlan.ORG_SIGN_PRO,
      };

      renderComponent({ organization: org as any, subscriptionItem: signItem as any });

      expect(screen.getByText(/settingBilling\.autoRenewMonthlyPremiumSignPlanPlural/)).toBeInTheDocument();
    });

    it('renders old annual plan description for non-DocStack plans', () => {
      PaymentHelpers.isDocStackPlan.mockReturnValue(false);
      const org = {
        ...baseOrganization,
        payment: { ...baseOrganization.payment, type: Plans.BUSINESS },
      };
      const item = { ...baseSubscriptionItem, paymentType: Plans.BUSINESS };

      renderComponent({ organization: org as any, subscriptionItem: item as any });

      expect(screen.getByText(/settingBilling\.autoRenewOldAnnualPremiumPlan/)).toBeInTheDocument();
    });

    it('renders old monthly plan description for non-DocStack plans', () => {
      PaymentHelpers.isDocStackPlan.mockReturnValue(false);
      const org = {
        ...baseOrganization,
        payment: { ...baseOrganization.payment, type: Plans.BUSINESS, period: PERIOD.MONTHLY },
      };
      const item = { ...baseSubscriptionItem, paymentType: Plans.BUSINESS };

      renderComponent({ organization: org as any, subscriptionItem: item as any });

      expect(screen.getByText(/settingBilling\.autoRenewOldMonthlyPremiumPlan/)).toBeInTheDocument();
    });
  });

  describe('Price description', () => {
    it('renders cancelled plan message when isCanceling', () => {
      PaymentHelpers.isMatchingUnifyPaymentStatus.mockImplementation(
        ({ status }: any) => status === PaymentStatus.CANCELED
      );

      renderComponent();

      expect(screen.getByText(/settingBilling\.cancelledPlan/)).toBeInTheDocument();
    });

    it('returns null when no upcomingInvoice and not canceling', () => {
      renderComponent({ upcomingInvoice: null as any });

      expect(screen.queryByText(/orgDashboardBilling\.autoRenew/)).not.toBeInTheDocument();
    });

    it('renders auto-renew message with upcoming invoice', () => {
      renderComponent();

      expect(screen.getByText(/orgDashboardBilling\.autoRenew/)).toBeInTheDocument();
    });

    it('renders charge after trial end message when trialing', () => {
      PaymentHelpers.isMatchingUnifyPaymentStatus.mockImplementation(
        ({ status }: any) => status === PaymentStatus.TRIALING
      );

      renderComponent();

      expect(screen.getByText(/orgDashboardBilling\.chargeAfterEnd/)).toBeInTheDocument();
    });

    it('renders credit balance info when creditBalance > 0', () => {
      const invoice = { ...baseUpcomingInvoice, creditBalance: 5000 };

      renderComponent({ upcomingInvoice: invoice as any });

      expect(screen.getByText(/orgDashboardBilling\.informUnusedPreviousPlan/)).toBeInTheDocument();
    });

    it('does not render credit balance info when creditBalance is 0', () => {
      renderComponent();

      expect(screen.queryByText(/orgDashboardBilling\.informUnusedPreviousPlan/)).not.toBeInTheDocument();
    });

    it('renders credit balance info when trialing with creditBalance', () => {
      PaymentHelpers.isMatchingUnifyPaymentStatus.mockImplementation(
        ({ status }: any) => status === PaymentStatus.TRIALING
      );
      const invoice = { ...baseUpcomingInvoice, creditBalance: 3000 };

      renderComponent({ upcomingInvoice: invoice as any });

      expect(screen.getByText(/orgDashboardBilling\.informUnusedPreviousPlan/)).toBeInTheDocument();
    });
  });

  describe('Quantity handling', () => {
    it('uses docStackStorage.totalStack for PDF DocStack plans', () => {
      PaymentHelpers.isDocStackPlan.mockReturnValue(true);

      renderComponent();

      expect(screen.getByText(/"quantity":5/)).toBeInTheDocument();
    });

    it('uses payment.quantity for non-DocStack plans', () => {
      PaymentHelpers.isDocStackPlan.mockReturnValue(false);

      renderComponent();

      expect(screen.getByText(/"quantity":10/)).toBeInTheDocument();
    });

    it('uses subscriptionItem.quantity for Sign products', () => {
      PaymentHelpers.isSignProduct.mockReturnValue(true);
      const signItem = {
        ...baseSubscriptionItem,
        productName: UnifySubscriptionProduct.SIGN,
        quantity: 15,
      };

      renderComponent({ subscriptionItem: signItem as any });

      expect(screen.getByText(/"quantity":15/)).toBeInTheDocument();
    });
  });

  describe('Upgrade button props', () => {
    it('passes hasPendingInvoice to PremiumButtonGroup', () => {
      const org = { ...baseOrganization, hasPendingInvoice: true };

      renderComponent({ organization: org as any });

      expect(screen.getByTestId('has-pending')).toHaveTextContent('true');
    });

    it('renders upgrade plan text', () => {
      renderComponent();

      expect(screen.getByTestId('btn-text')).toHaveTextContent('common.upgradePlan');
    });

    it('renders contact sales text for enterprise plan', () => {
      const org = {
        ...baseOrganization,
        payment: { ...baseOrganization.payment, type: Plans.ENTERPRISE },
      };

      renderComponent({ organization: org as any });

      expect(screen.getByTestId('btn-text')).toHaveTextContent('settingBilling.contactSalesToUpgrade');
    });
  });

  describe('PremiumButtonGroup integration', () => {
    it('renders PremiumButtonGroup', () => {
      renderComponent();

      expect(screen.getByTestId('premium-btn-group')).toBeInTheDocument();
    });
  });
});
