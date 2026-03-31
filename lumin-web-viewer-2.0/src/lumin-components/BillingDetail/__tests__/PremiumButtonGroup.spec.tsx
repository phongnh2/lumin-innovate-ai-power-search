import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import { KiwiProvider } from 'lumin-ui/kiwi-ui';

import PremiumButtonGroup from '../components/SubscriptionDetail/PremiumButtonGroup';
import { PaymentStatus } from 'constants/plan.enum';

jest.mock('hooks', () => ({
  useTranslation: () => ({ t: (s: string) => s }),
  useMobileMatch: () => false,
}));

jest.mock('utils', () => ({
  commonUtils: {
    formatTitleCaseByLocale: (s: string) => s,
  },
}));

jest.mock('utils/payment', () => ({
  PaymentHelpers: {
    isMatchingUnifyPaymentStatus: jest.fn(),
  },
}));

const { PaymentHelpers } = require('utils/payment');

const wrapper = (ui: React.ReactNode) =>
  render(
    <BrowserRouter>
      <KiwiProvider>{ui}</KiwiProvider>
    </BrowserRouter>
  );

describe('PremiumButtonGroup', () => {
  const basePayment = {
    status: PaymentStatus.ACTIVE,
    subscriptionItems: [] as any,
  };

  const subscriptionItem = {
    productName: 'PDF',
    paymentStatus: PaymentStatus.ACTIVE,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    PaymentHelpers.isMatchingUnifyPaymentStatus.mockReturnValue(false);
  });

  describe('when isCanceling is true', () => {
    beforeEach(() => {
      PaymentHelpers.isMatchingUnifyPaymentStatus.mockReturnValue(true);
    });

    it('renders reactivate button', () => {
      const reactivate = jest.fn();

      wrapper(
        <PremiumButtonGroup
          payment={basePayment as any}
          subscriptionItem={subscriptionItem as any}
          reactivate={reactivate}
          upgradeButtonProps={{ text: 'Upgrade' }}
        />
      );

      expect(screen.getByText('common.reactivate')).toBeInTheDocument();
    });

    it('calls reactivate when clicking reactivate button', () => {
      const reactivate = jest.fn();

      wrapper(
        <PremiumButtonGroup
          payment={basePayment as any}
          subscriptionItem={subscriptionItem as any}
          reactivate={reactivate}
          upgradeButtonProps={{ text: 'Upgrade' }}
        />
      );

      fireEvent.click(screen.getByText('common.reactivate'));
      expect(reactivate).toHaveBeenCalled();
    });

    it('does not render cancel or upgrade buttons', () => {
      wrapper(
        <PremiumButtonGroup
          payment={basePayment as any}
          subscriptionItem={subscriptionItem as any}
          isProfessionalUser
          upgradeButtonProps={{ text: 'Upgrade' }}
        />
      );

      expect(screen.queryByText('common.cancelPlan')).not.toBeInTheDocument();
      expect(screen.queryByText('Upgrade')).not.toBeInTheDocument();
    });

    it('applies buttonGroup class when isProfessionalUser is true', () => {
      wrapper(
        <PremiumButtonGroup
          payment={basePayment as any}
          subscriptionItem={subscriptionItem as any}
          isProfessionalUser
          reactivate={jest.fn()}
          upgradeButtonProps={{ text: 'Upgrade' }}
        />
      );

      const button = screen.getByText('common.reactivate');
      expect(button.closest('div')).toBeInTheDocument();
    });
  });

  describe('when isCanceling is false', () => {
    it('renders cancel button when isProfessionalUser is true', () => {
      const cancelSubscription = jest.fn();

      wrapper(
        <PremiumButtonGroup
          payment={basePayment as any}
          subscriptionItem={subscriptionItem as any}
          isProfessionalUser
          cancelSubscription={cancelSubscription}
          upgradeButtonProps={{ text: 'Upgrade' }}
        />
      );

      expect(screen.getByText('common.cancelPlan')).toBeInTheDocument();
    });

    it('calls cancelSubscription when clicking cancel button', () => {
      const cancelSubscription = jest.fn();

      wrapper(
        <PremiumButtonGroup
          payment={basePayment as any}
          subscriptionItem={subscriptionItem as any}
          isProfessionalUser
          cancelSubscription={cancelSubscription}
          upgradeButtonProps={{ text: 'Upgrade' }}
        />
      );

      fireEvent.click(screen.getByText('common.cancelPlan'));
      expect(cancelSubscription).toHaveBeenCalled();
    });

    it('does not render cancel button when isProfessionalUser is false', () => {
      wrapper(
        <PremiumButtonGroup
          payment={basePayment as any}
          subscriptionItem={subscriptionItem as any}
          isProfessionalUser={false}
          upgradeButtonProps={{ text: 'Upgrade' }}
        />
      );

      expect(screen.queryByText('common.cancelPlan')).not.toBeInTheDocument();
    });

    it('renders upgrade button when text is provided', () => {
      wrapper(
        <PremiumButtonGroup
          payment={basePayment as any}
          subscriptionItem={subscriptionItem as any}
          upgradeButtonProps={{ text: 'Upgrade Now', to: '/upgrade' }}
        />
      );

      expect(screen.getByText('Upgrade Now')).toBeInTheDocument();
    });

    it('does not render upgrade button when text is empty', () => {
      wrapper(
        <PremiumButtonGroup
          payment={basePayment as any}
          subscriptionItem={subscriptionItem as any}
          upgradeButtonProps={{ text: '' }}
        />
      );

      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });

    it('disables buttons when hasPendingInvoice is true', () => {
      wrapper(
        <PremiumButtonGroup
          payment={basePayment as any}
          subscriptionItem={subscriptionItem as any}
          isProfessionalUser
          hasPendingInvoice
          cancelSubscription={jest.fn()}
          upgradeButtonProps={{ text: 'Upgrade', to: '/upgrade' }}
        />
      );

      const cancelBtn = screen.getByText('common.cancelPlan').closest('button');
      const upgradeBtn = screen.getByText('Upgrade').closest('button');

      expect(cancelBtn).toBeDisabled();
      expect(upgradeBtn).toBeDisabled();
    });

    it('uses href when provided instead of to', () => {
      wrapper(
        <PremiumButtonGroup
          payment={basePayment as any}
          subscriptionItem={subscriptionItem as any}
          upgradeButtonProps={{
            text: 'Contact Sales',
            href: 'https://example.com/sales',
          }}
        />
      );

      const link = screen.getByText('Contact Sales').closest('a');
      expect(link).toHaveAttribute('href', 'https://example.com/sales');
      expect(link).toHaveAttribute('target', '_blank');
    });

    it('uses to when href is not provided', () => {
      wrapper(
        <PremiumButtonGroup
          payment={basePayment as any}
          subscriptionItem={subscriptionItem as any}
          upgradeButtonProps={{
            text: 'Upgrade',
            to: '/payment/upgrade',
          }}
        />
      );

      const link = screen.getByText('Upgrade').closest('a');
      expect(link).toHaveAttribute('href', '/payment/upgrade');
    });

    it('sets data-lumin-btn-name attribute with eventName', () => {
      wrapper(
        <PremiumButtonGroup
          payment={basePayment as any}
          subscriptionItem={subscriptionItem as any}
          upgradeButtonProps={{
            text: 'Upgrade',
            to: '/upgrade',
            eventName: 'upgrade_btn_clicked',
          }}
        />
      );

      const button = screen.getByText('Upgrade').closest('button');
      expect(button).toHaveAttribute('data-lumin-btn-name', 'upgrade_btn_clicked');
    });
  });
});
