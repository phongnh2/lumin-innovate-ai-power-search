export enum OrganizationRoles {
  ORGANIZATION_ADMIN = 'organization_admin',
  BILLING_MODERATOR = 'billing_moderator',
  MEMBER = 'member',
}

export enum ExtraTrialDaysOrganizationAction {
  INVITE_MEMBER = 'INVITE_MEMBER',
}

export enum InviteUsersSetting {
  ANYONE_CAN_INVITE = 'ANYONE_CAN_INVITE',
  ADMIN_BILLING_CAN_INVITE = 'ADMIN_BILLING_CAN_INVITE',
}

export enum OrganizationTypes {
  PAID = 'paid',
}

export enum UnifySubscriptionProduct {
  PDF = 'PDF',
  SIGN = 'SIGN',
}

export enum UnifySubscriptionPlan {
  ORG_STARTER = 'ORG_STARTER',
  ORG_PRO = 'ORG_PRO',
  ORG_BUSINESS = 'ORG_BUSINESS',
  ORG_SIGN_PRO = 'ORG_SIGN_PRO',
  FREE = 'FREE',
}
