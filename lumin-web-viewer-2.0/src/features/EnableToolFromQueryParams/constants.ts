export const ToolCategory = {
  TOOL: 'tool',
  PAGE_TOOL: 'pageTool',
  TAB: 'tab',
  DOWNLOAD_MODAL: 'downloadModal',
  SECURITY: 'security',
} as const;

export const PdfAction = {
  ANNOTATE: 'annotate',
  MERGE: 'merge',
  READ: 'read',
  UPLOAD: 'upload',
  UNLOCK: 'unlock',
  CONVERT_TO_PDF: 'convert-to-pdf',
  COMPRESS: 'compress',
  DELETE_PAGE: 'delete-page',
  CROP_PAGE: 'crop-page',
  POPULAR_TAB: 'popular-tab',
  ANNOTATE_TAB: 'annotate-tab',
  FILL_SIGN_TAB: 'fill-sign-tab',
  SECURITY_TAB: 'security-tab',
  PAGE_TOOLS: 'page-tools',
  DOWNLOAD_FILE: 'download-file',
  EDIT_TEXT: 'edit-text',
  JPG_TO_PDF: 'jpg-to-pdf',
  FORM_BUILD: 'fillable',
  SUMMARIZATION: 'summarize',
  SPLIT_PDF: 'split',
  OCR: 'ocr',

  EXCEL_TO_PDF: 'excel-to-pdf',
  WORD_TO_PDF: 'word-to-pdf',
  POWERPOINT_TO_PDF: 'ppt-to-pdf',
  PNG_TO_PDF: 'png-to-pdf',

  PDF_TO_JPG: 'pdf-to-jpg',
  PDF_TO_PNG: 'pdf-to-png',
  PDF_TO_WORD: 'pdf-to-word',
  PDF_TO_EXCEL: 'pdf-to-excel',
  PDF_TO_POWERPOINT: 'pdf-to-ppt',

  PROTECT_PDF: 'protect',
  REDACT_PDF: 'redact',
  FLATTEN_PDF: 'flatten',
  EXTRACT_PDF: 'extract',
  CHAT_PDF: 'chat',
  ROTATE_PDF: 'rotate-page',
} as const;

export type PdfActionType = typeof PdfAction[keyof typeof PdfAction];

export const ExploredFeatures = {
  FORM_BUILDER: 'formBuilder',
  OCR: 'ocr',
  SPLIT_PDF: 'splitPdf',
  SUMMARIZATION: 'summarization',
  EDIT_PDF: 'editPdf',
  PROTECT_PDF: 'protectPdf',
  REDACT_PDF: 'redactPdf',
  MERGE: 'merge',
} as const;

export type ExploredFeaturesType = typeof ExploredFeatures[keyof typeof ExploredFeatures];

export const mapExploredFeatureToToolName = new Map<PdfActionType, ExploredFeaturesType>([
  [PdfAction.FORM_BUILD, ExploredFeatures.FORM_BUILDER],
  [PdfAction.OCR, ExploredFeatures.OCR],
  [PdfAction.SPLIT_PDF, ExploredFeatures.SPLIT_PDF],
  [PdfAction.SUMMARIZATION, ExploredFeatures.SUMMARIZATION],
  [PdfAction.EDIT_TEXT, ExploredFeatures.EDIT_PDF],
  [PdfAction.PROTECT_PDF, ExploredFeatures.PROTECT_PDF],
  [PdfAction.REDACT_PDF, ExploredFeatures.REDACT_PDF],
]);

export const FEATURE_EXPLORATION_LIMIT_PER_USER = {
  [ExploredFeatures.FORM_BUILDER]: 1,
  [ExploredFeatures.SUMMARIZATION]: 3,
  [ExploredFeatures.OCR]: 1,
  [ExploredFeatures.SPLIT_PDF]: 1,
  [ExploredFeatures.EDIT_PDF]: 1,
  [ExploredFeatures.PROTECT_PDF]: 1,
  [ExploredFeatures.REDACT_PDF]: 1,
} as const;

export const FEATURE_PREMIUM_LIMIT_FOR_GUEST_MODE_FROM_FLP = {
  [ExploredFeatures.EDIT_PDF]: 1,
  [ExploredFeatures.PROTECT_PDF]: 1,
  [ExploredFeatures.MERGE]: 1,
} as const;
