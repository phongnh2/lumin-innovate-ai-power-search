interface IDOMAIN_WHITE_LIST {
  LIMIT_VERSION_EDIT_PDF: string[];
  FULL_VERSION_EDIT_PDF: string[];
  ON_MY_DEVICE_TAB: string[];
  DOCUMENT_SUMMARIZATION: string[];
  AGREEMENT_WHATS_NEW_MODAL: string[];
}

interface ICUSTOM_PROMPT_TYPE {
  REDACTION: string;
  CONTENT_EDIT: string;
  DEFAULT: string;
}

interface ISHARE_TYPE {
  PUBLIC: string;
  ORGANIZATION: string;
  ORGANIZATION_TEAM: string;
  SPECIFIC_USER: string;
  PRIVATE: string;
}

export const SHARE_TYPE: ISHARE_TYPE;

export const MIGRATION_DATE: string;

export const DOMAIN_WHITE_LIST: IDOMAIN_WHITE_LIST;

export const CUSTOM_PROMPT_TYPE: ICUSTOM_PROMPT_TYPE;

export const DRIVE_FOLDER_URL: string;

export const DROPBOX_FOLDER_URL: string;

export const CONVERT_TO_ANOTHER_TYPE_PAGE_LIMIT: number;

export const StepPercentage: {
  InitializeJob: number;
  ProcessingFile: number;
};

export const FILTERED_ERROR_MESSAGES: {
  NO_MATCHING_ANNOTATION_ERROR_MESSAGE: string;
  CANNOT_FIND_ANNOTATION_ERROR_MESSAGE: string;
  SCRIPT_ERROR: string;
  ADS_LINKEDIN_ERROR: string;
};

export const TOAST_DURATION_ERROR_INVITE_MEMBER: number;

export const UPLOAD_FILE_TYPE: {
  DOCUMENT: string;
  TEMPLATE: string;
};

export const HELP_CENTER_URL: string;

export const CONTACT_SUPPORT_URL: string;

export const SEARCH_PLACEHOLDER: {
  SEARCH_DOCUMENT: string;
  SEARCH_NAME_OR_EMAIL: string;
  SEARCH_EMAIL: string;
};

export const SEARCH_DELAY_TIME: number;

export const maximumAvatarSize: {
  TEAM: number;
  ORGANIZATION: number;
  INDIVIDUAL: number;
};
