import { renderHook, act, waitFor } from '@testing-library/react';
import { useDispatch, batch } from 'react-redux';
import produce from 'immer';
import { useProcessFormFieldDetection } from '../useProcessFormFieldDetection';
import core from 'core';
import selectors from 'selectors';
import actions from 'actions';
import { useShallowSelector } from 'hooks/useShallowSelector';
import { documentServices } from 'services';
import exportAnnotations from 'helpers/exportAnnotations';
import logger from 'helpers/logger';
import { toggleFormFieldCreationMode } from 'helpers/toggleFormFieldCreationMode';
import { getFileData } from 'utils/getFileService';
import { DataElements } from 'constants/dataElement';
import { SOCKET_ON } from 'constants/socketConstant';
import useSetupDetectionResult from '../useSetupDetectionResult';
import useShowModal from '../useShowModal';
import { socket } from '@socket';
import { FORM_FIELD_DETECTION_TIMEOUT } from '../../constants/detectionField.constant';
import { setHasEnteredFormFieldDetection } from '../../slice';
import { splitPagesForFFD } from '../../utils/batchRequestFFD';
import { uploadFileToS3ForDetection } from '../../utils/uploadFileToS3ForDetection';

jest.mock('react-redux', () => ({
  useDispatch: jest.fn(),
  batch: jest.fn((fn) => fn()),
}));

jest.mock('core', () => ({
  getDocument: jest.fn(),
  getTotalPages: jest.fn(),
}));

jest.mock('selectors', () => ({
  getCurrentDocument: jest.fn(),
  getCurrentUser: jest.fn(),
}));

jest.mock('hooks/useShallowSelector', () => ({
  useShallowSelector: jest.fn(),
}));

jest.mock('services', () => ({
  documentServices: {
    batchCreatePresignedFormFieldDetectionUrl: jest.fn(),
  },
}));

