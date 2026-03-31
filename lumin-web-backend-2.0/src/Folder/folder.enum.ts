export enum FolderRoleEnum {
  OWNER = 'owner',
  SHARER = 'sharer',
  EDITOR = 'editor',
  VIEWER = 'viewer',
  ORGANIZATION = 'organization',
  ORGANIZATION_TEAM = 'organization_team',
}

export enum OrganizationFolderPermissionEnum {
  ALL = 'organization_all',
  ORGANIZATION_ADMIN = 'organization_admin',
  BILLING_MODERATOR = 'billing_moderator',
  MEMBER = 'member',
}

export enum OrganizationTeamFolderPermissionEnum {
  ALL = 'org_team_all',
  ADMIN = 'admin',
  MEMBER = 'member'
}

export enum FolderTypeEnum {
  PERSONAL = 'personal',
  ORGANIZATION = 'organization',
  ORGANIZATION_TEAM = 'organization_team'
}
