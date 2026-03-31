import { useSubscription } from '@apollo/client';
import { useSelector, shallowEqual, useDispatch } from 'react-redux';

import { SUB_UPDATE_TEAMS } from 'graphQL/TeamGraph';

import actions from 'actions';
import selectors from 'selectors';

import { useFocusBrowserTab, useGetCurrentTeam, useForceReloadModal } from 'hooks';

import SubscriptionConstants from 'constants/subscriptionConstant';

const {
  TRANSFER_TEAM_OWNERSHIP_BY_MANAGER: SUBSCRIPTION_TRANSFER_TEAM_OWNERSHIP_BY_MANAGER,
  TRANSFER_TEAM_OWNERSHIP_BY_LUMIN_ADMIN: SUBSCRIPTION_TRANSFER_TEAM_OWNERSHIP_BY_LUMIN_ADMIN,
  TRANSFER_TEAM_OWNERSHIP: SUBSCRIPTION_TRANSFER_TEAM_OWNERSHIP,
  TEAM_SETTING_UPDATE,
} = SubscriptionConstants.Subscription;

function useUpdateTeam() {
  const { isFocusingTab } = useFocusBrowserTab();
  const dispatch = useDispatch();
  const currentUser = useSelector(selectors.getCurrentUser, shallowEqual);
  const currentTeam = useGetCurrentTeam();
  const { openModal } = useForceReloadModal();
  useSubscription(SUB_UPDATE_TEAMS, {
    variables: {
      input: {
        clientId: currentUser._id,
      },
    },
    onSubscriptionData: ({ subscriptionData: { data: { updateTeams } } }) => {
      const { team: updatedTeam, type } = updateTeams;
      switch (type) {
        case TEAM_SETTING_UPDATE:
          dispatch(actions.updateTeamById(updatedTeam._id, updatedTeam));
          break;
        case SUBSCRIPTION_TRANSFER_TEAM_OWNERSHIP:
        case SUBSCRIPTION_TRANSFER_TEAM_OWNERSHIP_BY_MANAGER:
        case SUBSCRIPTION_TRANSFER_TEAM_OWNERSHIP_BY_LUMIN_ADMIN:
          if (
            currentTeam._id === updatedTeam._id &&
            (type !== SUBSCRIPTION_TRANSFER_TEAM_OWNERSHIP || isFocusingTab)
          ) {
            openModal();
          }
          break;
        default:
          break;
      }
    },
  });
}

export default useUpdateTeam;
