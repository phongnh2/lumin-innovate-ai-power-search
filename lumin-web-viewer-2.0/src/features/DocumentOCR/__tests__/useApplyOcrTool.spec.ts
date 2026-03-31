import useApplyOcrTool from '../useApplyOcrTool';

jest.spyOn(console, 'error').mockImplementation(() => {});

jest.mock('helpers/i18n', () => ({
  __esModule: true,
  default: {},
}));

jest.mock('@libs/snackbar', () => ({
  enqueueSnackbar: jest.fn(),
}));

const mockDispatch = jest.fn();
let useAutoSyncCallbacks: { onSyncSuccess?: (params: { action?: string }) => void; onError?: (action?: string) => void } =
  {};

// Shared ref object that can be manipulated in tests
const mockSyncDriveRef = { current: false };
jest.mock('react', () => {
  const actual = jest.requireActual('react');
  return {
    ...actual,
    useRef: jest.fn(() => mockSyncDriveRef),
  };
});

jest.mock('react-redux', () => ({
  useDispatch: jest.fn(() => mockDispatch),
  batch: (fn: () => void) => fn(),
}));

const mockCurrentDocument = { _id: 'doc-id', service: 's3', mimeType: 'application/pdf' };

jest.mock('hooks/useShallowSelector', () => ({
  useShallowSelector: jest.fn(() => mockCurrentDocument),
}));

const mockSync = jest.fn();
jest.mock('hooks/useAutoSync', () => ({
  useAutoSync: jest.fn((callbacks) => {
    useAutoSyncCallbacks = callbacks;
    return { sync: mockSync };
  }),
}));

