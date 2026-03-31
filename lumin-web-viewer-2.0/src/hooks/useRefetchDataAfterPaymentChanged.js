import { useEffect } from 'react';
import { useDispatch, shallowEqual, useSelector } from 'react-redux';
import { BroadcastChannel } from 'broadcast-channel';

import actions from 'actions';
import selectors from 'selectors';
import { BROADCAST_ACTION, BROADCAST_CHANNEL_KEY } from 'constants/broadcastChannelKey';

export const useRefetchDataAfterPaymentChanged = () => {
  const dispatch = useDispatch();
  const currentOrganization = useSelector(selectors.getCurrentOrganization, shallowEqual).data;

  useEffect(() => {
    const channel = new BroadcastChannel(BROADCAST_CHANNEL_KEY.UPDATE_PAYMENT);

    const refetchDataAfterChangePayment = (event) => {
      const { type, orgId, data } = event;
      const mapType = {
        [BROADCAST_ACTION.UPDATE_USER_PAYMENT]: () => dispatch(actions.fetchCurrentUser()),
        [BROADCAST_ACTION.UPDATE_ORG_PAYMENT]: () => dispatch(actions.updateOrganizationInList(orgId, data)),
      };
      const action = mapType[type];
      if (action) {
        action();
      }
    };

    channel.onmessage = refetchDataAfterChangePayment;

    return () => channel.close();
  }, [dispatch, currentOrganization]);
};
