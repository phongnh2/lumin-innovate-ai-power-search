/* eslint-disable max-classes-per-file */
import { HttpStatusCode } from 'axios';

import timeTracking from 'screens/Viewer/time-tracking';

import documentServices from 'services/documentServices';

import logger from 'helpers/logger';

import SessionUtils from 'utils/session';

import annotationLoadObserver, { AnnotationEvent } from 'features/Annotation/utils/annotationLoadObserver';

import { AUTHORIZATION_HEADER } from 'constants/authConstant';
import { LOGGER } from 'constants/lumin-common';
import { GET_ANNOTATIONS } from 'constants/timeTracking';
import { EDITOR_BACKEND_BASE_URL } from 'constants/urls';

import {
  ProgressInfo,
  StreamConnectionConfig,
  AnnotationFetchResult,
  StreamChunkType,
  BaseChunk,
  ProgressChunk,
  BatchChunk,
  StreamChunk,
  ErrorChunk,
  CompleteChunk,
} from 'interfaces/annotation/annotation-stream.interface';
import { IAnnotation } from 'interfaces/document/document.interface';

const STREAM_CONFIG = {
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000,
  RETRYABLE_ERROR_MESSAGES: [
    'connection limit reached',
    'max connection',
    'too many connections',
    'service unavailable',
  ],
} as const;

class RetriableError extends Error {}

class FatalError extends Error {}

class ConnectionState {
  private readonly annotations: IAnnotation[] = [];

  private readonly resolve: (annotations: IAnnotation[]) => void;

  private readonly reject: (error: Error) => void;

  private readonly onMessage?: (annotations: IAnnotation[]) => void;

  private readonly onProgress?: (progress: ProgressInfo) => void;

  private readonly onComplete?: (data: CompleteChunk) => void;

  private hasCompleted = false;

  constructor({
    resolve,
    reject,
    onMessage,
    onProgress,
    onComplete,
  }: {
    resolve: (annotations: IAnnotation[]) => void;
    reject: (error: Error) => void;
    onMessage?: (annotations: IAnnotation[]) => void;
    onProgress?: (progress: ProgressInfo) => void;
    onComplete?: (data: CompleteChunk) => void;
  }) {
    this.resolve = resolve;
    this.reject = reject;
    this.onMessage = onMessage;
    this.onProgress = onProgress;
    this.onComplete = onComplete;
  }

  addAnnotations(newAnnotations: IAnnotation[]): void {
    this.annotations.push(...newAnnotations);
    this.onMessage?.(newAnnotations);
  }

  updateProgress(progress: ProgressInfo): void {
    this.onProgress?.(progress);
  }

  complete(data: CompleteChunk): void {
    if (this.hasCompleted) {
      return;
    }

    this.hasCompleted = true;
    this.onComplete?.(data);
    annotationLoadObserver.notify(AnnotationEvent.ExternalAnnotLoaded);
    this.resolve(this.annotations);
  }

  fail(error: Error): void {
    if (this.hasCompleted) {
      return;
    }

    this.hasCompleted = true;
    this.reject(error);
  }
}

class StreamConnectionManager {
  private retryCount = 0;

  async connect(config: StreamConnectionConfig): Promise<IAnnotation[]> {
    this.retryCount = 0;
    return new Promise<IAnnotation[]>((resolve, reject) => {
      const state = new ConnectionState({
        resolve,
        reject,
        onMessage: config.onMessage,
        onProgress: config.onProgress,
        onComplete: config.onComplete,
      });

      this.establishConnection(config, state).catch((error) => {
        state.fail(error as Error);
      });
    });
  }