jest.mock('helpers/exportAnnotations', () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock('helpers/logger', () => ({
  logError: jest.fn(),
}));

jest.mock('helpers/toggleFormFieldCreationMode', () => ({
  toggleFormFieldCreationMode: jest.fn(),
}));

jest.mock('utils/getFileService', () => ({
  getFileData: jest.fn(),
}));

jest.mock('../useSetupDetectionResult', () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock('../useShowModal', () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock('@socket', () => ({
  socket: {
    removeListener: jest.fn(),
  },
}));

jest.mock('../../slice', () => ({
  setHasEnteredFormFieldDetection: jest.fn((value) => ({
    type: 'SET_HAS_ENTERED_FORM_FIELD_DETECTION',
    payload: value,
  })),
}));

jest.mock('../../utils/batchRequestFFD', () => ({
  splitPagesForFFD: jest.fn(),
}));

jest.mock('../../utils/uploadFileToS3ForDetection', () => ({
  uploadFileToS3ForDetection: jest.fn(),
}));

jest.mock('actions', () => ({
  updateCurrentUser: jest.fn((user) => ({ type: 'UPDATE_CURRENT_USER', payload: user })),
  closeElement: jest.fn((element) => ({ type: 'CLOSE_ELEMENT', payload: element })),
  resetViewerLoadingModal: jest.fn(() => ({ type: 'RESET_VIEWER_LOADING_MODAL' })),
}));

describe('useProcessFormFieldDetection', () => {
  const mockDispatch = jest.fn();
  const mockCurrentDocument = {
    _id: 'doc-123',
    name: 'test-document.pdf',
  };
  const mockCurrentUser = {
    id: 'user-1',
    metadata: {
      formFieldDetectionConsentGranted: false,
    },
  };
  const mockDocument = {
    getDocumentCompletePromise: jest.fn().mockResolvedValue(undefined),
  };
  const mockHandleSetupDetectionResult = jest.fn().mockResolvedValue(undefined);
  const mockShowLoadingModal = jest.fn();
  const mockShowUnprocessableModal = jest.fn();
  const mockXfdfString = '<xfdf></xfdf>';
  const mockFileBuffer = new Uint8Array([1, 2, 3]);

  beforeEach(() => {
    jest.clearAllMocks();

    (useDispatch as jest.Mock).mockReturnValue(mockDispatch);
    (useShallowSelector as jest.Mock)
      .mockImplementation((selector) => {
        if (selector === selectors.getCurrentDocument) {
          return mockCurrentDocument;
        }
        if (selector === selectors.getCurrentUser) {
          return mockCurrentUser;
        }
        return null;
      });
    (core.getDocument as jest.Mock).mockReturnValue(mockDocument);
    (core.getTotalPages as jest.Mock).mockReturnValue(10);
    (useSetupDetectionResult as jest.Mock).mockReturnValue({
      handleSetupDetectionResult: mockHandleSetupDetectionResult,
    });
    (useShowModal as jest.Mock).mockReturnValue({
      showLoadingModal: mockShowLoadingModal,
      showUnprocessableModal: mockShowUnprocessableModal,
    });
    (exportAnnotations as jest.Mock).mockResolvedValue(mockXfdfString);
    (getFileData as jest.Mock).mockResolvedValue(mockFileBuffer);
    (uploadFileToS3ForDetection as jest.Mock).mockResolvedValue(undefined);
    (splitPagesForFFD as jest.Mock).mockReturnValue([[1, 2, 3, 4, 5], [6, 7, 8, 9, 10]]);
  });

  describe('hook initialization', () => {
    it('should return a function', () => {
      const { result } = renderHook(() => useProcessFormFieldDetection());
      expect(typeof result.current).toBe('function');
    });
  });

  describe('processFormFieldDetection - success path', () => {
    it('should successfully process form field detection with all steps', async () => {
      const batchResults = [
        {
          blockTime: 1234567890,
          presignedUrl: 'https://example.com/upload1',
          sessionId: 'session-1',
          usage: 5,
          isExceeded: false,
        },
        {
          blockTime: 1234567890,
          presignedUrl: 'https://example.com/upload2',
          sessionId: 'session-2',
          usage: 5,
          isExceeded: false,
        },
      ];

      (documentServices.batchCreatePresignedFormFieldDetectionUrl as jest.Mock).mockResolvedValue(batchResults);

      const { result } = renderHook(() => useProcessFormFieldDetection());

      await act(async () => {
        await result.current();
      });

      expect(mockDispatch).toHaveBeenCalledWith(
        actions.updateCurrentUser(
          produce(mockCurrentUser, (draft) => {
            draft.metadata.formFieldDetectionConsentGranted = true;
          })
        )
      );

      expect(mockDispatch).toHaveBeenCalledWith(setHasEnteredFormFieldDetection(true));
      expect(splitPagesForFFD).toHaveBeenCalledWith(10);

      expect(mockShowLoadingModal).toHaveBeenCalledTimes(2);
      expect(mockShowLoadingModal).toHaveBeenNthCalledWith(1, {
        cancelProcess: expect.any(Function),
        currentStep: 0,
      });
      expect(mockShowLoadingModal).toHaveBeenNthCalledWith(2, {
        cancelProcess: expect.any(Function),
        currentStep: 1,
      });

      expect(toggleFormFieldCreationMode).toHaveBeenCalledWith(
        DataElements.FORM_BUILD_PANEL,
        {},
        { isFormFieldDetecting: true }
      );

      expect(documentServices.batchCreatePresignedFormFieldDetectionUrl).toHaveBeenCalledWith(
        {
          documentId: 'doc-123',
          pages: [[1, 2, 3, 4, 5], [6, 7, 8, 9, 10]],
        },
        { signal: expect.any(AbortSignal) }
      );

      expect(mockDispatch).toHaveBeenCalledWith(
        actions.updateCurrentUser({
          toolQuota: { formFieldDetection: { usage: 5, blockTime: 1234567890, isExceeded: false } },
        })
      );

      expect(uploadFileToS3ForDetection).toHaveBeenCalledTimes(2);
      expect(uploadFileToS3ForDetection).toHaveBeenNthCalledWith(1, {
        presignedUrl: 'https://example.com/upload1',
        fileBuffer: mockFileBuffer,
        documentName: 'test-document.pdf',
        options: { signal: expect.any(AbortSignal) },
      });

      expect(mockHandleSetupDetectionResult).toHaveBeenCalledTimes(2);
      expect(mockHandleSetupDetectionResult).toHaveBeenNthCalledWith(
        1,
        {
          sessionId: 'session-1',
          socketMessage: `${SOCKET_ON.FORM_FIELD_DETECTION_COMPLETED}-session-1`,
        },
        { signal: expect.any(AbortSignal) }
      );

      expect(mockDispatch).toHaveBeenCalledWith(actions.closeElement(DataElements.VIEWER_LOADING_MODAL));
      expect(mockDispatch).toHaveBeenCalledWith(actions.resetViewerLoadingModal());
    });

    it('should handle empty batchResults array', async () => {
      (documentServices.batchCreatePresignedFormFieldDetectionUrl as jest.Mock).mockResolvedValue([]);

      const { result } = renderHook(() => useProcessFormFieldDetection());

      await act(async () => {
        await result.current();
      });

      const updateUserQuotaCalls = mockDispatch.mock.calls.filter(
        (call) => call[0]?.type === 'UPDATE_CURRENT_USER' && call[0]?.payload?.toolQuota
      );
      expect(updateUserQuotaCalls.length).toBe(0);
      expect(uploadFileToS3ForDetection).not.toHaveBeenCalled();
      expect(mockHandleSetupDetectionResult).not.toHaveBeenCalled();
    });

    it('should handle single batch result', async () => {
      const batchResults = [
        {
          blockTime: 1234567890,
          presignedUrl: 'https://example.com/upload1',
          sessionId: 'session-1',
          usage: 1,
          isExceeded: false,
        },
      ];

      (documentServices.batchCreatePresignedFormFieldDetectionUrl as jest.Mock).mockResolvedValue(batchResults);

      const { result } = renderHook(() => useProcessFormFieldDetection());

      await act(async () => {
        await result.current();
      });

      expect(uploadFileToS3ForDetection).toHaveBeenCalledTimes(1);
      expect(mockHandleSetupDetectionResult).toHaveBeenCalledTimes(1);
    });
  });

  describe('processFormFieldDetection - error handling', () => {
    it('should show unprocessable modal when error occurs and signal is not aborted', async () => {
      const error = new Error('Network error');
      (documentServices.batchCreatePresignedFormFieldDetectionUrl as jest.Mock).mockRejectedValue(error);

      const { result } = renderHook(() => useProcessFormFieldDetection());

      await act(async () => {
        await result.current();
      });

      expect(mockShowUnprocessableModal).toHaveBeenCalled();
      expect(logger.logError).toHaveBeenCalledWith({
        error: expect.objectContaining({
          message: 'Failed to process form field detection',
          cause: error,
        }),
      });

      expect(mockDispatch).toHaveBeenCalledWith(actions.closeElement(DataElements.VIEWER_LOADING_MODAL));
      expect(mockDispatch).toHaveBeenCalledWith(actions.resetViewerLoadingModal());
    });

    it('should not show unprocessable modal when error occurs but signal is aborted', async () => {
      const error = new Error('Aborted');
      const abortController = new AbortController();
      abortController.abort();

      (documentServices.batchCreatePresignedFormFieldDetectionUrl as jest.Mock).mockImplementation(
        async (_, { signal }) => {
          if (signal.aborted) {
            throw error;
          }
          return [];
        }
      );

      const originalAbortController = global.AbortController;
      global.AbortController = jest.fn(() => abortController) as any;

      const { result } = renderHook(() => useProcessFormFieldDetection());

      await act(async () => {
        await result.current();
      });

      expect(mockShowUnprocessableModal).not.toHaveBeenCalled();
      expect(logger.logError).not.toHaveBeenCalled();
      expect(mockDispatch).toHaveBeenCalledWith(actions.closeElement(DataElements.VIEWER_LOADING_MODAL));
      expect(mockDispatch).toHaveBeenCalledWith(actions.resetViewerLoadingModal());

      global.AbortController = originalAbortController;
    });

    it('should handle error during file upload', async () => {
      const batchResults = [
        {
          blockTime: 1234567890,
          presignedUrl: 'https://example.com/upload1',
          sessionId: 'session-1',
          usage: 5,
          isExceeded: false,
        },
      ];

      (documentServices.batchCreatePresignedFormFieldDetectionUrl as jest.Mock).mockResolvedValue(batchResults);
      const uploadError = new Error('Upload failed');
      (uploadFileToS3ForDetection as jest.Mock).mockRejectedValue(uploadError);

      const { result } = renderHook(() => useProcessFormFieldDetection());

      await act(async () => {
        await result.current();
      });

      expect(mockShowUnprocessableModal).toHaveBeenCalled();
      expect(logger.logError).toHaveBeenCalled();
    });

    it('should handle error during detection result setup', async () => {
      const batchResults = [
        {
          blockTime: 1234567890,
          presignedUrl: 'https://example.com/upload1',
          sessionId: 'session-1',
          usage: 5,
          isExceeded: false,
        },
      ];

      (documentServices.batchCreatePresignedFormFieldDetectionUrl as jest.Mock).mockResolvedValue(batchResults);
      const setupError = new Error('Setup failed');
      mockHandleSetupDetectionResult.mockRejectedValue(setupError);

      const { result } = renderHook(() => useProcessFormFieldDetection());

      await act(async () => {
        await result.current();
      });

      expect(logger.logError).toHaveBeenCalledWith({
        error: expect.objectContaining({
          message: 'Failed to process form field detection',
          cause: setupError,
        }),
      });
      expect(mockShowUnprocessableModal).not.toHaveBeenCalled();
    });
  });

  describe('processFormFieldDetection - cancellation', () => {
    it('should abort operations when cancelProcess is called', async () => {
      let cancelProcessFn: (() => void) | undefined;
      mockShowLoadingModal.mockImplementation(({ cancelProcess }: { cancelProcess: () => void }) => {
        cancelProcessFn = cancelProcess;
      });

      const batchResults = [
        {
          blockTime: 1234567890,
          presignedUrl: 'https://example.com/upload1',
          sessionId: 'session-1',
          usage: 5,
          isExceeded: false,
        },
      ];

      (documentServices.batchCreatePresignedFormFieldDetectionUrl as jest.Mock).mockImplementation(
        async (_, { signal }) => {
          await new Promise((resolve) => setTimeout(resolve, 50));
          if (signal.aborted) {
            throw new Error('Aborted');
          }
          return batchResults;
        }
      );

      const { result } = renderHook(() => useProcessFormFieldDetection());

      await act(async () => {
        const promise = result.current();
        await new Promise((resolve) => setTimeout(resolve, 0));
        if (cancelProcessFn) {
          cancelProcessFn();
        }
        try {
          await promise;
        } catch (e) {
          // Expected when aborted
        }
      });

      expect(mockShowUnprocessableModal).not.toHaveBeenCalled();
    });
  });

  describe('setupDetectionResultsForAllBatches', () => {
    it('should set up detection results for all batches and handle timeout', async () => {
      jest.useFakeTimers();
      const batchResults = [
        {
          blockTime: 1234567890,
          presignedUrl: 'https://example.com/upload1',
          sessionId: 'session-1',
          usage: 5,
          isExceeded: false,
        },
        {
          blockTime: 1234567890,
          presignedUrl: 'https://example.com/upload2',
          sessionId: 'session-2',
          usage: 5,
          isExceeded: false,
        },
      ];

      (documentServices.batchCreatePresignedFormFieldDetectionUrl as jest.Mock).mockResolvedValue(batchResults);

      const { result } = renderHook(() => useProcessFormFieldDetection());

      await act(async () => {
        const promise = result.current();
        jest.runAllTimers();
        await promise;
      });

      expect(mockHandleSetupDetectionResult).toHaveBeenCalledTimes(2);

      jest.useRealTimers();
    });

    it('should handle error in setupDetectionResultsForAllBatches', async () => {
      const batchResults = [
        {
          blockTime: 1234567890,
          presignedUrl: 'https://example.com/upload1',
          sessionId: 'session-1',
          usage: 5,
          isExceeded: false,
        },
      ];

      (documentServices.batchCreatePresignedFormFieldDetectionUrl as jest.Mock).mockResolvedValue(batchResults);
      const setupError = new Error('Setup error');
      mockHandleSetupDetectionResult.mockRejectedValue(setupError);

      const { result } = renderHook(() => useProcessFormFieldDetection());

      await act(async () => {
        await result.current();
      });

      expect(logger.logError).toHaveBeenCalledWith({
        error: expect.objectContaining({
          message: 'Failed to process form field detection',
          cause: setupError,
        }),
      });
    });
  });

  describe('temporaryUploadFileForDetection', () => {
    it('should upload file with correct parameters', async () => {
      const batchResults = [
        {
          blockTime: 1234567890,
          presignedUrl: 'https://example.com/upload1',
          sessionId: 'session-1',
          usage: 5,
          isExceeded: false,
        },
      ];

      (documentServices.batchCreatePresignedFormFieldDetectionUrl as jest.Mock).mockResolvedValue(batchResults);

      const { result } = renderHook(() => useProcessFormFieldDetection());

      await act(async () => {
        await result.current();
      });

      expect(mockDocument.getDocumentCompletePromise).toHaveBeenCalled();
      expect(exportAnnotations).toHaveBeenCalled();
      expect(getFileData).toHaveBeenCalledWith({ xfdfString: mockXfdfString });

      expect(uploadFileToS3ForDetection).toHaveBeenCalledWith(
        expect.objectContaining({
          presignedUrl: 'https://example.com/upload1',
          fileBuffer: mockFileBuffer,
          documentName: 'test-document.pdf',
          options: expect.objectContaining({
            signal: expect.any(AbortSignal),
          }),
        })
      );
    });
  });

  describe('updateUserConsent', () => {
    it('should update user consent using immer produce', async () => {
      const batchResults = [
        {
          blockTime: 1234567890,
          presignedUrl: 'https://example.com/upload1',
          sessionId: 'session-1',
          usage: 5,
          isExceeded: false,
        },
      ];

      (documentServices.batchCreatePresignedFormFieldDetectionUrl as jest.Mock).mockResolvedValue(batchResults);

      const { result } = renderHook(() => useProcessFormFieldDetection());

      await act(async () => {
        await result.current();
      });

      expect(mockDispatch).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'UPDATE_CURRENT_USER',
          payload: expect.objectContaining({
            metadata: expect.objectContaining({
              formFieldDetectionConsentGranted: true,
            }),
          }),
        })
      );
    });
  });

  describe('edge cases', () => {
    it('should handle zero total pages', async () => {
      (core.getTotalPages as jest.Mock).mockReturnValue(0);
      (splitPagesForFFD as jest.Mock).mockReturnValue([]);
      (documentServices.batchCreatePresignedFormFieldDetectionUrl as jest.Mock).mockResolvedValue([]);

      const { result } = renderHook(() => useProcessFormFieldDetection());

      await act(async () => {
        await result.current();
      });

      expect(splitPagesForFFD).toHaveBeenCalledWith(0);
    });

    it('should handle batchResults with isExceeded flag', async () => {
      const batchResults = [
        {
          blockTime: 1234567890,
          presignedUrl: 'https://example.com/upload1',
          sessionId: 'session-1',
          usage: 100,
          isExceeded: true,
        },
      ];

      (documentServices.batchCreatePresignedFormFieldDetectionUrl as jest.Mock).mockResolvedValue(batchResults);

      const { result } = renderHook(() => useProcessFormFieldDetection());

      await act(async () => {
        await result.current();
      });

      expect(mockDispatch).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'UPDATE_CURRENT_USER',
          payload: expect.objectContaining({
            toolQuota: expect.objectContaining({
              formFieldDetection: expect.objectContaining({
                usage: 100,
                blockTime: 1234567890,
                isExceeded: true,
              }),
            }),
          }),
        })
      );
    });

    it('should handle batchResults with undefined isExceeded', async () => {
      const batchResults = [
        {
          blockTime: 1234567890,
          presignedUrl: 'https://example.com/upload1',
          sessionId: 'session-1',
          usage: 5,
        },
      ];

      (documentServices.batchCreatePresignedFormFieldDetectionUrl as jest.Mock).mockResolvedValue(batchResults);

      const { result } = renderHook(() => useProcessFormFieldDetection());

      await act(async () => {
        await result.current();
      });

      expect(mockDispatch).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'UPDATE_CURRENT_USER',
          payload: expect.objectContaining({
            toolQuota: expect.objectContaining({
              formFieldDetection: expect.objectContaining({
                usage: 5,
                blockTime: 1234567890,
              }),
            }),
          }),
        })
      );

      const updateCall = mockDispatch.mock.calls.find(
        (call) => call[0]?.type === 'UPDATE_CURRENT_USER' && call[0]?.payload?.toolQuota?.formFieldDetection
      );
      expect(updateCall).toBeDefined();
      const formFieldDetection = updateCall[0].payload.toolQuota.formFieldDetection;
      expect(formFieldDetection.usage).toBe(5);
      expect(formFieldDetection.blockTime).toBe(1234567890);
      expect(formFieldDetection.isExceeded).toBeUndefined();
    });

    it('should handle error in temporaryUploadFileForDetection', async () => {
      const batchResults = [
        {
          blockTime: 1234567890,
          presignedUrl: 'https://example.com/upload1',
          sessionId: 'session-1',
          usage: 5,
          isExceeded: false,
        },
      ];

      (documentServices.batchCreatePresignedFormFieldDetectionUrl as jest.Mock).mockResolvedValue(batchResults);
      const exportError = new Error('Export failed');
      (exportAnnotations as jest.Mock).mockRejectedValue(exportError);

      const { result } = renderHook(() => useProcessFormFieldDetection());

      await act(async () => {
        await result.current();
      });

      expect(mockShowUnprocessableModal).toHaveBeenCalled();
      expect(logger.logError).toHaveBeenCalled();
    });

    it('should handle error in getFileData', async () => {
      const batchResults = [
        {
          blockTime: 1234567890,
          presignedUrl: 'https://example.com/upload1',
          sessionId: 'session-1',
          usage: 5,
          isExceeded: false,
        },
      ];

      (documentServices.batchCreatePresignedFormFieldDetectionUrl as jest.Mock).mockResolvedValue(batchResults);
      const fileDataError = new Error('File data failed');
      (getFileData as jest.Mock).mockRejectedValue(fileDataError);

      const { result } = renderHook(() => useProcessFormFieldDetection());

      await act(async () => {
        await result.current();
      });

      expect(mockShowUnprocessableModal).toHaveBeenCalled();
      expect(logger.logError).toHaveBeenCalled();
    });
  });

  describe('timeout handling in setupDetectionResultsForAllBatches', () => {
    it('should clear timeout when setup completes successfully', async () => {
      const batchResults = [
        {
          blockTime: 1234567890,
          presignedUrl: 'https://example.com/upload1',
          sessionId: 'session-1',
          usage: 5,
          isExceeded: false,
        },
      ];

      (documentServices.batchCreatePresignedFormFieldDetectionUrl as jest.Mock).mockResolvedValue(batchResults);

      const clearTimeoutSpy = jest.spyOn(global, 'clearTimeout');
      const setTimeoutSpy = jest.spyOn(global, 'setTimeout');

      const { result } = renderHook(() => useProcessFormFieldDetection());

      await act(async () => {
        await result.current();
      });

      expect(setTimeoutSpy).toHaveBeenCalled();
      expect(clearTimeoutSpy).toHaveBeenCalled();

      clearTimeoutSpy.mockRestore();
      setTimeoutSpy.mockRestore();
    });

    it('should clear timeout even when error occurs', async () => {
      const batchResults = [
        {
          blockTime: 1234567890,
          presignedUrl: 'https://example.com/upload1',
          sessionId: 'session-1',
          usage: 5,
          isExceeded: false,
        },
      ];

      (documentServices.batchCreatePresignedFormFieldDetectionUrl as jest.Mock).mockResolvedValue(batchResults);
      mockHandleSetupDetectionResult.mockRejectedValue(new Error('Setup error'));

      const clearTimeoutSpy = jest.spyOn(global, 'clearTimeout');
      const setTimeoutSpy = jest.spyOn(global, 'setTimeout');

      const { result } = renderHook(() => useProcessFormFieldDetection());

      await act(async () => {
        await result.current();
      });

      expect(setTimeoutSpy).toHaveBeenCalled();
      expect(clearTimeoutSpy).toHaveBeenCalled();

      clearTimeoutSpy.mockRestore();
      setTimeoutSpy.mockRestore();
    });
  });
});

