import React from 'react';

import { DEFAULT_FREE_TRIAL_CURRENCY } from 'constants/paymentConstant';
import { PERIOD } from 'constants/plan';
import { PaymentCurrency, PaymentPlans } from 'constants/plan.enum';

import { IOrganization } from 'interfaces/organization/organization.interface';
import { ICustomerInfo, IPaymentMethod } from 'interfaces/payment/payment.interface';

export type BillingInfoType = {
  currency: PaymentCurrency;
  isCardFilled: boolean;
  organizationId: string | null;
  stripeAccountId: string;
  period: string;
  plan: PaymentPlans;
  organization: IOrganization | null;
  isFreeTrial: boolean;
};

export type CheckoutModalContextType = {
  billingInfo: BillingInfoType;
  setBillingInfo: React.Dispatch<React.SetStateAction<BillingInfoType>>;
  isFetchingCardInfo: boolean;
  currentPaymentMethod: IPaymentMethod | null;
  isFetchingCurrency: boolean;
  customerInfo: ICustomerInfo | null;
  isFetchedCard: boolean;
  currentPaymentMethodType: string;
  setCurrentPaymentMethodType: React.Dispatch<React.SetStateAction<string>>;
  setIsFetchedCard: React.Dispatch<React.SetStateAction<boolean>>;
};

export const CheckoutModalContext = React.createContext<CheckoutModalContextType>({
  billingInfo: {
    currency: DEFAULT_FREE_TRIAL_CURRENCY as PaymentCurrency,
    isCardFilled: false,
    organizationId: null,
    stripeAccountId: '',
    period: PERIOD.ANNUAL,
    plan: PaymentPlans.ORG_PRO,
    organization: null,
    isFreeTrial: false,
  },
  setBillingInfo: () => {},
  isFetchingCardInfo: false,
  currentPaymentMethod: null,
  isFetchingCurrency: false,
  customerInfo: null,
  isFetchedCard: false,
  currentPaymentMethodType: 'card',
  setCurrentPaymentMethodType: () => {},
  setIsFetchedCard: () => {},
});
