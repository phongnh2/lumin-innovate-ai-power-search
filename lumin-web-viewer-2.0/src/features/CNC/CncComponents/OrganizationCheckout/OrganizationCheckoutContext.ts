import React from 'react';

import { DEFAULT_FREE_TRIAL_CURRENCY } from 'constants/paymentConstant';

export type BillingInfo = {
  currency: string;
  isCardFilled: boolean;
  organizationId: string | null;
  couponValue: Record<string, unknown>;
  couponCode: string;
  stripeAccountId: string;
  isValidatingCoupon: boolean;
  quantity: number;
};

type ContextType = {
  billingInfo: BillingInfo;
  setBillingInfo: React.Dispatch<React.SetStateAction<BillingInfo>>;
};

export type PeriodType = {
  value: string;
  label: string;
  name: string;
  purpose: string;
  showDiscount: boolean;
};

export type PlanType = {
  value: string;
  label: string;
  isTrial: boolean;
  name: string;
  purpose: string;
};

export default React.createContext<ContextType>({
  billingInfo: {
    currency: DEFAULT_FREE_TRIAL_CURRENCY,
    isCardFilled: false,
    organizationId: null,
    couponValue: {},
    couponCode: '',
    stripeAccountId: '',
    isValidatingCoupon: false,
    quantity: 0,
  },
  setBillingInfo: () => {},
});
