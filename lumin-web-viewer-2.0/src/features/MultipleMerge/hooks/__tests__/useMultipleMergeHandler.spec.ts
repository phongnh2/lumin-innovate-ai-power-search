import { renderHook, act, waitFor } from '@testing-library/react';

import { useMultipleMergeHandler } from '../useMultipleMergeHandler';
import { PremiumModalContentType } from 'interfaces/organization/organization.interface';

jest.mock('file-saver', () => ({
  saveAs: jest.fn(),
}));

jest.mock('react-redux', () => ({
  useDispatch: jest.fn(),
}));

jest.mock('hooks', () => ({
  useGetFolderType: jest.fn(() => 'individual'),
  useTranslation: jest.fn(() => ({ t: (key: string) => key })),
}));

jest.mock('actions', () => ({
  __esModule: true,
  default: {
    closeModal: jest.fn(() => ({ type: 'CLOSE_MODAL' })),
    openElement: jest.fn((el) => ({ type: 'OPEN_ELEMENT', payload: el })),
    closeElement: jest.fn((el) => ({ type: 'CLOSE_ELEMENT', payload: el })),
    setPasswordProtectedDocumentName: jest.fn((name) => ({ type: 'SET_NAME', payload: name })),
    setPasswordAttempts: jest.fn((attempts) => ({ type: 'SET_ATTEMPTS', payload: attempts })),
  },
}));

jest.mock('helpers/logger', () => ({
  __esModule: true,
  default: { logError: jest.fn() },
}));

jest.mock('helpers/device', () => ({
  isIE: false,
}));

jest.mock('utils', () => ({
  eventTracking: jest.fn().mockResolvedValue(undefined),
  toastUtils: { error: jest.fn() },
}));

jest.mock('utils/Factory/EventCollection/DocumentEventCollection', () => ({
  __esModule: true,
  default: { downloadDocumentSuccess: jest.fn().mockResolvedValue(undefined) },
}));

jest.mock('utils/Factory/EventCollection/ModalEventCollection', () => ({
  __esModule: true,
  default: { modalConfirmation: jest.fn().mockResolvedValue(undefined) },
}));

jest.mock('utils/file', () => ({
  __esModule: true,
  default: {
    convertExtensionToPdf: jest.fn((name) => `${name}.pdf`),
    getFilenameWithoutExtension: jest.fn((name) => name.replace(/\.[^/.]+$/, '')),
    getExtension: jest.fn(() => 'pdf'),
  },
}));

jest.mock('luminComponents/HeaderLumin/hooks/useSessionInternalStorageChecker', () => ({
  __esModule: true,
  default: jest.fn(() => ({
    handleInternalStoragePermission: jest.fn().mockResolvedValue(undefined),
  })),
}));

jest.mock('../useValidateDocuments', () => ({
  useValidateDocuments: jest.fn(() => ({
    shouldBlockMergeProcess: jest.fn().mockResolvedValue(false),
    premiumModalContent: null as PremiumModalContentType | null,
    openedPremiumModal: false,
    openedPremiumModalHandlers: { open: jest.fn(), close: jest.fn(), toggle: jest.fn() },
  })),
}));

jest.mock('../../core/merge', () => ({
  MergeHandler: jest.fn().mockImplementation(() => ({
    setItems: jest.fn(),
    setOnMergeItemComplete: jest.fn(),
    setOnMergeComplete: jest.fn(),
    setOnError: jest.fn(),
    setAbortSignal: jest.fn(),
    setOnSetupPasswordHandler: jest.fn(),
    setOnLoadDocumentComplete: jest.fn(),
    setOnCancelPassword: jest.fn(),
    handle: jest.fn().mockResolvedValue(undefined),
    getResult: jest.fn(),
    getOtherFileSource: jest.fn(() => 'local'),
    getProcessedPdfDoc: jest.fn(() => ({})),
  })),
}));

jest.mock('../../constants', () => ({
  getNextStep: jest.fn((step) => {
    const map: Record<string, string> = {
      selectDocuments: 'mergingDocuments',
      mergingDocuments: 'saveDocument',
    };
    return map[step];
  }),
  MULTIPLE_MERGE_SOURCE: { individual: 'my documents' },
}));

jest.mock('../../enum', () => ({
  MultipleMergeStep: {
    SELECT_DOCUMENTS: 'selectDocuments',
    MERGING_DOCUMENTS: 'mergingDocuments',
    SAVE_DOCUMENT: 'saveDocument',
  },
  SaveDestination: {
    COMPUTER: 'computer',
    LUMIN: 'lumin',
    GOOGLE_DRIVE: 'googleDrive',
  },
  UploadStatus: { FAILED: 'failed' },
}));

