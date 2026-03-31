import { DocumentIndexingStatusEnum } from 'Document/document.enum';

import { DocumentIndexingTypeEnum } from '../enums/documentIndexingBacklog.enum';

export const DOCUMENT_INDEXING_FREE_ORG_DOCUMENT_LIMIT = 10;

export const UNPROCESSED_DOCUMENT_CONDITIONS = {
  $or: [
    { 'metadata.indexingStatus': DocumentIndexingStatusEnum.PENDING },
    { 'metadata.indexingStatus': { $exists: false } },
    { metadata: { $exists: false } },
  ],
};

export const DOCUMENT_INDEXING_PREPARATION_CONTEXT = 'DOCUMENT_INDEXING_PREPARATION';

export class IndexingBacklogScoreConstants {
  // Time-based scoring constants (in minutes)
  static readonly RECENT_ACCESS_THRESHOLD_MINUTES = 5;

  static readonly DAILY_ACCESS_THRESHOLD_MINUTES = 24 * 60;

  static readonly WEEKLY_ACCESS_THRESHOLD_MINUTES = 7 * 24 * 60;

  // Score values
  static readonly MAX_SCORE = 10;

  static readonly HIGH_SCORE = 8;

  static readonly MEDIUM_SCORE = 5;

  static readonly MIN_SCORE = 1;

  // File size thresholds (in MB)
  static readonly SMALL_FILE_SIZE_MB = 5;

  static readonly MEDIUM_FILE_SIZE_MB = 20;

  static readonly LARGE_FILE_SIZE_MB = 35;

  // Queue length scoring
  static readonly QUEUE_DECAY_RATE = 0.0009;

  // Priority calculation weights
  static readonly QUEUE_LENGTH_WEIGHT = 4;

  static readonly LAST_ACCESS_WEIGHT = 3;

  static readonly SUBSCRIPTION_WEIGHT = 2;

  static readonly FILE_SIZE_WEIGHT = 1;

  // Bytes to MB conversion
  static readonly BYTES_TO_MB_DIVISOR = 1024 * 1024;
}

export const DocumentIndexingMessagePriority = {
  [DocumentIndexingTypeEnum.NEW_DOCUMENT]: 10,
  [DocumentIndexingTypeEnum.UPLOADED_GOOGLE_DOCUMENT]: 9,
  [DocumentIndexingTypeEnum.UPDATED_DOCUMENT]: 8,
  [DocumentIndexingTypeEnum.UPLOADED_DOCUMENT]: 5,
};
