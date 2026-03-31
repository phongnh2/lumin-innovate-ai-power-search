import { useEffect, useRef, useState } from 'react';

import { paymentServices } from 'services';

import { PaymentTypes } from 'constants/plan';

export function useFetchPaymentCard({ clientId, setIsChangeCard = () => {}, setIsFetchedCard = () => {} }) {
  const [currentPaymentMethod, setCurrentPaymentMethod] = useState(null);
  const [customerInfo, setCustomerInfo] = useState(null);
  const [isLoading, setIsLoadingCardInfo] = useState(true);
  const abortControllerRef = useRef();
  useEffect(() => {
    if (clientId) {
      fetchCurrentCard();
    } else {
      setIsLoadingCardInfo(false);
      setCurrentPaymentMethod(null);
    }

    function fetchCurrentCard() {
      setIsLoadingCardInfo(true);
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();
      paymentServices
        .getPaymentMethodAndCustomerInfo({
          clientId,
          type: PaymentTypes.ORGANIZATION,
          fetchOptions: {
            signal: abortControllerRef.current.signal,
          },
        })
        .then(([card, customerInfo]) => {
          setCurrentPaymentMethod(card);
          setCustomerInfo(customerInfo);
        })
        .catch(() => {
          setCurrentPaymentMethod(null);
          setCustomerInfo(null);
          setIsChangeCard(true);
        })
        .finally(() => {
          setIsLoadingCardInfo(false);
          setIsFetchedCard(true);
        });
    }
  }, [clientId]);

  return {
    currentPaymentMethod,
    customerInfo,
    isLoading,
  };
}
