export const DocumentAction = {
  EXPORT: 'export',
  PRINT: 'print',
  COPY: 'copy',
} as const;

export const SHARE_DOCUMENT_ACTION_LIST = [DocumentAction.EXPORT, DocumentAction.PRINT, DocumentAction.COPY];
