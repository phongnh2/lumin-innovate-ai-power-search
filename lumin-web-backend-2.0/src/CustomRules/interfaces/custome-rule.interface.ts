export interface IUserRules {
  orgId?: string;
  autoJoinOrg?: boolean;
  autoJoin?: boolean;
  onlyJoinOrg?: boolean;
  requireOrgMembership?: true;
  onlyDriveFile?: boolean;
  notAllowCreateOrg?: boolean;
  onlyInviteInternal?: boolean;
  onlyPersonalFile?: boolean;
  onlySearchForInternal?: boolean;
  cannotSearchFor: string[];
  cannotShareDocWith: string[];
  cannotInviteToOrg: string[];
  cannotRequestDocOf: string[];
  cannotJoinOrgsOf: string[];
  cannotShowPromptDriveUsers?: string[];
  hidePromptDriveUsersBanner?: boolean;
  onlyAccessRestrictedOrg: boolean;
  allowToChangeEmail?: boolean;
}
