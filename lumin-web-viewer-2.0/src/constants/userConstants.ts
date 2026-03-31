export const USER_SUBSCRIPTION_TYPE = {
  CANCELED_SUBSCRIPTION: 'subscription_canceled_user_payment',
  SHOW_RATING_MODAL: 'subscription_show_rating_modal',
  MIGRATING_SUCCESS: 'subscription_migrating_user_success',
};

export const RatingModalStatus = {
  NEVER_INTERACT: 'NEVER_INTERACT',
  OPEN: 'OPEN',
  HIDE: 'HIDE',
};

export const MAX_NAME_LENGTH = 30;

export const MAX_EMAIL_LENGTH = 255;

export const DIVISIBLE_NUMBER = {
  GET_50_PERCENT: 2,
  GET_10_PERCENT: 10,
  GET_20_PERCENT: 5,
};

export const USER_METADATA_KEY: Record<string, string> = {
  IS_FIRST_TIME_REDACT_FROM_FLP: 'isFirstTimeRedactFromFLP',
  IS_FIRST_TIME_SET_PASSWORD_FROM_FLP: 'isFirstTimeSetPasswordFromFLP',
  HAS_SHOWN_EDIT_IN_AGREEMENT_GEN_MODAL: 'hasShownEditInAgreementGenModal',
  AI_CHATBOT_CONSENT_GRANTED: 'aiChatbotConsentGranted',
  DOC_SUMMARIZATION_CONSENT_GRANTED: 'docSummarizationConsentGranted',
  HAS_SHOWN_AUTO_SYNC_MODAL: 'hasShownAutoSyncModal',
  HAS_CLOSED_QUICK_SEARCH_GUIDELINE: 'hasClosedQuickSearchGuideline',
  HAS_SHOWN_AUTO_SYNC_DEFAULT: 'hasShownAutoSyncDefault',
  HAS_SHOWN_CONTENT_EDIT_POPOVER: 'hasShownContentEditPopover',
  IS_HIDDEN_SUGGESTED_ORGANIZATION: 'isHiddenSuggestedOrganization',
};
