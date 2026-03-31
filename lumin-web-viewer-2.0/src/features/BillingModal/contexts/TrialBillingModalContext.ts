import { createContext } from 'react';

import { DEFAULT_FREE_TRIAL_CURRENCY } from 'constants/paymentConstant';
import { PaymentCurrency, PaymentPeriod } from 'constants/plan.enum';

import { IOrganization } from 'interfaces/organization/organization.interface';
import { ICustomerInfo, IPaymentMethod } from 'interfaces/payment/payment.interface';

import { BILLING_FORM_STEP } from '../constants/billingModal';

type BillingInfo = {
  currency: PaymentCurrency;
  isCardFilled: boolean;
  organizationId: string | null;
  period: PaymentPeriod | null;
  plan: string;
  organization: IOrganization | null;
  stripeAccountId: string | null;
  isFreeTrial: boolean;
};

type ContextType = {
  billingInfo: BillingInfo;
  setBillingInfo: React.Dispatch<React.SetStateAction<BillingInfo>>;
  isFetchingCardInfo: boolean;
  currentPaymentMethod: IPaymentMethod | null;
  isFetchingCurrency: boolean;
  customerInfo: ICustomerInfo | null;
  isFetchedCard: boolean;
  setIsFetchedCard: React.Dispatch<React.SetStateAction<boolean>>;
  billingFormStep: BILLING_FORM_STEP;
  setBillingFormStep: React.Dispatch<React.SetStateAction<BILLING_FORM_STEP>>;
  closeModal: () => void;
};

export const TrialBillingModalContext = createContext<ContextType>({
  billingInfo: {
    currency: DEFAULT_FREE_TRIAL_CURRENCY as PaymentCurrency,
    isCardFilled: false,
    organizationId: null,
    period: null,
    plan: '',
    organization: null,
    stripeAccountId: null,
    isFreeTrial: false,
  },
  setBillingInfo: () => {},
  isFetchingCardInfo: false,
  currentPaymentMethod: null,
  isFetchingCurrency: false,
  customerInfo: null,
  isFetchedCard: false,
  setIsFetchedCard: () => {},
  billingFormStep: BILLING_FORM_STEP.WORKSPACE_INFO,
  setBillingFormStep: () => {},
  closeModal: () => {},
});
