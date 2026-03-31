export const FADEIN_TIME = 3000; // This time fade in highlight password container
export enum OrganizationEntity {
  Organization = 'ORGANIZATION',
  OrganizationTeam = 'ORGANIZATION_TEAM'
}

export const DATE_FORMAT = 'LL';

export const NUMBER_DAYS_DELETED_ACCOUNT = 3;

export const NetworkConstants = {
  X_FORWARDED_FOR_HEADER: 'x-forwarded-for',
  CF_CONNECTING_IP: 'CF-Connecting-IP',
  TRUE_CLIENT_IP: 'True-Client-IP',
  DEFAULT_IP_ADDRESS: '127.0.0.1',
  USER_AGENT: 'user-agent'
};

export const LoggerScope = {
  ERROR: {
    UNKNOWN_ERROR: 'UNKNOWN_ERROR',
    REMOVE_AVATAR: 'REMOVE_AVATAR',
    ORY_EXCEPTION: 'ORY_EXCEPTION',
    GOOGLE_EXCEPTION: 'GOOGLE_EXCEPTION',
    UPDATE_IDENTITY: 'UPDATE_IDENTITY',
    LINK_ACCOUNT: 'LINK_ACCOUNT',
    XERO_EXCEPTION: 'XERO_EXCEPTION'
  }
};

export const ALLOW_IMAGE_MIMETYPE = ['image/png', 'image/jpg', 'image/jpeg'];

export const LUMIN_SIGN = 'luminsign';

export const SIGN_UP_REF = {
  LUMIN_SIGN: 'luminsign',
  LUMIN_APP: 'luminapp',
  LUMIN_STATIC: 'luminstatic'
};

export const AUTH_HEADER_REGEX = /(\S{1,20})\s{1,2}(\S{1,2048})/;

export enum ElementName {
  LUMIN_LOADING = 'lumin_loading'
}

export const RESEND_VERIFICATION_LIMIT = 59;

export enum QUERY_KEYS {
  RETURN_TO = 'return_to',
  LOGIN_HINT = 'loginHint',
  HIGHLIGHT = 'highlight',
  REQUEST_GOOGLE_SIGN_IN = 'request_google_sign_in',
  CREDENTIAL = 'credential',
  REDIRECT = 'redirect',
  REQUEST_SOCIAL_SIGN_IN = 'request_social_sign_in',
  PROVIDER = 'provider',
  SOCIAL_SIGN_IN_ENABLED = 'social_sign_in_enabled',
  ACTION = 'action',
  FROM = 'from',
  PLATFORM = 'platform',
  EMAIL = 'email',
  REQUEST_LOGIN_FROM_DESKTOP_APP = 'request_login',
  LOGIN_TYPE_FROM_DESKTOP_APP = 'login_type',
  OIDC_TOKEN = 'token',
  AG_GUEST = 'ag_guest',
  FLOW = 'flow',
  FROM_XERO_APP_STORE = 'from_xero_app_store'
}

export const INPUT_DEBOUNCE_TIME = 500;

export const ORGANIZATION_SEGMENT = 'workspace';

export const TEAMS_SEGMENT = 'spaces';

export const BANNER_INTERACTIONS = {
  VIEWED: 'Viewed',
  DIMISS: 'Dimiss',
  CONFIRMATION: 'Confirmation',
  HIDDEN: 'Hidden'
};
