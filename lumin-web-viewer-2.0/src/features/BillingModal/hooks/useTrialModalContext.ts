import { useContext } from 'react';

import { TrialBillingModalContext } from 'features/BillingModal/contexts/TrialBillingModalContext';

export const useTrialModalContext = () => {
  const context = useContext(TrialBillingModalContext);

  if (!context) {
    throw new Error('useTrialModalContext must be used within a TrialBillingModalContext');
  }

  return context;
};
