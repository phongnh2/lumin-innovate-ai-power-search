const SOCKET_NAMESPACE = {
  ORG_ROOM: 'org-room',
  USER_ROOM: 'user-room',
  OCR_ROOM: 'ocr',
  CONVERSION_ROOM: 'conversion',
};

const SOCKET_MESSAGE = {
  DELETE_ORGANIZATION: 'deleteOrganization',
  ORG_PAYMENT_UPDATED: 'orgPaymentUpdated',
  BULK_UPDATE_DOCUMENT_MEMBER_LIST: 'bulkUpdateDocumentMemberList',
  USER_LOGOUT: 'userLogout',
  AG_LOGOUT_NOTIFY: 'agLogoutNotify',
  ADMIN_DELETE_USER: 'adminDeleteUser',
  COMPLETED_DELETE_USER: 'completedDeleteUser',
  REACTIVE_USER_ACCOUNT: 'reactiveUserAccount',
  ENABLE_GOOGLE_SIGN_IN_SUCCESS: 'enableGoogleSignInSuccess',
  INVALID_IP_ADDRESS: 'invalidIpAddress',
  TOKEN_EXPIRED: 'tokenExpired',
  FORCE_RELOAD: 'forceReload',
  USER_EMAIL_CHANGED: 'userEmailChanged',
  OUTLINES_UPDATED: 'outlinesUpdated',
  SUMMARIZATION_COMPLETED: 'summarizationCompleted',
  FORM_FIELD_DETECTION_COMPLETED: 'formFieldDetectionCompleted',
  REMOVE_USER_SIGNATURE: 'removeUserSignature',
  COMPRESS_PDF_COMPLETED: 'compressPdfCompleted',
  SLACK_OAUTH_FLOW_COMPLETED: 'slackOauthFlowCompleted',
  GOOGLE_SYNC: 'googleSync',
  UPDATED_TEXT_CONTENT: 'updatedTextContent',
  PROMPT_TO_JOIN_TRIALING_ORG: 'promptToJoinTrialingOrg',
  UPDATE_DOCUMENT_ACTION_PERMISSION_SETTINGS: 'updateDocumentActionPermissionSettings',
  NOTIFY_XERO_APP: 'notifyXeroApp',
};

const SOCKET_ON = {
  JOIN_TO_ORG_ROOM: 'joinToOrgRoom',
};

const SOCKET_EMIT_TYPE = {
  UPDATED_PERMISSION: 'UPDATED_PERMISSION',
  DELETE: 'DELETE',
};

enum PageManipulation {
  RotatePage = 'ROTATE_PAGE',
  RemovePage = 'REMOVE_PAGE',
  MovePage = 'MOVE_PAGE',
  InsertBlankPage = 'INSERT_BLANK_PAGE',
  CropPage = 'CROP_PAGE',
  MergePage = 'MERGE_PAGE',
  SplitPage = 'SPLIT_PAGE',
}

enum FormFieldChangedSource {
  MANIPULATION = 'manipulation',
}

export {
  SOCKET_NAMESPACE,
  SOCKET_MESSAGE,
  SOCKET_ON,
  SOCKET_EMIT_TYPE,
  PageManipulation,
  FormFieldChangedSource,
};
