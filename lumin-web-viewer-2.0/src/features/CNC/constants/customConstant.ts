export const CNC_LOCAL_STORAGE_KEY = {
  DRIVE_COLLABORATORS_NOT_IN_CIRCLE: 'drive-collaborators-not-in-circle',
  DRIVE_USERS_CAN_INVITE_TO_WORKSPACE: 'drive-users-can-invite-to-workspace',
  PROMPT_TO_DOWNLOAD_APP_CYCLE: 'prompt_to_download_app_cycle',
  PROMPT_TO_DOWNLOAD_EXTENSION_CYCLE: 'prompt_to_download_extension_cycle',
};

export const LIMIT_INVITE_USER_COLLABORATOR = 30;

export const DiscardModal = {
  UNSAVED_CHANGES: 'unsavedChanges',
  INVITATION: 'invitation',
} as const;

export const CNC_SESSION_STORAGE_KEY = {
  HAS_SHOW_INVITE_COLLABORATORS_MODAL: 'has-show-invite-collaborators-modal',
} as const;

export const HOTJAR_PERCENTAGE_RECORDING = 0.5;

export const PROMPTS_TO_DOWNLOAD_APP_ORDER = ['hasViewedDownloadAppPage', 'hasDownloadedApp', 'hasOpenApp'] as const;

export const PROMPTS_TO_DOWNLOAD_EXTENSION_ORDER = [
  'hasViewedDownloadExtensionPage',
  'hasDownloadedExtension',
  'hasOpenExtension',
] as const;

export const NUMBER_INVITE_TO_SHOWN_CUSTOMER_SUPPORT_MODAL = 5;

export const PRODUCTS = {
  LUMIN_PDF: 'luminPdf',
  LUMIN_SIGN: 'luminSign',
  AGREEMENT_GEN: 'agreementGen',
  DOCUMENTS: 'documents',
} as const;

export const MINIMUM_HEIGHT_TO_VIEW_LARGE_MODALS = 648;

export const LOWER_BOUNDARY_PROMOTED_WORKSPACE = 2;
export const UPPER_BOUNDARY_PROMOTED_WORKSPACE = 20;

export const MAX_DOCUMENTS_BEFORE_COLLAPSE = 3;

export const PROMPT_TO_UPLOAD_LOGO_TYPE = {
  CREATE_ORG: 'createOrg',
  ORGANIZATION_SETTINGS: 'organizationSettings',
} as const;
