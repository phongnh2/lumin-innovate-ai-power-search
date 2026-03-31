jest.mock('i18next', () => ({
  t: jest.fn((key) => {
    // Return the actual translation for the specific key we're testing
    if (key === 'viewer.annotationSync.queueFull') {
      return 'Please wait for the document to be synced before adding more annotations';
    }
    return key;
  }),
}));

jest.mock('@libs/snackbar', () => ({
  enqueueSnackbar: jest.fn(),
}));

jest.mock('selectors', () => ({
  default: {
    getCurrentDocument: jest.fn(),
  },
  __esModule: true,
}));

jest.mock('store', () => ({
  store: {
    getState: jest.fn(),
    dispatch: jest.fn(),
  },
}));

jest.mock('services/documentServices', () => ({
  default: {
    emitData: jest.fn(),
  },
  __esModule: true,
}));

jest.mock('services/documentSyncQueue', () => ({
  documentSyncQueue: {
    getDocumentSyncStatus: jest.fn(),
  },
}));

jest.mock('features/Collaboration/slices', () => ({
  useCollaborationStore: {
    getState: jest.fn(() => ({
      socketState: {
        status: 'connected',
      },
    })),
  },
}));

jest.mock('hooks/useSocketStatus', () => ({
  isDisconnected: jest.fn(() => false),
}));

import { AnnotationSyncQueue, IFormFieldData, IAnnotationSyncQueueOptions } from '../baseQueue';
import { IAnnotation } from 'interfaces/document/document.interface';
import { CUSTOM_EVENT } from 'constants/customEvent';
import { AnnotationSubjectMapping } from 'constants/documentConstants';
import { SOCKET_EMIT } from 'constants/socketConstant';

