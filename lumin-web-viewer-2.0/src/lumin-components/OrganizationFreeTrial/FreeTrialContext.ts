import React from 'react';

import { DEFAULT_FREE_TRIAL_CURRENCY } from 'constants/paymentConstant';

type BillingInfo = {
  currency: string;
  isCardFilled: boolean;
  organizationId: string | null;
};

type ContextType = {
  billingInfo: BillingInfo;
  setBillingInfo: React.Dispatch<React.SetStateAction<BillingInfo>>;
};

export default React.createContext<ContextType>({
  billingInfo: {
    currency: DEFAULT_FREE_TRIAL_CURRENCY,
    isCardFilled: false,
    organizationId: null,
  },
  setBillingInfo: () => {},
});
