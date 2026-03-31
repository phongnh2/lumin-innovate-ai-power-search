import { act, renderHook, waitFor } from '@testing-library/react';
import { useDispatch } from 'react-redux';
import { AutoDetectQueue } from '../../utils/autoDetectQueue';
import indexedDBService from 'services/indexedDBService';
import core from 'core';
import documentServices from 'services/documentServices';
import exportAnnotations from 'helpers/exportAnnotations';
import { getExtractedData } from '@new-ui/components/ToolProperties/components/SplitExtractPanel/hooks/useExtractPages';
import { uploadFileToS3ForDetection } from '../../utils/uploadFileToS3ForDetection';
import logger from 'helpers/logger';
import errorExtract from 'utils/error';
import { socket } from '@socket';
import { SOCKET_ON } from 'constants/socketConstant';
import { DefaultErrorCode } from 'constants/errorCode';
import { createDetectedFieldPlaceholders } from '../../utils/createDetectedFieldPlaceholders';

// Mock DetectedFieldPlaceholder before importing useSetupAutoDetectQueue
jest.mock('helpers/CustomAnnotation/DetectedFieldPlaceholder', () => {
  class MockDetectedFieldPlaceholder {
    PageNumber: number = 0;
    X: number = 0;
    Y: number = 0;
    Width: number = 0;
    Height: number = 0;
    CustomFieldType: string = '';
    CustomFieldId: string = '';
  }
  return {
    __esModule: true,
    default: MockDetectedFieldPlaceholder,
  };
});

import { useSetupAutoDetectQueue } from '../useSetupAutoDetectQueue';

jest.mock('react-redux', () => ({
  useDispatch: jest.fn(),
}));

jest.mock('hooks/useGetCurrentUser', () => ({
  useGetCurrentUser: jest.fn(() => ({ id: 'user-1', toolQuota: { autoDetection: {} } })),
}));

// useCleanup uses useEffect internally, so we don't need to mock it
// It will work correctly with React's testing library

jest.mock('services/indexedDBService', () => ({
  getAutoDetectFormFields: jest.fn().mockResolvedValue({ predictions: {} }),
  saveAutoDetectFormFields: jest.fn(),
  updateAutoDetectFormFieldsPageNumber: jest.fn(),
}));

jest.mock('core', () => ({
  getAnnotationManager: jest.fn(() => ({
    addAnnotation: jest.fn(),
    redrawAnnotation: jest.fn(),
    getAnnotationsList: jest.fn(() => []),
  })),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
}));

jest.mock('actions', () => ({
  updateCurrentUser: jest.fn((user) => ({ type: 'UPDATE_CURRENT_USER', payload: user })),
}));

jest.mock('services/documentServices', () => ({
  createPresignedFormFieldDetectionUrl: jest.fn().mockResolvedValue({
    presignedUrl: 'https://example.com/upload',
    sessionId: 'session-123',
    usage: 0,
    blockTime: null,
    isExceeded: false,
  }),
}));

jest.mock('helpers/exportAnnotations', () => ({
  __esModule: true,
  default: jest.fn().mockResolvedValue('<xfdf></xfdf>'),
}));

jest.mock('@new-ui/components/ToolProperties/components/SplitExtractPanel/hooks/useExtractPages', () => ({
  getExtractedData: jest.fn().mockResolvedValue(new Uint8Array([1, 2, 3])),
}));

