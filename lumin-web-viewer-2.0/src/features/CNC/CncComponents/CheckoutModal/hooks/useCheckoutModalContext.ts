import { useContext } from 'react';

import { CheckoutModalContext } from '../context/CheckoutModalContext';

export const useCheckoutModalContext = () => {
  const context = useContext(CheckoutModalContext);

  if (!context) {
    throw new Error('useCheckoutModalContext must be used within a CheckoutModalContext');
  }

  return context;
};
