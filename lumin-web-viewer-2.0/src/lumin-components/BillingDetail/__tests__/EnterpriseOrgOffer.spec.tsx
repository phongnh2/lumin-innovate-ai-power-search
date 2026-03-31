import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

import EnterpriseOrgOffer from '../components/EnterpriseOrgOffer/EnterpriseOrgOffer';
import { PaymentStatus } from 'constants/plan.enum';
import { Plans, ORG_PLAN_TYPE } from 'constants/plan';

jest.mock('i18next', () => ({
  t: (key: string) => key,
}));

jest.mock('react-i18next', () => ({
  Trans: ({ components }: { components: { Link: React.ReactNode } }) => (
    <>enterpriseAdvertisement {components?.Link}</>
  ),
}));

jest.mock('utils/getLanguage', () => ({
  getFullPathWithPresetLang: (url: string) => url,
}));

jest.mock('../EnterpriseOrgOffer.module.scss', () => ({
  text: 'text',
  link: 'link',
}));

describe('EnterpriseOrgOffer', () => {
  const basePayment = {
    type: ORG_PLAN_TYPE.ORG_PRO,
    status: PaymentStatus.ACTIVE,
  };

  it('should return null when showEnterprise = false', () => {
    const { container } = render(
      <EnterpriseOrgOffer payment={{ type: Plans.FREE, status: PaymentStatus.ACTIVE } as any} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('should render enterprise offer when conditions match', () => {
    render(
      <EnterpriseOrgOffer
        payment={basePayment as any}
        subscriptionItem={
          {
            paymentType: ORG_PLAN_TYPE.ORG_PRO,
            paymentStatus: PaymentStatus.ACTIVE,
          } as any
        }
      />
    );

    expect(screen.getByText(/enterpriseAdvertisement/i)).toBeInTheDocument();
  });

  it('should render link with correct href', () => {
    render(
      <EnterpriseOrgOffer
        payment={basePayment as any}
        subscriptionItem={
          {
            paymentType: ORG_PLAN_TYPE.ORG_PRO,
            paymentStatus: PaymentStatus.ACTIVE,
          } as any
        }
      />
    );

    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', expect.stringContaining('url.saleSupport.contactSale'));
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveClass('link');
  });

  it('should show enterprise offer when subscriptionItem.paymentStatus = ACTIVE even if payment.status != ACTIVE', () => {
    render(
      <EnterpriseOrgOffer
        payment={
          {
            type: ORG_PLAN_TYPE.ORG_PRO,
            status: PaymentStatus.UNPAID,
          } as any
        }
        subscriptionItem={
          {
            paymentType: ORG_PLAN_TYPE.ORG_PRO,
            paymentStatus: PaymentStatus.ACTIVE,
          } as any
        }
      />
    );

    expect(screen.getByText(/enterpriseAdvertisement/i)).toBeInTheDocument();
  });
});