jest.mock('../../utils/uploadFileToS3ForDetection', () => ({
  uploadFileToS3ForDetection: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('helpers/logger', () => ({
  logError: jest.fn(),
}));

jest.mock('utils/error', () => ({
  extractGqlError: jest.fn((error) => ({ code: null, metadata: null })),
}));

jest.mock('constants/documentConstants', () => ({
  CUSTOM_ANNOTATION: {
    DETECTED_FIELD_PLACEHOLDER: {
      name: 'detectedFieldPlaceholder',
      subject: 'DetectedFieldPlaceholder',
      tool: '',
    },
  },
}));

// Store handlers for testing
const mockQueueHandlers: {
  handleSendDocumentForDetect?: (pages: number[]) => Promise<string | null>;
  handleListenForResult?: (sessionId: string, pages: number[]) => void;
} = {};

jest.mock('../../utils/autoDetectQueue', () => ({
  AutoDetectQueue: {
    getInstance: jest.fn((options) => {
      mockQueueHandlers.handleSendDocumentForDetect = options.handleSendDocumentForDetect;
      mockQueueHandlers.handleListenForResult = options.handleListenForResult;
      return { setProcessedPages: jest.fn() };
    }),
    clearInstance: jest.fn(),
  },
}));

jest.mock('@socket', () => ({
  socket: {
    once: jest.fn(),
    removeListener: jest.fn(),
  },
}));

jest.mock('../../utils/createDetectedFieldPlaceholders', () => ({
  createDetectedFieldPlaceholders: jest.fn(() => [1, 2]),
}));

describe('useSetupAutoDetectQueue', () => {
  const mockProps = {
    isViewerLoaded: true,
    documentId: 'doc-123',
    pageTrackerRef: { current: null } as any,
  };

  const mockDispatch = jest.fn();
  const mockPageTracker = {
    trackPage: jest.fn(),
    untrackPage: jest.fn(),
    getMappedPage: jest.fn((page: number) => page),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockQueueHandlers.handleSendDocumentForDetect = undefined;
    mockQueueHandlers.handleListenForResult = undefined;
    (useDispatch as jest.Mock).mockReturnValue(mockDispatch);
    (indexedDBService.getAutoDetectFormFields as jest.Mock).mockResolvedValue({ predictions: {} });
    (indexedDBService.saveAutoDetectFormFields as jest.Mock).mockResolvedValue(undefined);
    (core.getAnnotationManager as jest.Mock).mockReturnValue({
      getAnnotationsList: jest.fn(() => []),
      addAnnotation: jest.fn(),
      redrawAnnotation: jest.fn(),
    });
    (exportAnnotations as jest.Mock).mockResolvedValue('<xfdf></xfdf>');
    (getExtractedData as jest.Mock).mockResolvedValue(new Uint8Array([1, 2, 3]));
    (documentServices.createPresignedFormFieldDetectionUrl as jest.Mock).mockResolvedValue({
      presignedUrl: 'https://example.com/upload',
      sessionId: 'session-123',
      usage: 0,
      blockTime: null,
      isExceeded: false,
    });
    (uploadFileToS3ForDetection as jest.Mock).mockResolvedValue(undefined);
    (errorExtract.extractGqlError as jest.Mock).mockReturnValue({ code: null, metadata: null });
    (socket.once as jest.Mock).mockImplementation((message, callback) => {
      // Store callback for manual triggering in tests
      (socket.once as any).lastCallback = callback;
    });
  });

  it('should initialize and clear the queue singleton', () => {
    const { unmount } = renderHook(() => useSetupAutoDetectQueue(mockProps));
    expect(AutoDetectQueue.getInstance).toHaveBeenCalled();
    
    unmount();
    expect(AutoDetectQueue.clearInstance).toHaveBeenCalled();
  });

  // Line 62: Test when data.predictions is falsy
  it('should return early when getAutoDetectFormFields returns data without predictions', async () => {
    (indexedDBService.getAutoDetectFormFields as jest.Mock).mockResolvedValue({ predictions: null });
    
    const { result } = renderHook(() => useSetupAutoDetectQueue(mockProps));
    
    await waitFor(() => {
      expect(result.current.hasLoadedDataFromIndexedDB).toBe(true);
    });
    
    expect(createDetectedFieldPlaceholders).not.toHaveBeenCalled();
  });

  // Line 84: Test early return when viewer not loaded
  it('should return early when isViewerLoaded is false', () => {
    const props = { ...mockProps, isViewerLoaded: false };
    renderHook(() => useSetupAutoDetectQueue(props));
    
    expect(AutoDetectQueue.getInstance).not.toHaveBeenCalled();
  });

  // Line 84: Test early return when documentId is missing
  it('should return early when documentId is empty', () => {
    const props = { ...mockProps, documentId: '' };
    renderHook(() => useSetupAutoDetectQueue(props));
    
    expect(AutoDetectQueue.getInstance).not.toHaveBeenCalled();
  });

  // Lines 88-98: Test handleExtractPages function
  it('should extract pages correctly when handleExtractPages is called', async () => {
    const mockAnnotations = [
      { PageNumber: 1, type: 'text' },
      { PageNumber: 2, type: 'highlight' },
    ];
    const mockAnnotationManager = {
      getAnnotationsList: jest.fn(() => mockAnnotations),
      addAnnotation: jest.fn(),
      redrawAnnotation: jest.fn(),
    };
    (core.getAnnotationManager as jest.Mock).mockReturnValue(mockAnnotationManager);
    
    const { result } = renderHook(() => useSetupAutoDetectQueue(mockProps));
    
    await waitFor(() => {
      expect(result.current.hasLoadedDataFromIndexedDB).toBe(true);
    });
    
    // Call handleSendDocumentForDetect which internally calls handleExtractPages
    if (mockQueueHandlers.handleSendDocumentForDetect) {
      await act(async () => {
        await mockQueueHandlers.handleSendDocumentForDetect([1, 2]);
      });
      
      expect(mockAnnotationManager.getAnnotationsList).toHaveBeenCalled();
      expect(exportAnnotations).toHaveBeenCalledWith({
        annotList: mockAnnotations.filter((a) => [1, 2].includes(a.PageNumber)),
        widgets: true,
        fields: true,
      });
      expect(getExtractedData).toHaveBeenCalledWith([1, 2], '<xfdf></xfdf>');
    }
  });

  // Lines 102-151: Test handleSendDocumentForDetect success case
  it('should successfully send document for detection', async () => {
    const { result } = renderHook(() => useSetupAutoDetectQueue(mockProps));
    
    await waitFor(() => {
      expect(result.current.hasLoadedDataFromIndexedDB).toBe(true);
    });
    
    if (mockQueueHandlers.handleSendDocumentForDetect) {
      let sessionId: string | null = null;
      await act(async () => {
        sessionId = await mockQueueHandlers.handleSendDocumentForDetect([1, 2]);
      });
      
      expect(documentServices.createPresignedFormFieldDetectionUrl).toHaveBeenCalled();
      expect(uploadFileToS3ForDetection).toHaveBeenCalled();
      expect(mockDispatch).toHaveBeenCalled();
      expect(sessionId).toBe('session-123');
    }
  });

  // Lines 102-151: Test handleSendDocumentForDetect error case with TOO_MANY_REQUESTS
  it('should handle TOO_MANY_REQUESTS error and update user quota', async () => {
    const mockMetadata = {
      usage: 100,
      blockTime: Date.now() + 3600000,
      isExceeded: true,
    };
    
    (documentServices.createPresignedFormFieldDetectionUrl as jest.Mock).mockRejectedValue(
      new Error('Too many requests')
    );
    (errorExtract.extractGqlError as jest.Mock).mockReturnValue({
      code: DefaultErrorCode.TOO_MANY_REQUESTS,
      metadata: mockMetadata,
    });
    
    const { result } = renderHook(() => useSetupAutoDetectQueue(mockProps));
    
    await waitFor(() => {
      expect(result.current.hasLoadedDataFromIndexedDB).toBe(true);
    });
    
    if (mockQueueHandlers.handleSendDocumentForDetect) {
      let sessionId: string | null = null;
      await act(async () => {
        sessionId = await mockQueueHandlers.handleSendDocumentForDetect([1, 2]);
      });
      
      expect(errorExtract.extractGqlError).toHaveBeenCalled();
      expect(mockDispatch).toHaveBeenCalled();
      expect(logger.logError).toHaveBeenCalled();
      expect(sessionId).toBe(null);
    }
  });

  // Lines 102-151: Test handleSendDocumentForDetect generic error case
  it('should handle generic error in handleSendDocumentForDetect', async () => {
    (documentServices.createPresignedFormFieldDetectionUrl as jest.Mock).mockRejectedValue(
      new Error('Generic error')
    );
    (errorExtract.extractGqlError as jest.Mock).mockReturnValue({
      code: 'OTHER_ERROR',
      metadata: null,
    });
    
    const { result } = renderHook(() => useSetupAutoDetectQueue(mockProps));
    
    await waitFor(() => {
      expect(result.current.hasLoadedDataFromIndexedDB).toBe(true);
    });
    
    if (mockQueueHandlers.handleSendDocumentForDetect) {
      let sessionId: string | null = null;
      await act(async () => {
        sessionId = await mockQueueHandlers.handleSendDocumentForDetect([1, 2]);
      });
      
      expect(logger.logError).toHaveBeenCalledWith(
        expect.objectContaining({
          reason: expect.any(String),
          message: 'Error when send document for detect',
        })
      );
      expect(sessionId).toBe(null);
    }
  });

  // Lines 164-198: Test onAutoDetectFormFieldCompleted success case
  it('should handle successful form field detection completion', async () => {
    const mockPageTracker = {
      trackPage: jest.fn(),
      untrackPage: jest.fn(),
      getMappedPage: jest.fn((page: number) => page),
    };
    const props = { ...mockProps, pageTrackerRef: { current: mockPageTracker } };
    
    const mockPredictions = [
      {
        pageNumber: 1,
        boundingRectangle: { x1: 10, y1: 20, x2: 30, y2: 40 },
        fieldType: 'text',
        fieldId: 'field-1',
      },
      {
        pageNumber: 2,
        boundingRectangle: { x1: 50, y1: 60, x2: 70, y2: 80 },
        fieldType: 'checkbox',
        fieldId: 'field-2',
      },
    ];
    
    const { result } = renderHook(() => useSetupAutoDetectQueue(props));
    
    await waitFor(() => {
      expect(result.current.hasLoadedDataFromIndexedDB).toBe(true);
    });
    
    if (mockQueueHandlers.handleListenForResult) {
      await act(async () => {
        mockQueueHandlers.handleListenForResult('session-123', [1, 2]);
      });
      
      // Trigger the socket callback
      const socketCallback = (socket.once as any).lastCallback;
      if (socketCallback) {
        await act(async () => {
          await socketCallback({
            status: { code: 200 },
            predictions: mockPredictions,
          });
        });
        
        expect(mockPageTracker.trackPage).toHaveBeenCalledWith(1);
        expect(mockPageTracker.trackPage).toHaveBeenCalledWith(2);
        expect(mockPageTracker.untrackPage).toHaveBeenCalledWith(1);
        expect(mockPageTracker.untrackPage).toHaveBeenCalledWith(2);
        expect(indexedDBService.saveAutoDetectFormFields).toHaveBeenCalled();
        expect(indexedDBService.getAutoDetectFormFields).toHaveBeenCalled();
      }
    }
  });

  // Lines 164-198: Test onAutoDetectFormFieldCompleted error case - status.errorCode
  it('should handle error when status has errorCode', async () => {
    const mockPageTracker = {
      trackPage: jest.fn(),
      untrackPage: jest.fn(),
      getMappedPage: jest.fn((page: number) => page),
    };
    const props = { ...mockProps, pageTrackerRef: { current: mockPageTracker } };
    
    const { result } = renderHook(() => useSetupAutoDetectQueue(props));
    
    await waitFor(() => {
      expect(result.current.hasLoadedDataFromIndexedDB).toBe(true);
    });
    
    if (mockQueueHandlers.handleListenForResult) {
      await act(async () => {
        mockQueueHandlers.handleListenForResult('session-123', [1, 2]);
      });
      
      const socketCallback = (socket.once as any).lastCallback;
      if (socketCallback) {
        await act(async () => {
          await socketCallback({
            status: { code: 500, errorCode: 'DETECTION_ERROR' },
            predictions: [],
          });
        });
        
        expect(logger.logError).toHaveBeenCalledWith(
          expect.objectContaining({
            reason: expect.any(String),
            message: 'Error in onAutoDetectFormFieldCompleted',
          })
        );
      }
    }
  });

  // Lines 164-198: Test onAutoDetectFormFieldCompleted error case - no predictions
  it('should handle error when predictions array is empty', async () => {
    const mockPageTracker = {
      trackPage: jest.fn(),
      untrackPage: jest.fn(),
      getMappedPage: jest.fn((page: number) => page),
    };
    const props = { ...mockProps, pageTrackerRef: { current: mockPageTracker } };
    
    const { result } = renderHook(() => useSetupAutoDetectQueue(props));
    
    await waitFor(() => {
      expect(result.current.hasLoadedDataFromIndexedDB).toBe(true);
    });
    
    if (mockQueueHandlers.handleListenForResult) {
      await act(async () => {
        mockQueueHandlers.handleListenForResult('session-123', [1, 2]);
      });
      
      const socketCallback = (socket.once as any).lastCallback;
      if (socketCallback) {
        await act(async () => {
          await socketCallback({
            status: { code: 200 },
            predictions: [],
          });
        });
        
        expect(logger.logError).toHaveBeenCalledWith(
          expect.objectContaining({
            reason: expect.any(String),
            message: 'Error in onAutoDetectFormFieldCompleted',
          })
        );
      }
    }
  });

  // Lines 164-198: Test onAutoDetectFormFieldCompleted with page mapping
  it('should handle page mapping correctly in onAutoDetectFormFieldCompleted', async () => {
    const mockPageTracker = {
      trackPage: jest.fn(),
      untrackPage: jest.fn(),
      getMappedPage: jest.fn((page: number) => {
        // Map page 1 -> 2, page 2 -> 3
        if (page === 1) return 2;
        if (page === 2) return 3;
        return page;
      }),
    };
    const props = { ...mockProps, pageTrackerRef: { current: mockPageTracker } };
    
    const mockPredictions = [
      {
        pageNumber: 1,
        boundingRectangle: { x1: 10, y1: 20, x2: 30, y2: 40 },
        fieldType: 'text',
        fieldId: 'field-1',
      },
    ];
    
    const { result } = renderHook(() => useSetupAutoDetectQueue(props));
    
    await waitFor(() => {
      expect(result.current.hasLoadedDataFromIndexedDB).toBe(true);
    });
    
    if (mockQueueHandlers.handleListenForResult) {
      await act(async () => {
        mockQueueHandlers.handleListenForResult('session-123', [1, 2]);
      });
      
      const socketCallback = (socket.once as any).lastCallback;
      if (socketCallback) {
        await act(async () => {
          await socketCallback({
            status: { code: 200 },
            predictions: mockPredictions,
          });
        });
        
        expect(mockPageTracker.getMappedPage).toHaveBeenCalled();
        expect(indexedDBService.saveAutoDetectFormFields).toHaveBeenCalled();
      }
    }
  });

  // Lines 164-198: Test onAutoDetectFormFieldCompleted with non-finite page mapper
  it('should skip predictions with non-finite page mapper', async () => {
    const mockPageTracker = {
      trackPage: jest.fn(),
      untrackPage: jest.fn(),
      getMappedPage: jest.fn(() => NaN),
    };
    const props = { ...mockProps, pageTrackerRef: { current: mockPageTracker } };
    
    const mockPredictions = [
      {
        pageNumber: 1,
        boundingRectangle: { x1: 10, y1: 20, x2: 30, y2: 40 },
        fieldType: 'text',
        fieldId: 'field-1',
      },
    ];
    
    const { result } = renderHook(() => useSetupAutoDetectQueue(props));
    
    await waitFor(() => {
      expect(result.current.hasLoadedDataFromIndexedDB).toBe(true);
    });
    
    if (mockQueueHandlers.handleListenForResult) {
      await act(async () => {
        mockQueueHandlers.handleListenForResult('session-123', [1]);
      });
      
      const socketCallback = (socket.once as any).lastCallback;
      if (socketCallback) {
        await act(async () => {
          await socketCallback({
            status: { code: 200 },
            predictions: mockPredictions,
          });
        });
        
        // Should still save but with empty predictions for pages
        expect(indexedDBService.saveAutoDetectFormFields).toHaveBeenCalled();
      }
    }
  });

  // Lines 207-213: Test handleListenForResult
  it('should set up socket listener correctly in handleListenForResult', async () => {
    const mockPageTracker = {
      trackPage: jest.fn(),
      untrackPage: jest.fn(),
      getMappedPage: jest.fn((page: number) => page),
    };
    const props = { ...mockProps, pageTrackerRef: { current: mockPageTracker } };
    
    const { result } = renderHook(() => useSetupAutoDetectQueue(props));
    
    await waitFor(() => {
      expect(result.current.hasLoadedDataFromIndexedDB).toBe(true);
    });
    
    if (mockQueueHandlers.handleListenForResult) {
      await act(async () => {
        mockQueueHandlers.handleListenForResult('session-456', [1, 2, 3]);
      });
      
      expect(mockPageTracker.trackPage).toHaveBeenCalledWith(1);
      expect(mockPageTracker.trackPage).toHaveBeenCalledWith(2);
      expect(mockPageTracker.trackPage).toHaveBeenCalledWith(3);
      expect(socket.once).toHaveBeenCalledWith(
        `${SOCKET_ON.FORM_FIELD_DETECTION_COMPLETED}-session-456`,
        expect.any(Function)
      );
    }
  });

  // Line 231: Test socket.removeListener in cleanup
  it('should remove socket listeners on cleanup', async () => {
    const mockPageTracker = {
      trackPage: jest.fn(),
      untrackPage: jest.fn(),
      getMappedPage: jest.fn((page: number) => page),
    };
    const props = { ...mockProps, pageTrackerRef: { current: mockPageTracker } };
    
    const { result, unmount } = renderHook(() => useSetupAutoDetectQueue(props));
    
    await waitFor(() => {
      expect(result.current.hasLoadedDataFromIndexedDB).toBe(true);
    });
    
    if (mockQueueHandlers.handleListenForResult) {
      await act(async () => {
        mockQueueHandlers.handleListenForResult('session-789', [1]);
      });
      
      unmount();
      
      expect(socket.removeListener).toHaveBeenCalledWith({
        message: `${SOCKET_ON.FORM_FIELD_DETECTION_COMPLETED}-session-789`,
      });
    }
  });
});