export const AWS_EVENTS = {
  FORM_FIELD_DETECTION: {
    SURVEY_RESPONSE: 'surveyResponse',
  },
  PAGE_VIEW: 'pageView',
  UPLOAD_DOCUMENT: 'UploadDocument',
  DELETE_DOCUMENT: 'DeleteDocument',
  DOWNLOAD_DOCUMENT_SUCCESS: 'downloadDocSuccess',
  SAVE_DOCUMENT: 'documentSaving',
  RIGHT_SIDE_BAR: 'rightSidebarButton',
  PAYMENT: {
    USER_FILL_PAYMENT_FORM: 'userFillPaymentForm',
    USER_SUBMIT_PAYMENT_FORM: 'userSubmitPaymentForm',
    ERROR: 'paymentError',
    PAYMENT_SUCCESS: 'paymentSuccess',
    SUBSCRIPTION_CANCELED: 'subscriptionCanceled',
    PREINSPECT_CARD_INFO: 'preinspectCardInfo',
    PAYMENT_PERIOD_CHANGED: 'paymentPeriodChanged',
    PAYMENT_METHOD_CHANGED: 'paymentMethodChanged',
  },
  FORM: {
    FORM_SUBMIT: 'formSubmit',
    FORM_RESET: 'formReset',
    FORM_FIELD_CHANGE: 'formFieldChange',
    CHECKBOX_UPDATED: 'checkboxUpdated',
  },
  CLICK: 'click',
  BANNER: {
    DISMISS: 'bannerDismiss',
    VIEWED: 'bannerViewed',
    CONFIRMATION: 'bannerConfirmation',
    HIDDEN: 'bannerHidden',
  },
  MODAL: {
    DISMISS: 'modalDismiss',
    VIEWED: 'modalViewed',
    CONFIRMATION: 'modalConfirmation',
    HIDDEN: 'modalHidden',
  },
  MESSAGE: {
    DISMISSED: 'messageDismiss',
    VIEWED: 'messageView',
    CONFIRMATION: 'messageConfirmCTA',
    PREVIEWED: 'messagePreview',
  },
  DOWNLOAD_APP: 'appDownload',
  ORGANIZATION: {
    CREATE: 'organizationCreated',
    DELETE: 'organizationDeleted',
    PLAN_CHANGED: 'organizationPlanChanged',
    ADD_USER: 'organizationAddUser',
    APPROVE_USER_ACCESS_REQUEST: 'organizationApproveUserAccessRequest',
    DECLINE_USER_ACCESS_REQUEST: 'organizationDeclineUserAccessRequest',
    REMOVE_USER: 'organizationRemoveUser',
    SETTING_CHANGED: 'organizationSettingChanged',
    SELECT_SUGGESTED_ORGANIZATION: 'selectSuggestedOrganization',
    USER_REJECT_ORGANIZATION_INVITATION: 'userRejectOrganizationInvitation',
    USER_ACCEPT_ORGANIZATION_INVITATION: 'userAcceptOrganizationInvitation',
    VIEW_SUGGESTED_ORGANIZATION: 'viewSuggestedOrganization',
    REACTIVATE_SET_TO_CANCEL_CIRCLE: 'reactivateSetToCancelCircle',
    REACTIVATE_CANCELED_CIRCLE: 'reactivateCanceledCircle',
    UPGRADE_INTENT: 'upgradeIntent',
    SUGGESTED_ORGANIZATIONS_TO_JOIN_OVERALL: 'suggestedOrganizationsToJoinOverall',
    SUGGESTED_ORGANIZATIONS_TO_JOIN_DETAIL: 'suggestedOrganizationsToJoinDetail',
    DOC_STACK_ADDED: 'docStackAdded',
  },
  ORGANIZATION_TEAM: {
    CREATE: 'organizationCreateTeam',
    DELETE: 'organizationDeleteTeam',
    ADD_MEMBER: 'organizationAddTeamMember',
    REMOVE_MEMBER: 'organizationRemoveTeamMember',
  },
  AUTH: {
    USER_SIGNUP: 'userSignUp',
    USER_SIGNIN: 'userSignIn',
  },
  GOOGLE_ONE_TAP: {
    SIGN_IN_SUCCESS: 'googleOneTapSignInSuccess',
  },
  TEMPLATE: {
    UPLOAD_SUCCESS: 'templateUploaded',
    CREATED_SUCCESS: 'templateCreated',
    USE_TEMPLATE_SUCCESS: 'templateUsed',
    DELETE_TEMPLATE_SUCCESS: 'templateDeleted',
    EDIT_TEMPLATE_SUCCESS: 'templateEdited',
    PREVIEW_TEMPLATE: 'templatePreviewed',
    PREVIEW_TEMPLATE_SCROLL: 'templatePreviewedScroll',
  },
  APP_RATING: 'netPromoterScore',
  GROWTHBOOK: {
    VARIATION_VIEW: 'variationView',
  },
  CARD: {
    DISMISS: 'cardDismiss',
    VIEWED: 'cardViewed',
    CONFIRMATION: 'cardConfirmation',
    HIDDEN: 'cardHidden',
  },
  NOTIFICATION: {
    VIEWED: 'notificationViewed',
    ELEMENT_CLICK: 'notificationElementClicked',
  },
  NAVIGATION: 'navigation',
  DOCUMENT_ACTION: {
    BULK_ACTIONS: 'bulkActions',
    BULK_DOWNLOAD_SUCCESS: 'bulkDownloadSuccess',
    BULK_DOWNLOAD_ERROR: 'bulkDownloadError',
    QUICK_ACTIONS: 'quickActions',
    DOCUMENT_DROPDOWN: 'documentDropdown',
  },
  INVITE_LINK: {
    COPY: 'copyInviteLink',
    REGENERATE: 'regenerateInviteLink',
    ACCESS: 'accessInviteLink',
    JOIN_SUCCESS: 'joinViaInviteLinkSuccessfully',
    JOIN_ERROR: 'joinViaInviteLinkError',
    DEACTIVATE: 'deactivateInviteLink',
    REGISTER: 'inviteLinkRegistered',
  },
  CLICK_MONETIZED_TOUCHPOINT: 'clickMonetizedTouchpoint',
  SIGN_REQUEST_UPGRADE: {
    ACCEPT: 'signRequestUpgradeAccepted',
    REJECT: 'signRequestUpgradeRejected',
  },
};

export const SUBSCRIPTION_CANCELED_REASON = {
  CANCELED_ON_UI: 'canceledOnUI',
};

export const SIGN_AUTH_METHOD = {
  GOOGLE: 'Google',
  DROPBOX: 'Dropbox',
  USERNAME: 'UsernamePassword',
};

export const ADD_USER_BULK_INVITE = {
  INVITE_WHEN_HITTING_THREE_DOC_LIMIT: 'Invite collaborators when hitting 3-doc-limit',
  INVITE_BY_CSV: 'Invite by CSV file',
};
