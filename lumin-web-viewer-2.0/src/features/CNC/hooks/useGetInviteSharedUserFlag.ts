import { useGetFeatureIsOn } from 'hooks/growthBook/useGetFeatureIsOn';

import { FeatureFlags } from 'constants/featureFlagsConstant';
import { KEY_ATTRIBUTES_GROWTH_BOOK } from 'constants/growthBookConstant';

const useGetInviteSharedUserFlag = () => {
  const { isOn } = useGetFeatureIsOn({
    key: FeatureFlags.INVITE_SHARED_USERS,
    attributeToCheckLoading: KEY_ATTRIBUTES_GROWTH_BOOK.ORG_ID,
  });

  return { canShowInviteSharedUsersModal: isOn };
};

export { useGetInviteSharedUserFlag };
