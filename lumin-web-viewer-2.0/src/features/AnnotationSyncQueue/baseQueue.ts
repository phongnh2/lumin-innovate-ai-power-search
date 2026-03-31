/* eslint-disable class-methods-use-this */
import { t } from 'i18next';
import { AnyAction } from 'redux';

import { enqueueSnackbar } from '@libs/snackbar';

import actions from 'actions';
import selectors from 'selectors';
import { store } from 'store';

import { isDisconnected } from 'hooks/useSocketStatus';

import documentServices from 'services/documentServices';
import { documentSyncQueue } from 'services/documentSyncQueue';

import dateUtil from 'utils/date';

import { useCollaborationStore } from 'features/Collaboration/slices';

import { CUSTOM_EVENT } from 'constants/customEvent';
import { AnnotationSubjectMapping } from 'constants/documentConstants';
import { SOCKET_EMIT } from 'constants/socketConstant';

import { IAnnotation } from 'interfaces/document/document.interface';

export interface IAnnotationQueueItem {
  annotation: IAnnotation;
  documentId: string;
  timestamp: number;
  retryCount: number;
}

export interface IFormFieldData {
  xfdf: string;
  userId?: string;
  email?: string;
  [key: string]: unknown;
}

export interface IAnnotationSyncQueueOptions {
  maxQueueSize?: number;
  maxRetries?: number;
  enableBatching?: boolean;
  batchSize?: number;
  batchTimeoutMs?: number;
}

export class AnnotationSyncQueue {
  private queue: Map<string, IAnnotationQueueItem[]>;

  private processingDocuments: Set<string>;

  private maxQueueSize: number;

  private maxRetries: number;

  private enableBatching: boolean;

  private batchSize: number;

  private batchTimeoutMs: number;

  private batchTimeouts: Map<string, NodeJS.Timeout>;

  private isProcessing: boolean;

  constructor(options: IAnnotationSyncQueueOptions = {}) {
    this.queue = new Map();
    this.processingDocuments = new Set();
    this.batchTimeouts = new Map();
    this.isProcessing = false;

    this.maxQueueSize = options.maxQueueSize ?? 1000;
    this.maxRetries = options.maxRetries ?? 3;
    this.enableBatching = options.enableBatching ?? true;
    this.batchSize = options.batchSize ?? 10;
    this.batchTimeoutMs = options.batchTimeoutMs ?? 500;

    this.setupDocumentSyncListeners();
  }

  private isDocumentSyncing(documentId: string): boolean {
    const syncStatus = documentSyncQueue.getDocumentSyncStatus(documentId);
    const { status } = useCollaborationStore.getState().socketState;
    return syncStatus.isCurrentlySync || syncStatus.isProcessing || isDisconnected(status);
  }

  async addAnnotation(documentId: string, annotation: IAnnotation): Promise<void> {
    if (this.isDocumentSyncing(documentId)) {
      this.queueAnnotation(documentId, annotation);
    } else {
      await this.emitAnnotation(documentId, annotation);
    }
  }

  async addAnnotations(documentId: string, annotations: IAnnotation[]): Promise<void> {
    if (this.isDocumentSyncing(documentId)) {
      annotations.forEach((annotation) => this.queueAnnotation(documentId, annotation));
    } else {
      await this.emitAnnotations(documentId, annotations);
    }
  }

  private queueAnnotation(documentId: string, annotation: IAnnotation): void {
    if (!this.queue.has(documentId)) {
      this.queue.set(documentId, []);
    }

    const documentQueue = this.queue.get(documentId) ?? [];

    if (documentQueue.length >= this.maxQueueSize) {
      enqueueSnackbar({
        message: t('viewer.annotationSync.queueFull') as React.ReactNode,
        variant: 'warning',
      });
      return;
    }

    const queueItem: IAnnotationQueueItem = {
      annotation,
      documentId,
      timestamp: Date.now(),
      retryCount: 0,
    };

    documentQueue.push(queueItem);

    if (this.enableBatching) {
      this.scheduleBatchProcessing(documentId);
    }
  }

  private scheduleBatchProcessing(documentId: string): void {
    const existingTimeout = this.batchTimeouts.get(documentId);
    if (existingTimeout) {
      clearTimeout(existingTimeout);
    }

    const timeout = setTimeout(() => {
      this.processBatchForDocument(documentId).catch(() => {
        /* Handle later */
      });
    }, this.batchTimeoutMs);

    this.batchTimeouts.set(documentId, timeout);
  }

  private async processBatchForDocument(documentId: string): Promise<void> {
    const documentQueue = this.queue.get(documentId);
    if (!documentQueue?.length) {
      return;
    }

    if (this.isDocumentSyncing(documentId)) {
      this.scheduleBatchProcessing(documentId);
      return;
    }

    const batchSize = Math.min(this.batchSize, documentQueue.length);
    const batch = documentQueue.splice(0, batchSize);
    const annotations = batch.map((item) => item.annotation);

    try {
      await this.emitAnnotations(documentId, annotations);

      this.batchTimeouts.delete(documentId);

      if (documentQueue.length > 0) {
        this.scheduleBatchProcessing(documentId);
      } else {
        this.queue.delete(documentId);
      }
    } catch (error) {
      batch.forEach((item) => {
        if (item.retryCount < this.maxRetries) {
          item.retryCount++;
          documentQueue.unshift(item);
        } else {
          console.error(`Max retries exceeded for annotation in document ${documentId}.`);
        }
      });

      if (documentQueue.some((item) => item.retryCount < this.maxRetries)) {
        this.scheduleBatchProcessing(documentId);
      }
    }
  }

