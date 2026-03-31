import { useContext, useEffect } from 'react';

import { PaymentInfoContext } from 'HOC/withGetPaymentInfo';

import { paymentServices } from 'services';

const useGetNextPaymentInfo = ({
  plan,
  period,
  currency,
  stripeAccountId,
  organizationId,
  isFetchedCard,
  currentPaymentMethod,
}) => {
  const { updateState } = useContext(PaymentInfoContext);

  const getNextPaymentInfo = async () => {
    updateState({ loading: true });
    try {
      const { nextPlanRemoteId, nextProductId } = await paymentServices.getNextPaymentInfo({
        plan,
        period,
        currency,
        stripeAccountId,
        orgId: organizationId,
      });
      updateState({
        data: {
          nextPlanRemoteId,
          nextProductId,
        },
      });
    } finally {
      updateState({ loading: false });
    }
  };

  useEffect(() => {
    if (stripeAccountId || currentPaymentMethod) {
      getNextPaymentInfo();
      return;
    }

    if (!stripeAccountId && isFetchedCard && currentPaymentMethod) {
      updateState({ loading: false });
    }
  }, [stripeAccountId, isFetchedCard, currentPaymentMethod, currency, period, organizationId]);
};

export default useGetNextPaymentInfo;
