/// <reference path="./customConstant.d.ts" />

export const DOCUMENT_STORAGE = {
  google: 'Google Drive',
  dropbox: 'Dropbox',
  s3: 'Lumin Storage',
  oneDrive: 'One Drive',
};

export const maximumAvatarSize = {
  TEAM: 5 * 1024 * 1024,
  ORGANIZATION: 5 * 1024 * 1024,
  INDIVIDUAL: 5 * 1024 * 1024,
};

export const avatarSizeLimit = 5 * 1024 * 1024;

// seconds, must <= 3600
export const DURATION_TIME_RENEW_GOOGLE_ACCESS_TOKEN = 3500;

export const thumbnailSizeLimit = 2 * 1024 * 1024;

export const MIGRATION_DATE = '06/01/2019';

export const MAX_MOBILE_WIDTH = 600;
export const MAX_TABLET_WIDTH = 1024;
export const MAX_SMALL_DESKTOP_WIDTH = 1440;
export const SEARCH_DELAY_TIME = 1000;
export const SEARCH_PLACEHOLDER = {
  SEARCH_DOCUMENT: 'searchPlaceholder.documentName',
  SEARCH_NAME_OR_EMAIL: 'searchPlaceholder.nameOrEmail',
  SEARCH_EMAIL: 'searchPlaceholder.email',
};

export const LOGOUT_TIMEOUT = 2000;

export const TOAST_DURATION_ERROR_INVITE_MEMBER = 10000;

export const HELP_CENTER_URL = 'https://help.luminpdf.com';

export const CONTACT_SUPPORT_URL = 'https://www.luminpdf.com/contact-support/';

export const DRIVE_FOLDER_URL = 'https://drive.google.com/drive/folders/';

export const DROPBOX_FOLDER_URL = 'https://www.dropbox.com/home/';

export const UPLOAD_FILE_TYPE = {
  DOCUMENT: 'document',
  TEMPLATE: 'template',
};

export const UPLOAD_IMAGE_TYPES = {
  LOGO: 'logo',
  PHOTO: 'photo',
  THUMBNAIL: 'thumbnail',
};

export const CUSTOM_PROMPT_TYPE = {
  REDACTION: 'Redaction',
  CONTENT_EDIT: 'ContentEdit',
  DEFAULT: 'Default',
};

const DGROUP_DOMAIN = ['dgroup.co'];
const LUMIN_DOMAIN = ['luminpdf.com'];
const MERCHANTS_BANK_DOMAINS = ['mebanking.com', 'gofm.bank', 'lumin-sg.com', 'lumin-vn.com'];
const TESTING_DOMAIN = [...DGROUP_DOMAIN, ...LUMIN_DOMAIN];

export const DOMAIN_WHITE_LIST = {
  // eslint-disable-next-line sonarjs/no-duplicate-string
  SIGNATURE: TESTING_DOMAIN,
  ON_MY_DEVICE_TAB: [
    'YNbQUn3m',
    ...TESTING_DOMAIN,
    'bhrgHOsY',
    'wTwGQTsP',
    'T51sbmw0',
    '8pzXo2zl',
    'EmG9wmT1',
    'VEdoBCLm',
    'pFO9xBba',
    'cxTUJBu1',
    'IyGeKDGA',
    'PIcEJskl',
    'TskVXCxc',
    'Qq3yKoXO',
  ],
  FULL_VERSION_EDIT_PDF: ['unops.org', ...LUMIN_DOMAIN, ...MERCHANTS_BANK_DOMAINS],
  LIMIT_VERSION_EDIT_PDF: DGROUP_DOMAIN,
  DOCUMENT_SUMMARIZATION: ['ou.edu.vn', ...MERCHANTS_BANK_DOMAINS],
  AGREEMENT_WHATS_NEW_MODAL: ['aeis.com', ...MERCHANTS_BANK_DOMAINS],
};

// NOTE: please DO NOT change this array ordination.
export const STYLE_SUFFIX_FOR_FONT_FAMILY = ['BoldItalic', 'Bold', 'Italic'];

export const SHARE_TYPE = {
  PUBLIC: 'Public',
  ORGANIZATION: 'Organization',
  ORGANIZATION_TEAM: 'Organization Team',
  SPECIFIC_USER: 'Specific User',
  PRIVATE: 'Private',
};

export const USER_BLACK_LIST = {
  EDIT_PDF: ['steve@successstorymktg.com', 'thamdt+100@luminpdf.com', 'ditk+100@luminpdf.com'],
};

export const FILTERED_ERROR_MESSAGES = {
  NO_MATCHING_ANNOTATION_ERROR_MESSAGE: 'No matching annotation in appearance document.',
  CANNOT_FIND_ANNOTATION_ERROR_MESSAGE: 'Can not find any annotation',
  SCRIPT_ERROR: 'Script error.',
  ADS_LINKEDIN_ERROR: 'XHR error POST https://px.ads.linkedin.com/wa/',
  APPEARANCE_REFERENCE_ERROR_MESSAGE: 'Error in Promise.all for appearanceReference',
};

export const StepPercentage = {
  InitializeJob: 30,
  ProcessingFile: 80,
};

export const CONVERT_TO_ANOTHER_TYPE_PAGE_LIMIT = 200;
