import { DocumentActions, DocumentTemplateActions } from 'constants/documentConstants';
import { UnifySubscriptionPlan } from 'constants/organization.enum';
import { PaymentStatus } from 'constants/plan.enum';

export const ORGANIZATION_TEXT = 'Workspace';

// only used for URL
export const ORG_TEXT = 'workspace';

// only used for URL
export const ORGS_TEXT = `${ORG_TEXT}s`;

export const ORGANIZATION_ROLE_TEXT = {
  ORGANIZATION_ADMIN: 'roleText.orgAdmin',
  BILLING_MODERATOR: 'roleText.billingModerator',
  TEAM_ADMIN: 'roleText.teamAdmin',
  MEMBER: 'roleText.member',
};

export const ORGANIZATION_ROLE_SHORTEN_KEY = {
  ORGANIZATION_ADMIN: 'roleTextShorten.orgAdmin',
  BILLING_MODERATOR: 'roleTextShorten.billingModerator',
  MEMBER: 'roleTextShorten.member',
};

export const ORGANIZATION_ROLES = {
  ORGANIZATION_ADMIN: 'ORGANIZATION_ADMIN',
  BILLING_MODERATOR: 'BILLING_MODERATOR',
  TEAM_ADMIN: 'TEAM_ADMIN',
  MEMBER: 'MEMBER',
};
export const ORGANIZATION_ROLE_SHORTEN = {
  BILLING_MODERATOR: 'Moderator',
  MEMBER: 'Member',
};

export const ORGANIZATION_MEMBERS_FILTER_BY_ROLE = {
  ALL: 'common.all',
  [ORGANIZATION_ROLES.ORGANIZATION_ADMIN]: ORGANIZATION_ROLE_TEXT.ORGANIZATION_ADMIN,
  [ORGANIZATION_ROLES.BILLING_MODERATOR]: ORGANIZATION_ROLE_TEXT.BILLING_MODERATOR,
  [ORGANIZATION_ROLES.MEMBER]: ORGANIZATION_ROLE_TEXT.MEMBER,
};

export const ORG_ROLE_KEY = {
  [ORGANIZATION_ROLES.ORGANIZATION_ADMIN]: 'roleText.orgAdmin',
  [ORGANIZATION_ROLES.BILLING_MODERATOR]: 'roleText.billingModerator',
  [ORGANIZATION_ROLES.TEAM_ADMIN]: 'roleText.teamAdmin',
  [ORGANIZATION_ROLES.MEMBER]: 'roleText.member',
};

export const ORGANIZATION_MEMBER_TYPE = {
  PEOPLE_PENDING_MEMBER: 'PEOPLE_PENDING_MEMBER',
  PEOPLE_REQUEST_ACCESS: 'PEOPLE_REQUEST_ACCESS',
  PEOPLE_MEMBER: 'PEOPLE_MEMBER',
  PEOPLE_GUEST: 'PEOPLE_GUEST',
  MEMBER: 'MEMBER',
};

export const ORGANIZATION_DEFAULT_ROUTE_BY_ROLE = {
  [ORGANIZATION_ROLES.MEMBER]: 'documents',
  [ORGANIZATION_ROLES.TEAM_ADMIN]: 'documents',
  [ORGANIZATION_ROLES.BILLING_MODERATOR]: 'dashboard/people',
  [ORGANIZATION_ROLES.ORGANIZATION_ADMIN]: 'dashboard/people',
};

export const ORGANIZATION_CREATION_TYPE = {
  AUTOMATIC: 'automatic',
  MANUAL: 'manual',
};

export const ORG_PEOPLE_TAB_LIST_TYPE = {
  member: 'member',
  guest: 'guest',
  pending: 'pending',
  request: 'request',
};

export const MEMBER_TYPE = {
  MEMBER: 'MEMBER',
  GUEST: 'GUEST',
  PENDING: 'PENDING',
  REQUEST: 'REQUEST',
};

export const ORG_TRANSFER_URL = 'transfer-ownership';

export const ORG_PLAN = 'plans';

export const ORG_PATH = `/${ORG_TEXT}/:orgName/*`;

export const ORG_SUBSCRIPTION_TYPE = {
  TRANSFER_ADMIN: 'subscription_transfer_org_admin',
  DOWNGRADE_BILLING_MODERATOR: 'subscription_downgrade_billing_moderator',
  AUTO_APPROVE_UPDATE: 'subscription_auto_approve_update',
  GOOGLE_SIGN_IN_SECURITY_UPDATE: 'subscription_google_sign_in_security_update',
  PAYMENT_UPDATE: 'subscription_payment_update',
  FORCE_RESET_PASSWORD: 'subscription_force_reset_org_password',
  SETTING_UPDATE: 'subscription_setting_update',
  INVITE_LINK_UPDATE: 'subscription_invite_link_update',
  SAML_SSO_SIGN_IN_SECURITY_UPDATE: 'subscription_saml_sso_sign_in_security_update',
};

