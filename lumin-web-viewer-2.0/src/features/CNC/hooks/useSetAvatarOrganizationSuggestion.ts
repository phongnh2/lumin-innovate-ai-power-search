import { useMemo } from 'react';

import { useGetFeatureIsOn } from 'hooks/growthBook/useGetFeatureIsOn';

import { organizationServices } from 'services';

import { FeatureFlags } from 'constants/featureFlagsConstant';
import { KEY_ATTRIBUTES_GROWTH_BOOK } from 'constants/growthBookConstant';

import { IOrganization } from 'interfaces/organization/organization.interface';

import { useCheckBusinessDomain } from './useCheckBusinessDomain';
import { usePromptToUploadLogoStore } from '../CncComponents/PromptToUploadLogoModal/hooks/usePromptToUploadLogoStore';

const MAX_DISPLAY_MEMBERS = 20;

const useSetAvatarOrganizationSuggestion = ({ currentOrganization }: { currentOrganization: IOrganization }) => {
  const { hasSetSuggestionAvatar, setHasSetSuggestionAvatar } = usePromptToUploadLogoStore();
  const { isBusinessDomain } = useCheckBusinessDomain();
  const isManager = organizationServices.isManager(currentOrganization?.userRole);
  const orgAvatarRemoteId = currentOrganization?.avatarRemoteId;
  const isSmallOrg = currentOrganization?.totalMember < MAX_DISPLAY_MEMBERS;
  const hasAvatarSuggestion = currentOrganization?.metadata?.avatarSuggestion?.suggestionAvatarRemoteId;

  const { isOn } = useGetFeatureIsOn({
    key: FeatureFlags.PROMPT_UPDATE_LOGO,
    attributeToCheckLoading: KEY_ATTRIBUTES_GROWTH_BOOK.ORG_ID,
  });

  const shouldSetAvatarOrganizationSuggestion = useMemo<boolean>(
    () =>
      isOn &&
      isBusinessDomain &&
      isManager &&
      !orgAvatarRemoteId &&
      isSmallOrg &&
      !hasAvatarSuggestion &&
      !hasSetSuggestionAvatar,
    [isOn, isBusinessDomain, isManager, orgAvatarRemoteId, isSmallOrg, hasAvatarSuggestion, hasSetSuggestionAvatar]
  );

  if (shouldSetAvatarOrganizationSuggestion) {
    setHasSetSuggestionAvatar(true);
    organizationServices
      .setAvatarOrganizationSuggestion({
        orgId: currentOrganization?._id,
      })
      .catch(() => {});
  }
};

export { useSetAvatarOrganizationSuggestion };
