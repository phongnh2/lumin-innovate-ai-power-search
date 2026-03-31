export class CommonConstants {
  public static readonly APOLLO_SERVER_PATH = '/graphql';

  public static readonly JWT_EXPIRE_IN = '7 days';

  public static readonly JWT_EXPIRE_TOKEN_IN = '15 minutes';

  public static readonly JWT_EXPIRE_LANDING_PAGE_TOKEN = '5 minutes';

  public static readonly JWT_ALGORITHM = 'HS256';

  public static readonly MIN_DOCUMENT_NAME_LENGTH = 0;

  public static readonly MAX_DOCUMENT_NAME_LENGTH = 255;

  public static readonly AUTH_HEADER_REGEX = /(\S+)\s+(\S+)/;

  public static readonly AUTHORIZATION_HTTP_REQUEST_HEADER = 'authorization';

  public static readonly ORY_AUTHORIZATION_HTTP_REQUEST_HEADER = 'authorization-v2';

  public static readonly ORY_AUTHORIZATION_RPC_REQUEST_METADATA = 'authorization-v2';

  public static readonly GRAPHQL_SOCKET_AUTH = 'graphql-socket-auth';

  public static readonly AUTH_TOKEN_SUBSCRIPTION = 'authToken';

  public static readonly REFRESH_TOKEN_HTTP_REQUEST_HEADER = 'refreshtoken';

  public static readonly AUTHORIZATION_HEADER_BEARER = 'Bearer';

  public static readonly AUTHORIZATION_HEADER_BASIC = 'Basic';

  public static readonly TOKEN_EXPIRED_ERROR = 'TokenExpiredError';

  public static readonly GOOGLE = 'GOOGLE';

  public static readonly DROPBOX = 'DROPBOX';

  public static readonly DROPBOX_TOKEN_API = 'https://api.dropboxapi.com/oauth2/token';

  public static readonly DROPBOX_GET_ACCOUNT_API = 'https://api.dropboxapi.com/2/users/get_account';

  public static readonly DROPBOX_GET_CURRENT_ACCOUNT_API = 'https://api.dropboxapi.com/2/users/get_current_account';

  public static readonly DROPBOX_GRANT_TYPE = 'authorization_code';

  public static readonly ENCODE_BASE64 = 'base64';

  public static readonly EMAIL_TOKEN_EXPIRE_IN = '1 day';

  public static readonly REVOKE_PERMISSION_IN = 172800; // 2 days in second

  public static readonly EXPIRE_LANDING_PAGE_TOKEN = 604800; // 7 days in second, synchonize with JWT_EXPIRE_VERIFY_ACCOUNT_IN

  public static readonly ADMIN_ACCESS_TOKEN_EXPIRE_IN = 604800; // 7 days in second

  public static readonly EXPIRE_LAST_ACCESSED_ORG_ID = 1296000; // 15 days in second

  public static readonly STRIPE = 'STRIPE';

  public static readonly ALGORITHM = 'aes-256-cbc';

  public static readonly CRYPTO_IV = '2736badb14cfbcd6';

  public static readonly PAGING_DEFAULT = 12;

  public static readonly X_FORWARDED_FOR_HEADER = 'x-forwarded-for';

  public static readonly CF_CONNECTING_IP = 'CF-Connecting-IP';

  public static readonly CF_IPCOUNTRY = 'cf-ipcountry';

  public static readonly CF_REGION = 'cf-region';

  public static readonly CF_IPCITY = 'cf-ipcity';

  public static readonly TRUE_CLIENT_IP = 'True-Client-IP';

  public static readonly SOCKET_ID_HEADER = 'x-socket-id';

  public static readonly RATE_LIMIT_LIMIT_HEADER = 'X-RateLimit-Limit';

  public static readonly RATE_LIMIT_REMAINING_HEADER = 'X-RateLimit-Remaining';

  public static readonly RATE_LIMIT_RETRY_AFTER_HEADER = 'X-Retry-After';

  public static readonly RATE_LIMIT_INGRESS_COOKIE_HEADER = 'INGRESSCOOKIE';

  public static readonly DEFAULT_IP_ADDRESS = '127.0.0.1';

  public static readonly PDF_FILE_EXTENSION = '.pdf';

  public static readonly ALPHABET_CHARACTERS = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';

  public static readonly DEFAULT_TEAM_NAME_POSTFIX = "'s Team";

  public static readonly MAXIMUM_SIGN_IN_ATTEMPTS = 5;

  public static readonly INVITATION_SIGN_UP_EXPIRE_IN = 60;

  public static readonly LUMIN_ADMIN = 'Lumin Admin';

  public static readonly HEX_COLOR_REGEX = /^#(?:[0-9a-fA-F]{3}){1,2}$/;

  public static readonly RELEASE_VERSION = 1.0;

  public static readonly DEVELOPMENT_ORIGIN = ['http://localhost:3000', 'http://localhost:8000', 'http://localhost:9000', 'http://localhost:3400'];

  public static readonly MOBILE_REQUEST_HEADER = 'x-mb';

  public static readonly SYSTEM_FILE_PREFIX_ID = 'system-';

  public static readonly ANONYMOUS_USER_ID_COOKIE = 'anonymousUserId';

  public static readonly SSE_ACCEPT_HEADER = 'text/event-stream';

  public static readonly GOOGLE_ACCEPT_TOKEN_EXPIRE_IN = 3600; // 1h

  public static readonly PINPOINT_EVENTS_EXPIRE_IN = 60; // 1m

  public static readonly GA_MEASUREMENT_PROTOCOL_ENDPOINT = 'https://www.google-analytics.com/mp/collect';

  public static readonly TRUSTPILOT_API_ENDPOINT = 'https://api.trustpilot.com/v1';

  public static readonly INTERCOM_API_ENDPOINT = 'https://api.intercom.io';

  public static readonly USER_DOC_VIEWER_INTERACTION_EXPIRE_IN = 1296000; // 15 days in second

  public static readonly OPEN_GOOGLE_CREDENTIALS_EXPIRE_IN = 300; // 5 minute

  public static readonly EXPIRE_OBJECT_TAG = 'ExpireAfterOneDay=true';

  public static readonly ORG_RECENTLY_UPGRADED_BY_ADMIN_EXPIRE_IN = 31 * 24 * 60 * 60; // 31 days in second

  public static readonly MAXIMUM_PROMPT_SHARED_DRIVE_USER = 10;

  public static readonly LAST_AUTHORIZED_EMAIL_EXPIRE_IN = 1296000; // 15 days in second

  public static readonly LAST_CHANGED_ANNOTATION_EXPIRE_IN = 12 * 60 * 60; // 12 hours in second

  public static readonly SIGN_UP_IN_GOOGLE_FLOW_EXPIRE_IN = 600; // 5 minute

  public static readonly EXTRA_TRIAL_DAYS_EXPIRE_IN = 600; // 10 minutes

  public static readonly MAXIMUM_TRIAL_DAYS_PER_REQUEST = 30;

  public static readonly DOMAIN_ALTERNATIVE_QUERY_EXPIRE_IN = 1296000;

  // Recommend from mongodb with in operator https://www.mongodb.com/docs/manual/reference/operator/query/in/#syntax
  public static readonly MAX_LIMIT_PER_IN_OPERATOR = 10;

  public static readonly SUBSCRIPTION_CANCELED_DATE_EXPIRE_IN = 30 * 24 * 60 * 60; // 30 days in second

  public static readonly USER_LAST_ACCESSED_TEAM_EXPIRE_IN = 1296000; // 15 days in second

  public static readonly MAX_NUMBER_OF_LAST_ACCESSED_TEAM = 4;

  public static readonly S3_KEY_MAX_LENGTH = 1024;

  public static readonly REPRESENTATIVE_MEMBERS_EXPIRE_IN = 1296000; // 15 days in second

  public static readonly INVALID_SESSION_EXPIRE = 30 * 24 * 60 * 60; // 30 days in second

  public static readonly MICROSOFT_GRAPH_API = 'https://graph.microsoft.com/v1.0';

  public static readonly FORM_FIELD_DETECTION_QUOTA_EXPIRE_IN = 24 * 60 * 60;

  public static readonly USER_SIGN_UP_BY_INVITATION_EXPIRE_IN = 1296000; // 15 days in second

  public static readonly SUGGESTED_ORG_EXPIRE_IN = 60; // 1 minute

  public static readonly LUMIN_ASSETS_URL = 'https://assets.luminpdf.com';

  public static readonly CHATBOT_DAILY_REQUESTS_LIMIT_EXPIRE_IN = 24 * 60 * 60;

  public static readonly SIGN_IN_SLACK_OAUTH_EXPIRE_IN = 120; // 10 minutes

  public static readonly CREATE_PDF_FROM_STATIC_TOOL_UPLOAD_EXPIRE_IN = 60 * 60 * 24;

  public static readonly THIRD_PARTY_ACCESS_TOKEN_FOR_INDEXING_EXPIRE_IN = 10 * 60; // 10 minutes

  public static readonly INTERCOM_JWT_EXPIRE_IN = '1h';

  public static readonly AVATAR_SUGGESTION_EXPIRE_IN = 60 * 60 * 24 * 30; // 30 days in second
}
