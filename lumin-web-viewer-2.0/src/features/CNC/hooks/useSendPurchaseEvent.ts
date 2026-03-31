import { capitalize, snakeCase, startCase } from 'lodash';

import useGetPlanName from 'hooks/useGetPlanName';
import useMatchPaymentRoute from 'hooks/useMatchPaymentRoute';

import { ga } from 'utils';

import { IOrganization } from 'interfaces/organization/organization.interface';

import { useCheckBusinessDomain } from './useCheckBusinessDomain';

const useSendPurchaseEvent = () => {
  const { period, isFreeTrial } = useMatchPaymentRoute();
  const planName = useGetPlanName();
  const { isBusinessDomain } = useCheckBusinessDomain();
  const trialText = isFreeTrial && 'Trial';
  const eventPlanName = startCase([planName, trialText, capitalize(period), 'plan'].filter(Boolean).join(' '));
  const planNameEventId = snakeCase(eventPlanName);

  const sendPurchaseEvent = ({
    subscriptionRemoteId,
    currency,
    organization,
    value,
    price,
    discount,
    coupon,
  }: {
    subscriptionRemoteId: string;
    currency: string;
    organization: IOrganization;
    value?: number;
    price?: number;
    discount?: number;
    coupon?: string;
  }) => {
    ga.trackingPurchase({
      transactionId: ga.getTransactionId(subscriptionRemoteId, planNameEventId),
      value: isFreeTrial ? 0 : value,
      transactionDescription: eventPlanName,
      currency,
      items: [
        {
          item_id: planNameEventId,
          item_name: eventPlanName,
          price: isFreeTrial ? 0 : price,
          ...(!isFreeTrial ? { discount, coupon } : {}),
        },
      ],
      ...(isBusinessDomain && { isBusinessDomain: 'true' }),
      extraInfo: {
        organizationId: organization._id,
      },
    });
  };

  return { sendPurchaseEvent };
};

export { useSendPurchaseEvent };
