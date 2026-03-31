import React, { createContext, useEffect, useMemo } from 'react';

import withStripeElements from 'HOC/withStripeElements';

import { LocalStorageKey } from 'constants/localStorageKey';
import { CURRENCY } from 'constants/paymentConstant';
import { PaymentCurrency } from 'constants/plan.enum';

import { useCheckoutModalContext } from './hooks/useCheckoutModalContext';

type CheckoutModalProviderProps = {
  children: React.ReactNode;
  stripeAccountId: string;
  hasClientSecret?: boolean;
  getNewSecret: () => void;
};

type ContextType = {
  hasClientSecret: boolean;
  getNewSecret: () => void;
};

export const CheckoutModalProviderContext = createContext<ContextType>({
  hasClientSecret: false,
  getNewSecret: () => {},
});

function CheckoutModalProvider(props: CheckoutModalProviderProps) {
  const { stripeAccountId, hasClientSecret, getNewSecret } = props;
  const { setBillingInfo } = useCheckoutModalContext();

  useEffect(() => {
    if (stripeAccountId) {
      const isStripeLimitCurrency = stripeAccountId === process.env.STRIPE_US_ACCOUNT_ID;
      if (isStripeLimitCurrency) {
        localStorage.setItem(LocalStorageKey.CURRENCY, CURRENCY.USD.value);
      }
      setBillingInfo((prev) => ({
        ...prev,
        ...(isStripeLimitCurrency && { currency: CURRENCY.USD.value as PaymentCurrency }),
        stripeAccountId,
      }));
    }
  }, [stripeAccountId]);

  const context = useMemo(
    () => ({
      getNewSecret,
      hasClientSecret,
    }),
    [hasClientSecret]
  );

  return (
    <CheckoutModalProviderContext.Provider value={context}>{props.children}</CheckoutModalProviderContext.Provider>
  );
}

export const CheckoutModalWithStripeElements = withStripeElements(CheckoutModalProvider, {
  action: 'paymentFreeTrial',
});
