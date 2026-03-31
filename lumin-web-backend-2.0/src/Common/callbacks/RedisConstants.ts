export class RedisConstants {
  public static readonly CHANNEL = 'REDIS_NOTIFICATION';

  public static readonly EXPIRED_EVENT = '__keyevent@0__:expired';

  public static readonly REDIS_EXPIRED = 'RedisExpired';

  public static readonly TRANSFER_ORG_ADMIN = 'transfer-org-admin';

  public static readonly DOCUMENT_STAT_REDIS_PREFIX = 'stat:document:';

  public static readonly NON_DOCUMENT_STAT_REDIS_PREFIX = 'stat:non:document:';

  public static readonly SUBSCRIPTION_ACTOR_REDIS_PREFIX = 'subscription:';

  public static readonly RATE_LIMIT_PREFIX = 'rateLimit:';

  public static readonly VALID_VERIFY_TOKEN_PREFIX = 'validVerifyToken:';

  public static readonly ADMIN_ACCESS_TOKENS_PREFIX = 'admin:tokens:';

  public static readonly USER_SIGN_IN_ATTEMPT_PREFIX = 'attempt-';

  public static readonly ADMIN_SIGN_IN_ATTEMPT_PREFIX = 'admin:attempt:sign-in:';

  public static readonly INVITATION_SIGN_UP_PREFIX = 'sign-up:invitation:';

  public static readonly RESET_PASSWORD_ATTEMPT_REMAINS = 'attempt:reset-password:';

  public static readonly TOKEN_BLACK_LIST_PREFIX = 'token:blacklist:';

  public static readonly STRIPE_RENEW_ATTEMPT = 'stripe:renew-attempt:';

  public static readonly STRIPE_FAILED_ALL_ATTEMPTS = 'stripe:failed-all-attempts:';

  public static readonly STRIPE_DISABLE_SUBSCRIPTION_REMAINING_DATE = 'stripe:disbale-subscription-remaining-date';

  public static readonly RESET_PASSWORD_TOKEN_PREFIX = 'token:reset-password:';

  public static readonly ADMIN_RESET_PASSWORD_TOKEN_PREFIX = 'admin:token:reset-password:';

  public static readonly ADMIN_CREATE_PASSWORD_TOKEN_PREFIX = 'admin:token:create-password:';

  public static readonly USER_LAST_ACCESSED_ORG_ID = 'last-accessed:org-id:user:';

  public static readonly SHARE_DOCUMENT_LIMIT_PREFIX = 'limit:share-document:';

  public static readonly DELETE_USER_IMMEDIATELY = 'delete-user-immediately';

  public static readonly DOC_VIEWER_INTERACTION_PREFIX = 'user:doc-viewer:interaction:';

  public static readonly TOTAL_OPENED_DOC_FIELD = 'totalOpenedDoc';

  public static readonly TOTAL_CREATED_ANNOT_FIELD = 'totalCreatedAnnotation';

  public static readonly CONTACT_POOL = 'contact-pool';

  public static readonly STRIPE_SETUP_INTENT_PREFIX = 'stripe:setup-intent:';

  public static readonly ORGANIZATION_STRIPE_SETUP_INTENT_PREFIX = 'organization:setup-intent:';

  public static readonly UPLOAD_DOCUMENT_TO_ORGANIZATION = 'upload-document-organization:';

  public static readonly UPLOAD_TEMPLATE = 'upload-template:';

  public static readonly VERIFY_EMAIL_SENT = 'verifyEmailSent:';

  public static readonly RESENT_ORGANIZATION_INVITATION = 'organization:resent-invitation:';

  public static readonly MIGRATE_USER_DOCUMENTS_TO_ORG_PREFIX = 'migrate_user_documents_to_org:';

  public static readonly PRICING_USER_MIGRATION = 'pricing_user_migration';

  public static readonly STRIPE_REFUND_FRAUD_WARNING_CUSTOMER = 'stripe:refund_fraud_warning:customer:';

  public static readonly STRIPE_MAIN_SUBSCRIPTION_ITEM = 'stripe:subscription_main_item:subscription:';

  public static readonly MIGRATED_ORG_URL_PREFIX = 'migrated_org_url:';

  public static readonly VALID_INVITE_ORG_TOKEN_PREFIX = 'organization:invitation-token:';

  public static readonly DELETE_BACKUP_FILES = 'delete-backup-files:';

  public static readonly OPEN_FORM_FROM_TEMPLATES = 'templates:open-form:';

  public static readonly PINPOINT_EVENTS = 'pinpoint:events';

  public static readonly IDENTITY_DELETED_RECENTLY = 'auth:identity-deleted-recently:';

  public static readonly OPEN_GOOGLE_CREDENTIALS = 'open-google:credentials:';

  public static readonly ORG_RECENTLY_UPGRADED_BY_ADMIN = 'organization:recently-upgraded-by-admin';

  public static readonly LAST_AUTHORIZE_GOOGLE_EMAIL = 'last-authorize-google-email:';

  public static readonly LAST_CHANGED_ANNOTATION = 'last-changed-annotation';

  public static readonly SIGN_UP_IN_GOOGLE_FLOW = 'sign-up-in-google-flow:';

  public static readonly EXTRA_TRIAL_DAYS = 'extra-trial-days:';

  public static readonly CAN_EXTRA_TRIAL = 'can-extra-trial:';

  public static readonly DOMAIN_USE_ALTERNATIVE_QUERY = 'domain-use-alternative-query:';

  public static readonly SUBSCRIPTION_CANCELED_DATE = 'subscription-canceled-date:';

  public static readonly USER_LAST_ACCESSED_TEAM = 'user-last-accessed-team:';

  public static readonly REPRESENTATIVE_MEMBERS = 'representative-members:';

  public static readonly INVALID_SESSION_ID = 'invalid-session-id:';

  public static readonly ONEDRIVE_ACCESS_TOKEN = 'onedriveToken:';

  public static readonly FORM_FIELD_DETECTION_USAGE_PER_DAY = 'form-field-detection-usage-per-day:';

  public static readonly AUTO_DETECTION_USAGE_PER_DAY = 'auto-detection-usage-per-day:';

  public static readonly USER_SIGN_UP_BY_INVITATION = 'user-sign-up-by-invitation:';

  public static readonly SUGGESTED_ORG = 'suggested-org:';

  public static readonly CHATBOT_DAILY_REQUESTS_LIMIT = 'chatbot-daily-requests-limit:';

  public static readonly SIGN_IN_SLACK_OAUTH = 'sign-in-slack-oauth:';

  public static readonly DOCUMENT_SHARING_QUEUE = 'document-sharing-queue:';

  // the key is named according to the rule of lumin-integration
  // ref: app-integration/packages/storage/src/redis.ts
  public static readonly SLACK_WEB_AUTHORIZATION = 'slack_web-authorization:';

  public static readonly CREATE_PDF_FROM_STATIC_TOOL_UPLOAD = 'create-pdf-from-static-tool-upload:';

  public static readonly THIRD_PARTY_ACCESS_TOKEN_FOR_INDEXING = 'third-party-access-token-for-indexing:';

  public static readonly WEB_CHATBOT_LATEST_MESSAGE_FROM_USER = 'web-chatbot-latest-message-from-user:';

  public static readonly DOCUMENT_INDEXING_DEBOUNCE = 'document-indexing-debounce:';

  public static readonly AVATAR_SUGGESTION = 'avatar-suggestion:domain:';

  public static readonly TIME_SENSITIVE_COUPON_PREFIX = 'time-sensitive-coupon:';
}