export const NOTIFY_UPLOAD_KEY = 'notify_upload';

const commonPermission = [
  DocumentActions.View,
  DocumentActions.Open,
  DocumentActions.MakeACopy,
  DocumentActions.MarkFavorite,
  DocumentActions.CopyLink,
  DocumentActions.Share,
  DocumentActions.MakeOffline,
  DocumentActions.CreateAsTemplate,
  DocumentTemplateActions.PreviewTemplate,
  DocumentTemplateActions.CopyLinkTemplate,
  DocumentTemplateActions.UseTemplate,
];

const editPermission = commonPermission;
const sharePermission = commonPermission;
const adminPermission = [
  ...commonPermission,
  DocumentActions.Move,
  DocumentActions.Remove,
  DocumentActions.Rename,
  DocumentTemplateActions.EditTemplate,
  DocumentTemplateActions.DeleteTemplate,
];

const ownerDocumentPermission = [
  ...commonPermission,
  DocumentActions.Move,
  DocumentActions.Remove,
  DocumentActions.Rename,
  DocumentTemplateActions.EditTemplate,
  DocumentTemplateActions.DeleteTemplate,
];

export const OrgDocumentPermission = {
  CanView: commonPermission,
  CanEdit: editPermission,
  CanShare: sharePermission,
};

export const OrgDocumentRole = {
  Billing: adminPermission,
  Admin: adminPermission,
  Owner: ownerDocumentPermission,
  Member: commonPermission,
};

export const OrgTeamDocumentRole = {
  Admin: adminPermission,
  Owner: ownerDocumentPermission,
  Member: commonPermission,
};

export const SHARE_DOCUMENT_LIST_TYPE = {
  MEMBER: 'MEMBER',
  INVITED_EMAIL: 'INVITED_EMAIL',
  REQUEST_ACCESS: 'REQUEST_ACCESS',
};

export const SHOW_USER_ROLE_RESOLUTION = {
  PC: 'hide-in-mobile',
  MOBILE: 'hide-in-tablet hide-in-tablet-up',
};

export const ORG_TEAM_ROLE = {
  ADMIN: 'ADMIN',
  MEMBER: 'MEMBER',
};

export const ORGANIZATION_MAX_MEMBERS = 100;

export const ORGANIZATION_MIN_MEMBERS = 1;

export const ORG_ACTION = {
  WELCOME: 'WELCOME',
};

export const ORGANIZATION_CONVERT_TYPE = {
  SUBSCRIPTION_CONVERT_TO_MAIN_ORGANIZATION: 'subscription_convert_to_main_organization',
  SUBSCRIPTION_CONVERT_TO_CUSTOM_ORGANIZATION: 'subscription_convert_to_custom_organization',
};

export const ORGANIZATION_PASSWORD_TYPE = {
  SIMPLE: 'SIMPLE',
  STRONG: 'STRONG',
};

export const ORGANIZATION_DOMAIN_TYPE = {
  POPULAR_DOMAIN: 'POPULAR_DOMAIN',
  BLACKLIST_DOMAIN: 'BLACKLIST_DOMAIN',
  EXISTED_DOMAIN: 'EXISTED_DOMAIN',
  ASSCOCIATE_DOMAIN: 'ASSCOCIATE_DOMAIN',
};

export const MAXIMUM_ORG_TOTAL_MEMBER_PUSH_NOTIFICATION = 20;

export const MAX_ORGANIZATION_NAME_LENGTH = 100;

export const MAX_DOMAIN_LENGTH = 255;

export const CONTACT_LIST_CONNECT = {
  CONNECT: 'CONNECT',
  NOT_CONNECT: 'NOT_CONNECT',
};

export const ORG_SET_UP_TYPE = {
  WORK: 'WORK',
  PERSONAL: 'PERSONAL',
  EDUCATION: 'EDUCATION',
};

export const MAX_ACCESS_ORG_DISPLAY = 4;

export const DOMAIN_VISIBILITY_SETTING = {
  INVITE_ONLY: 'INVITE_ONLY',
  VISIBLE_AUTO_APPROVE: 'VISIBLE_AUTO_APPROVE',
  VISIBLE_NEED_APPROVE: 'VISIBLE_NEED_APPROVE',
};

