import { useEffect } from 'react';
import { shallowEqual, useSelector } from 'react-redux';
import selectors from 'selectors';
import { CURRENCY } from 'constants/paymentConstant';
import useGetQuantity from './useGetQuantity';

export function useUpdatePayment({ currentOrganization, updateCallback }) {
  const locationCurrency = useSelector(selectors.getLocationCurrency, shallowEqual);
  const { quantity } = useGetQuantity({ currentOrganization });

  useEffect(() => {
    if (!currentOrganization) {
      return;
    }
    updateCallback((prevPayment) => ({
      ...prevPayment,
      quantity,
      currency: currentOrganization.payment.currency || locationCurrency.value || CURRENCY.USD.value,
    }));
  }, [currentOrganization?._id]);
}
