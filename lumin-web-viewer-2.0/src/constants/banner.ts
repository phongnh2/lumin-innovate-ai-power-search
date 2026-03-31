import defineWarningBanners from 'utils/defineWarningBanners';

export const BannerType = {
  BEFORE_TRIAL: 'before_trial',
  AFTER_TRIAL: 'after_trial',
  INVITE_FRIEND: 'invite_friend',
  PROMOTE_YOUTUBE: 'promote_youtube',
  CREATE_ORGANIZATION: 'create_organization',
  FOR_PREMIUM: 'for_premium',
  FOR_FREE_ORG: 'for_free',
  FOR_PREMIUM_ORG: 'for_premium_org',
  PERSONAL_SAVE: 'personal_save',
  BANANA_SIGN: 'banana_sign',
  DOWNLOAD_PWA: 'download_pwa',
  RATE_LUMIN: 'rate_lumin',
  UPLOAD_DOCUMENT: 'upload_document',
  CREATE_TEAM: 'create_team',
  CONTACT_UPGRADE: 'contact_upgrade',
  INTRODUCE_TEMPLATES: 'introduce_templates',
};

export const WarningBannerType = defineWarningBanners([
  'LEGACY_CUSTOMER_MIGRATION',
  'DELETE_RESOURCE',
  'BILLING_WARNING_UNPAID',
  'BILLING_WARNING',
  'VIEWER_BANNER',
  'WORKSPACE_ANNOUNCEMENT',
  'ACCEPT_PENDING_REQUEST',
  'GOOGLE_COLLABORATORS',
  'SETUP_DEFAULT_WORKSPACE',
] as const);

export type WarningBannerKey = keyof typeof WarningBannerType;

export const BannerRateLuminState = {
  NEVER_INTERACT: 'NEVER_INTERACT',
  OPEN: 'OPEN',
  HIDE: 'HIDE',
};

export const BannerActorType = {
  PERSONAL: 'personal',
  ORGANIZATION: 'organization',
};

export const AnimationBanner = {
  SHOW: 'show',
  HIDE: 'hide',
  DEFAULT: 'default',
};

export const RATED_SCORE = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

export const SHOW_RATING_TIMER = 300000;

export const AutoSyncRatingAttempt = 2;

export const BannerNames = {
  COOKIES: 'cookies',
};

export const BannerViewerPosition = {
  TOP: 'top',
  INSIDE: 'inside',
  NONE: 'none',
};
