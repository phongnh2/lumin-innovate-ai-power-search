import { useGetFeatureIsOn } from 'hooks/growthBook/useGetFeatureIsOn';

import { organizationServices } from 'services';

import { FeatureFlags } from 'constants/featureFlagsConstant';
import { KEY_ATTRIBUTES_GROWTH_BOOK } from 'constants/growthBookConstant';

import { IOrganization } from 'interfaces/organization/organization.interface';

import { useCheckBusinessDomain } from './useCheckBusinessDomain';

const MAX_DISPLAY_MEMBERS = 20;

const useGetPromptUpdateLogo = ({ currentOrganization }: { currentOrganization: IOrganization }) => {
  const { isBusinessDomain } = useCheckBusinessDomain();
  const isManager = organizationServices.isManager(currentOrganization?.userRole);
  const orgAvatarRemoteId = currentOrganization?.avatarRemoteId;
  const isSmallOrg = currentOrganization?.totalMember < MAX_DISPLAY_MEMBERS;
  const hasAvatarSuggestion = currentOrganization?.metadata?.avatarSuggestion?.suggestionAvatarRemoteId;

  const { isOn } = useGetFeatureIsOn({
    key: FeatureFlags.PROMPT_UPDATE_LOGO,
    attributeToCheckLoading: KEY_ATTRIBUTES_GROWTH_BOOK.ORG_ID,
  });

  return {
    shouldShowPromptUpdateLogo:
      isOn && isBusinessDomain && isManager && !orgAvatarRemoteId && isSmallOrg && hasAvatarSuggestion,
    isOn: isOn && isBusinessDomain,
  };
};

export { useGetPromptUpdateLogo };
