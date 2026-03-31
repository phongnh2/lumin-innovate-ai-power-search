import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';

import SubscriptionDetail from '../components/SubscriptionDetail/SubscriptionDetail';
import { UnifySubscriptionPlan } from 'constants/organization.enum';
import { Plans } from 'constants/plan';

jest.mock('../components/SubscriptionDetail/PremiumSubscription', () => (props: any) => (
  <div data-testid="premium-subscription">PremiumSubscription: {props.subscriptionItem?.paymentType}</div>
));

jest.mock('../components/SubscriptionDetail/PersonalSubscription', () => (props: any) => (
  <div data-testid="personal-subscription">PersonalSubscription: {props.user?.payment?.type}</div>
));

describe('SubscriptionDetail', () => {
  const baseSubscription = {
    nextInvoice: 1737000000,
    payment: { subscriptionItems: [] as any },
  };

  const baseUpcomingInvoice = {
    nextInvoice: 1737000000,
    currency: 'USD',
    amount: 9900,
  };

  const reactivateSubscription = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('renders PremiumSubscription', () => {
    it('for ORG_PRO plan', () => {
      const entity = {
        _id: 'org-1',
        payment: { type: UnifySubscriptionPlan.ORG_PRO },
      };
      const subscriptionItem = {
        paymentType: UnifySubscriptionPlan.ORG_PRO,
      };

      render(
        <BrowserRouter>
          <SubscriptionDetail
            entity={entity as any}
            subscriptionItem={subscriptionItem as any}
            subscription={baseSubscription as any}
            upcomingInvoice={baseUpcomingInvoice as any}
            reactivateSubscription={reactivateSubscription}
          />
        </BrowserRouter>
      );

      expect(screen.getByTestId('premium-subscription')).toBeInTheDocument();
      expect(screen.getByText(/ORG_PRO/)).toBeInTheDocument();
    });

    it('for ORG_STARTER plan', () => {
      const entity = {
        _id: 'org-1',
        payment: { type: UnifySubscriptionPlan.ORG_STARTER },
      };
      const subscriptionItem = {
        paymentType: UnifySubscriptionPlan.ORG_STARTER,
      };

      render(
        <BrowserRouter>
          <SubscriptionDetail
            entity={entity as any}
            subscriptionItem={subscriptionItem as any}
            subscription={baseSubscription as any}
            upcomingInvoice={baseUpcomingInvoice as any}
            reactivateSubscription={reactivateSubscription}
          />
        </BrowserRouter>
      );

      expect(screen.getByTestId('premium-subscription')).toBeInTheDocument();
    });

    it('for ORG_BUSINESS plan', () => {
      const entity = {
        _id: 'org-1',
        payment: { type: UnifySubscriptionPlan.ORG_BUSINESS },
      };
      const subscriptionItem = {
        paymentType: UnifySubscriptionPlan.ORG_BUSINESS,
      };

      render(
        <BrowserRouter>
          <SubscriptionDetail
            entity={entity as any}
            subscriptionItem={subscriptionItem as any}
            subscription={baseSubscription as any}
            upcomingInvoice={baseUpcomingInvoice as any}
            reactivateSubscription={reactivateSubscription}
          />
        </BrowserRouter>
      );

      expect(screen.getByTestId('premium-subscription')).toBeInTheDocument();
    });

    it('for ORG_SIGN_PRO plan', () => {
      const entity = {
        _id: 'org-1',
        payment: { type: UnifySubscriptionPlan.ORG_SIGN_PRO },
      };
      const subscriptionItem = {
        paymentType: UnifySubscriptionPlan.ORG_SIGN_PRO,
      };

      render(
        <BrowserRouter>
          <SubscriptionDetail
            entity={entity as any}
            subscriptionItem={subscriptionItem as any}
            subscription={baseSubscription as any}
            upcomingInvoice={baseUpcomingInvoice as any}
            reactivateSubscription={reactivateSubscription}
          />
        </BrowserRouter>
      );

      expect(screen.getByTestId('premium-subscription')).toBeInTheDocument();
    });

    it('for OLD_BUSINESS_PLANS (BUSINESS)', () => {
      const entity = {
        _id: 'org-1',
        payment: { type: Plans.BUSINESS },
      };
      const subscriptionItem = {
        paymentType: 'OTHER',
      };

      render(
        <BrowserRouter>
          <SubscriptionDetail
            entity={entity as any}
            subscriptionItem={subscriptionItem as any}
            subscription={baseSubscription as any}
            upcomingInvoice={baseUpcomingInvoice as any}
            reactivateSubscription={reactivateSubscription}
          />
        </BrowserRouter>
      );

      expect(screen.getByTestId('premium-subscription')).toBeInTheDocument();
    });

    it('for OLD_BUSINESS_PLANS (ENTERPRISE)', () => {
      const entity = {
        _id: 'org-1',
        payment: { type: Plans.ENTERPRISE },
      };
      const subscriptionItem = {
        paymentType: 'OTHER',
      };

      render(
        <BrowserRouter>
          <SubscriptionDetail
            entity={entity as any}
            subscriptionItem={subscriptionItem as any}
            subscription={baseSubscription as any}
            upcomingInvoice={baseUpcomingInvoice as any}
            reactivateSubscription={reactivateSubscription}
          />
        </BrowserRouter>
      );

      expect(screen.getByTestId('premium-subscription')).toBeInTheDocument();
    });
  });

  describe('renders PersonalSubscription', () => {
    it('for PROFESSIONAL plan in payment.type', () => {
      const entity = {
        _id: 'user-1',
        payment: { type: Plans.PROFESSIONAL },
      };

      render(
        <BrowserRouter>
          <SubscriptionDetail
            entity={entity as any}
            subscription={baseSubscription as any}
            upcomingInvoice={baseUpcomingInvoice as any}
            reactivateSubscription={reactivateSubscription}
          />
        </BrowserRouter>
      );

      expect(screen.getByTestId('personal-subscription')).toBeInTheDocument();
    });

    it('for PERSONAL plan in payment.type', () => {
      const entity = {
        _id: 'user-1',
        payment: { type: Plans.PERSONAL },
      };

      render(
        <BrowserRouter>
          <SubscriptionDetail
            entity={entity as any}
            subscription={baseSubscription as any}
            upcomingInvoice={baseUpcomingInvoice as any}
            reactivateSubscription={reactivateSubscription}
          />
        </BrowserRouter>
      );

      expect(screen.getByTestId('personal-subscription')).toBeInTheDocument();
    });

    it('for PROFESSIONAL plan in subscriptionItem.paymentType', () => {
      const entity = {
        _id: 'user-1',
        payment: { type: 'OTHER' },
      };
      const subscriptionItem = {
        paymentType: Plans.PROFESSIONAL,
      };

      render(
        <BrowserRouter>
          <SubscriptionDetail
            entity={entity as any}
            subscriptionItem={subscriptionItem as any}
            subscription={baseSubscription as any}
            upcomingInvoice={baseUpcomingInvoice as any}
            reactivateSubscription={reactivateSubscription}
          />
        </BrowserRouter>
      );

      expect(screen.getByTestId('personal-subscription')).toBeInTheDocument();
    });

    it('for PERSONAL plan in subscriptionItem.paymentType', () => {
      const entity = {
        _id: 'user-1',
        payment: { type: 'OTHER' },
      };
      const subscriptionItem = {
        paymentType: Plans.PERSONAL,
      };

      render(
        <BrowserRouter>
          <SubscriptionDetail
            entity={entity as any}
            subscriptionItem={subscriptionItem as any}
            subscription={baseSubscription as any}
            upcomingInvoice={baseUpcomingInvoice as any}
            reactivateSubscription={reactivateSubscription}
          />
        </BrowserRouter>
      );

      expect(screen.getByTestId('personal-subscription')).toBeInTheDocument();
    });
  });

  describe('renders nothing', () => {
    it('for FREE plan', () => {
      const entity = {
        _id: 'user-1',
        payment: { type: Plans.FREE },
      };
      const subscriptionItem = {
        paymentType: Plans.FREE,
      };

      const { container } = render(
        <BrowserRouter>
          <SubscriptionDetail
            entity={entity as any}
            subscriptionItem={subscriptionItem as any}
            subscription={baseSubscription as any}
            upcomingInvoice={baseUpcomingInvoice as any}
            reactivateSubscription={reactivateSubscription}
          />
        </BrowserRouter>
      );

      expect(screen.queryByTestId('premium-subscription')).not.toBeInTheDocument();
      expect(screen.queryByTestId('personal-subscription')).not.toBeInTheDocument();
      expect(container.querySelector('.container')).toBeEmptyDOMElement();
    });

    it('for unknown plan type', () => {
      const entity = {
        _id: 'user-1',
        payment: { type: 'UNKNOWN_PLAN' },
      };
      const subscriptionItem = {
        paymentType: 'UNKNOWN_PLAN',
      };

      const { container } = render(
        <BrowserRouter>
          <SubscriptionDetail
            entity={entity as any}
            subscriptionItem={subscriptionItem as any}
            subscription={baseSubscription as any}
            upcomingInvoice={baseUpcomingInvoice as any}
            reactivateSubscription={reactivateSubscription}
          />
        </BrowserRouter>
      );

      expect(screen.queryByTestId('premium-subscription')).not.toBeInTheDocument();
      expect(screen.queryByTestId('personal-subscription')).not.toBeInTheDocument();
    });
  });

  describe('default subscriptionItem', () => {
    it('handles missing subscriptionItem prop', () => {
      const entity = {
        _id: 'org-1',
        payment: { type: Plans.BUSINESS },
      };

      render(
        <BrowserRouter>
          <SubscriptionDetail
            entity={entity as any}
            subscription={baseSubscription as any}
            upcomingInvoice={baseUpcomingInvoice as any}
            reactivateSubscription={reactivateSubscription}
          />
        </BrowserRouter>
      );

      expect(screen.getByTestId('premium-subscription')).toBeInTheDocument();
    });
  });
});
