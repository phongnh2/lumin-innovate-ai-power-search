import { STORAGE_TYPE } from 'constants/lumin-common';

export { quickActionCategories } from './quickActionCategories';

export enum RESTRICTION_TYPES {
  PLAN = 'plan',
  STORAGE = 'storage',
  DIGITAL_SIGNED = 'digitalSigned',
  OCR = 'ocr',
}

export const CHATBOT_TOOL_NAMES = {
  PRINT: 'print',
  REDACT: 'redact',
  DOWNLOAD: 'download',
  ADD_SHAPE: 'addShape',
  MOVE_PAGE: 'movePage',
  EDIT_TEXT: 'editText',
  HIGHLIGHT: 'highlight',
  ROTATE_PAGE: 'rotatePage',
  DELETE_PAGE: 'deletePage',
  TEXT_DECORATION: 'textDecoration',
  INSERT_BLANK_PAGE: 'insertBlankPage',
  GET_TEXT_COORDINATES: 'getTextCoordinates',
  SPLIT_EXTRACT: 'splitExtract',
  INSERT_OUTLINES: 'insertOutlines',
  GENERATE_OUTLINES: 'generateOutlines',
  MERGE_PAGE: 'merge',
  ADD_COMMENTS: 'addComments',
};

export const STORAGE_TOOL_RESTRICTIONS: Record<string, string[]> = {
  [STORAGE_TYPE.DROPBOX]: [CHATBOT_TOOL_NAMES.EDIT_TEXT, CHATBOT_TOOL_NAMES.REDACT],
  [STORAGE_TYPE.ONEDRIVE]: [CHATBOT_TOOL_NAMES.EDIT_TEXT, CHATBOT_TOOL_NAMES.REDACT],
};

export const RESPONSE_TYPE = {
  TOOL_INVOCATION: 'tool-invocation',
  TEXT: 'text',
};

export const SPLIT_EXTRACT_TYPE = {
  EQUAL: 'equal',
  CUSTOM: 'custom',
  ERROR: 'error',
};

export const OCR_LINK = 'https://www.luminpdf.com/blog/what-is-optical-character-recognition-ocr/';

export const TOOL_APPLY_OCR = [
  CHATBOT_TOOL_NAMES.HIGHLIGHT,
  CHATBOT_TOOL_NAMES.TEXT_DECORATION,
  CHATBOT_TOOL_NAMES.REDACT,
];

export const CHATBOT_AUTO_COMMANDS = {
  SUMMARIZE: 'summarize',
  ASK_ABOUT_DOCUMENT: 'askAboutDocument',
  REDACT_SENSITIVE_INFO: 'redactSensitiveInfo',
};

export const MESSAGE_FOR_FULL_OCR_DOCUMENT = `Please response user with this message: 'This appears to be a scanned document. Editing scanned files isn’t supported yet. If you believe this is an error, please let us know'`;

export const MERGE_PAGE_POSITION = {
  FIRST: 'before current document',
  LAST: 'after current document',
};

export const CHATBOT_MESSAGE_STREAM_PARTS = {
  START_STEP: 'start_step',
  TOOL_CALL: 'tool_call',
  TEXT: 'text',
  SOURCE: 'source',
  FINISH_MESSAGE: 'finish_message',
  ERROR: 'error',
} as const;

export const CHATBOT_SOURCE_PARTS = {
  REFERENCE_URLS: 'referenceUrls',
  SOURCE_METADATA: 'source_metadata',
} as const;

export const AGENT_MODE_MAX_DOCUMENT_SIZE_MB = 20;

export const ASK_MODE_MAX_DOCUMENT_SIZE_MB = 50;

export const AGENT_MODE_MAX_DOCUMENT_SIZE_BYTES = AGENT_MODE_MAX_DOCUMENT_SIZE_MB * 1024 * 1024;

export const ASK_MODE_MAX_DOCUMENT_SIZE_BYTES = ASK_MODE_MAX_DOCUMENT_SIZE_MB * 1024 * 1024;

export const AGENT_MODE_MAX_PAGE_COUNT = 40;

export const ASK_MODE_MAX_PAGE_COUNT = 1000;

export const CANNY_URL_FEEDBACK_CHATBOT = 'https://luminpdf.canny.io/feedback-insights?selectedCategory=editor-chatbot';

export const OUTLINE_MARKER = '{outline-list}';
export const OUTLINE_MARKER_TEXT = `Outlines ${OUTLINE_MARKER}`;
export const OUTLINE_MARKER_WITH_PREFIX = `### ${OUTLINE_MARKER_TEXT}`;
