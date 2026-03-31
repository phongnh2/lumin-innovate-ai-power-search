import { useContext } from 'react';

import { BillingFormContext } from '../contexts/BillingFormContext';

export const useBillingFormContext = () => {
  const context = useContext(BillingFormContext);

  if (!context) {
    throw new Error('useBillingFormContext must be used within a BillingFormContext');
  }

  return context;
};
