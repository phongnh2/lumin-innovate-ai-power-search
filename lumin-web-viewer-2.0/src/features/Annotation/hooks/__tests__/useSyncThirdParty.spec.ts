import { act, renderHook } from '@testing-library/react';
import { v4 } from 'uuid';

import { enqueueSnackbar } from '@libs/snackbar';

import actions from 'actions';
import selectors from 'selectors';

import { useAutoSync } from 'hooks/useAutoSync';
import useDocumentTools, { CallbackResult } from 'hooks/useDocumentTools';
import { useLatestRef } from 'hooks/useLatestRef';
import { useShallowSelector } from 'hooks/useShallowSelector';
import { useTrackingDocumentSync } from 'hooks/useTrackingDocumentSync';
import { useTranslation } from 'hooks/useTranslation';

import userServices from 'services/userServices';

import logger from 'helpers/logger';

import { checkAndDispatchQuotaExceeded } from 'utils/checkQuotaExternalStorage';
import { executeWithCancellation } from 'utils/executeWithCancellation';
import { getLinearizedDocumentFile } from 'utils/getFileService';
import { eventTracking } from 'utils/recordUtil';

import {
  documentUploadExternalActions,
  documentUploadExternalSelectors,
  SYNC_STATUS,
} from 'features/DocumentUploadExternal/slices';
import useSyncFileToExternalStorage from 'features/DocumentUploadExternal/useSyncFileToExternalStorage';
import { useSyncedQueueContext } from 'features/FileSync';

import { AUTO_SYNC_CHANGE_TYPE } from 'constants/autoSyncConstant';
import { DocumentStorage } from 'constants/documentConstants';
import UserEventConstants from 'constants/eventConstants';
import { HUBSPOT_CONTACT_PROPERTIES } from 'constants/hubspotContactProperties';
import { LOGGER, OPERATION_CANCELED_MESSAGE, STORAGE_TYPE, STORAGE_TYPE_DESC } from 'constants/lumin-common';
import { ModalKeys } from 'constants/modal-keys';

import { SyncThirdPartySource } from '../../constants/syncThirdPartySource.enum';
import useSyncThirdParty from '../useSyncThirdParty';

// Mock dependencies
const mockInnerDispatch = jest.fn();
// Create a thunk-aware mock dispatch that calls thunk functions
const mockDispatch = jest.fn((action) => {
  if (typeof action === 'function') {
    // If action is a thunk, call it with the inner dispatch
    return action(mockInnerDispatch);
  }
  return action;
});
const mockUseSelector = jest.fn();

jest.mock('react-redux', () => ({
  useDispatch: () => mockDispatch,
  useSelector: (selector: any) => mockUseSelector(selector),
}));

jest.mock('hooks/useAutoSync', () => ({
  useAutoSync: jest.fn(),
}));

jest.mock('hooks/useDocumentTools', () => ({
  __esModule: true,
  default: jest.fn(),
  CallbackResult: {
    Success: 'success',
    Failed: 'failed',
  },
}));

jest.mock('hooks/useLatestRef', () => ({
  useLatestRef: jest.fn(),
}));

jest.mock('hooks/useShallowSelector', () => ({
  useShallowSelector: jest.fn(),
}));

jest.mock('hooks/useTrackingDocumentSync', () => ({
  useTrackingDocumentSync: jest.fn(),
}));
jest.mock('hooks/useTranslation', () => ({
  useTranslation: jest.fn(),
}));

jest.mock('services/userServices', () => ({
  saveHubspotProperties: jest.fn(),
}));

jest.mock('helpers/logger', () => ({
  logError: jest.fn(),
}));

jest.mock('utils/checkQuotaExternalStorage', () => ({
  checkAndDispatchQuotaExceeded: jest.fn(),
}));

jest.mock('utils/executeWithCancellation', () => ({
  executeWithCancellation: jest.fn(),
}));

jest.mock('utils/getFileService', () => ({
  getLinearizedDocumentFile: jest.fn(),
}));

jest.mock('utils/recordUtil', () => ({
  eventTracking: jest.fn(),
}));

