import { FolderRoleEnum } from 'Folder/folder.enum';
import { OrganizationRoleEnums, OrganizationTeamRoles } from 'Organization/organization.enum';

export const DEFAULT_FOLDER_COLORS = ['#f2385a', '#da6668', '#fab1a5', '#4690a4', '#77c2d7', '#48687f', '#9eb6c7'];

export const MAX_NUBMER_FOLDER = 200;

// Count from 0
export const MAX_DEPTH_LEVEL = 9;

export const FOLDER_MANAGER_ROLES = [
  OrganizationRoleEnums.BILLING_MODERATOR,
  OrganizationRoleEnums.ORGANIZATION_ADMIN,
  OrganizationTeamRoles.ADMIN,
];

export const ORIGINAL_FOLDER_PERMISSION_ROLE = [FolderRoleEnum.OWNER, FolderRoleEnum.ORGANIZATION, FolderRoleEnum.ORGANIZATION_TEAM];