// Get references to mocked modules for assertions
const getMockedModules = () => ({
  saveAs: require('file-saver').saveAs as jest.Mock,
  actions: require('actions').default,
  logger: require('helpers/logger').default,
  toastUtils: require('utils').toastUtils,
  documentEvent: require('utils/Factory/EventCollection/DocumentEventCollection').default,
  MergeHandler: require('../../core/merge').MergeHandler as jest.Mock,
  useSessionInternalStorageChecker: require('luminComponents/HeaderLumin/hooks/useSessionInternalStorageChecker')
    .default as jest.Mock,
});

describe('useMultipleMergeHandler', () => {
  const mockDispatch = jest.fn();
  const mockOnClose = jest.fn();
  const mockHandleUploadLumin = jest.fn().mockResolvedValue(undefined);
  const mockSetIsLoadingDocument = jest.fn();
  const mockSetDocuments = jest.fn();
  const mockResetAbortController = jest.fn();
  let mockAbortController: AbortController;
  const mockGetAbortController = jest.fn(() => mockAbortController);

  const defaultProps = {
    documents: [{ _id: 'doc-1', name: 'test.pdf', buffer: new ArrayBuffer(8), source: 'local' }] as any,
    handleUploadLumin: mockHandleUploadLumin,
    onClose: mockOnClose,
    setIsLoadingDocument: mockSetIsLoadingDocument,
    getAbortController: mockGetAbortController,
    setDocuments: mockSetDocuments,
    resetAbortController: mockResetAbortController,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockAbortController = new AbortController();
    mockGetAbortController.mockReturnValue(mockAbortController);
    const { useDispatch } = require('react-redux');
    useDispatch.mockReturnValue(mockDispatch);

    // Reset MergeHandler mock
    const { MergeHandler } = getMockedModules();
    MergeHandler.mockImplementation(() => ({
      setItems: jest.fn(),
      setOnMergeItemComplete: jest.fn(),
      setOnMergeComplete: jest.fn(),
      setOnError: jest.fn(),
      setAbortSignal: jest.fn(),
      setOnSetupPasswordHandler: jest.fn(),
      setOnLoadDocumentComplete: jest.fn(),
      setOnCancelPassword: jest.fn(),
      handle: jest.fn().mockResolvedValue(undefined),
      getResult: jest.fn(),
      getOtherFileSource: jest.fn(() => 'local'),
      getProcessedPdfDoc: jest.fn(() => ({})),
    }));
  });

  describe('initialization', () => {
    it('should initialize with default values', () => {
      const { result } = renderHook(() => useMultipleMergeHandler(defaultProps));

      expect(result.current.currentStep).toBe('selectDocuments');
      expect(result.current.mergingProgress).toBe(0);
      expect(result.current.saveDestination).toBe('computer');
      expect(result.current.openSaveToDriveModal).toBe(false);
    });

    it('should return all expected functions and state', () => {
      const { result } = renderHook(() => useMultipleMergeHandler(defaultProps));

      expect(typeof result.current.setCurrentStep).toBe('function');
      expect(typeof result.current.setSaveDestination).toBe('function');
      expect(typeof result.current.setOpenSaveToDriveModal).toBe('function');
      expect(typeof result.current.handleClickConfirm).toBe('function');
      expect(typeof result.current.goToNextStep).toBe('function');
      expect(typeof result.current.getResult).toBe('function');
    });
  });

  describe('goToNextStep', () => {
    it('should transition to next step when valid', () => {
      const { result } = renderHook(() => useMultipleMergeHandler(defaultProps));

      act(() => {
        result.current.goToNextStep('selectDocuments');
      });

      expect(result.current.currentStep).toBe('mergingDocuments');
    });

    it('should not change step when no next step exists', () => {
      const { getNextStep } = require('../../constants');
      getNextStep.mockReturnValueOnce(undefined);

      const { result } = renderHook(() => useMultipleMergeHandler(defaultProps));

      act(() => {
        result.current.goToNextStep('saveDocument');
      });

      expect(result.current.currentStep).toBe('selectDocuments');
    });
  });

  describe('setSaveDestination', () => {
    it('should update save destination', () => {
      const { result } = renderHook(() => useMultipleMergeHandler(defaultProps));

      act(() => {
        result.current.setSaveDestination('lumin');
      });

      expect(result.current.saveDestination).toBe('lumin');
    });
  });

  describe('setOpenSaveToDriveModal', () => {
    it('should toggle Google Drive modal state', () => {
      const { result } = renderHook(() => useMultipleMergeHandler(defaultProps));

      expect(result.current.openSaveToDriveModal).toBe(false);

      act(() => {
        result.current.setOpenSaveToDriveModal(true);
      });

      expect(result.current.openSaveToDriveModal).toBe(true);
    });
  });

  describe('handleClickConfirm', () => {
    it('should call handleMergeDocuments when on SELECT_DOCUMENTS step', async () => {
      const { useValidateDocuments } = require('../useValidateDocuments');
      useValidateDocuments.mockReturnValue({
        shouldBlockMergeProcess: jest.fn().mockResolvedValue(false),
        premiumModalContent: null,
        openedPremiumModal: false,
        openedPremiumModalHandlers: { open: jest.fn(), close: jest.fn(), toggle: jest.fn() },
      });

      const { result } = renderHook(() => useMultipleMergeHandler(defaultProps));

      await act(async () => {
        await result.current.handleClickConfirm();
      });

      expect(mockDispatch).toHaveBeenCalled();
      expect(mockSetIsLoadingDocument).toHaveBeenCalledWith(true);
    });

    it('should do nothing when on MERGING_DOCUMENTS step', async () => {
      const { result } = renderHook(() => useMultipleMergeHandler(defaultProps));

      act(() => {
        result.current.setCurrentStep('mergingDocuments');
      });

      await act(async () => {
        await result.current.handleClickConfirm();
      });

      // No save or merge operations should be called
      expect(mockOnClose).not.toHaveBeenCalled();
    });
  });

  describe('getResult', () => {
    it('should throw error when mergeHandler is not initialized', async () => {
      const { result } = renderHook(() => useMultipleMergeHandler(defaultProps));

      await expect(result.current.getResult()).rejects.toThrow('Merge handler is not initialized');
    });
  });

  describe('shouldBlockMergeProcess integration', () => {
    it('should reset to SELECT_DOCUMENTS when blocked', async () => {
      const { useValidateDocuments } = require('../useValidateDocuments');
      useValidateDocuments.mockReturnValue({
        shouldBlockMergeProcess: jest.fn().mockResolvedValue(true),
        premiumModalContent: { title: 'Premium' },
        openedPremiumModal: false,
        openedPremiumModalHandlers: { open: jest.fn(), close: jest.fn(), toggle: jest.fn() },
      });

      const { result } = renderHook(() => useMultipleMergeHandler(defaultProps));

      await act(async () => {
        await result.current.handleClickConfirm();
      });

      expect(result.current.currentStep).toBe('selectDocuments');
    });
  });

  describe('setMergingProgress', () => {
    it('should update merging progress', () => {
      const { result } = renderHook(() => useMultipleMergeHandler(defaultProps));

      act(() => {
        result.current.setMergingProgress(5);
      });

      expect(result.current.mergingProgress).toBe(5);
    });
  });

  describe('premiumModal state', () => {
    it('should return premiumModalContent from useValidateDocuments', () => {
      const { useValidateDocuments } = require('../useValidateDocuments');
      useValidateDocuments.mockReturnValue({
        shouldBlockMergeProcess: jest.fn(),
        premiumModalContent: { title: 'Upgrade' },
        openedPremiumModal: true,
        openedPremiumModalHandlers: { open: jest.fn(), close: jest.fn(), toggle: jest.fn() },
      });

      const { result } = renderHook(() => useMultipleMergeHandler(defaultProps));

      expect(result.current.premiumModalContent).toEqual({ title: 'Upgrade' });
      expect(result.current.openedPremiumModal).toBe(true);
    });
  });

  describe('getResult with initialized mergeHandler', () => {
    it('should return file and name when mergeHandler is initialized', async () => {
      const mockPdfDoc = {
        saveMemoryBuffer: jest.fn().mockResolvedValue(new Uint8Array([1, 2, 3])),
      };

      const { MergeHandler } = getMockedModules();
      MergeHandler.mockImplementation(() => ({
        setItems: jest.fn(),
        setOnMergeItemComplete: jest.fn(),
        setOnMergeComplete: jest.fn(),
        setOnError: jest.fn(),
        setAbortSignal: jest.fn(),
        setOnSetupPasswordHandler: jest.fn(),
        setOnLoadDocumentComplete: jest.fn(),
        setOnCancelPassword: jest.fn(),
        handle: jest.fn().mockResolvedValue(undefined),
        getResult: jest.fn().mockReturnValue(mockPdfDoc),
        getOtherFileSource: jest.fn(() => 'local'),
        getProcessedPdfDoc: jest.fn(() => ({})),
      }));

      // Setup PDFNet mock
      (window as any).Core = {
        PDFNet: {
          SDFDoc: {
            SaveOptions: {
              e_linearized: 1,
            },
          },
        },
      };

      const { useValidateDocuments } = require('../useValidateDocuments');
      useValidateDocuments.mockReturnValue({
        shouldBlockMergeProcess: jest.fn().mockResolvedValue(false),
        premiumModalContent: null,
        openedPremiumModal: false,
        openedPremiumModalHandlers: { open: jest.fn(), close: jest.fn(), toggle: jest.fn() },
      });

      const { result } = renderHook(() => useMultipleMergeHandler(defaultProps));

      // Trigger merge to initialize mergeHandler
      await act(async () => {
        await result.current.handleClickConfirm();
      });

      // Now getResult should work
      const { file, name } = await result.current.getResult();

      expect(file).toBeInstanceOf(File);
      expect(name).toBe('test_merged.pdf');
      expect(mockPdfDoc.saveMemoryBuffer).toHaveBeenCalled();
    });
  });

  describe('handleSaveDocument', () => {
    const setupMergeAndNavigateToSaveStep = async (result: any, mockPdfDoc?: any) => {
      const pdfDoc = mockPdfDoc || {
        saveMemoryBuffer: jest.fn().mockResolvedValue(new Uint8Array([1, 2, 3])),
      };

      const { MergeHandler } = getMockedModules();
      MergeHandler.mockImplementation(() => ({
        setItems: jest.fn(),
        setOnMergeItemComplete: jest.fn(),
        setOnMergeComplete: jest.fn(),
        setOnError: jest.fn(),
        setAbortSignal: jest.fn(),
        setOnSetupPasswordHandler: jest.fn(),
        setOnLoadDocumentComplete: jest.fn(),
        setOnCancelPassword: jest.fn(),
        handle: jest.fn().mockResolvedValue(undefined),
        getResult: jest.fn().mockReturnValue(pdfDoc),
        getOtherFileSource: jest.fn(() => 'local'),
        getProcessedPdfDoc: jest.fn(() => ({})),
      }));

      (window as any).Core = {
        PDFNet: {
          SDFDoc: {
            SaveOptions: {
              e_linearized: 1,
            },
          },
        },
      };

      // Trigger merge to initialize handler and go to next step
      await act(async () => {
        await result.current.handleClickConfirm();
      });

      // Manually set step to SAVE_DOCUMENT
      act(() => {
        result.current.setCurrentStep('saveDocument');
      });
    };

    it('should save to computer and call onClose', async () => {
      const { useValidateDocuments } = require('../useValidateDocuments');
      useValidateDocuments.mockReturnValue({
        shouldBlockMergeProcess: jest.fn().mockResolvedValue(false),
        premiumModalContent: null,
        openedPremiumModal: false,
        openedPremiumModalHandlers: { open: jest.fn(), close: jest.fn(), toggle: jest.fn() },
      });

      const { result } = renderHook(() => useMultipleMergeHandler(defaultProps));

      await setupMergeAndNavigateToSaveStep(result);

      // Set destination to computer (default)
      act(() => {
        result.current.setSaveDestination('computer');
      });

      await act(async () => {
        await result.current.handleClickConfirm();
      });

      const { saveAs, documentEvent } = getMockedModules();
      expect(saveAs).toHaveBeenCalled();
      expect(mockOnClose).toHaveBeenCalled();
      expect(documentEvent.downloadDocumentSuccess).toHaveBeenCalledWith({
        fileType: 'pdf',
        savedLocation: 'device',
      });
    });

    it('should upload to Lumin and call onClose', async () => {
      const { useValidateDocuments } = require('../useValidateDocuments');
      useValidateDocuments.mockReturnValue({
        shouldBlockMergeProcess: jest.fn().mockResolvedValue(false),
        premiumModalContent: null,
        openedPremiumModal: false,
        openedPremiumModalHandlers: { open: jest.fn(), close: jest.fn(), toggle: jest.fn() },
      });

      const { result } = renderHook(() => useMultipleMergeHandler(defaultProps));

      await setupMergeAndNavigateToSaveStep(result);

      act(() => {
        result.current.setSaveDestination('lumin');
      });

      await act(async () => {
        await result.current.handleClickConfirm();
      });

      const { documentEvent } = getMockedModules();
      expect(mockOnClose).toHaveBeenCalled();
      expect(mockHandleUploadLumin).toHaveBeenCalled();
      expect(documentEvent.downloadDocumentSuccess).toHaveBeenCalledWith({
        fileType: 'pdf',
        savedLocation: 'lumin',
      });
    });

    it('should open Google Drive modal when destination is googleDrive', async () => {
      const { useSessionInternalStorageChecker } = getMockedModules();
      useSessionInternalStorageChecker.mockReturnValue({
        handleInternalStoragePermission: jest.fn().mockImplementation(({ hasPermissionCallback }) => {
          hasPermissionCallback();
          return Promise.resolve();
        }),
      });

      const { useValidateDocuments } = require('../useValidateDocuments');
      useValidateDocuments.mockReturnValue({
        shouldBlockMergeProcess: jest.fn().mockResolvedValue(false),
        premiumModalContent: null,
        openedPremiumModal: false,
        openedPremiumModalHandlers: { open: jest.fn(), close: jest.fn(), toggle: jest.fn() },
      });

      const { result } = renderHook(() => useMultipleMergeHandler(defaultProps));

      await setupMergeAndNavigateToSaveStep(result);

      act(() => {
        result.current.setSaveDestination('googleDrive');
      });

      await act(async () => {
        await result.current.handleClickConfirm();
      });

      await waitFor(() => {
        expect(result.current.openSaveToDriveModal).toBe(true);
      });
    });

    it('should show error toast and log error when save fails', async () => {
      const { MergeHandler } = getMockedModules();
      MergeHandler.mockImplementation(() => ({
        setItems: jest.fn(),
        setOnMergeItemComplete: jest.fn(),
        setOnMergeComplete: jest.fn(),
        setOnError: jest.fn(),
        setAbortSignal: jest.fn(),
        setOnSetupPasswordHandler: jest.fn(),
        setOnLoadDocumentComplete: jest.fn(),
        setOnCancelPassword: jest.fn(),
        handle: jest.fn().mockResolvedValue(undefined),
        getResult: jest.fn().mockImplementation(() => {
          throw new Error('Save failed');
        }),
        getOtherFileSource: jest.fn(() => 'local'),
        getProcessedPdfDoc: jest.fn(() => ({})),
      }));

      const { useValidateDocuments } = require('../useValidateDocuments');
      useValidateDocuments.mockReturnValue({
        shouldBlockMergeProcess: jest.fn().mockResolvedValue(false),
        premiumModalContent: null,
        openedPremiumModal: false,
        openedPremiumModalHandlers: { open: jest.fn(), close: jest.fn(), toggle: jest.fn() },
      });

      const { result } = renderHook(() => useMultipleMergeHandler(defaultProps));

      // Trigger merge first
      await act(async () => {
        await result.current.handleClickConfirm();
      });

      // Navigate to save step
      act(() => {
        result.current.setCurrentStep('saveDocument');
      });

      await act(async () => {
        await result.current.handleClickConfirm();
      });

      const { toastUtils, logger } = getMockedModules();
      expect(toastUtils.error).toHaveBeenCalledWith({
        message: 'multipleMerge.mergeFailedToast',
      });
      expect(logger.logError).toHaveBeenCalled();
    });
  });

  describe('processMerge error handling', () => {
    it('should handle error with processedPdfDoc and update documents', async () => {
      const mockError = new Error('Merge error');
      const { MergeHandler } = getMockedModules();
      MergeHandler.mockImplementation(() => ({
        setItems: jest.fn(),
        setOnMergeItemComplete: jest.fn(),
        setOnMergeComplete: jest.fn(),
        setOnError: jest.fn(),
        setAbortSignal: jest.fn(),
        setOnSetupPasswordHandler: jest.fn(),
        setOnLoadDocumentComplete: jest.fn(),
        setOnCancelPassword: jest.fn(),
        handle: jest.fn().mockRejectedValue(mockError),
        getResult: jest.fn(),
        getOtherFileSource: jest.fn(() => 'local'),
        getProcessedPdfDoc: jest.fn().mockReturnValue({
          'doc-1': {
            pdfDoc: { pages: 5 },
            status: 'failed',
            metadata: { info: 'test' },
          },
        }),
      }));

      const { useValidateDocuments } = require('../useValidateDocuments');
      useValidateDocuments.mockReturnValue({
        shouldBlockMergeProcess: jest.fn().mockResolvedValue(false),
        premiumModalContent: null,
        openedPremiumModal: false,
        openedPremiumModalHandlers: { open: jest.fn(), close: jest.fn(), toggle: jest.fn() },
      });

      const { result } = renderHook(() => useMultipleMergeHandler(defaultProps));

      await act(async () => {
        await result.current.handleClickConfirm();
      });

      const { toastUtils, logger } = getMockedModules();
      expect(mockSetDocuments).toHaveBeenCalled();
      expect(mockResetAbortController).toHaveBeenCalled();
      expect(result.current.currentStep).toBe('selectDocuments');
      expect(toastUtils.error).toHaveBeenCalledWith({
        message: 'multipleMerge.mergeFailedToast',
      });
      expect(logger.logError).toHaveBeenCalled();
    });

    it('should handle error without matching document id in processedPdfDoc', async () => {
      const mockError = new Error('Merge error');
      const { MergeHandler } = getMockedModules();
      MergeHandler.mockImplementation(() => ({
        setItems: jest.fn(),
        setOnMergeItemComplete: jest.fn(),
        setOnMergeComplete: jest.fn(),
        setOnError: jest.fn(),
        setAbortSignal: jest.fn(),
        setOnSetupPasswordHandler: jest.fn(),
        setOnLoadDocumentComplete: jest.fn(),
        setOnCancelPassword: jest.fn(),
        handle: jest.fn().mockRejectedValue(mockError),
        getResult: jest.fn(),
        getOtherFileSource: jest.fn(() => 'local'),
        getProcessedPdfDoc: jest.fn().mockReturnValue({
          'non-existent-doc': {
            pdfDoc: { pages: 5 },
            status: 'failed',
          },
        }),
      }));

      const { useValidateDocuments } = require('../useValidateDocuments');
      useValidateDocuments.mockReturnValue({
        shouldBlockMergeProcess: jest.fn().mockResolvedValue(false),
        premiumModalContent: null,
        openedPremiumModal: false,
        openedPremiumModalHandlers: { open: jest.fn(), close: jest.fn(), toggle: jest.fn() },
      });

      const { result } = renderHook(() => useMultipleMergeHandler(defaultProps));

      await act(async () => {
        await result.current.handleClickConfirm();
      });

      expect(mockSetDocuments).toHaveBeenCalled();
      expect(mockResetAbortController).toHaveBeenCalled();
    });
  });

  describe('setupMergeHandler callbacks', () => {
    it('should call setOnMergeItemComplete callback to update progress', async () => {
      let onMergeItemCompleteCallback: () => void;
      const mockSetOnMergeItemComplete = jest.fn((cb) => {
        onMergeItemCompleteCallback = cb;
      });

      const { MergeHandler } = getMockedModules();
      MergeHandler.mockImplementation(() => ({
        setItems: jest.fn(),
        setOnMergeItemComplete: mockSetOnMergeItemComplete,
        setOnMergeComplete: jest.fn(),
        setOnError: jest.fn(),
        setAbortSignal: jest.fn(),
        setOnSetupPasswordHandler: jest.fn(),
        setOnLoadDocumentComplete: jest.fn(),
        setOnCancelPassword: jest.fn(),
        handle: jest.fn().mockResolvedValue(undefined),
        getResult: jest.fn(),
        getOtherFileSource: jest.fn(() => 'local'),
        getProcessedPdfDoc: jest.fn(() => ({})),
      }));

      const { useValidateDocuments } = require('../useValidateDocuments');
      useValidateDocuments.mockReturnValue({
        shouldBlockMergeProcess: jest.fn().mockResolvedValue(false),
        premiumModalContent: null,
        openedPremiumModal: false,
        openedPremiumModalHandlers: { open: jest.fn(), close: jest.fn(), toggle: jest.fn() },
      });

      const { result } = renderHook(() => useMultipleMergeHandler(defaultProps));

      await act(async () => {
        await result.current.handleClickConfirm();
      });

      expect(mockSetOnMergeItemComplete).toHaveBeenCalled();

      // Call the callback to test progress update
      act(() => {
        onMergeItemCompleteCallback!();
      });

      expect(result.current.mergingProgress).toBe(1);
    });

    it('should call setOnMergeComplete callback to go to next step', async () => {
      let onMergeCompleteCallback: () => void;
      const mockSetOnMergeComplete = jest.fn((cb) => {
        onMergeCompleteCallback = cb;
      });

      const { MergeHandler } = getMockedModules();
      MergeHandler.mockImplementation(() => ({
        setItems: jest.fn(),
        setOnMergeItemComplete: jest.fn(),
        setOnMergeComplete: mockSetOnMergeComplete,
        setOnError: jest.fn(),
        setAbortSignal: jest.fn(),
        setOnSetupPasswordHandler: jest.fn(),
        setOnLoadDocumentComplete: jest.fn(),
        setOnCancelPassword: jest.fn(),
        handle: jest.fn().mockResolvedValue(undefined),
        getResult: jest.fn(),
        getOtherFileSource: jest.fn(() => 'local'),
        getProcessedPdfDoc: jest.fn(() => ({})),
      }));

      const { useValidateDocuments } = require('../useValidateDocuments');
      useValidateDocuments.mockReturnValue({
        shouldBlockMergeProcess: jest.fn().mockResolvedValue(false),
        premiumModalContent: null,
        openedPremiumModal: false,
        openedPremiumModalHandlers: { open: jest.fn(), close: jest.fn(), toggle: jest.fn() },
      });

      const { result } = renderHook(() => useMultipleMergeHandler(defaultProps));

      await act(async () => {
        await result.current.handleClickConfirm();
      });

      expect(mockSetOnMergeComplete).toHaveBeenCalled();

      // Call the callback to test step transition
      act(() => {
        onMergeCompleteCallback!();
      });

      expect(result.current.currentStep).toBe('saveDocument');
    });

    it('should call setOnError callback to log errors', async () => {
      let onErrorCallback: (error: Error) => void;
      const mockSetOnError = jest.fn((cb) => {
        onErrorCallback = cb;
      });

      const { MergeHandler } = getMockedModules();
      MergeHandler.mockImplementation(() => ({
        setItems: jest.fn(),
        setOnMergeItemComplete: jest.fn(),
        setOnMergeComplete: jest.fn(),
        setOnError: mockSetOnError,
        setAbortSignal: jest.fn(),
        setOnSetupPasswordHandler: jest.fn(),
        setOnLoadDocumentComplete: jest.fn(),
        setOnCancelPassword: jest.fn(),
        handle: jest.fn().mockResolvedValue(undefined),
        getResult: jest.fn(),
        getOtherFileSource: jest.fn(() => 'local'),
        getProcessedPdfDoc: jest.fn(() => ({})),
      }));

      const { useValidateDocuments } = require('../useValidateDocuments');
      useValidateDocuments.mockReturnValue({
        shouldBlockMergeProcess: jest.fn().mockResolvedValue(false),
        premiumModalContent: null,
        openedPremiumModal: false,
        openedPremiumModalHandlers: { open: jest.fn(), close: jest.fn(), toggle: jest.fn() },
      });

      const { result } = renderHook(() => useMultipleMergeHandler(defaultProps));

      await act(async () => {
        await result.current.handleClickConfirm();
      });

      expect(mockSetOnError).toHaveBeenCalled();

      // Call the callback to test error logging
      const testError = new Error('Test error');
      act(() => {
        onErrorCallback!(testError);
      });

      const { logger } = getMockedModules();
      expect(logger.logError).toHaveBeenCalled();
    });

    it('should call setOnSetupPasswordHandler callback to open password modal', async () => {
      let onSetupPasswordCallback: (params: { attempt: number; name: string }) => void;
      const mockSetOnSetupPasswordHandler = jest.fn((cb) => {
        onSetupPasswordCallback = cb;
      });

      const { MergeHandler } = getMockedModules();
      MergeHandler.mockImplementation(() => ({
        setItems: jest.fn(),
        setOnMergeItemComplete: jest.fn(),
        setOnMergeComplete: jest.fn(),
        setOnError: jest.fn(),
        setAbortSignal: jest.fn(),
        setOnSetupPasswordHandler: mockSetOnSetupPasswordHandler,
        setOnLoadDocumentComplete: jest.fn(),
        setOnCancelPassword: jest.fn(),
        handle: jest.fn().mockResolvedValue(undefined),
        getResult: jest.fn(),
        getOtherFileSource: jest.fn(() => 'local'),
        getProcessedPdfDoc: jest.fn(() => ({})),
      }));

      const { useValidateDocuments } = require('../useValidateDocuments');
      useValidateDocuments.mockReturnValue({
        shouldBlockMergeProcess: jest.fn().mockResolvedValue(false),
        premiumModalContent: null,
        openedPremiumModal: false,
        openedPremiumModalHandlers: { open: jest.fn(), close: jest.fn(), toggle: jest.fn() },
      });

      const { result } = renderHook(() => useMultipleMergeHandler(defaultProps));

      await act(async () => {
        await result.current.handleClickConfirm();
      });

      expect(mockSetOnSetupPasswordHandler).toHaveBeenCalled();

      // Call the callback
      act(() => {
        onSetupPasswordCallback!({ attempt: 1, name: 'protected.pdf' });
      });

      const { actions } = getMockedModules();
      expect(actions.openElement).toHaveBeenCalled();
      expect(actions.setPasswordProtectedDocumentName).toHaveBeenCalledWith('protected.pdf');
      expect(actions.setPasswordAttempts).toHaveBeenCalledWith(1);
    });

    it('should call setOnLoadDocumentComplete callback to close password modal', async () => {
      let onLoadDocumentCompleteCallback: () => void;
      const mockSetOnLoadDocumentComplete = jest.fn((cb) => {
        onLoadDocumentCompleteCallback = cb;
      });

      const { MergeHandler } = getMockedModules();
      MergeHandler.mockImplementation(() => ({
        setItems: jest.fn(),
        setOnMergeItemComplete: jest.fn(),
        setOnMergeComplete: jest.fn(),
        setOnError: jest.fn(),
        setAbortSignal: jest.fn(),
        setOnSetupPasswordHandler: jest.fn(),
        setOnLoadDocumentComplete: mockSetOnLoadDocumentComplete,
        setOnCancelPassword: jest.fn(),
        handle: jest.fn().mockResolvedValue(undefined),
        getResult: jest.fn(),
        getOtherFileSource: jest.fn(() => 'local'),
        getProcessedPdfDoc: jest.fn(() => ({})),
      }));

      const { useValidateDocuments } = require('../useValidateDocuments');
      useValidateDocuments.mockReturnValue({
        shouldBlockMergeProcess: jest.fn().mockResolvedValue(false),
        premiumModalContent: null,
        openedPremiumModal: false,
        openedPremiumModalHandlers: { open: jest.fn(), close: jest.fn(), toggle: jest.fn() },
      });

      const { result } = renderHook(() => useMultipleMergeHandler(defaultProps));

      await act(async () => {
        await result.current.handleClickConfirm();
      });

      expect(mockSetOnLoadDocumentComplete).toHaveBeenCalled();

      // Call the callback
      act(() => {
        onLoadDocumentCompleteCallback!();
      });

      const { actions } = getMockedModules();
      expect(actions.closeElement).toHaveBeenCalled();
      expect(actions.setPasswordProtectedDocumentName).toHaveBeenCalledWith('');
    });

    it('should call setOnCancelPassword callback to abort controller', async () => {
      let onCancelPasswordCallback: () => void;
      const mockSetOnCancelPassword = jest.fn((cb) => {
        onCancelPasswordCallback = cb;
      });

      const { MergeHandler } = getMockedModules();
      MergeHandler.mockImplementation(() => ({
        setItems: jest.fn(),
        setOnMergeItemComplete: jest.fn(),
        setOnMergeComplete: jest.fn(),
        setOnError: jest.fn(),
        setAbortSignal: jest.fn(),
        setOnSetupPasswordHandler: jest.fn(),
        setOnLoadDocumentComplete: jest.fn(),
        setOnCancelPassword: mockSetOnCancelPassword,
        handle: jest.fn().mockResolvedValue(undefined),
        getResult: jest.fn(),
        getOtherFileSource: jest.fn(() => 'local'),
        getProcessedPdfDoc: jest.fn(() => ({})),
      }));

      const mockAbort = jest.fn();
      mockAbortController.abort = mockAbort;

      const { useValidateDocuments } = require('../useValidateDocuments');
      useValidateDocuments.mockReturnValue({
        shouldBlockMergeProcess: jest.fn().mockResolvedValue(false),
        premiumModalContent: null,
        openedPremiumModal: false,
        openedPremiumModalHandlers: { open: jest.fn(), close: jest.fn(), toggle: jest.fn() },
      });

      const { result } = renderHook(() => useMultipleMergeHandler(defaultProps));

      await act(async () => {
        await result.current.handleClickConfirm();
      });

      expect(mockSetOnCancelPassword).toHaveBeenCalled();

      // Call the callback
      act(() => {
        onCancelPasswordCallback!();
      });

      expect(mockAbort).toHaveBeenCalledWith('User cancel password');
    });
  });

  describe('handleMergeDocuments error handling', () => {
    it('should log error when merge throws exception', async () => {
      const mockError = new Error('Setup error');
      const { MergeHandler } = getMockedModules();
      MergeHandler.mockImplementationOnce(() => {
        throw mockError;
      });

      const { useValidateDocuments } = require('../useValidateDocuments');
      useValidateDocuments.mockReturnValue({
        shouldBlockMergeProcess: jest.fn().mockResolvedValue(false),
        premiumModalContent: null,
        openedPremiumModal: false,
        openedPremiumModalHandlers: { open: jest.fn(), close: jest.fn(), toggle: jest.fn() },
      });

      const { result } = renderHook(() => useMultipleMergeHandler(defaultProps));

      await act(async () => {
        await result.current.handleClickConfirm();
      });

      const { logger } = getMockedModules();
      expect(logger.logError).toHaveBeenCalled();
      expect(mockSetIsLoadingDocument).toHaveBeenCalledWith(false);
    });
  });

  describe('setItems mapping', () => {
    it('should map documents correctly to handler items', async () => {
      const mockSetItems = jest.fn();
      const { MergeHandler } = getMockedModules();
      MergeHandler.mockImplementation(() => ({
        setItems: mockSetItems,
        setOnMergeItemComplete: jest.fn(),
        setOnMergeComplete: jest.fn(),
        setOnError: jest.fn(),
        setAbortSignal: jest.fn(),
        setOnSetupPasswordHandler: jest.fn(),
        setOnLoadDocumentComplete: jest.fn(),
        setOnCancelPassword: jest.fn(),
        handle: jest.fn().mockResolvedValue(undefined),
        getResult: jest.fn(),
        getOtherFileSource: jest.fn(() => 'local'),
        getProcessedPdfDoc: jest.fn(() => ({})),
      }));

      const { useValidateDocuments } = require('../useValidateDocuments');
      useValidateDocuments.mockReturnValue({
        shouldBlockMergeProcess: jest.fn().mockResolvedValue(false),
        premiumModalContent: null,
        openedPremiumModal: false,
        openedPremiumModalHandlers: { open: jest.fn(), close: jest.fn(), toggle: jest.fn() },
      });

      const propsWithFullDocument = {
        ...defaultProps,
        documents: [
          {
            _id: 'doc-1',
            name: 'test.pdf',
            buffer: new ArrayBuffer(8),
            source: 'local',
            pdfDoc: { pages: 5 },
            remoteId: 'remote-123',
          },
        ] as any,
      };

      const { result } = renderHook(() => useMultipleMergeHandler(propsWithFullDocument));

      await act(async () => {
        await result.current.handleClickConfirm();
      });

      expect(mockSetItems).toHaveBeenCalledWith([
        {
          id: 'doc-1',
          buffer: expect.any(ArrayBuffer),
          name: 'test.pdf',
          pdfDoc: { pages: 5 },
          source: 'local',
          remoteId: 'remote-123',
        },
      ]);
    });
  });
});