jest.mock('hooks/useTranslation', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

jest.mock('selectors', () => ({}));

jest.mock('../useShowModal', () => ({
  __esModule: true,
  default: jest.fn(() => ({
    showUnavailableModal: jest.fn(),
    showPromptModal: jest.fn(),
    openLoadingModal: jest.fn(),
  })),
}));

jest.mock('../utils', () => ({
  isValidToApplyOCR: jest.fn(),
  mergeFile: jest.fn(),
  syncFileToS3AfterOCR: jest.fn(),
}));

jest.mock('services/indexedDBService', () => ({
  __esModule: true,
  default: {
    getProfileDataByKey: jest.fn(),
  },
}));

jest.mock('services/documentServices', () => ({
  __esModule: true,
  default: {
    getSignedUrlForOCR: jest.fn(),
    uploadFileToS3: jest.fn(),
  },
}));

const mockPdfDoc = {
  saveMemoryBuffer: jest.fn().mockResolvedValue(new ArrayBuffer(0)),
  destroy: jest.fn(),
  getPageCount: jest.fn().mockResolvedValue(1),
};

jest.mock('core', () => ({
  getTotalPages: jest.fn(() => 1),
  getDocument: jest.fn(() => ({
    getFileData: jest.fn().mockResolvedValue(new ArrayBuffer(0)),
  })),
  runWithCleanup: jest.fn(async (fn) => fn()),
  loadDocument: jest.fn(),
}));

jest.mock('helpers/exportAnnotations', () => jest.fn(() => Promise.resolve('xfdf')));

jest.mock('features/EnableToolFromQueryParams/hooks/useExploringFeature', () => ({
  useCheckExploringFeature: jest.fn(() => false),
}));

jest.mock('features/EnableToolFromQueryParams/constants', () => ({
  PdfAction: {
    OCR: 'OCR',
  },
}));

jest.mock('features/EnableToolFromQueryParams/constants/exploredFeatureKeys', () => ({
  ExploredFeatureKeys: {
    OCR: 'OCR',
  },
}));

let socketOcrCallback: ((data: { preSignedUrl?: string; errorMessage?: string; position: number }) => void) | null =
  null;
jest.mock('../../../socket', () => ({
  socket: {
    emit: jest.fn(),
    on: jest.fn((event: string, callback: typeof socketOcrCallback) => {
      if (event === 'ocr') {
        socketOcrCallback = callback;
      }
    }),
    removeListener: jest.fn(),
  },
}));

jest.mock('features/Outline/utils/outlineCore.utils', () => ({
  OutlineCoreUtils: {
    importOutlinesToDoc: jest.fn(),
  },
}));

jest.mock('constants/urls', () => ({
  ENV: 'dev',
}));

jest.mock('helpers/autoSync', () => ({
  isSyncableFile: jest.fn(() => false),
}));

jest.mock('utils/recordUtil', () => ({
  eventTracking: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('helpers/fireEvent', () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock('helpers/logger', () => ({
  logError: jest.fn(),
}));

jest.mock('actions', () => ({
  __esModule: true,
  default: {
    closeElement: jest.fn(() => ({ type: 'CLOSE_ELEMENT' })),
    resetViewerLoadingModal: jest.fn(() => ({ type: 'RESET_VIEWER_LOADING_MODAL' })),
    setShouldShowOCRBanner: jest.fn(() => ({ type: 'SET_SHOULD_SHOW_OCR_BANNER' })),
    steppingViewerLoadingModal: jest.fn(() => ({ type: 'STEPPING_VIEWER_LOADING_MODAL' })),
  },
}));

jest.mock('features/Annotation/utils/annotationLoadObserver', () => ({
  setAnnotations: jest.fn(),
}));

jest.mock('features/EnableToolFromQueryParams/apis/increaseExploredFeatureUsage', () => ({
  increaseExploredFeatureUsage: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('constants/autoSyncConstant', () => ({
  AUTO_SYNC_CHANGE_TYPE: {
    OCR: 'OCR',
    ANNOTATION_CHANGE: 'ANNOTATION_CHANGE',
  },
}));

jest.mock('constants/documentConstants', () => ({
  documentStorage: {
    s3: 's3',
    google: 'google',
    dropbox: 'dropbox',
  },
}));

jest.mock('constants/dataElement', () => ({
  DataElements: {
    VIEWER_LOADING_MODAL: 'viewerLoadingModal',
  },
}));

jest.mock('constants/eventConstants', () => ({
  __esModule: true,
  default: {
    EventType: {
      OCR_DOCUMENT: 'OCR_DOCUMENT',
    },
  },
}));

jest.mock('constants/lumin-common', () => ({
  LOGGER: {
    Service: {
      APPLY_OCR_DOCUMENT_ERROR: 'APPLY_OCR_DOCUMENT_ERROR',
    },
  },
}));

jest.mock('../constants', () => ({
  OCR_TIMEOUT: 50, // Very short timeout for testing
  maxOCRPages: 200,
  maxOCRFileSize: 30 * 1024 * 1024,
}));

// Mock p-limit to execute immediately
jest.mock('p-limit', () => {
  return () =>
    <T, Args extends unknown[]>(fn: (...args: Args) => T, ...args: Args): T =>
      fn(...args);
});

describe('useApplyOcrTool', () => {
  const useShowModalMock = jest.requireMock('../useShowModal').default as jest.Mock;
  const utils = jest.requireMock('../utils') as jest.Mocked<typeof import('../utils')>;
  const indexedDBService = jest.requireMock('services/indexedDBService').default as {
    getProfileDataByKey: jest.Mock;
  };
  const documentServices = jest.requireMock('services/documentServices').default as {
    getSignedUrlForOCR: jest.Mock;
    uploadFileToS3: jest.Mock;
  };
  const useShallowSelectorMock = jest.requireMock('hooks/useShallowSelector').useShallowSelector as jest.Mock;
  const isSyncableFileMock = jest.requireMock('helpers/autoSync').isSyncableFile as jest.Mock;
  const useCheckExploringFeatureMock = jest.requireMock(
    'features/EnableToolFromQueryParams/hooks/useExploringFeature'
  ).useCheckExploringFeature as jest.Mock;
  const eventTrackingMock = jest.requireMock('utils/recordUtil').eventTracking as jest.Mock;
  const fireEventMock = jest.requireMock('helpers/fireEvent').default as jest.Mock;
  const loggerMock = jest.requireMock('helpers/logger') as { logError: jest.Mock };
  const enqueueSnackbarMock = jest.requireMock('@libs/snackbar').enqueueSnackbar as jest.Mock;
  const socketMock = jest.requireMock('../../../socket').socket as {
    emit: jest.Mock;
    on: jest.Mock;
    removeListener: jest.Mock;
  };
  const coreMock = jest.requireMock('core') as {
    getTotalPages: jest.Mock;
    getDocument: jest.Mock;
    runWithCleanup: jest.Mock;
    loadDocument: jest.Mock;
  };
  const increaseExploredFeatureUsageMock = jest.requireMock(
    'features/EnableToolFromQueryParams/apis/increaseExploredFeatureUsage'
  ).increaseExploredFeatureUsage as jest.Mock;
  const actionsMock = jest.requireMock('actions').default as {
    closeElement: jest.Mock;
    resetViewerLoadingModal: jest.Mock;
    setShouldShowOCRBanner: jest.Mock;
    steppingViewerLoadingModal: jest.Mock;
  };

  beforeEach(() => {
    jest.clearAllMocks();
    enqueueSnackbarMock.mockClear();
    useAutoSyncCallbacks = {};
    socketOcrCallback = null;
    mockSyncDriveRef.current = false; // Reset the shared ref
    useShallowSelectorMock.mockReturnValue({ _id: 'doc-id', service: 's3', mimeType: 'application/pdf' });
    useShowModalMock.mockReturnValue({
      showUnavailableModal: jest.fn(),
      showPromptModal: jest.fn(),
      openLoadingModal: jest.fn(),
    });
    isSyncableFileMock.mockReturnValue(false);
    useCheckExploringFeatureMock.mockReturnValue(false);
    coreMock.getTotalPages.mockReturnValue(1);
  });

  describe('OCR validation', () => {
    it('shows unavailable modal when OCR is not valid', async () => {
      utils.isValidToApplyOCR.mockReturnValue(false);
      const showUnavailableModal = jest.fn();
      useShowModalMock.mockReturnValue({
        showUnavailableModal,
        showPromptModal: jest.fn(),
        openLoadingModal: jest.fn(),
      });

      const apply = useApplyOcrTool();
      await apply();

      expect(showUnavailableModal).toHaveBeenCalledTimes(1);
    });

    it('starts OCR process when OCR is valid', async () => {
      utils.isValidToApplyOCR.mockReturnValue(true);
      indexedDBService.getProfileDataByKey.mockResolvedValue(false);
      const showPromptModal = jest.fn();
      useShowModalMock.mockReturnValue({
        showUnavailableModal: jest.fn(),
        showPromptModal,
        openLoadingModal: jest.fn(),
      });

      const apply = useApplyOcrTool();
      await apply();

      expect(showPromptModal).toHaveBeenCalledTimes(1);
    });
  });

  describe('prompt modal behavior', () => {
    it('prompts user when OCR is valid and prompt not suppressed', async () => {
      utils.isValidToApplyOCR.mockReturnValue(true);
      indexedDBService.getProfileDataByKey.mockResolvedValue(false);
      const showPromptModal = jest.fn();
      useShowModalMock.mockReturnValue({
        showUnavailableModal: jest.fn(),
        showPromptModal,
        openLoadingModal: jest.fn(),
      });

      const apply = useApplyOcrTool();
      await apply();

      expect(showPromptModal).toHaveBeenCalledTimes(1);
      expect(typeof showPromptModal.mock.calls[0][0]).toBe('function');
    });

    it('skips prompt and processes OCR directly when prompt is suppressed', async () => {
      utils.isValidToApplyOCR.mockReturnValue(true);
      indexedDBService.getProfileDataByKey.mockResolvedValue(true);
      const showPromptModal = jest.fn();
      const openLoadingModal = jest.fn();
      useShowModalMock.mockReturnValue({
        showUnavailableModal: jest.fn(),
        showPromptModal,
        openLoadingModal,
      });

      documentServices.getSignedUrlForOCR.mockResolvedValue({
        key: 'test-key',
        listSignedUrls: ['url1'],
      });
      documentServices.uploadFileToS3.mockResolvedValue(undefined);
      coreMock.runWithCleanup.mockResolvedValue(new ArrayBuffer(10));

      // Mock PDFNet
      (window as unknown as { Core: unknown }).Core = {
        PDFNet: {
          PDFDoc: {
            create: jest.fn().mockResolvedValue(mockPdfDoc),
            createFromBuffer: jest.fn().mockResolvedValue(mockPdfDoc),
            InsertFlag: { e_none: 0 },
          },
          SDFDoc: {
            SaveOptions: { e_remove_unused: 0, e_linearized: 0 },
          },
        },
        SaveOptions: { INCREMENTAL: 0 },
      };

      const apply = useApplyOcrTool();
      await apply();

      expect(showPromptModal).not.toHaveBeenCalled();
      expect(openLoadingModal).toHaveBeenCalled();
    });
  });

  describe('onSyncSuccess callback', () => {
    beforeEach(() => {
      utils.isValidToApplyOCR.mockReturnValue(true);
      indexedDBService.getProfileDataByKey.mockResolvedValue(false);
      useShowModalMock.mockReturnValue({
        showUnavailableModal: jest.fn(),
        showPromptModal: jest.fn(),
        openLoadingModal: jest.fn(),
      });
    });

    it('returns early when action is undefined', () => {
      useApplyOcrTool();

      useAutoSyncCallbacks.onSyncSuccess?.({ action: undefined });

      expect(eventTrackingMock).not.toHaveBeenCalled();
    });

    it('returns early when action does not include OCR', () => {
      useApplyOcrTool();

      useAutoSyncCallbacks.onSyncSuccess?.({ action: 'ANNOTATION_CHANGE' });

      expect(eventTrackingMock).not.toHaveBeenCalled();
    });

    it('returns early when isSyncDriveRef.current is false', () => {
      useApplyOcrTool();

      // isSyncDriveRef.current is initialized as false
      useAutoSyncCallbacks.onSyncSuccess?.({ action: 'OCR' });

      expect(eventTrackingMock).not.toHaveBeenCalled();
    });

    it('executes event tracking and closes modal when all conditions are met', () => {
      useApplyOcrTool();

      // Manually set the ref to simulate a completed sync drive operation
      mockSyncDriveRef.current = true;

      // Trigger onSyncSuccess callback with OCR action
      useAutoSyncCallbacks.onSyncSuccess?.({ action: 'OCR' });

      expect(eventTrackingMock).toHaveBeenCalled();
      expect(actionsMock.closeElement).toHaveBeenCalled();
      expect(mockSyncDriveRef.current).toBe(false); // Should be reset to false
    });
  });

  describe('onError callback', () => {
    beforeEach(() => {
      utils.isValidToApplyOCR.mockReturnValue(true);
      indexedDBService.getProfileDataByKey.mockResolvedValue(false);
      useShowModalMock.mockReturnValue({
        showUnavailableModal: jest.fn(),
        showPromptModal: jest.fn(),
        openLoadingModal: jest.fn(),
      });
    });

    it('returns early when action is undefined', () => {
      useApplyOcrTool();

      useAutoSyncCallbacks.onError?.(undefined);

      expect(actionsMock.closeElement).not.toHaveBeenCalled();
    });

    it('returns early when action does not include OCR', () => {
      useApplyOcrTool();

      useAutoSyncCallbacks.onError?.('ANNOTATION_CHANGE');

      expect(actionsMock.closeElement).not.toHaveBeenCalled();
    });

    it('returns early when isSyncDriveRef.current is false', () => {
      useApplyOcrTool();

      // isSyncDriveRef.current is initialized as false
      useAutoSyncCallbacks.onError?.('OCR');

      expect(actionsMock.closeElement).not.toHaveBeenCalled();
    });

    it('closes modal when all conditions are met', () => {
      useApplyOcrTool();

      // Manually set the ref to simulate a sync drive operation in progress
      mockSyncDriveRef.current = true;

      // Trigger onError callback with OCR action
      useAutoSyncCallbacks.onError?.('OCR');

      expect(actionsMock.closeElement).toHaveBeenCalled();
      expect(mockSyncDriveRef.current).toBe(false); // Should be reset to false
    });
  });

  describe('processOCR error handling', () => {
    beforeEach(() => {
      utils.isValidToApplyOCR.mockReturnValue(true);
      indexedDBService.getProfileDataByKey.mockResolvedValue(true);
      const openLoadingModal = jest.fn();
      useShowModalMock.mockReturnValue({
        showUnavailableModal: jest.fn(),
        showPromptModal: jest.fn(),
        openLoadingModal,
      });
    });

    it('handles error during OCR process and shows error toast', async () => {
      documentServices.getSignedUrlForOCR.mockRejectedValue(new Error('Network error'));

      const apply = useApplyOcrTool();
      await apply();

      expect(loggerMock.logError).toHaveBeenCalled();
      expect(enqueueSnackbarMock).toHaveBeenCalledWith({
        message: 'common.somethingWentWrong',
        variant: 'error',
      });
    });

    it('closes loading modal in finally block for s3 service', async () => {
      useShallowSelectorMock.mockReturnValue({ _id: 'doc-id', service: 's3' });
      documentServices.getSignedUrlForOCR.mockRejectedValue(new Error('Error'));

      const apply = useApplyOcrTool();
      await apply();

      expect(actionsMock.closeElement).toHaveBeenCalled();
    });

    it('does not close loading modal in finally block for non-s3 service', async () => {
      useShallowSelectorMock.mockReturnValue({ _id: 'doc-id', service: 'google' });
      documentServices.getSignedUrlForOCR.mockRejectedValue(new Error('Error'));

      const apply = useApplyOcrTool();
      await apply();

      // closeElement is called in catch block but not in finally for non-s3
      expect(actionsMock.closeElement).toHaveBeenCalledTimes(1);
    });
  });

  describe('handleSuccess branches', () => {
    const setupSuccessfulOCR = () => {
      utils.isValidToApplyOCR.mockReturnValue(true);
      indexedDBService.getProfileDataByKey.mockResolvedValue(true);
      const openLoadingModal = jest.fn();
      useShowModalMock.mockReturnValue({
        showUnavailableModal: jest.fn(),
        showPromptModal: jest.fn(),
        openLoadingModal,
      });

      documentServices.getSignedUrlForOCR.mockResolvedValue({
        key: 'test-key',
        listSignedUrls: ['url1'],
      });
      documentServices.uploadFileToS3.mockResolvedValue(undefined);

      const mockResultPdfDoc = {
        saveMemoryBuffer: jest.fn().mockResolvedValue(new ArrayBuffer(10)),
        destroy: jest.fn(),
        getPageCount: jest.fn().mockResolvedValue(1),
      };

      const mockChunkPdfDoc = {
        getPageCount: jest.fn().mockResolvedValue(1),
        destroy: jest.fn(),
      };

      (window as unknown as { Core: unknown }).Core = {
        PDFNet: {
          PDFDoc: {
            create: jest.fn().mockResolvedValue(mockResultPdfDoc),
            createFromBuffer: jest.fn().mockResolvedValue(mockPdfDoc),
            createFromURL: jest.fn().mockResolvedValue(mockChunkPdfDoc),
            InsertFlag: { e_none: 0 },
          },
          SDFDoc: {
            SaveOptions: { e_remove_unused: 0, e_linearized: 0 },
          },
        },
        SaveOptions: { INCREMENTAL: 0 },
      };

      coreMock.runWithCleanup.mockResolvedValue(new ArrayBuffer(10));
      coreMock.loadDocument.mockResolvedValue(undefined);
      utils.mergeFile.mockResolvedValue(undefined);
      utils.syncFileToS3AfterOCR.mockResolvedValue(undefined);

      return { mockResultPdfDoc, mockChunkPdfDoc };
    };

    it('syncs to S3 and fires refetchDocument event for s3 service', async () => {
      setupSuccessfulOCR();
      useShallowSelectorMock.mockReturnValue({ _id: 'doc-id', service: 's3' });

      const apply = useApplyOcrTool();
      const applyPromise = apply();

      // Wait for socket listener to be set up
      await new Promise((resolve) => setTimeout(resolve, 10));

      // Simulate OCR completion via socket
      if (socketOcrCallback) {
        await socketOcrCallback({ preSignedUrl: 'https://example.com/ocr-result.pdf', position: 1 });
      }

      await applyPromise;

      expect(utils.syncFileToS3AfterOCR).toHaveBeenCalled();
      expect(fireEventMock).toHaveBeenCalledWith('refetchDocument');
      expect(eventTrackingMock).toHaveBeenCalled();
    });

    it('calls sync for syncable files (drive storage)', async () => {
      setupSuccessfulOCR();
      useShallowSelectorMock.mockReturnValue({ _id: 'doc-id', service: 'google', mimeType: 'application/pdf' });
      isSyncableFileMock.mockReturnValue(true);

      const apply = useApplyOcrTool();
      const applyPromise = apply();

      await new Promise((resolve) => setTimeout(resolve, 10));

      if (socketOcrCallback) {
        await socketOcrCallback({ preSignedUrl: 'https://example.com/ocr-result.pdf', position: 1 });
      }

      await applyPromise;

      expect(mockSync).toHaveBeenCalledWith('OCR');
    });

    it('does not call sync for non-syncable files', async () => {
      setupSuccessfulOCR();
      useShallowSelectorMock.mockReturnValue({ _id: 'doc-id', service: 'google' });
      isSyncableFileMock.mockReturnValue(false);

      const apply = useApplyOcrTool();
      const applyPromise = apply();

      await new Promise((resolve) => setTimeout(resolve, 10));

      if (socketOcrCallback) {
        await socketOcrCallback({ preSignedUrl: 'https://example.com/ocr-result.pdf', position: 1 });
      }

      await applyPromise;

      expect(mockSync).not.toHaveBeenCalled();
    });

    it('increases explored feature usage when exploring feature is enabled', async () => {
      setupSuccessfulOCR();
      useShallowSelectorMock.mockReturnValue({ _id: 'doc-id', service: 's3' });
      useCheckExploringFeatureMock.mockReturnValue(true);

      const apply = useApplyOcrTool();
      const applyPromise = apply();

      await new Promise((resolve) => setTimeout(resolve, 10));

      if (socketOcrCallback) {
        await socketOcrCallback({ preSignedUrl: 'https://example.com/ocr-result.pdf', position: 1 });
      }

      await applyPromise;

      expect(increaseExploredFeatureUsageMock).toHaveBeenCalled();
    });

    it('does not increase explored feature usage when not exploring', async () => {
      setupSuccessfulOCR();
      useShallowSelectorMock.mockReturnValue({ _id: 'doc-id', service: 's3' });
      useCheckExploringFeatureMock.mockReturnValue(false);

      const apply = useApplyOcrTool();
      const applyPromise = apply();

      await new Promise((resolve) => setTimeout(resolve, 10));

      if (socketOcrCallback) {
        await socketOcrCallback({ preSignedUrl: 'https://example.com/ocr-result.pdf', position: 1 });
      }

      await applyPromise;

      expect(increaseExploredFeatureUsageMock).not.toHaveBeenCalled();
    });
  });

  describe('socket OCR handling', () => {
    it('accumulates PDF docs until all parts received', async () => {
      utils.isValidToApplyOCR.mockReturnValue(true);
      indexedDBService.getProfileDataByKey.mockResolvedValue(true);
      useShowModalMock.mockReturnValue({
        showUnavailableModal: jest.fn(),
        showPromptModal: jest.fn(),
        openLoadingModal: jest.fn(),
      });

      // Configure for 2 parts
      documentServices.getSignedUrlForOCR.mockResolvedValue({
        key: 'test-key',
        listSignedUrls: ['url1', 'url2'],
      });
      documentServices.uploadFileToS3.mockResolvedValue(undefined);
      coreMock.getTotalPages.mockReturnValue(40); // 40 pages = 2 parts (20 pages each)

      const mockChunkPdfDoc = {
        getPageCount: jest.fn().mockResolvedValue(20),
        destroy: jest.fn(),
      };
      const mockResultPdfDoc = {
        saveMemoryBuffer: jest.fn().mockResolvedValue(new ArrayBuffer(10)),
        destroy: jest.fn(),
      };

      (window as unknown as { Core: unknown }).Core = {
        PDFNet: {
          PDFDoc: {
            create: jest.fn().mockResolvedValue(mockResultPdfDoc),
            createFromBuffer: jest.fn().mockResolvedValue(mockPdfDoc),
            createFromURL: jest.fn().mockResolvedValue(mockChunkPdfDoc),
            InsertFlag: { e_none: 0 },
          },
          SDFDoc: {
            SaveOptions: { e_remove_unused: 0, e_linearized: 0 },
          },
        },
        SaveOptions: { INCREMENTAL: 0 },
      };
      coreMock.runWithCleanup.mockResolvedValue(new ArrayBuffer(10));
      coreMock.loadDocument.mockResolvedValue(undefined);
      utils.mergeFile.mockResolvedValue(undefined);
      utils.syncFileToS3AfterOCR.mockResolvedValue(undefined);

      const apply = useApplyOcrTool();
      const applyPromise = apply();

      await new Promise((resolve) => setTimeout(resolve, 10));

      // Send first part - should not complete yet
      if (socketOcrCallback) {
        await socketOcrCallback({ preSignedUrl: 'https://example.com/part1.pdf', position: 1 });
      }

      await new Promise((resolve) => setTimeout(resolve, 5));

      // mergeFile should not be called yet (only 1 of 2 parts)
      expect(utils.mergeFile).not.toHaveBeenCalled();

      // Send second part - should complete
      if (socketOcrCallback) {
        await socketOcrCallback({ preSignedUrl: 'https://example.com/part2.pdf', position: 2 });
      }

      await applyPromise;

      expect(utils.mergeFile).toHaveBeenCalled();
    });

    it('handles socket callback error and rejects promise', async () => {
      utils.isValidToApplyOCR.mockReturnValue(true);
      indexedDBService.getProfileDataByKey.mockResolvedValue(true);
      useShowModalMock.mockReturnValue({
        showUnavailableModal: jest.fn(),
        showPromptModal: jest.fn(),
        openLoadingModal: jest.fn(),
      });

      documentServices.getSignedUrlForOCR.mockResolvedValue({
        key: 'test-key',
        listSignedUrls: ['url1'],
      });
      documentServices.uploadFileToS3.mockResolvedValue(undefined);

      (window as unknown as { Core: unknown }).Core = {
        PDFNet: {
          PDFDoc: {
            create: jest.fn().mockResolvedValue(mockPdfDoc),
            createFromBuffer: jest.fn().mockResolvedValue(mockPdfDoc),
            createFromURL: jest.fn().mockRejectedValue(new Error('Failed to load PDF')),
            InsertFlag: { e_none: 0 },
          },
          SDFDoc: {
            SaveOptions: { e_remove_unused: 0, e_linearized: 0 },
          },
        },
        SaveOptions: { INCREMENTAL: 0 },
      };
      coreMock.runWithCleanup.mockResolvedValue(new ArrayBuffer(10));

      const apply = useApplyOcrTool();
      const applyPromise = apply();

      await new Promise((resolve) => setTimeout(resolve, 10));

      if (socketOcrCallback) {
        await socketOcrCallback({ preSignedUrl: 'https://example.com/invalid.pdf', position: 1 });
      }

      // Should handle error gracefully
      await applyPromise;

      expect(loggerMock.logError).toHaveBeenCalled();
      expect(socketMock.removeListener).toHaveBeenCalled();
    });
  });

  describe('OCR timeout', () => {
    it('rejects with timeout error when OCR takes too long', async () => {
      utils.isValidToApplyOCR.mockReturnValue(true);
      indexedDBService.getProfileDataByKey.mockResolvedValue(true);
      useShowModalMock.mockReturnValue({
        showUnavailableModal: jest.fn(),
        showPromptModal: jest.fn(),
        openLoadingModal: jest.fn(),
      });

      documentServices.getSignedUrlForOCR.mockResolvedValue({
        key: 'test-key',
        listSignedUrls: ['url1'],
      });
      documentServices.uploadFileToS3.mockResolvedValue(undefined);

      (window as unknown as { Core: unknown }).Core = {
        PDFNet: {
          PDFDoc: {
            create: jest.fn().mockResolvedValue(mockPdfDoc),
            createFromBuffer: jest.fn().mockResolvedValue(mockPdfDoc),
            InsertFlag: { e_none: 0 },
          },
          SDFDoc: {
            SaveOptions: { e_remove_unused: 0, e_linearized: 0 },
          },
        },
        SaveOptions: { INCREMENTAL: 0 },
      };
      coreMock.runWithCleanup.mockResolvedValue(new ArrayBuffer(10));

      const apply = useApplyOcrTool();

      // Don't send any socket callback - let it timeout (50ms mock timeout)
      await apply();

      expect(loggerMock.logError).toHaveBeenCalled();
      expect(socketMock.removeListener).toHaveBeenCalled();
    }, 10000);
  });

  describe('splitFileAndUploadToS3', () => {
    it('handles multi-page documents with pagination', async () => {
      utils.isValidToApplyOCR.mockReturnValue(true);
      indexedDBService.getProfileDataByKey.mockResolvedValue(true);
      useShowModalMock.mockReturnValue({
        showUnavailableModal: jest.fn(),
        showPromptModal: jest.fn(),
        openLoadingModal: jest.fn(),
      });

      // 45 pages = 3 parts (20 + 20 + 5)
      coreMock.getTotalPages.mockReturnValue(45);

      documentServices.getSignedUrlForOCR.mockResolvedValue({
        key: 'test-key',
        listSignedUrls: ['url1', 'url2', 'url3'],
      });
      documentServices.uploadFileToS3.mockResolvedValue(undefined);

      const mockResultPdfDoc = {
        saveMemoryBuffer: jest.fn().mockResolvedValue(new ArrayBuffer(10)),
        destroy: jest.fn(),
      };
      const mockChunkPdfDoc = {
        getPageCount: jest.fn().mockResolvedValue(15),
        destroy: jest.fn(),
      };
      const mockTempPdfDoc = {
        insertPages: jest.fn().mockResolvedValue(undefined),
        saveMemoryBuffer: jest.fn().mockResolvedValue(new ArrayBuffer(10)),
      };

      (window as unknown as { Core: unknown }).Core = {
        PDFNet: {
          PDFDoc: {
            create: jest.fn().mockResolvedValue(mockTempPdfDoc),
            createFromBuffer: jest.fn().mockResolvedValue(mockPdfDoc),
            createFromURL: jest.fn().mockResolvedValue(mockChunkPdfDoc),
            InsertFlag: { e_none: 0 },
          },
          SDFDoc: {
            SaveOptions: { e_remove_unused: 0, e_linearized: 0 },
          },
        },
        SaveOptions: { INCREMENTAL: 0 },
      };

      // Make runWithCleanup actually execute the function to cover lines 100-108
      coreMock.runWithCleanup.mockImplementation(async (fn: () => Promise<unknown>) => fn());
      coreMock.loadDocument.mockResolvedValue(undefined);
      utils.mergeFile.mockResolvedValue(undefined);
      utils.syncFileToS3AfterOCR.mockResolvedValue(undefined);

      const apply = useApplyOcrTool();
      const applyPromise = apply();

      await new Promise((resolve) => setTimeout(resolve, 10));

      // Send all 3 parts
      if (socketOcrCallback) {
        await socketOcrCallback({ preSignedUrl: 'https://example.com/part1.pdf', position: 1 });
        await socketOcrCallback({ preSignedUrl: 'https://example.com/part2.pdf', position: 2 });
        await socketOcrCallback({ preSignedUrl: 'https://example.com/part3.pdf', position: 3 });
      }

      await applyPromise;

      // Should upload 3 parts
      expect(documentServices.uploadFileToS3).toHaveBeenCalledTimes(3);
      expect(socketMock.emit).toHaveBeenCalledWith('ocr', { fileName: 'test-key' });
      // Verify runWithCleanup was called (which executes the inner function)
      expect(coreMock.runWithCleanup).toHaveBeenCalled();
      expect(mockTempPdfDoc.insertPages).toHaveBeenCalled();
    }, 10000);
  });
});