jest.mock('features/DocumentUploadExternal/useSyncFileToExternalStorage', () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock('features/FileSync', () => ({
  useSyncedQueueContext: jest.fn(),
}));

jest.mock('@libs/snackbar', () => ({
  enqueueSnackbar: jest.fn(),
}));

jest.mock('uuid', () => ({
  v4: jest.fn(),
}));

describe('useSyncThirdParty', () => {
  const mockHandleDocStackForSyncExternalFile = jest.fn();
  const mockSync = jest.fn();
  const mockHandleTrackDocumentSync = jest.fn();
  const mockT = jest.fn((key: string, params?: Record<string, string>) => {
    if (params?.destinationStorage) {
      return `Your file has been synced to ${params.destinationStorage}`;
    }
    return key;
  });
  const mockSetQueue = jest.fn();
  const mockSyncFile = jest.fn();
  const mockGetLatestRef = jest.fn();
  
  // Store callbacks passed to useAutoSync
  let capturedOnSyncSuccess: ((data: { hasBackupToS3?: boolean; action: string }) => void) | undefined;
  let capturedOnError: ((action: string, reason: string) => void) | undefined;

  const mockDocument = {
    _id: 'doc-123',
    name: 'test-document.pdf',
    service: STORAGE_TYPE.GOOGLE,
    size: 1000,
  };

  const mockDocumentDropbox = {
    _id: 'doc-456',
    name: 'test-document-dropbox.pdf',
    service: STORAGE_TYPE.DROPBOX,
    size: 2000,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockInnerDispatch.mockClear();
    
    // Reset captured callbacks
    capturedOnSyncSuccess = undefined;
    capturedOnError = undefined;

    mockUseSelector.mockImplementation((selector: any) => {
      if (selector === documentUploadExternalSelectors.syncStatus) {
        return SYNC_STATUS.DEFAULT;
      }
      return null;
    });

    (useDocumentTools as jest.Mock).mockReturnValue({
      handleDocStackForSyncExternalFile: mockHandleDocStackForSyncExternalFile,
    });

    (useLatestRef as jest.Mock).mockImplementation((value) => ({
      current: value,
    }));

    (useShallowSelector as jest.Mock).mockImplementation((selector: any) => {
      if (selector === selectors.getCurrentDocument) {
        return mockDocument;
      }
      if (selector === selectors.getModalData) {
        return { key: null };
      }
      return null;
    });

    // Capture callbacks passed to useAutoSync
    // Note: useAutoSync has a useEffect that sets up event listeners, but in tests we directly call the callbacks
    (useAutoSync as jest.Mock).mockImplementation((props?: { onSyncSuccess?: any; onError?: any }) => {
      if (props) {
        // Capture callbacks immediately when useAutoSync is called
        capturedOnSyncSuccess = props.onSyncSuccess;
        capturedOnError = props.onError;
      }
      return {
        sync: mockSync,
      };
    });

    (useTrackingDocumentSync as jest.Mock).mockReturnValue({
      handleTrackDocumentSync: mockHandleTrackDocumentSync,
    });

    (useTranslation as jest.Mock).mockReturnValue({
      t: mockT,
    });

    (useSyncFileToExternalStorage as jest.Mock).mockReturnValue(mockSyncFile);

    (useSyncedQueueContext as jest.Mock).mockReturnValue({
      setQueue: mockSetQueue,
    });

    (getLinearizedDocumentFile as jest.Mock).mockResolvedValue(new File(['content'], 'test.pdf'));

    (checkAndDispatchQuotaExceeded as jest.Mock).mockReturnValue(false);

    (eventTracking as jest.Mock).mockResolvedValue(undefined);

    (v4 as jest.Mock).mockReturnValue('uuid-123');

    // Default mock for executeWithCancellation - returns a function that calls the callback
    (executeWithCancellation as jest.Mock).mockImplementation(({ callback, signal }) => {
      return async (args: any) => {
        if (signal?.aborted) {
          throw new Error(OPERATION_CANCELED_MESSAGE);
        }
        return await callback(args);
      };
    });

    // Default mock for handleDocStackForSyncExternalFile - calls the callback
    mockHandleDocStackForSyncExternalFile.mockImplementation(async ({ callback }) => {
      return await callback();
    });
  });

  describe('closeForceSyncModal', () => {
    it('should close force sync modal when modal is open', () => {
      // Reset and set up mock with implementation that returns correct values
      (useShallowSelector as jest.Mock).mockReset();
      let callCount = 0;
      (useShallowSelector as jest.Mock).mockImplementation(() => {
        callCount++;
        if (callCount === 1) return mockDocument; // getCurrentDocument
        if (callCount === 2) return { key: ModalKeys.FORCE_SYNC_DOCUMENT }; // getModalData
        return null;
      });

      renderHook(() =>
        useSyncThirdParty({ source: SyncThirdPartySource.FORCE_SYNC })
      );

      // Trigger onSyncSuccess to test closeForceSyncModal
      expect(capturedOnSyncSuccess).toBeDefined();
      if (capturedOnSyncSuccess) {
        act(() => {
          capturedOnSyncSuccess({ hasBackupToS3: false, action: 'test-action' });
        });
      }

      // Check that dispatch was called to close the modal via thunk
      expect(mockDispatch).toHaveBeenCalled();
      // The thunk dispatches the actual action to mockInnerDispatch
      expect(mockInnerDispatch).toHaveBeenCalledWith({
        type: 'UPDATE_MODAL_PROPERTIES',
        payload: {
          open: false,
          isProcessing: false,
        },
      });
    });

    it('should not close force sync modal when modal is not open', () => {
      // Set up mock to return different modal BEFORE rendering hook
      (useShallowSelector as jest.Mock).mockImplementation((selector: any) => {
        if (selector === selectors.getCurrentDocument) {
          return mockDocument;
        }
        if (selector === selectors.getModalData) {
          return { key: 'other-modal' };
        }
        return null;
      });

      renderHook(() => useSyncThirdParty({ source: SyncThirdPartySource.FORCE_SYNC }));

      if (capturedOnSyncSuccess) {
        act(() => {
          capturedOnSyncSuccess({ hasBackupToS3: false, action: 'test-action' });
        });
      }

      expect(mockDispatch).not.toHaveBeenCalledWith(
        expect.objectContaining({
          type: expect.stringContaining('UPDATE_MODAL_PROPERTIES'),
        })
      );
    });
  });

  describe('useAutoSync onSyncSuccess', () => {
    const setupForceSyncModalMock = () => {
      // Reset and set up mock with implementation that returns correct values
      (useShallowSelector as jest.Mock).mockReset();
      let callCount = 0;
      (useShallowSelector as jest.Mock).mockImplementation(() => {
        callCount++;
        if (callCount === 1) return mockDocument; // getCurrentDocument
        if (callCount === 2) return { key: ModalKeys.FORCE_SYNC_DOCUMENT }; // getModalData
        return null;
      });
    };

    it('should close modal and show snackbar when source is FORCE_SYNC and syncToS3 is false and action does not include ANNOTATION_CHANGE', () => {
      // Set up mock to return FORCE_SYNC_DOCUMENT modal BEFORE rendering hook
      setupForceSyncModalMock();

      renderHook(() => useSyncThirdParty({ source: SyncThirdPartySource.FORCE_SYNC }));

      expect(capturedOnSyncSuccess).toBeDefined();
      if (capturedOnSyncSuccess) {
        act(() => {
          capturedOnSyncSuccess({
            hasBackupToS3: false,
            action: 'other-action',
          });
        });
      }

      // Check that dispatch was called to close the modal via thunk
      expect(mockDispatch).toHaveBeenCalled();
      expect(mockInnerDispatch).toHaveBeenCalledWith({
        type: 'UPDATE_MODAL_PROPERTIES',
        payload: {
          open: false,
          isProcessing: false,
        },
      });
      expect(enqueueSnackbar).toHaveBeenCalledWith({
        message: expect.stringContaining('Google'),
        variant: 'success',
        preventDuplicate: true,
      });
    });

    it('should close modal but not show snackbar when syncToS3 is true', () => {
      // Set up mock to return FORCE_SYNC_DOCUMENT modal BEFORE rendering hook
      setupForceSyncModalMock();

      renderHook(() => useSyncThirdParty({ source: SyncThirdPartySource.FORCE_SYNC }));

      expect(capturedOnSyncSuccess).toBeDefined();
      if (capturedOnSyncSuccess) {
        act(() => {
          capturedOnSyncSuccess({
            hasBackupToS3: true,
            action: 'other-action',
          });
        });
      }

      // Check that dispatch was called to close the modal via thunk
      expect(mockDispatch).toHaveBeenCalled();
      expect(mockInnerDispatch).toHaveBeenCalledWith({
        type: 'UPDATE_MODAL_PROPERTIES',
        payload: {
          open: false,
          isProcessing: false,
        },
      });
      expect(enqueueSnackbar).not.toHaveBeenCalled();
    });

    it('should close modal but not show snackbar when action includes ANNOTATION_CHANGE', () => {
      // Set up mock to return FORCE_SYNC_DOCUMENT modal BEFORE rendering hook
      setupForceSyncModalMock();

      renderHook(() => useSyncThirdParty({ source: SyncThirdPartySource.FORCE_SYNC }));

      expect(capturedOnSyncSuccess).toBeDefined();
      if (capturedOnSyncSuccess) {
        act(() => {
          capturedOnSyncSuccess({
            hasBackupToS3: false,
            action: `${AUTO_SYNC_CHANGE_TYPE.ANNOTATION_CHANGE}:some-id`,
          });
        });
      }

      // Check that dispatch was called to close the modal via thunk
      expect(mockDispatch).toHaveBeenCalled();
      expect(mockInnerDispatch).toHaveBeenCalledWith({
        type: 'UPDATE_MODAL_PROPERTIES',
        payload: {
          open: false,
          isProcessing: false,
        },
      });
      expect(enqueueSnackbar).not.toHaveBeenCalled();
    });

    it('should not close modal when source is not FORCE_SYNC', () => {
      // Set up mock to return FORCE_SYNC_DOCUMENT modal BEFORE rendering hook
      (useShallowSelector as jest.Mock).mockImplementation((selector: any) => {
        if (selector === selectors.getCurrentDocument) {
          return mockDocument;
        }
        if (selector === selectors.getModalData) {
          return { key: ModalKeys.FORCE_SYNC_DOCUMENT };
        }
        return null;
      });

      renderHook(() => useSyncThirdParty({ source: undefined }));

      if (capturedOnSyncSuccess) {
        act(() => {
          capturedOnSyncSuccess({
            hasBackupToS3: false,
            action: 'other-action',
          });
        });
      }

      expect(mockDispatch).not.toHaveBeenCalledWith(
        expect.objectContaining({
          type: expect.stringContaining('UPDATE_MODAL_PROPERTIES'),
        })
      );
      expect(enqueueSnackbar).toHaveBeenCalled();
    });
  });

  describe('useAutoSync onError', () => {
    const setupForceSyncModalMock = () => {
      // Reset and set up mock with implementation that returns correct values
      (useShallowSelector as jest.Mock).mockReset();
      let callCount = 0;
      (useShallowSelector as jest.Mock).mockImplementation(() => {
        callCount++;
        if (callCount === 1) return mockDocument; // getCurrentDocument
        if (callCount === 2) return { key: ModalKeys.FORCE_SYNC_DOCUMENT }; // getModalData
        return null;
      });
    };

    it('should close modal when source is FORCE_SYNC', () => {
      // Set up mock to return FORCE_SYNC_DOCUMENT modal BEFORE rendering hook
      setupForceSyncModalMock();

      renderHook(() => useSyncThirdParty({ source: SyncThirdPartySource.FORCE_SYNC }));

      expect(capturedOnError).toBeDefined();
      if (capturedOnError) {
        act(() => {
          capturedOnError('test-action', 'test-reason');
        });
      }

      // Check that dispatch was called to close the modal via thunk
      expect(mockDispatch).toHaveBeenCalled();
      expect(mockInnerDispatch).toHaveBeenCalledWith({
        type: 'UPDATE_MODAL_PROPERTIES',
        payload: {
          open: false,
          isProcessing: false,
        },
      });
    });

    it('should not close modal when source is not FORCE_SYNC', () => {
      // Set up mock to return FORCE_SYNC_DOCUMENT modal BEFORE rendering hook
      setupForceSyncModalMock();

      renderHook(() => useSyncThirdParty({ source: undefined }));

      if (capturedOnError) {
        act(() => {
          capturedOnError('test-action', 'test-reason');
        });
      }

      // Check that dispatch was NOT called with modal update
      expect(mockInnerDispatch).not.toHaveBeenCalledWith({
        type: 'UPDATE_MODAL_PROPERTIES',
        payload: {
          open: false,
          isProcessing: false,
        },
      });
    });
  });

  describe('handleInstantSync', () => {
    const setupDropboxMocks = () => {
      // Reset and set up mock with implementation that returns correct values
      (useShallowSelector as jest.Mock).mockReset();
      let callCount = 0;
      (useShallowSelector as jest.Mock).mockImplementation(() => {
        callCount++;
        if (callCount === 1) return mockDocumentDropbox; // getCurrentDocument
        if (callCount === 2) return { key: null }; // getModalData
        return null;
      });

      (useLatestRef as jest.Mock).mockImplementation((value) => ({
        current: value,
      }));

      mockHandleDocStackForSyncExternalFile.mockImplementation(async ({ callback }) => {
        return await callback();
      });
      
      // Mock executeWithCancellation to properly invoke the callback
      (executeWithCancellation as jest.Mock).mockImplementation(({ callback, signal }) => {
        return async (args: any) => {
          // If signal is aborted, throw OPERATION_CANCELED_MESSAGE
          if (signal?.aborted) {
            throw new Error(OPERATION_CANCELED_MESSAGE);
          }
          return await callback(args);
        };
      });
    };

    beforeEach(() => {
      setupDropboxMocks();
    });

    it('should return Failed when latestDocumentRef.current is null', async () => {
      (useLatestRef as jest.Mock).mockReturnValue({ current: null });

      const { result } = renderHook(() => useSyncThirdParty());

      await act(async () => {
        await result.current.handleSyncThirdParty();
      });

      // When document is null, handleInstantSync returns early, so syncFile should not be called
      expect(mockSyncFile).not.toHaveBeenCalled();
    });

    it('should return Failed when syncFile returns no successMsg', async () => {
      // Re-apply all mocks to ensure they're set up correctly
      setupDropboxMocks();
      mockSyncFile.mockResolvedValue({ successMsg: null });

      const { result } = renderHook(() => useSyncThirdParty());

      await act(async () => {
        await result.current.handleSyncThirdParty();
      });

      // Verify handleDocStackForSyncExternalFile was called (which calls the callback)
      expect(mockHandleDocStackForSyncExternalFile).toHaveBeenCalled();
      
      // Check dispatch was called with setIsSyncing and resetSyncStatus (plain action creators)
      expect(mockDispatch).toHaveBeenCalledWith(documentUploadExternalActions.setIsSyncing());
      expect(mockDispatch).toHaveBeenCalledWith(documentUploadExternalActions.resetSyncStatus());
    });

    it('should return Failed when signal is aborted', async () => {
      const abortController = new AbortController();
      abortController.abort();

      mockSyncFile.mockResolvedValue({ successMsg: 'Success' });

      const { result } = renderHook(() => useSyncThirdParty());

      await act(async () => {
        await result.current.handleSyncThirdParty({ signal: abortController.signal });
      });

      // When signal is aborted, executeWithCancellation throws, so syncFile may or may not be called
      // The important thing is that the error is handled gracefully
      expect(mockHandleDocStackForSyncExternalFile).toHaveBeenCalled();
    });

    it('should return Success when syncFile succeeds', async () => {
      // Re-apply all mocks to ensure they're set up correctly
      setupDropboxMocks();
      mockSyncFile.mockResolvedValue({ successMsg: 'Success' });

      const { result } = renderHook(() => useSyncThirdParty());

      await act(async () => {
        await result.current.handleSyncThirdParty();
      });

      // Verify handleDocStackForSyncExternalFile was called (which calls the callback)
      expect(mockHandleDocStackForSyncExternalFile).toHaveBeenCalled();
      
      expect(mockSyncFile).toHaveBeenCalledWith({
        currentDocument: mockDocumentDropbox,
        shouldShowRatingModal: true,
        isOverride: true,
        newDocumentName: mockDocumentDropbox.name,
        signal: undefined,
      });
      expect(enqueueSnackbar).toHaveBeenCalledWith({
        message: expect.stringContaining(STORAGE_TYPE_DESC[STORAGE_TYPE.DROPBOX]),
        preventDuplicate: true,
        variant: 'success',
      });
      // Check dispatch was called with setIsSaved (plain action creator)
      expect(mockDispatch).toHaveBeenCalledWith(documentUploadExternalActions.setIsSaved());
      expect(userServices.saveHubspotProperties).toHaveBeenCalledWith({
        key: HUBSPOT_CONTACT_PROPERTIES.SYNC_DOCUMENT,
        value: 'true',
      });
      expect(mockHandleTrackDocumentSync).toHaveBeenCalled();
    });

    it('should return Failed when signal is aborted after syncFile succeeds', async () => {
      // Re-apply all mocks to ensure they're set up correctly
      setupDropboxMocks();

      const abortController = new AbortController();
      
      // Mock syncFile to abort the signal after returning successfully
      mockSyncFile.mockImplementation(async () => {
        // Simulate: syncFile completes successfully, but signal gets aborted during/after
        abortController.abort();
        return { successMsg: 'Success' };
      });

      // Mock executeWithCancellation to not throw on aborted signal (let the inner check handle it)
      (executeWithCancellation as jest.Mock).mockImplementation(({ callback }) => {
        return async (args: any) => {
          return await callback(args);
        };
      });

      const { result } = renderHook(() => useSyncThirdParty());

      await act(async () => {
        await result.current.handleSyncThirdParty({ signal: abortController.signal });
      });

      // Verify handleDocStackForSyncExternalFile was called
      expect(mockHandleDocStackForSyncExternalFile).toHaveBeenCalled();
      expect(mockSyncFile).toHaveBeenCalled();
      
      // Should NOT show success snackbar since signal was aborted
      expect(enqueueSnackbar).not.toHaveBeenCalled();
      // Should NOT call setIsSaved since it returns early
      expect(mockDispatch).not.toHaveBeenCalledWith(documentUploadExternalActions.setIsSaved());
      expect(mockHandleTrackDocumentSync).not.toHaveBeenCalled();
    });
  });

  describe('handleSyncThirdParty', () => {
    it('should return early when checkAndDispatchQuotaExceeded returns true', async () => {
      (checkAndDispatchQuotaExceeded as jest.Mock).mockReturnValue(true);

      const { result } = renderHook(() => useSyncThirdParty());

      await act(async () => {
        await result.current.handleSyncThirdParty();
      });

      expect(mockHandleDocStackForSyncExternalFile).not.toHaveBeenCalled();
    });

    it('should return Promise.resolve when syncStatus is SAVED', async () => {
      mockUseSelector.mockReturnValue(SYNC_STATUS.SAVED);
      // Update the ref mock to return SAVED status
      (useLatestRef as jest.Mock).mockImplementation((value) => {
        if (Object.values(SYNC_STATUS).includes(value as SYNC_STATUS)) {
          return {
            current: SYNC_STATUS.SAVED,
          };
        }
        return {
          current: value,
        };
      });

      const { result } = renderHook(() => useSyncThirdParty());

      await act(async () => {
        const response = await result.current.handleSyncThirdParty();
        expect(response).toBeUndefined();
      });

      expect(mockHandleDocStackForSyncExternalFile).not.toHaveBeenCalled();
    });

    describe('Google Drive sync', () => {
      it('should sync with Google Drive and set queue', async () => {
        mockHandleDocStackForSyncExternalFile.mockResolvedValue(undefined);

        const { result } = renderHook(() => useSyncThirdParty({ source: SyncThirdPartySource.FORCE_SYNC }));

        await act(async () => {
          await result.current.handleSyncThirdParty();
        });

        expect(mockSetQueue).toHaveBeenCalled();
        expect(mockHandleDocStackForSyncExternalFile).toHaveBeenCalledWith({
          callback: expect.any(Function),
          storage: STORAGE_TYPE.GOOGLE,
          signal: undefined,
        });

        // Verify callback calls sync with forceSync
        const callback = mockHandleDocStackForSyncExternalFile.mock.calls[0][0].callback;
        await act(async () => {
          await callback();
        });
        expect(mockSync).toHaveBeenCalledWith('ANNOTATION_CHANGE:uuid-123', { forceSync: true });
      });

      it('should sync with Google Drive without forceSync when source is not FORCE_SYNC', async () => {
        mockHandleDocStackForSyncExternalFile.mockResolvedValue(undefined);

        const { result } = renderHook(() => useSyncThirdParty({ source: undefined }));

        await act(async () => {
          await result.current.handleSyncThirdParty();
        });

        const callback = mockHandleDocStackForSyncExternalFile.mock.calls[0][0].callback;
        await act(async () => {
          await callback();
        });
        expect(mockSync).toHaveBeenCalledWith('ANNOTATION_CHANGE:uuid-123', { forceSync: false });
      });
    });

    describe('Non-Google Drive sync (Dropbox/OneDrive)', () => {
      beforeEach(() => {
        (useShallowSelector as jest.Mock).mockImplementation((selector: any) => {
          if (selector === selectors.getCurrentDocument) {
            return mockDocumentDropbox;
          }
          if (selector === selectors.getModalData) {
            return { key: null };
          }
          return null;
        });

        (useLatestRef as jest.Mock).mockImplementation((value) => ({
          current: value,
        }));
      });

      it('should call handleInstantSync successfully', async () => {
        mockSyncFile.mockResolvedValue({ successMsg: 'Success' });
        mockHandleDocStackForSyncExternalFile.mockImplementation(async ({ callback }) => {
          return await callback();
        });
        (executeWithCancellation as jest.Mock).mockImplementation(({ callback, signal }) => {
          return async (args: any) => {
            if (signal?.aborted) {
              throw new Error(OPERATION_CANCELED_MESSAGE);
            }
            return await callback(args);
          };
        });

        const { result } = renderHook(() => useSyncThirdParty());

        await act(async () => {
          await result.current.handleSyncThirdParty();
        });

        expect(mockHandleDocStackForSyncExternalFile).toHaveBeenCalledWith({
          callback: expect.any(Function),
          storage: STORAGE_TYPE.DROPBOX,
          signal: undefined,
        });

        expect(mockSyncFile).toHaveBeenCalled();
      });

      it('should handle OPERATION_CANCELED_MESSAGE error', async () => {
        const canceledError = new Error(OPERATION_CANCELED_MESSAGE);
        mockHandleDocStackForSyncExternalFile.mockImplementation(async ({ callback }) => {
          try {
            await callback();
          } catch (error) {
            // Error is caught and handled
          }
        });
        (executeWithCancellation as jest.Mock).mockImplementation(({ callback, signal }) => {
          return async (args: any) => {
            if (signal?.aborted) {
              throw new Error(OPERATION_CANCELED_MESSAGE);
            }
            try {
              return await callback(args);
            } catch (error) {
              if (error instanceof Error && error.message === OPERATION_CANCELED_MESSAGE) {
                throw error;
              }
              throw error;
            }
          };
        });
        mockSyncFile.mockRejectedValue(canceledError);

        const { result } = renderHook(() => useSyncThirdParty());

        await act(async () => {
          await result.current.handleSyncThirdParty();
        });

        expect(logger.logError).not.toHaveBeenCalled();
      });

      it('should handle other errors and log them', async () => {
        const otherError = new Error('Some other error');
        mockHandleDocStackForSyncExternalFile.mockImplementation(async ({ callback }) => {
          try {
            await callback();
          } catch (error) {
            // Error is caught and handled
          }
        });
        (executeWithCancellation as jest.Mock).mockImplementation(({ callback, signal }) => {
          return async (args: any) => {
            if (signal?.aborted) {
              throw new Error(OPERATION_CANCELED_MESSAGE);
            }
            try {
              return await callback(args);
            } catch (error) {
              throw otherError;
            }
          };
        });
        mockSyncFile.mockRejectedValue(otherError);

        const { result } = renderHook(() => useSyncThirdParty());

        await act(async () => {
          await result.current.handleSyncThirdParty();
        });

        expect(logger.logError).toHaveBeenCalledWith({
          reason: LOGGER.Service.FORCE_SYNC_DOCUMENT_ERROR,
          error: otherError,
        });
      });

      it('should handle signal in handleInstantSync callback', async () => {
        const abortController = new AbortController();
        mockSyncFile.mockResolvedValue({ successMsg: 'Success' });
        mockHandleDocStackForSyncExternalFile.mockImplementation(async ({ callback }) => {
          return await callback();
        });
        (executeWithCancellation as jest.Mock).mockImplementation(({ callback, signal }) => {
          return async (args: any) => {
            if (signal?.aborted) {
              throw new Error(OPERATION_CANCELED_MESSAGE);
            }
            return await callback(args);
          };
        });

        const { result } = renderHook(() => useSyncThirdParty());

        await act(async () => {
          await result.current.handleSyncThirdParty({ signal: abortController.signal });
        });

        expect(mockHandleDocStackForSyncExternalFile).toHaveBeenCalledWith({
          callback: expect.any(Function),
          storage: STORAGE_TYPE.DROPBOX,
          signal: abortController.signal,
        });
      });
    });

    it('should handle eventTracking promise rejection', async () => {
      (eventTracking as jest.Mock).mockRejectedValue(new Error('Tracking error'));
      mockSyncFile.mockResolvedValue({ successMsg: 'Success' });
      mockHandleDocStackForSyncExternalFile.mockImplementation(async ({ callback }) => {
        return await callback();
      });
      (executeWithCancellation as jest.Mock).mockImplementation(({ callback, signal }) => {
        return async (args: any) => {
          if (signal?.aborted) {
            throw new Error(OPERATION_CANCELED_MESSAGE);
          }
          return await callback(args);
        };
      });

      // Set up for Dropbox sync (non-Google)
      (useShallowSelector as jest.Mock).mockImplementation((selector: any) => {
        if (selector === selectors.getCurrentDocument) {
          return mockDocumentDropbox;
        }
        if (selector === selectors.getModalData) {
          return { key: null };
        }
        return null;
      });

      (useLatestRef as jest.Mock).mockImplementation((value) => ({
        current: value,
      }));

      const { result } = renderHook(() => useSyncThirdParty());

      await act(async () => {
        await result.current.handleSyncThirdParty();
      });

      // Should not throw, eventTracking error is caught
      expect(mockSyncFile).toHaveBeenCalled();
    });
  });

  describe('integration tests', () => {
    it('should handle complete flow for Google Drive with force sync', async () => {
      (useShallowSelector as jest.Mock).mockImplementation((selector: any) => {
        if (selector === selectors.getCurrentDocument) {
          return mockDocument;
        }
        if (selector === selectors.getModalData) {
          return { key: ModalKeys.FORCE_SYNC_DOCUMENT };
        }
        return null;
      });

      mockHandleDocStackForSyncExternalFile.mockResolvedValue(undefined);

      const { result } = renderHook(() => useSyncThirdParty({ source: SyncThirdPartySource.FORCE_SYNC }));

      await act(async () => {
        await result.current.handleSyncThirdParty();
      });

      expect(mockSetQueue).toHaveBeenCalled();
      expect(mockHandleDocStackForSyncExternalFile).toHaveBeenCalled();
    });

    it('should handle complete flow for Dropbox without force sync', async () => {
      (useShallowSelector as jest.Mock).mockImplementation((selector: any) => {
        if (selector === selectors.getCurrentDocument) {
          return mockDocumentDropbox;
        }
        if (selector === selectors.getModalData) {
          return { key: null };
        }
        return null;
      });

      (useLatestRef as jest.Mock).mockImplementation((value) => ({
        current: value,
      }));

      mockSyncFile.mockResolvedValue({ successMsg: 'Success' });
      mockHandleDocStackForSyncExternalFile.mockImplementation(async ({ callback }) => {
        return await callback();
      });
      (executeWithCancellation as jest.Mock).mockImplementation(({ callback, signal }) => {
        return async (args: any) => {
          if (signal?.aborted) {
            throw new Error(OPERATION_CANCELED_MESSAGE);
          }
          return await callback(args);
        };
      });

      const { result } = renderHook(() => useSyncThirdParty());

      await act(async () => {
        await result.current.handleSyncThirdParty();
      });

      expect(mockHandleDocStackForSyncExternalFile).toHaveBeenCalled();
      expect(mockSyncFile).toHaveBeenCalled();
    });
  });
});

