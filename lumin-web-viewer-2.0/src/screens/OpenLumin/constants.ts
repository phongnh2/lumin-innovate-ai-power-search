export const PLATFORM = {
  ELECTRON: 'electron',
  PWA: 'pwa',
} as const;

export type PlatformType = typeof PLATFORM[keyof typeof PLATFORM];

export const ERROR_MESSAGES = {
  FILE_OPEN_ERROR: 'Failed to open the selected file. Please try again.',
  FILE_OPEN_TITLE: 'File Open Error',
  UNSUPPORTED_FILE_TYPE: 'Unsupported file type',
  FAILED_TO_OPEN_FILE: 'Failed to open file',
  FAILED_TO_PARSE_FILE_PATHS: 'Failed to parse file paths from URL',
  ERROR_PROCESSING_PWA_FILE: 'Error processing PWA file',
} as const;

export const URL_PARAMS = {
  FILES: 'files',
} as const;
