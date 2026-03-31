import { useContext } from 'react';
import { shallowEqual, useSelector } from 'react-redux';

import selectors from 'selectors';
import { RootState } from 'store';

import FreeTrialContext from 'luminComponents/OrganizationFreeTrial/FreeTrialContext';

import { PaymentInfoContext } from 'HOC/withGetPaymentInfo';

import paymentEvent from 'utils/Factory/EventCollection/PaymentEventCollection';

import { FREE_TRIAL_DAYS } from 'constants/paymentConstant';

import { IOrganization } from 'interfaces/organization/organization.interface';

type PaymentInfoContextType = {
  triggerEvent: ({ callback, params }: { callback: () => void; params: Record<string, any> }) => void;
};

type CardInfo = {
  cardFunding: string;
};

const useSendLogPreventPrepaidCard = () => {
  const { triggerEvent } = useContext<PaymentInfoContextType>(PaymentInfoContext);
  const { billingInfo } = useContext(FreeTrialContext);
  const { organizationId } = billingInfo;
  const { organization: selectedOrganization } =
    useSelector<unknown, { organization: IOrganization }>(
      (state) => selectors.getOrganizationById(state as RootState, organizationId),
      shallowEqual
    ) || {};
  const { payment: targetPayment } = selectedOrganization || {};

  const eventParams = {
    freeTrialDays: FREE_TRIAL_DAYS,
    organizationId,
    ...(targetPayment?.customerRemoteId && { StripeCustomerId: targetPayment.customerRemoteId }),
  };

  const logPaymentError = (msg: string, cardInfo?: CardInfo) => {
    triggerEvent({
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      callback: paymentEvent.paymentError.bind(paymentEvent),
      params: {
        ...eventParams,
        ...cardInfo,
        errorMessage: msg,
      },
    });
  };

  const logPreinspectCardInfo = (cardInfo: CardInfo) => {
    triggerEvent({
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      callback: paymentEvent.preinspectCardInfo.bind(paymentEvent),
      params: {
        ...eventParams,
        ...cardInfo,
        chargeType: 'createTrial',
      },
    });
  };

  return { logPreinspectCardInfo, logPaymentError };
};

export { useSendLogPreventPrepaidCard };
