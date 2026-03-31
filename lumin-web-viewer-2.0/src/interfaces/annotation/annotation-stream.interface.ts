import { IAnnotation } from 'interfaces/document/document.interface';

export interface ProgressInfo {
  totalSent: number;
  batchNumber: number;
  timestamp: string;
}

export interface StreamConnectionConfig {
  documentId: string;
  onMessage?: (annotations: IAnnotation[]) => void;
  onProgress?: (progress: ProgressInfo) => void;
  onError?: (error: Error) => void;
  onComplete?: () => void;
  signal?: AbortSignal;
}

export interface AnnotationFetchResult {
  annotations: IAnnotation[];
  isFromStream: boolean;
  error?: Error;
}

export enum StreamChunkType {
  PROGRESS = 'progress',
  BATCH = 'batch',
  METADATA = 'metadata',
  COMPLETE = 'complete',
  ERROR = 'error',
}

export interface BaseChunk {
  type: string;
  timestamp?: string;
}

export interface ProgressChunk extends BaseChunk {
  type: StreamChunkType.PROGRESS;
  totalSent: number;
  batchNumber: number;
  timestamp: string;
}

export interface BatchChunk extends BaseChunk {
  type: StreamChunkType.BATCH;
  annotations?: IAnnotation[];
  batchNumber?: number;
  error?: string;
}

export interface MetadataChunk extends BaseChunk {
  type: StreamChunkType.METADATA;
  [key: string]: unknown;
}

export interface CompleteChunk extends BaseChunk {
  type: StreamChunkType.COMPLETE;
  totalSent: number;
  batchCount: number;
  completed: string;
  documentId: string;
}

export interface ErrorChunk extends BaseChunk {
  type: StreamChunkType.ERROR;
  error: string;
  timestamp: string;
}

export type StreamChunk = ProgressChunk | BatchChunk | MetadataChunk | CompleteChunk | ErrorChunk;
