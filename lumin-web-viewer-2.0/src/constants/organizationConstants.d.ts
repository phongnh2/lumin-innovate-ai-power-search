import { UnifySubscriptionProduct, UnifySubscriptionPlan } from './organization.enum';
import { PaymentStatus } from './plan.enum';

export const SettingSections: {
  INVITE_PERMISSION: string;
  VISIBILITY: string;
};

export const DOMAIN_VISIBILITY_SETTING: {
  INVITE_ONLY: string;
  VISIBLE_AUTO_APPROVE: string;
  VISIBLE_NEED_APPROVE: string;
};

export const ORG_PATH: string;

// only used for URL
export const ORG_TEXT: string;

// only used for URL
export const ORGS_TEXT: string;

export const ORG_TRANSFER_URL: string;

export const ORGANIZATION_CREATION_TYPE: {
  AUTOMATIC: string;
  MANUAL: string;
};

export const ORGANIZATION_TEXT: string;

export const ORGANIZATION_ROLES: {
  ORGANIZATION_ADMIN: string;
  BILLING_MODERATOR: string;
  TEAM_ADMIN: string;
  MEMBER: string;
};

export const MAXIMUM_ORG_TOTAL_MEMBER_PUSH_NOTIFICATION: number;

export const GetGoogleContactsContext: {
  ONBOARDING_FLOW: string;
  INVITE_ORG_MEMBER: string;
};

export const InviteBannerType: {
  PENDING_REQUEST: string;
  GOOGLE_CONTACT: string;
  INVITE_MEMBER: string;
};
export const JOIN_ORGANIZATION_STATUS: {
  CAN_JOIN: string;
  CAN_REQUEST: string;
  PENDING_INVITE: string;
  REQUESTED: string;
};

export const JOIN_ORGANIZATION_PERMISSION_TYPE: {
  ACCEPT_INVITE: string;
  REQUEST_ACCESS: string;
  JOIN: string;
};

export const MAX_DISPLAY_WORKSPACES_ON_SWITCHER: number;

export const ORGANIZATION_ROUTERS: string[];

export const MAX_DISPLAY_SPACES_ON_SWITCHER: number;

export const CONTACT_LIST_CONNECT: {
  CONNECT: string;
  NOT_CONNECT: string;
};

export const ORGANIZATION_ROLE_SHORTEN_KEY: {
  ORGANIZATION_ADMIN: string;
  BILLING_MODERATOR: string;
  MEMBER: string;
};

export const ORGANIZATION_ROLE_CHIP_COLOR: {
  [key: string]: {
    backgroundColor: string;
    color: string;
  };
};

export const MAX_DOMAIN_LENGTH: number;
export const DEFAULT_SIGN_DOC_STACK: number;

export const MAX_ORGANIZATION_NAME_LENGTH: number;

export const ORG_ROLE_KEY: {
  [key: string]: string;
};

export const MAX_ACCESS_ORG_DISPLAY: number;

export const DomainVisibilitySetting: {
  [key: string]: string;
};

export const OLD_ORGANIZATION_DOCUMENT_PATHS: string[];

export const ORGANIZATION_MEMBER_TYPE: {
  PEOPLE_PENDING_MEMBER: string;
  PEOPLE_REQUEST_ACCESS: string;
  PEOPLE_MEMBER: string;
  PEOPLE_GUEST: string;
  MEMBER: string;
};

export const ORGANIZATION_MEMBERS_FILTER_BY_ROLE: Record<string, string>;

export const LIMIT_API_KEY: number;

export const UNIFY_PRODUCTS_LABEL_MAPPING: Record<UnifySubscriptionProduct, string>;

export const PRODUCT_TIER_LABEL_MAPPING: Record<UnifySubscriptionPlan, string>;

export const PRODUCT_STATUS_LABEL_MAPPING: Record<PaymentStatus, string>;
