import { ORG_TEXT } from 'constants/organizationConstants';

export const UrlSearchParam = {
  FORM_NAME: 'formName',
  CREDENTIALS_ID: 'credentials-id',
  OPEN_FROM: 'openFrom',
  FROM: 'from',
  PAYMENT_ORG_TARGET: `${ORG_TEXT}_id`,
  PAYMENT_ORG_QUANTITY: 'quantity',
  PAYMENT_SUCCESSFUL_REDIRECT: 'successful_redirect',
  AUTH_ROUTE_PERIOD: 'period',
  PAYMENT_ORG_URL: `${ORG_TEXT}_url`,

  PLAN_PERIOD: 'period',
  REDIRECT_URL: 'url',
  /**
   * @deprecated
   */
  LANDING_PAGE_TOKEN: 'ltk',
  /**
   * @deprecated
   */
  CONTINUE_URL: 'continue',
  PLATFORM: 'platform',
  PLAN: 'plan',
  BILLING: 'billing',
  TEMPLATE_ID: 'templateId',
  ACTION: 'action',
  TAB: 'tab',
  REQUESTER_ID: 'requesterId',
  CALLBACK_ACTION: 'callback_action',
  REDIRECT_STATE: 'redirect_state',
  PROMOTION: 'promotion',
  SECTION: 'section',
  SETTING_TAB: 'setting_tab',
  HIGHLIGHT: 'highlight',
  TOKEN: 'token',
  OPEN_MODAL_FROM: 'open_modal_from',
  RETURN_URL: 'returnUrl',
  REDIRECT: 'redirect',
  OPEN_GOOGLE_STATE: 'open_google_state',
  REFERER: 'referer',
  FORM_REMOTE_ID: 'remoteId',
  WRONG_EMAIL: 'wrong_email',
  REQUIRE_ORG_MEMBERSHIP: 'require_org_membership',
  EMAIL: 'email',
  FROM_PAGE: 'from',
  SOURCE: 'source',
  PDF_ACTION: 'action',
  HINT_LOGIN_SERVICE: 'hint-login-service',
  PREPAID_CARD: 'prepaid_card',
  OLD_PAYMENT_ORG_TARGET: 'org_id',
  STORAGE: 'storage',
  DRIVE_ID: 'drive_id',
  STATE: 'state',
  HINT_EMAIL: 'hint_email',
  CAN_JOIN_WORKSPACE: 'can-join-workspace',
  RETURN_TO: 'return_to',
  ORG_TYPE: 'type',
  TRIAL: 'trial',
  PDF_PLAN: 'pdf',
  SIGN_PLAN: 'sign',
  PAYMENT_PERIOD: 'period',
  CANCEL_SUBSCRIPTION_PRODUCT: 'product',
  ERROR_CODE: 'errorCode',
};

export const CancelSubscriptionProduct = {
  SIGN: 'sign',
  PDF: 'pdf',
};

export const TemplateAction = {
  EDIT: 'edit',
  INFO: 'info',
  PREVIEW: 'preview',
};

export const HighlightSettings = {
  OFFLINE: 'offline',
};

export const RedirectFromPage = {
  TEMPLATES: 'templates',
};

export const AwsPresignUrlParams = {
  Expire: 'X-Amz-Expires',
  Date: 'X-Amz-Date',
};

export const FORWARDED_FLP_URL_PARAMS = [UrlSearchParam.ACTION, UrlSearchParam.FROM];
