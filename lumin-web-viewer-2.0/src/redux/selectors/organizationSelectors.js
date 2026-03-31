import { flatten } from 'lodash';

import { OrganizationUtilities } from 'utils/Factory/Organization';
import * as orgUtils from 'utils/orgUtils';

import { ErrorCode } from 'constants/errorCode';
import { ORGANIZATION_ROLES } from 'constants/organizationConstants';

const filterAvailablePaidOrgs = ({ role, organization }) => {
  const orgUtilities = new OrganizationUtilities({ organization });
  const isValidOrg = !organization.deletedAt;
  const isMemberCanChargeFreeCircle = orgUtilities.payment.isFree() && role.toUpperCase() === ORGANIZATION_ROLES.MEMBER;
  const isEnterprise = orgUtilities.payment.isEnterprise();
  return isValidOrg && (orgUtils.canPaySubscription(role) || isMemberCanChargeFreeCircle) && !isEnterprise;
};

export const getOrganizationList = (state) => state.organization.organizations;

export const getCurrentOrganization = (state) => state.organization.currentOrganization;

export const getOrganizationById = (state, orgId) =>
  getOrganizationList(state).data?.find((org) => org?.organization?._id === orgId);

export const getOrganizationFromTeam = (state, teamId) =>
  getOrganizationList(state).data?.find((org) => org?.organization?.teams?.find((team) => team._id === teamId));

export const getMainOrganizationCanJoin = (state) => state.organization?.mainOrganization || {};

export const getTeams = (state) => getCurrentOrganization(state)?.data?.teams || [];

export const getTeamById = (state, id) =>
  flatten((getOrganizationList(state).data || []).map((item) => item.organization.teams)).find(
    (team) => team._id === id
  );

export const isLoadingOrganizationList = (state) => getOrganizationList(state).loading;

export const hasJoinedAnyOrganizations = (state) => Boolean(getOrganizationList(state).data?.length);

export const getSuggestedOrganizations = (state) => state.organization.suggestedOrganizations;

export const availablePaidOrgs = (state) => getOrganizationList(state).data?.filter(filterAvailablePaidOrgs) || [];

export const isDisableNearlyHitDocStackBanner = (state) =>
  getCurrentOrganization(state).data?.disableNearlyHitDocStack ?? true;

export const isNoPermissionOrg = (state) =>
  getCurrentOrganization(state)?.error?.code === ErrorCode.Common.NO_PERMISSION;
