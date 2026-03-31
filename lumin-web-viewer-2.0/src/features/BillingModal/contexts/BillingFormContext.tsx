import React, { useMemo, useState, useEffect, createContext } from 'react';

import withStripeElements from 'HOC/withStripeElements';

import { LocalStorageKey } from 'constants/localStorageKey';
import { CURRENCY } from 'constants/paymentConstant';
import { PaymentCurrency } from 'constants/plan.enum';

import { useTrialModalContext } from '../hooks/useTrialModalContext';

type ContextType = {
  hasClientSecret: boolean;
  getNewSecret: () => void;
  newOrganization: { name: string; error: string };
  setNewOrganization: (newOrganization: { name: string; error: string }) => void;
};

export const BillingFormContext = createContext<ContextType>({
  hasClientSecret: false,
  getNewSecret: () => {},
  newOrganization: { name: '', error: '' },
  setNewOrganization: () => {},
});

type BillingFormProviderProps = {
  children: React.ReactNode;
  stripeAccountId: string;
  getNewSecret: () => void;
  hasClientSecret: boolean;
};

function BillingFormProvider(props: BillingFormProviderProps) {
  const { stripeAccountId, getNewSecret, hasClientSecret } = props;
  const { setBillingInfo } = useTrialModalContext();

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

  const [newOrganization, setNewOrganization] = useState({ name: '', error: '' });
  const context = useMemo(
    () => ({
      newOrganization,
      setNewOrganization,
      getNewSecret,
      hasClientSecret,
    }),
    [newOrganization]
  );

  return <BillingFormContext.Provider value={context}>{props.children}</BillingFormContext.Provider>;
}

export const FreeTrialContainerWithStripeElements = withStripeElements(BillingFormProvider, {
  action: 'paymentFreeTrial',
});
