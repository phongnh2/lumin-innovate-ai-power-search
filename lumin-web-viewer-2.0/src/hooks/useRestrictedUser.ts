import { useMemo } from 'react';

import {
  isDriveOnlyUser as isDriveOnlyUserUtil,
  isInviteScopeInternalOnly as isInviteScopeInternalOnlyUtil,
  isOrgCreationRestricted as isOrgCreationRestrictedUtil,
  getTenantConfigForUser,
  isHidePromptDriveUsersBanner as isHidePromptDriveUsersBannerUtil,
} from 'utils/restrictedUserUtil';

import { useGetCurrentUser } from './useGetCurrentUser';

export function useRestrictedUser() {
  const currentUser = useGetCurrentUser();

  const tenant = useMemo(() => getTenantConfigForUser(currentUser?.email), [currentUser?.email]);

  const templateManagementEnabled = Boolean(tenant?.configuration?.files?.templateManagementEnabled ?? true);

  const isOrgCreationRestricted = isOrgCreationRestrictedUtil(currentUser?.email);

  const isDriveOnlyUser = isDriveOnlyUserUtil(currentUser?.email);

  const isInviteScopeInternalOnly = isInviteScopeInternalOnlyUtil(currentUser?.email);

  const isHidePromptDriveUsersBanner = isHidePromptDriveUsersBannerUtil(currentUser?.email);

  return {
    isDriveOnlyUser,
    templateManagementEnabled,
    isInviteScopeInternalOnly,
    isOrgCreationRestricted,
    isHidePromptDriveUsersBanner,
  };
}
