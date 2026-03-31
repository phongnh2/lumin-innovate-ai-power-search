import { useEnableWebReskin, useGetCurrentUser, useRestrictedUser } from 'hooks';

import { Plans } from 'constants/plan';

import { IOrganization } from 'interfaces/organization/organization.interface';

export const useInviteLinkAvailable = (organizationData: IOrganization) => {
  const { payment } = organizationData || {};
  const { type } = payment || {};
  const isOldPlan = [Plans.ENTERPRISE, Plans.BUSINESS].includes(type);
  const { isEnableReskin } = useEnableWebReskin();
  const currentUser = useGetCurrentUser();

  const { isDriveOnlyUser } = useRestrictedUser();

  return Boolean(currentUser) && !isDriveOnlyUser && isEnableReskin && !isOldPlan;
};
