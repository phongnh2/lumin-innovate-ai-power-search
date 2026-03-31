import { useGetFeatureIsOn } from 'hooks/growthBook/useGetFeatureIsOn';

import { FeatureFlags } from 'constants/featureFlagsConstant';
import { KEY_ATTRIBUTES_GROWTH_BOOK } from 'constants/growthBookConstant';

const useGetInviteCollaboratorsFlag = (): boolean => {
  const { isOn: shouldShowInviteCollaboratorsModalFlag } = useGetFeatureIsOn({
    key: FeatureFlags.INVITE_COLLABORATORS_MODAL,
    attributeToCheckLoading: KEY_ATTRIBUTES_GROWTH_BOOK.ORG_ID,
  });

  return shouldShowInviteCollaboratorsModalFlag;
};

export { useGetInviteCollaboratorsFlag };