  private async establishConnection(config: StreamConnectionConfig, state: ConnectionState): Promise<void> {
    try {
      const { documentId, signal } = config;
      const url = `${EDITOR_BACKEND_BASE_URL}/v2/annotation/${documentId}/stream`;
      const token = await SessionUtils.getAuthorizedToken();

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          [AUTHORIZATION_HEADER]: `Bearer ${token}`,
          Accept: 'application/json',
        },
        signal,
      });

      if (!response.ok) {
        StreamConnectionManager.handleHttpError(response);
        return;
      }

      if (!response.body) {
        throw new Error('Response body is null');
      }

      await StreamConnectionManager.processStream(response.body, state);
    } catch (error) {
      this.handleError(error as Error, state, config);
    }
  }

  private static handleHttpError(response: Response): void {
    if ([HttpStatusCode.TooManyRequests, HttpStatusCode.ServiceUnavailable].includes(response.status)) {
      throw new RetriableError(response.statusText);
    }
    throw new FatalError(`HTTP ${response.status}: ${response.statusText}`);
  }

  private static async processStream(body: ReadableStream<Uint8Array>, state: ConnectionState): Promise<void> {
    const reader = body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    const readChunk = async (): Promise<void> => {
      const result = await reader.read();

      if (!result.done && result.value) {
        buffer += decoder.decode(result.value, { stream: true });
        buffer = StreamConnectionManager.processBuffer(buffer, state);
        return readChunk();
      }

      return Promise.resolve();
    };

    try {
      await readChunk();

      if (buffer.trim()) {
        StreamConnectionManager.processBuffer(`${buffer}\n`, state);
      }
    } finally {
      reader.releaseLock();
    }
  }

  private static processBuffer(buffer: string, state: ConnectionState): string {
    const lines = buffer.split('\n');
    const remaining = lines.pop() || '';

    lines.forEach((line) => {
      const trimmedLine = line.trim();
      if (trimmedLine) {
        StreamConnectionManager.processChunk(trimmedLine, state);
      }
    });

    return remaining;
  }

  private static processChunk(chunk: string, state: ConnectionState): void {
    try {
      const data = JSON.parse(chunk) as StreamChunk;
      StreamConnectionManager.processJSONChunk(data, state);
    } catch (error: unknown) {
      logger.logError({
        message: 'Failed to parse annotation chunk',
        reason: LOGGER.Service.GET_ANNOTATIONS_ERROR,
        error,
      });
      throw error;
    }
  }

  private static processJSONChunk(data: StreamChunk, state: ConnectionState): void {
    switch (data.type) {
      case StreamChunkType.PROGRESS:
        StreamConnectionManager.handleProgressChunk(data, state);
        break;
      case StreamChunkType.BATCH:
        StreamConnectionManager.handleBatchChunk(data, state);
        break;
      case StreamChunkType.METADATA:
        // Handle if needed
        break;
      case StreamChunkType.COMPLETE:
        StreamConnectionManager.handleCompleteChunk(data, state);
        break;
      case StreamChunkType.ERROR:
        StreamConnectionManager.handleErrorChunk(data, state);
        break;
      default:
        throw new FatalError(`Unknown chunk type received: ${String((data as BaseChunk).type)}`);
    }
  }

  private static handleCompleteChunk(data: CompleteChunk, state: ConnectionState): void {
    state.complete(data);
  }

  private static handleErrorChunk(data: ErrorChunk, state: ConnectionState): void {
    state.fail(new FatalError(data.error));
  }

  private static handleProgressChunk(data: ProgressChunk, state: ConnectionState): void {
    state.updateProgress({
      totalSent: data.totalSent,
      batchNumber: data.batchNumber,
      timestamp: data.timestamp,
    });
  }

  private static handleBatchChunk(data: BatchChunk, state: ConnectionState): void {
    if (data.error) {
      throw new FatalError(data.error);
    }

    if (data.annotations && Array.isArray(data.annotations)) {
      StreamConnectionManager.updateAnnotationStore(data.annotations);
      state.addAnnotations(data.annotations);
    }
  }

  private static updateAnnotationStore(annotations: IAnnotation[]): void {
    const currentAnnotations = annotationLoadObserver.getAnnotations();
    annotationLoadObserver.setAnnotations([...currentAnnotations, ...annotations]);
  }

  private handleError = (error: Error, state: ConnectionState, config: StreamConnectionConfig): void => {
    if (error.name === 'AbortError') {
      return;
    }

    if (error instanceof FatalError) {
      state.fail(error);
      return;
    }

    if (this.shouldRetry(error)) {
      this.scheduleRetry(config, state);
      return;
    }

    state.fail(error);
  };

  private shouldRetry(error: Error): boolean {
    return this.retryCount < STREAM_CONFIG.MAX_RETRIES && StreamConnectionManager.isRetryableError(error);
  }

  private static isRetryableError(error: Error): boolean {
    const errorMessage = error.message.toLowerCase();
    return STREAM_CONFIG.RETRYABLE_ERROR_MESSAGES.some((msg) => errorMessage.includes(msg));
  }

  private scheduleRetry(config: StreamConnectionConfig, state: ConnectionState): void {
    setTimeout(() => {
      this.retryCount++;
      this.establishConnection(config, state).catch((error) => {
        state.fail(error as Error);
      });
    }, STREAM_CONFIG.RETRY_DELAY * this.retryCount);
  }

  reset(): void {
    this.retryCount = 0;
  }
}

class LegacyAnnotationFetcher {
  static async fetch(documentId: string, signal?: AbortSignal): Promise<IAnnotation[]> {
    const fetchOptions = signal ? { signal } : {};

    return documentServices.getAnnotations({
      documentId,
      fetchOptions,
    });
  }
}

class AnnotationStreamService {
  private connectionManager = new StreamConnectionManager();

  async fetchAnnotations(config: StreamConnectionConfig): Promise<AnnotationFetchResult> {
    const { documentId, onError, onComplete, signal } = config;

    timeTracking.register(GET_ANNOTATIONS);

    try {
      const annotations = await this.connectionManager.connect(config);
      return { annotations, isFromStream: true };
    } catch (streamError) {
      AnnotationStreamService.logStreamError(streamError, documentId);
      onError?.(streamError as Error);

      return await AnnotationStreamService.attemptFallback(documentId, signal, onError, onComplete);
    } finally {
      timeTracking.finishTracking(GET_ANNOTATIONS);
    }
  }

  private static logStreamError(error: unknown, documentId: string): void {
    logger.logError({
      message: 'Stream connection failed, falling back to legacy fetch',
      reason: LOGGER.Service.GET_ANNOTATIONS_ERROR,
      error,
      attributes: { documentId },
    });
  }

  private static async attemptFallback(
    documentId: string,
    signal?: AbortSignal,
    onError?: (error: Error) => void,
    onComplete?: () => void
  ): Promise<AnnotationFetchResult> {
    try {
      const annotations = await LegacyAnnotationFetcher.fetch(documentId, signal);
      onComplete?.();
      return { annotations, isFromStream: false };
    } catch (legacyError) {
      const error = legacyError instanceof Error ? legacyError : new Error('Failed to fetch annotations');

      onError?.(error);
      return { annotations: [], isFromStream: false, error };
    }
  }

  reset(): void {
    this.connectionManager.reset();
  }
}

export const annotationStreamService = new AnnotationStreamService();