describe('AnnotationSyncQueue', () => {
  let annotationSyncQueue: AnnotationSyncQueue;

  const mockDocument = { _id: 'test-doc-id', name: 'test.pdf' } as any;
  const mockAnnotation: IAnnotation = {
    annotationType: 'freetext',
    annotationAction: 'add',
    annotationId: 'annotation-1',
    xfdf: '<test>annotation</test>',
  } as IAnnotation;

  const mockEnqueueSnackbar = require('@libs/snackbar').enqueueSnackbar;
  const mockGetCurrentDocument = require('selectors').default.getCurrentDocument;
  const mockGetState = require('store').store.getState;
  const mockEmitData = require('services/documentServices').default.emitData;
  const mockGetDocumentSyncStatus = require('services/documentSyncQueue').documentSyncQueue.getDocumentSyncStatus;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    
    mockGetState.mockReturnValue({} as any);
    mockGetCurrentDocument.mockReturnValue(mockDocument);
    mockGetDocumentSyncStatus.mockReturnValue({
      isCurrentlySync: false,
      isProcessing: false,
    });
    mockEmitData.mockResolvedValue(undefined);

    annotationSyncQueue = new AnnotationSyncQueue();
  });

  afterEach(() => {
    if (annotationSyncQueue) {
      annotationSyncQueue.destroy();
    }
    jest.useRealTimers();
  });

  describe('constructor', () => {
    it('should initialize with default options', () => {
      const queue = new AnnotationSyncQueue();
      const stats = queue.getQueueStats();
      
      expect(stats.totalDocuments).toBe(0);
      expect(stats.totalAnnotations).toBe(0);
      expect(stats.isProcessing).toBe(false);
    });

    it('should initialize with custom options', () => {
      const options: IAnnotationSyncQueueOptions = {
        maxQueueSize: 500,
        maxRetries: 5,
        enableBatching: false,
        batchSize: 20,
        batchTimeoutMs: 5000,
      };
      
      const queue = new AnnotationSyncQueue(options);
      expect(queue).toBeInstanceOf(AnnotationSyncQueue);
    });
  });

  describe('addAnnotation', () => {
    it('should emit annotation immediately when document is not syncing', async () => {
      await annotationSyncQueue.addAnnotation('test-doc-id', mockAnnotation);

      expect(mockEmitData).toHaveBeenCalledWith({
        document: mockDocument,
        type: SOCKET_EMIT.ANNOTATION_CHANGE,
        data: mockAnnotation,
      });
    });

    it('should queue annotation when document is currently syncing', async () => {
      mockGetDocumentSyncStatus.mockReturnValue({
        isCurrentlySync: true,
        isProcessing: false,
      });

      await annotationSyncQueue.addAnnotation('test-doc-id', mockAnnotation);

      expect(mockEmitData).not.toHaveBeenCalled();
      
      const status = annotationSyncQueue.getQueueStatus('test-doc-id');
      expect(status.queueLength).toBe(1);
    });

    it('should queue annotation when document is processing', async () => {
      mockGetDocumentSyncStatus.mockReturnValue({
        isCurrentlySync: false,
        isProcessing: true,
      });

      await annotationSyncQueue.addAnnotation('test-doc-id', mockAnnotation);

      expect(mockEmitData).not.toHaveBeenCalled();
      
      const status = annotationSyncQueue.getQueueStatus('test-doc-id');
      expect(status.queueLength).toBe(1);
    });

    it('should not emit when document is not found', async () => {
      mockGetCurrentDocument.mockReturnValue(null);

      await annotationSyncQueue.addAnnotation('invalid-doc-id', mockAnnotation);
      
      expect(mockEmitData).not.toHaveBeenCalled();
    });

    it('should not emit when document ID does not match current document', async () => {
      mockGetCurrentDocument.mockReturnValue({ _id: 'different-doc-id' } as any);

      await annotationSyncQueue.addAnnotation('test-doc-id', mockAnnotation);
      
      expect(mockEmitData).not.toHaveBeenCalled();
    });
  });

  describe('addAnnotations', () => {
    const mockAnnotations: IAnnotation[] = [
      { ...mockAnnotation, annotationId: 'annotation-1' },
      { ...mockAnnotation, annotationId: 'annotation-2' },
    ] as IAnnotation[];

    it('should emit annotations immediately when document is not syncing', async () => {
      await annotationSyncQueue.addAnnotations('test-doc-id', mockAnnotations);

      expect(mockEmitData).toHaveBeenCalledTimes(2);
    });

    it('should queue all annotations when document is syncing', async () => {
      mockGetDocumentSyncStatus.mockReturnValue({
        isCurrentlySync: true,
        isProcessing: false,
      });

      await annotationSyncQueue.addAnnotations('test-doc-id', mockAnnotations);

      expect(mockEmitData).not.toHaveBeenCalled();
      
      const status = annotationSyncQueue.getQueueStatus('test-doc-id');
      expect(status.queueLength).toBe(2);
    });
  });

  describe('queue management', () => {
    beforeEach(() => {
      mockGetDocumentSyncStatus.mockReturnValue({
        isCurrentlySync: true,
        isProcessing: false,
      });
    });

    it('should show warning when queue is full', async () => {
      const smallQueue = new AnnotationSyncQueue({ maxQueueSize: 2 });
      mockGetDocumentSyncStatus.mockReturnValue({
        isCurrentlySync: true,
        isProcessing: false,
      });

      await smallQueue.addAnnotation('test-doc-id', mockAnnotation);
      await smallQueue.addAnnotation('test-doc-id', mockAnnotation);
      await smallQueue.addAnnotation('test-doc-id', mockAnnotation);

      expect(mockEnqueueSnackbar).toHaveBeenCalledWith({
        message: 'Please wait for the document to be synced before adding more annotations',
        variant: 'warning',
      });

      const status = smallQueue.getQueueStatus('test-doc-id');
      expect(status.queueLength).toBe(2);
    });

    it('should schedule batch processing when batching is enabled', async () => {
      mockGetDocumentSyncStatus.mockReturnValue({
        isCurrentlySync: true,
        isProcessing: false,
      });

      await annotationSyncQueue.addAnnotation('test-doc-id', mockAnnotation);

      mockGetDocumentSyncStatus.mockReturnValue({
        isCurrentlySync: false,
        isProcessing: false,
      });

      // Wait for the batch timeout (default is 500ms)
      jest.advanceTimersByTime(500);
      
      await Promise.resolve();

      expect(mockEmitData).toHaveBeenCalledWith({
        document: mockDocument,
        type: SOCKET_EMIT.ANNOTATION_CHANGE,
        data: mockAnnotation,
      });
    });
  });

  describe('status and stats methods', () => {
    it('should return correct queue status', () => {
      const status = annotationSyncQueue.getQueueStatus('test-doc-id');
      
      expect(status).toEqual({
        queueLength: 0,
        isProcessing: false,
      });
    });

    it('should return correct queue stats', async () => {
      mockGetDocumentSyncStatus.mockReturnValue({
        isCurrentlySync: true,
        isProcessing: false,
      });

      await annotationSyncQueue.addAnnotation('doc-1', mockAnnotation);
      await annotationSyncQueue.addAnnotation('doc-2', mockAnnotation);

      const stats = annotationSyncQueue.getQueueStats();
      
      expect(stats).toEqual({
        totalDocuments: 2,
        totalAnnotations: 2,
        isProcessing: false,
      });
    });
  });

  describe('queue clearing', () => {
    it('should clear queue for specific document', async () => {
      mockGetDocumentSyncStatus.mockReturnValue({
        isCurrentlySync: true,
        isProcessing: false,
      });

      await annotationSyncQueue.addAnnotation('test-doc-id', mockAnnotation);
      
      annotationSyncQueue.clearQueue('test-doc-id');

      const status = annotationSyncQueue.getQueueStatus('test-doc-id');
      expect(status.queueLength).toBe(0);
    });

    it('should clear all queues', async () => {
      mockGetDocumentSyncStatus.mockReturnValue({
        isCurrentlySync: true,
        isProcessing: false,
      });

      await annotationSyncQueue.addAnnotation('doc-1', mockAnnotation);
      await annotationSyncQueue.addAnnotation('doc-2', mockAnnotation);
      
      annotationSyncQueue.clearAllQueues();

      const stats = annotationSyncQueue.getQueueStats();
      expect(stats.totalDocuments).toBe(0);
      expect(stats.totalAnnotations).toBe(0);
    });
  });

  describe('addFormFieldAnnotation', () => {
    it('should create and add form field annotation', async () => {
      const formFieldData: IFormFieldData = {
        xfdf: '<form-field>data</form-field>',
        userId: 'user-123',
        email: 'test@example.com',
      };

      await annotationSyncQueue.addFormFieldAnnotation('test-doc-id', formFieldData);

      expect(mockEmitData).toHaveBeenCalledWith({
        document: mockDocument,
        type: SOCKET_EMIT.ANNOTATION_CHANGE,
        data: expect.objectContaining({
          annotationType: AnnotationSubjectMapping.widget,
          annotationAction: 'add',
          xfdf: formFieldData.xfdf,
          annotationId: 'test-doc-id',
          userId: 'user-123',
          email: 'test@example.com',
        }),
      });
    });
  });

  describe('destroy', () => {
    it('should remove event listeners and clear all queues', () => {
      const removeEventListenerSpy = jest.spyOn(window, 'removeEventListener');
      
      annotationSyncQueue.destroy();

      expect(removeEventListenerSpy).toHaveBeenCalledWith(
        CUSTOM_EVENT.DOCUMENT_SYNC_COMPLETED,
        expect.any(Function)
      );

      const stats = annotationSyncQueue.getQueueStats();
      expect(stats.totalDocuments).toBe(0);
      expect(stats.totalAnnotations).toBe(0);
    });
  });

  describe('error handling', () => {
    it('should handle emit errors gracefully', async () => {
      mockEmitData.mockRejectedValue(new Error('Network error'));

      await expect(annotationSyncQueue.addAnnotation('test-doc-id', mockAnnotation))
        .rejects.toThrow('Network error');
    });

    it('should handle missing current document gracefully', async () => {
      mockGetCurrentDocument.mockReturnValue(null);

      await annotationSyncQueue.addAnnotation('test-doc-id', mockAnnotation);
      
      expect(mockEmitData).not.toHaveBeenCalled();
    });
  });
});
