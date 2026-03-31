export enum OrganizationPasswordStrengthEnums {
  SIMPLE = 'SIMPLE',
  STRONG = 'STRONG',
}

export enum OrganizationOtherSettingEnums {
  ANYONE = 'ANYONE',
}

export enum OrganizationRoleEnums {
  ORGANIZATION_ADMIN = 'organization_admin',
  BILLING_MODERATOR = 'billing_moderator',
  MEMBER = 'member',
}

export enum OrganizationTeamRoles {
  ADMIN = 'admin',
  MEMBER = 'member'
}

export enum OrganizationValidationStrategy {
  PUBLIC = 'public',
  PRIVATE = 'private'
}

export enum SortStrategy {
  ASC = 1,
  DESC = -1,
}

export enum Effect {
  ALLOW = 'allow',
  DENY = 'deny',
}

export enum AccessTypeOrganization {
  INVITE_ORGANIZATION = 'inviteOrganization',
  INVITE_ORGANIZATION_TEAM = 'inviteOrganizationTeam',
  REQUEST_ORGANIZATION = 'requestOrganization',
  REQUEST_SIGN_SEAT = 'requestSignSeat',
}

export enum AllowNonPermissionEnum {
  ALLOW = 'allow_non_permission',
  REJECT = 'reject_non_permission',
}

export enum OrganizationCreationTypeEnum {
  AUTOMATIC = 'automatic',
  MANUAL = 'manual'
}

export enum ActionNameEnum {
  CREATE_MAIN_ORGANIZATION = 'create_main_organization',
  ADD_MEMBER = 'add_member',
}

export enum TransferOrgAdminStrategy {
  BILLING_MODERATOR_PRIORITY = 'billing_moderator_priority',
  SAME_EMAIL_DOMAIN = 'same_email_domain',
  LATEST_ACTIVE = 'latest_active',
}

export enum ConvertOrganizationToEnum {
  MAIN_ORGANIZATION = 'main_organization',
  CUSTOM_ORGANIZATION = 'custom_organization'
}

export enum TemplateWorkspaceEnum {
  PERSONAL = 'PERSONAL',
  ORGANIZATION = 'ORGANIZATION',
  ORGANIZATION_TEAM = 'ORGANIZATION_TEAM',
}

export enum PriorityOrgIndex {
  INVITED_ORG = 1,
  ORG_BUSINESS_ANNUAL = 2,
  ORG_BUSINESS_MONTHLY = 3,
  ORG_PRO_ANNUAL = 4,
  ORG_PRO_MONTHLY = 5,
  ORG_STARTER_ANNUAL = 6,
  ORG_STARTER_MONTHLY = 7,
  OLD_ENTERPRISE_ANNUAL = 8,
  OLD_ENTERPRISE_MONTHLY = 9,
  BUSINESS_ANNUAL = 10,
  BUSINESS_MONTHLY = 11,
  SHARE_DOCUMENT = 12,
  MAIN_ORG = 13,
  OTHER_ORG = 14,
}

export enum InviteUsersSettingEnum {
  ANYONE_CAN_INVITE = 'ANYONE_CAN_INVITE',
  ADMIN_BILLING_CAN_INVITE = 'ADMIN_BILLING_CAN_INVITE',
}

export enum OrganizationPromotionEnum {
  UPGRADE_WITH_75_ANNUAL = 'upgradeWith75Annual',
}
