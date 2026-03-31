import {
  LOWER_BOUNDARY_PROMOTED_WORKSPACE,
  UPPER_BOUNDARY_PROMOTED_WORKSPACE,
} from 'features/CNC/constants/customConstant';

import { JoinOrganizationStatus, SuggestedOrganization } from 'interfaces/organization/organization.interface';

const PRIORITY_ORDER = {
  [JoinOrganizationStatus.CAN_JOIN]: 1,
  [JoinOrganizationStatus.CAN_REQUEST]: 2,
  [JoinOrganizationStatus.PENDING_INVITE]: 3,
  [JoinOrganizationStatus.REQUESTED]: 4,
  [JoinOrganizationStatus.JOINED]: 5,
} as const;

// Workspaces that have workspace sizes beyond this size will be considered minor and we want to promote workspaces that have size from 2 to 20
const isInPromotedRange = (size: number | undefined = 0) =>
  size >= LOWER_BOUNDARY_PROMOTED_WORKSPACE && size <= UPPER_BOUNDARY_PROMOTED_WORKSPACE;
const rankOrgsBasedOnMembersSize = <T extends SuggestedOrganization>(orgList: T[]) => {
  const score = (org: T) => (isInPromotedRange(org.totalMember) ? 0 : 1);
  return [...orgList].sort((a, b) => score(a) - score(b));
};

class OrganizationsSorter<TOrganization extends SuggestedOrganization> {
  orgList: TOrganization[];

  constructor(orgList: TOrganization[]) {
    this.orgList = [...orgList];
  }

  private _groupOrgsByJoinStatus() {
    return this.orgList.reduce((acc, org) => {
      if (!acc[org.status]) {
        acc[org.status] = [];
      }
      acc[org.status].push(org);
      return acc;
    }, {} as Record<JoinOrganizationStatus, TOrganization[]>);
  }

  private _sortByJoinStatus() {
    this.orgList.sort((a, b) => (PRIORITY_ORDER[a.status] || Infinity) - (PRIORITY_ORDER[b.status] || Infinity));
    return this;
  }

  private _sortByWorkspaceSize() {
    const orgsGroupedByJoinStatus = this._groupOrgsByJoinStatus();

    Object.keys(orgsGroupedByJoinStatus).forEach((status: JoinOrganizationStatus) => {
      orgsGroupedByJoinStatus[status] = rankOrgsBasedOnMembersSize(orgsGroupedByJoinStatus[status]);
    });

    this.orgList = Object.values(orgsGroupedByJoinStatus).flat();

    return this;
  }

  private _sortByIpAddress(userHashedIpAddress: string) {
    const hasMatchingIp = (org: TOrganization) => org.hashedIpAddresses?.includes(userHashedIpAddress) ?? false;
    this.orgList.sort((a, b) => Number(!hasMatchingIp(a)) - Number(!hasMatchingIp(b)));
    return this;
  }

  sort(userHashedIpAddress: string, shouldShowOrgListSortedByIpAddress: boolean) {
    if (shouldShowOrgListSortedByIpAddress) {
      return this._sortByJoinStatus()._sortByWorkspaceSize()._sortByIpAddress(userHashedIpAddress);
    }
    return this._sortByJoinStatus()._sortByWorkspaceSize();
  }

  getOrgList() {
    return this.orgList;
  }
}

export default OrganizationsSorter;
