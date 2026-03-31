import { BroadcastChannel } from 'broadcast-channel';
import merge from 'lodash/merge';
import { batch, useDispatch } from 'react-redux';

import actions from 'actions';

import { BROADCAST_ACTION, BROADCAST_CHANNEL_KEY } from 'constants/broadcastChannelKey';

import { IOrganization } from 'interfaces/organization/organization.interface';
import { IOrganizationPayment } from 'interfaces/payment/payment.interface';

type Props = {
  organization: IOrganization;
  isTrackEvent?: boolean;
  cancelAction?: () => void;
};

type Actions = {
  updateOrganizationPayment: (data: IOrganizationPayment) => void;
};

function useUpdateOrgPayment({ organization }: Props): Actions {
  const { _id: orgId, payment } = organization;
  const dispatch = useDispatch();

  const updateOrganizationPayment = (data: Partial<IOrganizationPayment>): void => {
    const channel = new BroadcastChannel(BROADCAST_CHANNEL_KEY.UPDATE_PAYMENT);
    const updatedSubscription = {
      ...merge({}, payment, data),
      ...(data.subscriptionItems && { subscriptionItems: data.subscriptionItems }),
    };
    batch(() => {
      dispatch(
        actions.updateCurrentOrganization({
          payment: updatedSubscription,
        })
      );
      dispatch(
        actions.updateOrganizationInList(orgId, {
          payment: updatedSubscription,
          isPayment: true,
        })
      );
      channel.postMessage({
        type: BROADCAST_ACTION.UPDATE_ORG_PAYMENT,
        orgId,
        data: { payment: updatedSubscription },
      });
    });
  };

  return {
    updateOrganizationPayment,
  };
}

export default useUpdateOrgPayment;
