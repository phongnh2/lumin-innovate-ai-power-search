export const PURPOSE = {
  TEACHER: 'teacher',
  STUDENT: 'student',
  PERSONAL: 'personal',
  SMALL_BUSINESS: 'small-business',
  LARGE_COMPANY: 'large-company',
  NON_PROFIT: 'non-profit',
};

export const MAPPING_USER_PURPOSE = {
  education: PURPOSE.TEACHER,
  feature: PURPOSE.PERSONAL,
  free_trial: PURPOSE.PERSONAL,
  recruitment: PURPOSE.SMALL_BUSINESS,
  business: PURPOSE.LARGE_COMPANY,
  real_estate: PURPOSE.SMALL_BUSINESS,
};

export const PURPOSE_STEP = {
  /**
   * @deprecated
   */
  GET_PURPOSE: 1,
  /**
   * @deprecated
   */
  INVITE_MEMBER: 2,
  START_FREE_TRIAL: 3,
  AFTER_FREE_TRIAL: 4,
};

export const USER_TYPE = {
  LANDING: 'landing',
  EDUCATION: 'education',
  FEATURE: 'feature',
  NORMAL: 'normal',
  RECRUITMENT: 'recruitment',
  BUSINESS: 'business',
  REAL_ESTATE: 'real_estate',
};

export const INVITATION_TO_LUMIN_TYPE = {
  TEAM: 'TEAM',
  ORGANIZATION: 'ORGANIZATION',
};

export const LOGIN_TYPE = {
  GOOGLE: 'google',
  NORMAL: 'normal',
};
export const LIMIT_USER_CONTACTS = 5;

export const LIMIT_STORE_CONTACTS = 100;

export const LIMIT_FOLDER_COLORS = 100;

export const LOCATION_LIMIT = 50;

export const RATING_DISPLAY_CONDITIONS = {
  TOTAL_CREATED_ANNOTATION: 10,
  TOTAL_OPENED_DOC: 5,
};

export const LIMIT_GET_USERS = 5000;

export const LIMIT_RETURN_GOOGLE_CONTACTS = 5;

export const LIMIT_GET_GOOGLE_CONTACTS = 30;
// use for testing recaptcha v3 bot user
export const RECAPTCHA_V3_USER_BLACKLIST = ['travlp+011@dgroup.co', 'huyenntm+0001@luminpdf.com'];

export const UNKNOWN_THIRD_PARTY = 'unknown_third_party';

export const SYNC_OIDC_AVATAR_MAX_RETRIES = 3;

export const SYNC_OIDC_AVATAR_BASE_DELAY_MS = 5000; // 5 seconds
