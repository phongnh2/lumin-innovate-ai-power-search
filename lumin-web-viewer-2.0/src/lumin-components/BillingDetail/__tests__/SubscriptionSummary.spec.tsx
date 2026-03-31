import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { KiwiProvider } from 'lumin-ui/kiwi-ui';

import SubscriptionSummary from '../components/SubscriptionSummary/SubscriptionSummary';
import { PERIOD, Plans } from 'constants/plan';
import { UnifySubscriptionPlan } from 'constants/organization.enum';
import { PaymentStatus } from 'constants/plan.enum';

jest.mock('hooks', () => ({
  useTranslation: () => ({ t: (key: string, params?: any) => (params ? `${key}_${JSON.stringify(params)}` : key) }),
}));

jest.mock('utils', () => ({
  avatar: {
    getAvatar: (remoteId: string) => (remoteId ? `https://avatar.com/${remoteId}` : null),
  },
}));

jest.mock('utils/payment', () => ({
  PaymentHelpers: {
    isOrgTrialing: jest.fn(),
  },
}));

const { PaymentHelpers } = require('utils/payment');

const wrapper = (ui: React.ReactNode) => render(<KiwiProvider>{ui}</KiwiProvider>);

describe('SubscriptionSummary', () => {
  const basePayment = {
    type: UnifySubscriptionPlan.ORG_PRO,
    period: PERIOD.ANNUAL,
    status: PaymentStatus.ACTIVE,
    subscriptionItems: [] as any,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    PaymentHelpers.isOrgTrialing.mockReturnValue(false);
  });

  describe('Plan details', () => {
    it('renders free plan', () => {
      const subscriptionItem = {
        paymentType: Plans.FREE,
        paymentStatus: PaymentStatus.ACTIVE,
      };

      wrapper(
        <SubscriptionSummary name="Test Org" payment={basePayment as any} subscriptionItem={subscriptionItem as any} />
      );

      expect(screen.getByText('common.free')).toBeInTheDocument();
    });

    it('renders trial plan', () => {
      PaymentHelpers.isOrgTrialing.mockReturnValue(true);
      const subscriptionItem = {
        paymentType: UnifySubscriptionPlan.ORG_PRO,
        paymentStatus: PaymentStatus.TRIALING,
      };

      wrapper(
        <SubscriptionSummary name="Test Org" payment={basePayment as any} subscriptionItem={subscriptionItem as any} />
      );

      expect(screen.getByText(/common\.planTrial/)).toBeInTheDocument();
    });

    it('renders annual plan', () => {
      const subscriptionItem = {
        paymentType: UnifySubscriptionPlan.ORG_PRO,
        paymentStatus: PaymentStatus.ACTIVE,
      };

      wrapper(
        <SubscriptionSummary name="Test Org" payment={basePayment as any} subscriptionItem={subscriptionItem as any} />
      );

      expect(screen.getByText(/common\.planAnnual/)).toBeInTheDocument();
    });

    it('renders monthly plan', () => {
      const payment = {
        ...basePayment,
        period: PERIOD.MONTHLY,
      };
      const subscriptionItem = {
        paymentType: UnifySubscriptionPlan.ORG_PRO,
        paymentStatus: PaymentStatus.ACTIVE,
      };

      wrapper(
        <SubscriptionSummary name="Test Org" payment={payment as any} subscriptionItem={subscriptionItem as any} />
      );

      expect(screen.getByText(/common\.planMonthly/)).toBeInTheDocument();
    });

    it('uses payment.type when subscriptionItem.paymentType is not available', () => {
      wrapper(<SubscriptionSummary name="Test Org" payment={basePayment as any} />);

      expect(screen.getByText(/common\.planAnnual/)).toBeInTheDocument();
    });
  });

  describe('Organization info', () => {
    it('renders organization name', () => {
      wrapper(<SubscriptionSummary name="My Organization" payment={basePayment as any} />);

      expect(screen.getByText('My Organization')).toBeInTheDocument();
    });

    it('renders avatar with remote ID', () => {
      wrapper(<SubscriptionSummary name="Test Org" avatarRemoteId="remote-123" payment={basePayment as any} />);

      const avatar = screen.getByRole('img');
      expect(avatar).toHaveAttribute('src', 'https://avatar.com/remote-123');
    });

    it('renders default avatar when no avatarRemoteId provided', () => {
      wrapper(<SubscriptionSummary name="Test Org" payment={basePayment as any} />);

      const avatar = screen.getByRole('img');
      expect(avatar).toHaveAttribute('src');
    });

    it('shows tooltip with organization name', () => {
      wrapper(<SubscriptionSummary name="Very Long Organization Name" payment={basePayment as any} />);

      expect(screen.getByText('Very Long Organization Name')).toBeInTheDocument();
    });
  });

  describe('Different plan types', () => {
    it('renders ORG_STARTER plan', () => {
      const subscriptionItem = {
        paymentType: UnifySubscriptionPlan.ORG_STARTER,
        paymentStatus: PaymentStatus.ACTIVE,
      };

      wrapper(
        <SubscriptionSummary name="Test Org" payment={basePayment as any} subscriptionItem={subscriptionItem as any} />
      );

      expect(screen.getByText(/common\.planAnnual/)).toBeInTheDocument();
    });

    it('renders ORG_BUSINESS plan', () => {
      const subscriptionItem = {
        paymentType: UnifySubscriptionPlan.ORG_BUSINESS,
        paymentStatus: PaymentStatus.ACTIVE,
      };

      wrapper(
        <SubscriptionSummary name="Test Org" payment={basePayment as any} subscriptionItem={subscriptionItem as any} />
      );

      expect(screen.getByText(/common\.planAnnual/)).toBeInTheDocument();
    });

    it('renders PROFESSIONAL personal plan', () => {
      const payment = {
        ...basePayment,
        type: Plans.PROFESSIONAL,
      };

      wrapper(<SubscriptionSummary name="Test User" payment={payment as any} />);

      expect(screen.getByText(/common\.planAnnual/)).toBeInTheDocument();
    });
  });
});
