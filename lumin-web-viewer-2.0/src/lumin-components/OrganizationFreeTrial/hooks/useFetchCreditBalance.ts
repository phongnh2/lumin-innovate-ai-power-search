/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { useEffect, useState } from 'react';

import { paymentServices } from 'services';

import { PreviewUpcomingSubscriptionInvoiceParams } from 'interfaces/payment/payment.interface';

type UseFetchCreditBalanceProps = Omit<PreviewUpcomingSubscriptionInvoiceParams, 'orgId'> & {
  clientId: string;
};

type UseFetchCreditBalanceData = {
  isLoading: boolean;
  creditBalance: number;
  nextBillingPrice: number;
};

const useFetchCreditBalance = ({
  clientId,
  period,
  currency,
  stripeAccountId,
  subscriptionItems = [],
}: UseFetchCreditBalanceProps): UseFetchCreditBalanceData => {
  const [creditBalance, setCreditBalance] = useState<number>(0);
  const [nextBillingPrice, setNextBillingPrice] = useState<number>(0);
  const [isLoading, setIsLoadingUpcomingInvoice] = useState<boolean>(true);

  useEffect(() => {
    function fetchSubscription(): void {
      setIsLoadingUpcomingInvoice(true);
      paymentServices
        .previewUpcomingSubscriptionInvoice({
          orgId: clientId,
          period,
          currency,
          startTrial: true,
          stripeAccountId,
          subscriptionItems,
        })
        .then((upcomingInvoice) => {
          setCreditBalance(upcomingInvoice.creditBalance);
          setNextBillingPrice(upcomingInvoice.nextBillingPrice);
        })
        .finally(() => setIsLoadingUpcomingInvoice(false));
    }
    if (clientId && stripeAccountId && subscriptionItems.length > 0) {
      fetchSubscription();
    } else {
      setIsLoadingUpcomingInvoice(false);
      setCreditBalance(0);
    }
  }, [clientId, period, currency, stripeAccountId, JSON.stringify(subscriptionItems)]);

  return {
    isLoading,
    creditBalance,
    nextBillingPrice,
  };
};

export default useFetchCreditBalance;
