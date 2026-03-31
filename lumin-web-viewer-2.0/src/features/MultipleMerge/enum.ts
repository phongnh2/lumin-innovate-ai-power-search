export const MultipleMergeStep = {
  SELECT_DOCUMENTS: 'selectDocuments',
  MERGING_DOCUMENTS: 'mergingDocuments',
  SAVE_DOCUMENT: 'saveDocument',
} as const;

export type MultipleMergeStepType = typeof MultipleMergeStep[keyof typeof MultipleMergeStep];

export const SaveDestination = {
  COMPUTER: 'computer',
  LUMIN: 'lumin',
  GOOGLE_DRIVE: 'googleDrive',
} as const;

export type SaveDestinationType = typeof SaveDestination[keyof typeof SaveDestination];

export const UploadStatus = {
  UPLOADING: 'uploading',
  UPLOADED: 'uploaded',
  FAILED: 'failed',
} as const;

export type UploadStatusType = typeof UploadStatus[keyof typeof UploadStatus];

export const SaveDocumentFormat = {
  PDF: 'pdf',
} as const;

export type SaveDocumentFormatType = typeof UploadStatus[keyof typeof UploadStatus];

export const UploadDocumentError = {
  FAILED_TO_UPLOAD: 'failed-to-upload',
  FILE_INVALID_TYPE: 'file-invalid-type',
  FILE_ENCRYPTED: 'file-encrypted',
  DOCUMENT_PERMISSION_DENIED: 'document-permission-denied',
} as const;

export type UploadDocumentErrorType = typeof UploadDocumentError[keyof typeof UploadDocumentError];

export const FileSource = {
  LOCAL: 'local',
  GOOGLE: 'google',
  LUMIN: 'lumin',
};

export type FileSourceType = typeof FileSource[keyof typeof FileSource];
