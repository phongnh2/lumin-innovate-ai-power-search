export const ATTACHED_FILES_STATUS = {
  FAILED: 'failed',
  UPLOADING: 'uploading',
  UPLOADED: 'uploaded',
  SENT: 'sent',
  MERGED: 'merged',
} as const;

export const ATTACHED_FILES_SOURCE = {
  LOCAL: 'local',
  GOOGLE: 'google',
} as const;

export const SAVE_ATTACHED_FILES_METADATA_STATUS = {
  SUCCEED: 'SUCCEED',
  FAILED: 'FAILED',
};