export const JOIN_ORGANIZATION_STATUS = {
  CAN_JOIN: 'CAN_JOIN',
  CAN_REQUEST: 'CAN_REQUEST',
  PENDING_INVITE: 'PENDING_INVITE',
  REQUESTED: 'REQUESTED',
};

export const VISIBILITY_SETTING_CALLBACK_ACTION = {
  ALLOW_CERTAIN_DOMAIN: 'allow_certain_domain',
};

export const MAX_CREATED_ORG_NUMBER = 20;

export const DEFAULT_SIGN_DOC_STACK = 5;

export const EDUCATION_DOMAIN = ['edu', 'st', 'k12', 'ac', 'ed'];

export const PREFIX_EDUCATION_DOMAIN = ['isd', 'dsb'];

export const JOIN_ORGANIZATION_PERMISSION_TYPE = {
  ACCEPT_INVITE: 'acceptInvite',
  REQUEST_ACCESS: 'requestAccess',
  JOIN: 'join',
};

export const SettingSections = {
  INVITE_PERMISSION: 'invitePermission',
  VISIBILITY: 'visibility',
};

export const GetGoogleContactsContext = {
  ONBOARDING_FLOW: 'ONBOARDING_FLOW',
  INVITE_ORG_MEMBER: 'INVITE_ORG_MEMBER',
};

export const InviteBannerType = {
  PENDING_REQUEST: 'PENDING_REQUEST',
  GOOGLE_CONTACT: 'GOOGLE_CONTACT',
  INVITE_MEMBER: 'INVITE_MEMBER',
};

export const MAX_DISPLAY_WORKSPACES_ON_SWITCHER = 3;

export const ORGANIZATION_ROUTERS = [`/${ORG_TEXT}`, `${ORG_TEXT}s`];

export const MAX_DISPLAY_SPACES_ON_SWITCHER = 4;

export const ORGANIZATION_ROLE_CHIP_COLOR = {
  [ORGANIZATION_ROLE_SHORTEN_KEY.ORGANIZATION_ADMIN]: {
    backgroundColor: 'var(--kiwi-colors-custom-brand-lumin-lumin-container)',
    color: 'var(--kiwi-colors-custom-brand-lumin-lumin)',
  },
  [ORGANIZATION_ROLE_SHORTEN_KEY.BILLING_MODERATOR]: {
    backgroundColor: 'var(--kiwi-colors-custom-role-web-surface-blue-activated)',
    color: 'var(--kiwi-colors-core-on-primary-container)',
  },
  [ORGANIZATION_ROLE_SHORTEN_KEY.MEMBER]: {
    backgroundColor: 'var(--kiwi-colors-surface-surface-container)',
    color: 'var(--kiwi-colors-surface-on-surface)',
  },
};

export const LIMIT_GET_ORGANIZATION_MEMBERS = 4;

export const DomainVisibilitySetting = {
  [DOMAIN_VISIBILITY_SETTING.INVITE_ONLY]: 'inviteOnly',
  [DOMAIN_VISIBILITY_SETTING.VISIBLE_AUTO_APPROVE]: 'anyoneCanJoin',
  [DOMAIN_VISIBILITY_SETTING.VISIBLE_NEED_APPROVE]: 'requestToJoin',
};

export const OLD_ORGANIZATION_DOCUMENT_PATHS = ['/documents/circle', '/documents/circle/folder/:folderId'];

export const LIMIT_API_KEY = 4;

export const UNIFY_PRODUCTS_LABEL_MAPPING = {
  PDF: 'PDF',
  SIGN: 'Sign',
};

export const PRODUCT_TIER_LABEL_MAPPING = {
  [UnifySubscriptionPlan.ORG_STARTER]: 'Starter',
  [UnifySubscriptionPlan.ORG_PRO]: 'Pro',
  [UnifySubscriptionPlan.ORG_BUSINESS]: 'Business',
  [UnifySubscriptionPlan.ORG_SIGN_PRO]: 'Pro',
  [UnifySubscriptionPlan.FREE]: 'Free',
};

export const PRODUCT_STATUS_LABEL_MAPPING = {
  [PaymentStatus.ACTIVE]: '',
  [PaymentStatus.TRIALING]: 'unifyBillingSettings.trialing',
  [PaymentStatus.CANCELED]: 'unifyBillingSettings.setToCancel',
  [PaymentStatus.UNPAID]: 'unifyBillingSettings.unpaid',
  [PaymentStatus.PENDING]: 'unifyBillingSettings.renewalFailed',
};