  async processQueueForDocument(documentId: string): Promise<void> {
    if (this.processingDocuments.has(documentId)) {
      return;
    }

    this.processingDocuments.add(documentId);

    try {
      const timeout = this.batchTimeouts.get(documentId);
      if (timeout) {
        clearTimeout(timeout);
        this.batchTimeouts.delete(documentId);
      }

      const documentQueue = this.queue.get(documentId);
      if (!documentQueue?.length) {
        return;
      }

      const annotations = documentQueue.map((item) => item.annotation);
      await this.emitAnnotations(documentId, annotations);

      this.queue.delete(documentId);
    } finally {
      this.processingDocuments.delete(documentId);
    }
  }

  async processAllQueues(): Promise<void> {
    if (this.isProcessing) {
      return;
    }

    this.isProcessing = true;

    try {
      const documentIds = Array.from(this.queue.keys());

      await Promise.all(
        documentIds.map(async (documentId) => {
          if (!this.isDocumentSyncing(documentId)) {
            await this.processQueueForDocument(documentId);
          }
        })
      );
    } finally {
      this.isProcessing = false;
    }
  }

  private emitAnnotation = async (documentId: string, annotation: IAnnotation): Promise<void> => {
    const state = store.getState();
    const currentDocument = selectors.getCurrentDocument(state);

    if (currentDocument?._id !== documentId) {
      return;
    }

    await documentServices.emitData({
      document: currentDocument,
      type: SOCKET_EMIT.ANNOTATION_CHANGE,
      data: annotation,
    });
    const lastModify = dateUtil.convertToRelativeTime(Date.now(), t);
    store.dispatch(actions.updateCurrentDocument({ lastModify }) as AnyAction);
  };

  private async emitAnnotations(documentId: string, annotations: IAnnotation[]): Promise<void> {
    if (annotations.length === 0) {
      return;
    }

    if (annotations.length === 1) {
      await this.emitAnnotation(documentId, annotations[0]);
      return;
    }

    const state = store.getState();
    const currentDocument = selectors.getCurrentDocument(state);

    if (!currentDocument || currentDocument._id !== documentId) {
      return;
    }

    await annotations.reduce(async (previousPromise, annotation) => {
      await previousPromise;

      return documentServices.emitData({
        document: currentDocument,
        type: SOCKET_EMIT.ANNOTATION_CHANGE,
        data: annotation,
      });
    }, Promise.resolve());
  }

  getQueueStatus(documentId: string): { queueLength: number; isProcessing: boolean } {
    const documentQueue = this.queue.get(documentId) ?? [];
    return {
      queueLength: documentQueue.length,
      isProcessing: this.processingDocuments.has(documentId),
    };
  }

  getQueueStats(): { totalDocuments: number; totalAnnotations: number; isProcessing: boolean } {
    let totalAnnotations = 0;

    Array.from(this.queue.values()).forEach((documentQueue) => {
      totalAnnotations += documentQueue.length;
    });

    return {
      totalDocuments: this.queue.size,
      totalAnnotations,
      isProcessing: this.isProcessing,
    };
  }

  clearQueue(documentId: string): void {
    const timeout = this.batchTimeouts.get(documentId);
    if (timeout) {
      clearTimeout(timeout);
      this.batchTimeouts.delete(documentId);
    }

    this.queue.delete(documentId);
    this.processingDocuments.delete(documentId);
  }

  clearAllQueues(): void {
    Array.from(this.batchTimeouts.values()).forEach((timeout) => {
      clearTimeout(timeout);
    });

    this.batchTimeouts.clear();
    this.queue.clear();
    this.processingDocuments.clear();
    this.isProcessing = false;
  }

  private setupDocumentSyncListeners(): void {
    window.addEventListener(CUSTOM_EVENT.DOCUMENT_SYNC_COMPLETED, this.handleDocumentSyncCompleted);
  }

  private handleDocumentSyncCompleted = async (event: CustomEvent<{ documentId: string; result: unknown }>) => {
    const { documentId } = event.detail;
    if (documentId) {
      await this.processQueueForDocument(documentId).catch(() => {
        /* Handle later */
      });
    }
  };

  async addFormFieldAnnotation(documentId: string, formFieldData: IFormFieldData): Promise<void> {
    const annotation: IAnnotation = {
      annotationType: AnnotationSubjectMapping.widget,
      annotationAction: 'add',
      xfdf: formFieldData.xfdf,
      annotationId: documentId,
      ...formFieldData,
    } as IAnnotation;

    await this.addAnnotation(documentId, annotation);
  }

  destroy(): void {
    window.removeEventListener(CUSTOM_EVENT.DOCUMENT_SYNC_COMPLETED, this.handleDocumentSyncCompleted);
    this.clearAllQueues();
  }
}
