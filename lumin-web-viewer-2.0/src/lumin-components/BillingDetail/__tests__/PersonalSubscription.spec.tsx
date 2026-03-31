import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';

import PersonalSubscription from '../components/SubscriptionDetail/PersonalSubscription';

jest.mock('hooks', () => ({
  useTranslation: () => ({ t: (s: string) => s }),
}));

jest.mock('luminComponents/BillingDetail/hooks/usePersonalBillingAction', () => {
  return () => ({
    cancel: jest.fn(),
    reactivate: jest.fn(),
  });
});

jest.mock('utils/date', () => ({
  formatMDYTime: (ms: number) => '01/01/2025',
}));

jest.mock('utils/numberUtils', () => ({
  formatDecimal: (num: number) => num.toFixed(2),
}));

jest.mock('utils/paymentUtil', () => ({
  convertCurrencySymbol: (cur: string) => '$',
}));

jest.mock('../components/SubscriptionDetail/PremiumButtonGroup', () => (props: any) => (
  <div data-testid="premium-btn-group">{JSON.stringify(props)}</div>
));

jest.mock('react-i18next', () => ({
  Trans: ({ i18nKey, values }: any) => (
    <span>
      {i18nKey}
      {values && Object.values(values).join(' ')}
    </span>
  ),
}));

describe('PersonalSubscription', () => {
  const baseProps = {
    user: {
      payment: {
        status: 'ACTIVE',
        type: 'some-plan',
        period: 'ANNUAL',
      } as any,
    } as any,
    subscription: {} as any,
  };

  test('renders "noUpcomingInvoiceFound" when upcomingInvoice is null', () => {
    render(
      <BrowserRouter>
        <PersonalSubscription {...baseProps} upcomingInvoice={null} />
      </BrowserRouter>
    );

    expect(screen.getByText('settingBilling.noUpcomingInvoiceFound')).toBeInTheDocument();
  });

  test('renders personal monthly plan description', () => {
    const baseProps = {
      user: {
        payment: {
          status: 'ACTIVE',
          type: 'some-plan',
          period: 'MONTHLY',
        } as any,
      } as any,
    };
    render(
      <BrowserRouter>
        <PersonalSubscription {...baseProps} upcomingInvoice={null} subscription={null} />
      </BrowserRouter>
    );

    expect(screen.getByText('settingBilling.descPersonalMonthlyPlan')).toBeInTheDocument();
  });

  test('renders upcoming invoice info when upcomingInvoice provided', () => {
    const upcoming = {
      nextInvoice: 1711929600,
      amount: 123456,
      currency: 'USD',
    };

    render(
      <BrowserRouter>
        <PersonalSubscription {...baseProps} upcomingInvoice={upcoming as any} />
      </BrowserRouter>
    );

    expect(screen.getByText(/01\/01\/2025/)).toBeInTheDocument();
    expect(screen.getByText(/\$1234.56/)).toBeInTheDocument();
  });

  test('renders cancelled plan message when payment.status is CANCELED', () => {
    const userCanceled = {
      ...baseProps.user,
      payment: {
        ...baseProps.user.payment,
        status: 'CANCELED',
      },
    };

    const subscription = { nextInvoice: 1711929600 } as any;

    render(
      <BrowserRouter>
        <PersonalSubscription user={userCanceled as any} subscription={subscription} upcomingInvoice={null} />
      </BrowserRouter>
    );

    expect(screen.getByText(/^settingBilling\.cancelledPlan/)).toBeInTheDocument();
  });

  test('always renders PremiumButtonGroup', () => {
    render(
      <BrowserRouter>
        <PersonalSubscription {...baseProps} upcomingInvoice={null} />
      </BrowserRouter>
    );

    expect(screen.getByTestId('premium-btn-group')).toBeInTheDocument();
  });
});
