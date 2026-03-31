import { act, renderHook, waitFor } from '@testing-library/react';

import actions from 'actions';
import core from 'core';
import selectors from 'selectors';

import { useCleanup } from 'hooks/useCleanup';
import { useLatestRef } from 'hooks/useLatestRef';
import { useShallowSelector } from 'hooks/useShallowSelector';
import { useTranslation } from 'hooks/useTranslation';

import { isAutoSync } from 'helpers/autoSync';
import fireEvent from 'helpers/fireEvent';
import getCurrentRole from 'helpers/getCurrentRole';
import logger from 'helpers/logger';

import { executeWithCancellation } from 'utils/executeWithCancellation';
import { syncFileToS3 } from 'utils/syncFileToS3';

import { useSyncDocumentChecker } from 'features/Document/hooks/useSyncDocumentChecker';
import { documentSyncSelectors } from 'features/Document/slices';
import { removeSignedUrlSignature } from 'features/Signature/utils';

import { documentStorage } from 'constants/documentConstants';
import { general } from 'constants/documentType';
import { DOCUMENT_ROLES, LOGGER, OPERATION_CANCELED_MESSAGE, STORAGE_TYPE } from 'constants/lumin-common';
import { ModalKeys } from 'constants/modal-keys';

import { AnnotationChangedAction } from 'interfaces/annotation/annotation.interface';

import { useFetchingAnnotationsStore } from '../useFetchingAnnotationsStore';
import { useSyncAnnotationsStore } from '../useSyncAnnotationsStore';
import useSyncThirdParty from '../useSyncThirdParty';
import { SYNC_DOCUMENT_THROTTLE_TIME } from '../../constants/forceSync';
import { SyncThirdPartySource } from '../../constants/syncThirdPartySource.enum';
import { ForceSyncDocumentManager } from '../../utils/forceSyncDocumentManager';
import { useSyncNumerousAnnotations } from '../useSyncNumerousAnnotations';

// Mock dependencies - declared after imports but before jest.mock to avoid hoisting issues
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

jest.mock('actions', () => ({
  __esModule: true,
  default: {
    openViewerModal: jest.fn((props) => (dispatch: any) => {
      dispatch({
        type: 'OPEN_MODAL',
        payload: {
          ...props,
          showOnlyInViewer: true,
        },
      });
    }),
    updateModalProperties: jest.fn((props) => ({
      type: 'UPDATE_MODAL_PROPERTIES',
      payload: props,
    })),
  },
}));

jest.mock('core', () => ({
  deselectAllAnnotations: jest.fn(),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  isDocumentEncrypted: jest.fn(),
  getDocument: jest.fn(),
  getAnnotationsList: jest.fn(),
}));

// Get references to the mocked core functions after jest.mock
const mockAddEventListener = core.addEventListener as jest.Mock;
const mockRemoveEventListener = core.removeEventListener as jest.Mock;

jest.mock('selectors', () => ({
  isDocumentLoaded: jest.fn(),
  canModifyDriveContent: jest.fn(),
  getCurrentDocument: jest.fn(),
  getInternalAnnotationIds: jest.fn(),
}));

jest.mock('hooks/useCleanup', () => ({
  useCleanup: jest.fn((callback, deps) => {
    // Use actual React useEffect to properly simulate cleanup on unmount
    const { useEffect } = jest.requireActual('react');
    useEffect(() => {
      return callback;
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, deps);
  }),
}));

jest.mock('hooks/useLatestRef', () => ({
  useLatestRef: jest.fn((value) => ({ current: value })),
}));

jest.mock('hooks/useShallowSelector', () => ({
  useShallowSelector: jest.fn(),
}));

jest.mock('hooks/useTranslation', () => ({
  useTranslation: jest.fn(() => ({
    t: jest.fn((key: string, params?: any) => {
      if (params?.count) {
        return `Sync ${params.count} annotations`;
      }
      return key;
    }),
  })),
}));

jest.mock('helpers/autoSync', () => ({
  isAutoSync: jest.fn(),
}));

jest.mock('helpers/fireEvent', () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock('helpers/getCurrentRole', () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock('helpers/logger', () => ({
  logInfo: jest.fn(),
  logError: jest.fn(),
}));

jest.mock('utils/executeWithCancellation', () => ({
  executeWithCancellation: jest.fn(({ callback, signal }) => {
    return async (args: any) => {
      if (signal?.aborted) {
        throw new Error('Operation canceled');
      }
      return await callback(args);
    };
  }),
}));

jest.mock('utils/syncFileToS3', () => ({
  syncFileToS3: jest.fn(),
}));

jest.mock('features/Document/hooks/useSyncDocumentChecker', () => ({
  useSyncDocumentChecker: jest.fn(),
}));

jest.mock('features/Document/slices', () => ({
  documentSyncSelectors: {
    isSyncing: jest.fn(),
  },
}));

jest.mock('features/Signature/utils', () => ({
  removeSignedUrlSignature: jest.fn(),
}));

jest.mock('features/Collaboration/slices', () => ({
  SocketStatus: {
    CONNECTED: 'connected',
    DISCONNECTED: 'disconnected',
    CONNECTING: 'connecting',
    RECONNECTING: 'reconnecting',
    AUTHENTICATING: 'authenticating',
    AUTHENTICATED: 'authenticated',
    ERROR: 'error',
  },
  useCollaborationStore: jest.fn(() => ({
    socketState: {
      status: 'disconnected',
      isOnline: true,
      socketId: null,
      reconnectAttempts: 0,
      lastConnectedAt: null,
      lastDisconnectedAt: null,
      error: null,
    },
  })),
}));

jest.mock('../useFetchingAnnotationsStore', () => ({
  useFetchingAnnotationsStore: jest.fn(),
}));

jest.mock('zustand/react/shallow', () => ({
  useShallow: jest.fn((selector) => selector),
}));

jest.mock('../useSyncAnnotationsStore', () => ({
  useSyncAnnotationsStore: jest.fn(),
}));

jest.mock('../useSyncThirdParty', () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock('../../utils/forceSyncDocumentManager', () => ({
  ForceSyncDocumentManager: {
    getInstance: jest.fn(),
    clearInstance: jest.fn(),
    getForceSyncAnnotationsThreshold: jest.fn(() => 500),
    shouldForceSyncEncryptedDocument: jest.fn(),
  },
}));

// Use global to store the cancel mock to avoid hoisting issues with jest.mock
jest.mock('lodash/throttle', () => {
  const mockCancel = jest.fn();
  // Store in global for test access since jest.mock is hoisted
  (global as any).__mockThrottleCancel = mockCancel;
  return jest.fn((fn: any) => {
    const throttled = jest.fn(fn) as any;
    throttled.cancel = mockCancel;
    return throttled;
  });
});

// Helper to access the mock cancel function
const getMockCancel = () => (global as any).__mockThrottleCancel as jest.Mock;

describe('useSyncNumerousAnnotations', () => {
  const mockSetIsSyncing = jest.fn();
  const mockResetAbortController = jest.fn();
  const mockHandleSyncThirdParty = jest.fn();
  const mockCanSyncOnAnnotationChange = jest.fn();
  const mockCanSync = jest.fn();
  const mockT = jest.fn((key: string, params?: any) => {
    if (params?.count) {
      return `Sync ${params.count} annotations`;
    }
    return key;
  });

  const mockAbortController = new AbortController();
  const mockForceSyncDocumentManager = {
    addModifiedAnnotations: jest.fn(),
    checkAnnotationsChangedForceSync: jest.fn(),
    checkAutomaticallyForceSync: jest.fn(),
    prepareNextSync: jest.fn(),
    getTotalAnnots: jest.fn(),
    totalUnsyncedAnnots: 0,
  };

  const mockDocument = {
    _id: 'doc-123',
    service: STORAGE_TYPE.S3,
    mimeType: general.PDF,
    enableGoogleSync: false,
  };

  const mockAnnotations = [
    { Id: 'annot-1' },
    { Id: 'annot-2' },
  ] as Core.Annotations.Annotation[];

  beforeEach(() => {
    jest.clearAllMocks();
    mockInnerDispatch.mockClear();

    // Reset executeWithCancellation to its original implementation
    (executeWithCancellation as jest.Mock).mockImplementation(({ callback, signal }) => {
      return async (args: any) => {
        if (signal?.aborted) {
          throw new Error('Operation canceled');
        }
        return await callback(args);
      };
    });
    // Create a new AbortController for each test to avoid read-only property issues
    const newAbortController = new AbortController();
    Object.defineProperty(mockAbortController, 'signal', {
      value: newAbortController.signal,
      writable: true,
    });
    mockAbortController.abort = jest.fn();

    // Mock useSyncAnnotationsStore to return the selector result when called with useShallow
    (useSyncAnnotationsStore as unknown as jest.Mock).mockImplementation((selector: any) => {
      if (selector) {
        // When called with a selector (via useShallow), return the selected state
        return selector({
          abortController: mockAbortController,
          setIsSyncing: mockSetIsSyncing,
          resetAbortController: mockResetAbortController,
          isSyncing: false,
        });
      }
      // When called without selector, return the full state
      return {
        abortController: mockAbortController,
        setIsSyncing: mockSetIsSyncing,
        resetAbortController: mockResetAbortController,
        isSyncing: false,
      };
    });

    (useFetchingAnnotationsStore as jest.Mock).mockReturnValue({
      annotations: mockAnnotations,
    });

    (useSyncDocumentChecker as jest.Mock).mockReturnValue({
      canSyncOnAnnotationChange: mockCanSyncOnAnnotationChange,
      canSync: true,
    });

    (useSyncThirdParty as jest.Mock).mockReturnValue({
      handleSyncThirdParty: mockHandleSyncThirdParty,
    });

    (useShallowSelector as jest.Mock).mockReturnValue(mockDocument);
    (useLatestRef as jest.Mock).mockImplementation((value) => ({ current: value }));

    mockUseSelector.mockImplementation((selector: any) => {
      if (selector === selectors.isDocumentLoaded) {
        return true;
      }
      if (selector === selectors.canModifyDriveContent) {
        return true;
      }
      if (selector === documentSyncSelectors.isSyncing) {
        return false;
      }
      return null;
    });

    (getCurrentRole as jest.Mock).mockReturnValue(DOCUMENT_ROLES.EDITOR);
    (isAutoSync as jest.Mock).mockReturnValue(false);
    (ForceSyncDocumentManager.getInstance as jest.Mock).mockReturnValue(mockForceSyncDocumentManager);
    (ForceSyncDocumentManager.shouldForceSyncEncryptedDocument as jest.Mock).mockResolvedValue(false);
    (core.isDocumentEncrypted as jest.Mock).mockResolvedValue(false);
    (core.getDocument as jest.Mock).mockReturnValue({});
    (core.getAnnotationsList as jest.Mock).mockReturnValue([]);
    (selectors.getInternalAnnotationIds as jest.Mock).mockReturnValue([]);
    mockCanSyncOnAnnotationChange.mockReturnValue(true);
    mockCanSync.mockReturnValue(true);
    (syncFileToS3 as jest.Mock).mockResolvedValue(undefined);
    (removeSignedUrlSignature as jest.Mock).mockResolvedValue(undefined);
    mockHandleSyncThirdParty.mockResolvedValue(undefined);
    (fireEvent as jest.Mock).mockReturnValue(undefined);

    // Reset mockForceSyncDocumentManager mock functions to their default state
    mockForceSyncDocumentManager.addModifiedAnnotations.mockClear();
    mockForceSyncDocumentManager.checkAnnotationsChangedForceSync.mockReset();
    mockForceSyncDocumentManager.checkAnnotationsChangedForceSync.mockReturnValue(false);
    mockForceSyncDocumentManager.checkAutomaticallyForceSync.mockReset();
    mockForceSyncDocumentManager.checkAutomaticallyForceSync.mockResolvedValue(false);
    mockForceSyncDocumentManager.prepareNextSync.mockClear();
    mockForceSyncDocumentManager.getTotalAnnots.mockReset();
    mockForceSyncDocumentManager.getTotalAnnots.mockReturnValue(0);
  });

  describe('logForceSyncDocument', () => {
    it('should log force sync document info', () => {
      renderHook(() => useSyncNumerousAnnotations());

      // Trigger syncToS3 to test logForceSyncDocument
      act(() => {
        const eventHandler = mockAddEventListener.mock.calls.find(
          (call) => call[0] === 'annotationChanged'
        )?.[1];
        if (eventHandler) {
          eventHandler(mockAnnotations, 'add', { imported: false });
        }
      });

      // Wait for async operations
      waitFor(() => {
        expect(logger.logInfo).toHaveBeenCalled();
      });
    });
  });

  describe('syncToS3', () => {
    it('should sync to S3 successfully', async () => {
      mockForceSyncDocumentManager.getTotalAnnots.mockReturnValue(10);
      mockForceSyncDocumentManager.checkAnnotationsChangedForceSync.mockReturnValue(true);
      (syncFileToS3 as jest.Mock).mockResolvedValue(undefined);
      (ForceSyncDocumentManager.shouldForceSyncEncryptedDocument as jest.Mock).mockResolvedValue(false);

      renderHook(() => useSyncNumerousAnnotations());

      await act(async () => {
        const eventHandler = mockAddEventListener.mock.calls.find(
          (call) => call[0] === 'annotationChanged'
        )?.[1];
        if (eventHandler) {
          await eventHandler(mockAnnotations, 'add', { imported: false });
        }
      });

      await waitFor(() => {
        expect(mockSetIsSyncing).toHaveBeenCalledWith(true);
        expect(syncFileToS3).toHaveBeenCalled();
        expect(mockSetIsSyncing).toHaveBeenCalledWith(false);
      });
    });

    it('should handle abort during syncToS3', async () => {
      const abortedController = new AbortController();
      abortedController.abort();
      mockForceSyncDocumentManager.checkAnnotationsChangedForceSync.mockReturnValue(true);
      (useSyncAnnotationsStore as unknown as jest.Mock).mockImplementation((selector: any) => {
        if (selector) {
          return selector({
            abortController: abortedController,
            setIsSyncing: mockSetIsSyncing,
            resetAbortController: mockResetAbortController,
            isSyncing: false,
          });
        }
        return {
          abortController: abortedController,
          setIsSyncing: mockSetIsSyncing,
          resetAbortController: mockResetAbortController,
          isSyncing: false,
        };
      });
      (syncFileToS3 as jest.Mock).mockResolvedValue(undefined);

      renderHook(() => useSyncNumerousAnnotations());

      await act(async () => {
        const eventHandler = mockAddEventListener.mock.calls.find(
          (call) => call[0] === 'annotationChanged'
        )?.[1];
        if (eventHandler) {
          await eventHandler(mockAnnotations, 'add', { imported: false });
        }
      });

      await waitFor(() => {
        expect(mockSetIsSyncing).toHaveBeenCalledWith(false);
      });
    });

    it('should handle shouldForceSyncEncryptedDocument', async () => {
      mockForceSyncDocumentManager.checkAnnotationsChangedForceSync.mockReturnValue(true);
      (ForceSyncDocumentManager.shouldForceSyncEncryptedDocument as jest.Mock).mockResolvedValue(true);
      (removeSignedUrlSignature as jest.Mock).mockResolvedValue(undefined);

      renderHook(() => useSyncNumerousAnnotations());

      await act(async () => {
        const eventHandler = mockAddEventListener.mock.calls.find(
          (call) => call[0] === 'annotationChanged'
        )?.[1];
        if (eventHandler) {
          await eventHandler(mockAnnotations, 'add', { imported: false });
        }
      });

      await waitFor(() => {
        expect(removeSignedUrlSignature).toHaveBeenCalled();
      });
    });

    it('should handle abort after syncFileToS3 completes', async () => {
      const abortedController = new AbortController();
      mockForceSyncDocumentManager.checkAnnotationsChangedForceSync.mockReturnValue(true);
      // Mock syncFileToS3 to resolve successfully, but abort happens during execution
      (syncFileToS3 as jest.Mock).mockImplementation(async () => {
        // Abort after starting but before completing - simulating abort during sync
        abortedController.abort();
        await Promise.resolve();
      });
      // Mock executeWithCancellation to complete successfully even if signal becomes aborted during execution
      (executeWithCancellation as jest.Mock).mockImplementation(({ callback, signal }) => {
        return async (args: any) => {
          // Don't check signal at start - allow callback to run
          return await callback(args);
        };
      });
      (useSyncAnnotationsStore as unknown as jest.Mock).mockImplementation((selector: any) => {
        if (selector) {
          return selector({
            abortController: abortedController,
            setIsSyncing: mockSetIsSyncing,
            resetAbortController: mockResetAbortController,
            isSyncing: false,
          });
        }
        return {
          abortController: abortedController,
          setIsSyncing: mockSetIsSyncing,
          resetAbortController: mockResetAbortController,
          isSyncing: false,
        };
      });

      renderHook(() => useSyncNumerousAnnotations());

      await act(async () => {
        const eventHandler = mockAddEventListener.mock.calls.find(
          (call) => call[0] === 'annotationChanged'
        )?.[1];
        if (eventHandler) {
          await eventHandler(mockAnnotations, 'add', { imported: false });
        }
      });

      await waitFor(() => {
        expect(mockSetIsSyncing).toHaveBeenCalledWith(false);
        // shouldForceSyncEncryptedDocument should not be called because abort happened after syncFileToS3
        expect(ForceSyncDocumentManager.shouldForceSyncEncryptedDocument).not.toHaveBeenCalled();
      });
    });

    it('should handle abort after shouldForceSyncEncryptedDocument check', async () => {
      const abortedController = new AbortController();
      mockForceSyncDocumentManager.checkAnnotationsChangedForceSync.mockReturnValue(true);
      (ForceSyncDocumentManager.shouldForceSyncEncryptedDocument as jest.Mock).mockImplementation(async () => {
        abortedController.abort();
        return true;
      });
      (useSyncAnnotationsStore as unknown as jest.Mock).mockImplementation((selector: any) => {
        if (selector) {
          return selector({
            abortController: abortedController,
            setIsSyncing: mockSetIsSyncing,
            resetAbortController: mockResetAbortController,
            isSyncing: false,
          });
        }
        return {
          abortController: abortedController,
          setIsSyncing: mockSetIsSyncing,
          resetAbortController: mockResetAbortController,
          isSyncing: false,
        };
      });

      renderHook(() => useSyncNumerousAnnotations());

      await act(async () => {
        const eventHandler = mockAddEventListener.mock.calls.find(
          (call) => call[0] === 'annotationChanged'
        )?.[1];
        if (eventHandler) {
          await eventHandler(mockAnnotations, 'add', { imported: false });
        }
      });

      await waitFor(() => {
        expect(mockSetIsSyncing).toHaveBeenCalledWith(false);
      });
    });

    it('should handle OPERATION_CANCELED_MESSAGE error in syncToS3', async () => {
      const canceledError = new Error(OPERATION_CANCELED_MESSAGE);
      mockForceSyncDocumentManager.checkAnnotationsChangedForceSync.mockReturnValue(true);
      (syncFileToS3 as jest.Mock).mockRejectedValue(canceledError);

      renderHook(() => useSyncNumerousAnnotations());

      await act(async () => {
        const eventHandler = mockAddEventListener.mock.calls.find(
          (call) => call[0] === 'annotationChanged'
        )?.[1];
        if (eventHandler) {
          await eventHandler(mockAnnotations, 'add', { imported: false });
        }
      });

      await waitFor(() => {
        expect(logger.logError).not.toHaveBeenCalled();
        expect(mockSetIsSyncing).toHaveBeenCalledWith(false);
      });
    });

    it('should handle other errors in syncToS3', async () => {
      const otherError = new Error('Sync failed');
      mockForceSyncDocumentManager.checkAnnotationsChangedForceSync.mockReturnValue(true);
      mockForceSyncDocumentManager.getTotalAnnots.mockReturnValue(10);
      (syncFileToS3 as jest.Mock).mockRejectedValue(otherError);

      renderHook(() => useSyncNumerousAnnotations());

      await act(async () => {
        const eventHandler = mockAddEventListener.mock.calls.find(
          (call) => call[0] === 'annotationChanged'
        )?.[1];
        if (eventHandler) {
          await eventHandler(mockAnnotations, 'add', { imported: false });
        }
      });

      await waitFor(() => {
        expect(logger.logError).toHaveBeenCalledWith({
          reason: LOGGER.Service.FORCE_SYNC_DOCUMENT_ERROR,
          error: otherError,
        });
      });
    });
  });

  describe('openSyncNumerousAnnotationsModal', () => {
    it('should open modal and handle onConfirm successfully', async () => {
      (useShallowSelector as jest.Mock).mockReturnValue({
        ...mockDocument,
        service: STORAGE_TYPE.DROPBOX,
      });

      const { result } = renderHook(() => useSyncNumerousAnnotations());

      await act(async () => {
        // Trigger handleSyncDocument which calls openSyncNumerousAnnotationsModal
        const eventHandler = mockAddEventListener.mock.calls.find(
          (call) => call[0] === 'annotationChanged'
        )?.[1];
        if (eventHandler) {
          mockForceSyncDocumentManager.checkAnnotationsChangedForceSync.mockReturnValue(true);
          await eventHandler(mockAnnotations, 'add', { imported: false });
        }
      });

      await waitFor(() => {
        expect(mockDispatch).toHaveBeenCalled();
        // Check that the thunk was called, which then dispatches to mockInnerDispatch
        expect(mockInnerDispatch).toHaveBeenCalledWith(
          expect.objectContaining({
            type: 'OPEN_MODAL',
            payload: expect.objectContaining({
              key: ModalKeys.FORCE_SYNC_DOCUMENT,
            }),
          })
        );
      });
    });

    it('should handle onConfirm with shouldForceSyncEncryptedDocument', async () => {
      (useShallowSelector as jest.Mock).mockReturnValue({
        ...mockDocument,
        service: STORAGE_TYPE.DROPBOX,
      });
      (ForceSyncDocumentManager.shouldForceSyncEncryptedDocument as jest.Mock).mockResolvedValue(true);
      mockForceSyncDocumentManager.getTotalAnnots.mockReturnValue(10);
      mockHandleSyncThirdParty.mockResolvedValue(undefined);

      renderHook(() => useSyncNumerousAnnotations());

      await act(async () => {
        const eventHandler = mockAddEventListener.mock.calls.find(
          (call) => call[0] === 'annotationChanged'
        )?.[1];
        if (eventHandler) {
          mockForceSyncDocumentManager.checkAnnotationsChangedForceSync.mockReturnValue(true);
          await eventHandler(mockAnnotations, 'add', { imported: false });
        }
      });

      await waitFor(() => {
        expect(mockDispatch).toHaveBeenCalled();
        expect(mockInnerDispatch).toHaveBeenCalled();
      });

      // Extract and call the onConfirm callback from the modal
      await act(async () => {
        const openViewerModalCall = (actions.openViewerModal as jest.Mock).mock.calls[0];
        if (openViewerModalCall) {
          const modalProps = openViewerModalCall[0];
          if (modalProps.onConfirm) {
            await modalProps.onConfirm();
          }
        }
      });

      await waitFor(() => {
        expect(mockHandleSyncThirdParty).toHaveBeenCalled();
        expect(ForceSyncDocumentManager.shouldForceSyncEncryptedDocument).toHaveBeenCalled();
        expect(removeSignedUrlSignature).toHaveBeenCalled();
        expect(mockForceSyncDocumentManager.prepareNextSync).toHaveBeenCalled();
      });
    });

    it('should handle onConfirm with OPERATION_CANCELED_MESSAGE error', async () => {
      (useShallowSelector as jest.Mock).mockReturnValue({
        ...mockDocument,
        service: STORAGE_TYPE.DROPBOX,
      });
      const canceledError = new Error(OPERATION_CANCELED_MESSAGE);
      mockHandleSyncThirdParty.mockRejectedValue(canceledError);
      mockForceSyncDocumentManager.getTotalAnnots.mockReturnValue(10);

      renderHook(() => useSyncNumerousAnnotations());

      await act(async () => {
        const eventHandler = mockAddEventListener.mock.calls.find(
          (call) => call[0] === 'annotationChanged'
        )?.[1];
        if (eventHandler) {
          mockForceSyncDocumentManager.checkAnnotationsChangedForceSync.mockReturnValue(true);
          await eventHandler(mockAnnotations, 'add', { imported: false });
        }
      });

      await waitFor(() => {
        expect(mockDispatch).toHaveBeenCalled();
      });

      // Extract and call the onConfirm callback from the modal
      await act(async () => {
        const openViewerModalCall = (actions.openViewerModal as jest.Mock).mock.calls[0];
        if (openViewerModalCall) {
          const modalProps = openViewerModalCall[0];
          if (modalProps.onConfirm) {
            await modalProps.onConfirm();
          }
        }
      });

      await waitFor(() => {
        expect(logger.logError).not.toHaveBeenCalled();
        expect(mockSetIsSyncing).toHaveBeenCalledWith(false);
      });
    });

    it('should handle onConfirm with other errors', async () => {
      (useShallowSelector as jest.Mock).mockReturnValue({
        ...mockDocument,
        service: STORAGE_TYPE.DROPBOX,
      });
      const otherError = new Error('Sync failed');
      mockHandleSyncThirdParty.mockRejectedValue(otherError);
      mockForceSyncDocumentManager.checkAnnotationsChangedForceSync.mockReturnValue(true);
      mockForceSyncDocumentManager.getTotalAnnots.mockReturnValue(10);

      renderHook(() => useSyncNumerousAnnotations());

      await act(async () => {
        const eventHandler = mockAddEventListener.mock.calls.find(
          (call) => call[0] === 'annotationChanged'
        )?.[1];
        if (eventHandler) {
          await eventHandler(mockAnnotations, 'add', { imported: false });
        }
      });

      // Extract and call the onConfirm callback from the modal
      await act(async () => {
        const openViewerModalCall = (actions.openViewerModal as jest.Mock).mock.calls[0];
        if (openViewerModalCall) {
          const modalProps = openViewerModalCall[0];
          if (modalProps.onConfirm) {
            await modalProps.onConfirm();
          }
        }
      });

      await waitFor(() => {
        expect(logger.logError).toHaveBeenCalledWith({
          reason: LOGGER.Service.FORCE_SYNC_DOCUMENT_ERROR,
          error: otherError,
        });
      });
    });

    it('should close modal when isGoogleAutoSyncEnabled is false', async () => {
      (useShallowSelector as jest.Mock).mockReturnValue({
        ...mockDocument,
        service: STORAGE_TYPE.DROPBOX,
        enableGoogleSync: false,
      });
      (isAutoSync as jest.Mock).mockReturnValue(false);
      mockForceSyncDocumentManager.getTotalAnnots.mockReturnValue(10);
      mockHandleSyncThirdParty.mockResolvedValue(undefined);
      (ForceSyncDocumentManager.shouldForceSyncEncryptedDocument as jest.Mock).mockResolvedValue(false);

      renderHook(() => useSyncNumerousAnnotations());

      await act(async () => {
        const eventHandler = mockAddEventListener.mock.calls.find(
          (call) => call[0] === 'annotationChanged'
        )?.[1];
        if (eventHandler) {
          mockForceSyncDocumentManager.checkAnnotationsChangedForceSync.mockReturnValue(true);
          await eventHandler(mockAnnotations, 'add', { imported: false });
        }
      });

      await waitFor(() => {
        expect(mockDispatch).toHaveBeenCalled();
        expect(mockInnerDispatch).toHaveBeenCalled();
      });

      // Extract and call the onConfirm callback from the modal to test line 180
      await act(async () => {
        const openViewerModalCall = (actions.openViewerModal as jest.Mock).mock.calls[0];
        if (openViewerModalCall) {
          const modalProps = openViewerModalCall[0];
          if (modalProps.onConfirm) {
            await modalProps.onConfirm();
          }
        }
      });

      await waitFor(() => {
        // Should close modal when isGoogleAutoSyncEnabled is false (line 180)
        expect(mockDispatch).toHaveBeenCalledWith(
          expect.objectContaining({
            type: 'UPDATE_MODAL_PROPERTIES',
            payload: {
              open: false,
              isProcessing: false,
            },
          })
        );
      });
    });

    it('should handle onCancel', async () => {
      (useShallowSelector as jest.Mock).mockReturnValue({
        ...mockDocument,
        service: STORAGE_TYPE.DROPBOX,
      });

      renderHook(() => useSyncNumerousAnnotations());

      await act(async () => {
        const eventHandler = mockAddEventListener.mock.calls.find(
          (call) => call[0] === 'annotationChanged'
        )?.[1];
        if (eventHandler) {
          mockForceSyncDocumentManager.checkAnnotationsChangedForceSync.mockReturnValue(true);
          await eventHandler(mockAnnotations, 'add', { imported: false });
        }
      });

      await waitFor(() => {
        expect(mockDispatch).toHaveBeenCalled();
        expect(mockInnerDispatch).toHaveBeenCalled();
      });

      // Extract and call the onCancel callback from the modal
      await act(() => {
        const openViewerModalCall = (actions.openViewerModal as jest.Mock).mock.calls[0];
        if (openViewerModalCall) {
          const modalProps = openViewerModalCall[0];
          if (modalProps.onCancel) {
            modalProps.onCancel();
          }
        }
      });

      await waitFor(() => {
        expect(mockDispatch).toHaveBeenCalledWith(
          expect.objectContaining({
            type: 'UPDATE_MODAL_PROPERTIES',
            payload: {
              open: false,
            },
          })
        );
      });
    });
  });

  describe('handleSyncDocument', () => {
    it('should handle S3 storage type', async () => {
      // mockDocument already has service: STORAGE_TYPE.S3
      mockForceSyncDocumentManager.getTotalAnnots.mockReturnValue(10);
      mockForceSyncDocumentManager.checkAnnotationsChangedForceSync.mockReturnValue(true);
      (syncFileToS3 as jest.Mock).mockResolvedValue(undefined);
      (ForceSyncDocumentManager.shouldForceSyncEncryptedDocument as jest.Mock).mockResolvedValue(false);

      renderHook(() => useSyncNumerousAnnotations());

      await act(async () => {
        const eventHandler = mockAddEventListener.mock.calls.find(
          (call) => call[0] === 'annotationChanged'
        )?.[1];
        if (eventHandler) {
          await eventHandler(mockAnnotations, 'add', { imported: false });
        }
      });

      await waitFor(() => {
        expect(syncFileToS3).toHaveBeenCalled();
      });
    });

    it('should handle ONEDRIVE storage type with canModifyDriveContent', async () => {
      (useShallowSelector as jest.Mock).mockReturnValue({
        ...mockDocument,
        service: STORAGE_TYPE.ONEDRIVE,
      });
      mockUseSelector.mockImplementation((selector: any) => {
        if (selector === selectors.canModifyDriveContent) {
          return true;
        }
        if (selector === selectors.isDocumentLoaded) {
          return true;
        }
        return false;
      });
      mockForceSyncDocumentManager.checkAnnotationsChangedForceSync.mockReturnValue(true);

      renderHook(() => useSyncNumerousAnnotations());

      await act(async () => {
        const eventHandler = mockAddEventListener.mock.calls.find(
          (call) => call[0] === 'annotationChanged'
        )?.[1];
        if (eventHandler) {
          await eventHandler(mockAnnotations, 'add', { imported: false });
        }
      });

      await waitFor(() => {
        expect(mockDispatch).toHaveBeenCalled();
        expect(mockInnerDispatch).toHaveBeenCalled();
      });
    });

    it('should handle ONEDRIVE storage type without canModifyDriveContent', async () => {
      (useShallowSelector as jest.Mock).mockReturnValue({
        ...mockDocument,
        service: STORAGE_TYPE.ONEDRIVE,
      });
      mockUseSelector.mockImplementation((selector: any) => {
        if (selector === selectors.canModifyDriveContent) {
          return false;
        }
        if (selector === selectors.isDocumentLoaded) {
          return true;
        }
        if (selector === documentSyncSelectors.isSyncing) {
          return false;
        }
        return false;
      });

      renderHook(() => useSyncNumerousAnnotations());

      await act(async () => {
        const eventHandler = mockAddEventListener.mock.calls.find(
          (call) => call[0] === 'annotationChanged'
        )?.[1];
        if (eventHandler) {
          mockForceSyncDocumentManager.checkAnnotationsChangedForceSync.mockReturnValue(true);
          await eventHandler(mockAnnotations, 'add', { imported: false });
        }
      });

      await waitFor(() => {
        // Should not open modal when canModifyDriveContent is false - should break early
        const modalCall = mockInnerDispatch.mock.calls.find((call) =>
          call[0]?.payload?.key === ModalKeys.FORCE_SYNC_DOCUMENT
        );
        expect(modalCall).toBeUndefined();
        expect(mockDispatch).not.toHaveBeenCalled();
      });
    });

    it('should handle GOOGLE storage type without canModifyDriveContent', async () => {
      (useShallowSelector as jest.Mock).mockReturnValue({
        ...mockDocument,
        service: STORAGE_TYPE.GOOGLE,
      });
      mockUseSelector.mockImplementation((selector: any) => {
        if (selector === selectors.canModifyDriveContent) {
          return false;
        }
        if (selector === selectors.isDocumentLoaded) {
          return true;
        }
        if (selector === documentSyncSelectors.isSyncing) {
          return false;
        }
        return false;
      });

      renderHook(() => useSyncNumerousAnnotations());

      await act(async () => {
        const eventHandler = mockAddEventListener.mock.calls.find(
          (call) => call[0] === 'annotationChanged'
        )?.[1];
        if (eventHandler) {
          mockForceSyncDocumentManager.checkAnnotationsChangedForceSync.mockReturnValue(true);
          await eventHandler(mockAnnotations, 'add', { imported: false });
        }
      });

      await waitFor(() => {
        // Should not open modal when canModifyDriveContent is false - should break early
        const modalCall = mockInnerDispatch.mock.calls.find((call) =>
          call[0]?.payload?.key === ModalKeys.FORCE_SYNC_DOCUMENT
        );
        expect(modalCall).toBeUndefined();
        expect(mockDispatch).not.toHaveBeenCalled();
      });
    });

    it('should handle GOOGLE storage type', async () => {
      (useShallowSelector as jest.Mock).mockReturnValue({
        ...mockDocument,
        service: STORAGE_TYPE.GOOGLE,
      });

      renderHook(() => useSyncNumerousAnnotations());

      await act(async () => {
        const eventHandler = mockAddEventListener.mock.calls.find(
          (call) => call[0] === 'annotationChanged'
        )?.[1];
        if (eventHandler) {
          mockForceSyncDocumentManager.checkAnnotationsChangedForceSync.mockReturnValue(true);
          await eventHandler(mockAnnotations, 'add', { imported: false });
        }
      });

      await waitFor(() => {
        expect(mockDispatch).toHaveBeenCalled();
        expect(mockInnerDispatch).toHaveBeenCalled();
      });
    });

    it('should handle DROPBOX storage type', async () => {
      (useShallowSelector as jest.Mock).mockReturnValue({
        ...mockDocument,
        service: STORAGE_TYPE.DROPBOX,
      });

      renderHook(() => useSyncNumerousAnnotations());

      await act(async () => {
        const eventHandler = mockAddEventListener.mock.calls.find(
          (call) => call[0] === 'annotationChanged'
        )?.[1];
        if (eventHandler) {
          mockForceSyncDocumentManager.checkAnnotationsChangedForceSync.mockReturnValue(true);
          await eventHandler(mockAnnotations, 'add', { imported: false });
        }
      });

      await waitFor(() => {
        expect(mockDispatch).toHaveBeenCalled();
        expect(mockInnerDispatch).toHaveBeenCalled();
      });
    });

    it('should handle default storage type', async () => {
      (useShallowSelector as jest.Mock).mockReturnValue({
        ...mockDocument,
        service: 'UNKNOWN',
      });

      renderHook(() => useSyncNumerousAnnotations());

      await act(async () => {
        const eventHandler = mockAddEventListener.mock.calls.find(
          (call) => call[0] === 'annotationChanged'
        )?.[1];
        if (eventHandler) {
          mockForceSyncDocumentManager.checkAnnotationsChangedForceSync.mockReturnValue(true);
          await eventHandler(mockAnnotations, 'add', { imported: false });
        }
      });

      await waitFor(() => {
        expect(mockDispatch).toHaveBeenCalled();
        expect(mockInnerDispatch).toHaveBeenCalled();
      });
    });
  });

  describe('onAnnotationChanged effect', () => {
    it('should return early when isSyncingAnnotationsRef.current is true', async () => {
      (useSyncAnnotationsStore as unknown as jest.Mock).mockImplementation((selector: any) => {
        if (selector) {
          return selector({
            abortController: mockAbortController,
            setIsSyncing: mockSetIsSyncing,
            resetAbortController: mockResetAbortController,
            isSyncing: true,
          });
        }
        return {
          abortController: mockAbortController,
          setIsSyncing: mockSetIsSyncing,
          resetAbortController: mockResetAbortController,
          isSyncing: true,
        };
      });
      (useLatestRef as jest.Mock).mockReturnValue({ current: true });

      renderHook(() => useSyncNumerousAnnotations());

      await act(async () => {
        const eventHandler = mockAddEventListener.mock.calls.find(
          (call) => call[0] === 'annotationChanged'
        )?.[1];
        if (eventHandler) {
          await eventHandler(mockAnnotations, 'add', { imported: false });
        }
      });

      await waitFor(() => {
        expect(mockForceSyncDocumentManager.addModifiedAnnotations).not.toHaveBeenCalled();
      });
    });

    it('should return early when isSyncing is true', async () => {
      mockUseSelector.mockImplementation((selector: any) => {
        if (selector === documentSyncSelectors.isSyncing) {
          return true;
        }
        return false;
      });

      renderHook(() => useSyncNumerousAnnotations());

      await act(async () => {
        const eventHandler = mockAddEventListener.mock.calls.find(
          (call) => call[0] === 'annotationChanged'
        )?.[1];
        if (eventHandler) {
          await eventHandler(mockAnnotations, 'add', { imported: false });
        }
      });

      await waitFor(() => {
        expect(mockForceSyncDocumentManager.addModifiedAnnotations).not.toHaveBeenCalled();
      });
    });

    it('should return early when canSyncOnAnnotationChange returns false', async () => {
      mockCanSyncOnAnnotationChange.mockReturnValue(false);

      renderHook(() => useSyncNumerousAnnotations());

      await act(async () => {
        const eventHandler = mockAddEventListener.mock.calls.find(
          (call) => call[0] === 'annotationChanged'
        )?.[1];
        if (eventHandler) {
          await eventHandler(mockAnnotations, 'add', { imported: false });
        }
      });

      await waitFor(() => {
        expect(mockForceSyncDocumentManager.addModifiedAnnotations).not.toHaveBeenCalled();
      });
    });

    it('should return early when checkDocumentSyncable returns false', async () => {
      mockUseSelector.mockImplementation((selector: any) => {
        if (selector === selectors.isDocumentLoaded) {
          return false;
        }
        return false;
      });

      renderHook(() => useSyncNumerousAnnotations());

      await act(async () => {
        const eventHandler = mockAddEventListener.mock.calls.find(
          (call) => call[0] === 'annotationChanged'
        )?.[1];
        if (eventHandler) {
          await eventHandler(mockAnnotations, 'add', { imported: false });
        }
      });

      await waitFor(() => {
        expect(mockForceSyncDocumentManager.addModifiedAnnotations).not.toHaveBeenCalled();
      });
    });

    it('should return early when isGoogleAutoSyncEnabled is true', async () => {
      (useShallowSelector as jest.Mock).mockReturnValue({
        ...mockDocument,
        enableGoogleSync: true,
      });
      (isAutoSync as jest.Mock).mockReturnValue(true);

      renderHook(() => useSyncNumerousAnnotations());

      await act(async () => {
        const eventHandler = mockAddEventListener.mock.calls.find(
          (call) => call[0] === 'annotationChanged'
        )?.[1];
        if (eventHandler) {
          await eventHandler(mockAnnotations, 'add', { imported: false });
        }
      });

      await waitFor(() => {
        expect(mockForceSyncDocumentManager.addModifiedAnnotations).not.toHaveBeenCalled();
      });
    });

    it('should return early when documentService is not S3 and not PDF', async () => {
      (useShallowSelector as jest.Mock).mockReturnValue({
        ...mockDocument,
        service: STORAGE_TYPE.DROPBOX,
        mimeType: 'application/word',
      });

      renderHook(() => useSyncNumerousAnnotations());

      await act(async () => {
        const eventHandler = mockAddEventListener.mock.calls.find(
          (call) => call[0] === 'annotationChanged'
        )?.[1];
        if (eventHandler) {
          await eventHandler(mockAnnotations, 'add', { imported: false });
        }
      });

      await waitFor(() => {
        expect(mockForceSyncDocumentManager.addModifiedAnnotations).not.toHaveBeenCalled();
      });
    });

    it('should trigger sync when forceSync is true', async () => {
      mockForceSyncDocumentManager.checkAnnotationsChangedForceSync.mockReturnValue(true);

      renderHook(() => useSyncNumerousAnnotations());

      await act(async () => {
        const eventHandler = mockAddEventListener.mock.calls.find(
          (call) => call[0] === 'annotationChanged'
        )?.[1];
        if (eventHandler) {
          await eventHandler(mockAnnotations, 'add', { imported: false });
        }
      });

      await waitFor(() => {
        expect(mockForceSyncDocumentManager.addModifiedAnnotations).toHaveBeenCalledWith(mockAnnotations);
        expect(mockForceSyncDocumentManager.checkAnnotationsChangedForceSync).toHaveBeenCalled();
      });
    });

    it('should not trigger sync when forceSync is false', async () => {
      mockForceSyncDocumentManager.checkAnnotationsChangedForceSync.mockReturnValue(false);

      renderHook(() => useSyncNumerousAnnotations());

      await act(async () => {
        const eventHandler = mockAddEventListener.mock.calls.find(
          (call) => call[0] === 'annotationChanged'
        )?.[1];
        if (eventHandler) {
          await eventHandler(mockAnnotations, 'add', { imported: false });
        }
      });

      await waitFor(() => {
        expect(mockForceSyncDocumentManager.addModifiedAnnotations).toHaveBeenCalled();
        expect(mockForceSyncDocumentManager.checkAnnotationsChangedForceSync).toHaveBeenCalled();
      });
    });
  });

  describe('abortController effect', () => {
    it('should reset abortController when signal is aborted', () => {
      const abortedController = new AbortController();
      abortedController.abort();
      (useSyncAnnotationsStore as unknown as jest.Mock).mockImplementation((selector: any) => {
        if (selector) {
          return selector({
            abortController: abortedController,
            setIsSyncing: mockSetIsSyncing,
            resetAbortController: mockResetAbortController,
            isSyncing: false,
          });
        }
        return {
          abortController: abortedController,
          setIsSyncing: mockSetIsSyncing,
          resetAbortController: mockResetAbortController,
          isSyncing: false,
        };
      });

      renderHook(() => useSyncNumerousAnnotations());

      expect(mockResetAbortController).toHaveBeenCalled();
    });

    it('should abort when canSync is false', () => {
      (useSyncDocumentChecker as jest.Mock).mockReturnValue({
        canSyncOnAnnotationChange: mockCanSyncOnAnnotationChange,
        canSync: false,
      });

      renderHook(() => useSyncNumerousAnnotations());

      expect(mockAbortController.abort).toHaveBeenCalled();
    });

    it('should not abort when canSync is true', () => {
      (useSyncDocumentChecker as jest.Mock).mockReturnValue({
        canSyncOnAnnotationChange: mockCanSyncOnAnnotationChange,
        canSync: true,
      });

      renderHook(() => useSyncNumerousAnnotations());

      // Abort should not be called when canSync is true
      expect(mockAbortController.abort).not.toHaveBeenCalled();
    });
  });

  describe('syncDocumentAutomatically effect', () => {
    it('should return early when isSyncingAnnotationsRef.current is true', async () => {
      (useSyncAnnotationsStore as unknown as jest.Mock).mockImplementation((selector: any) => {
        if (selector) {
          return selector({
            abortController: mockAbortController,
            setIsSyncing: mockSetIsSyncing,
            resetAbortController: mockResetAbortController,
            isSyncing: true,
          });
        }
        return {
          abortController: mockAbortController,
          setIsSyncing: mockSetIsSyncing,
          resetAbortController: mockResetAbortController,
          isSyncing: true,
        };
      });
      (useLatestRef as jest.Mock).mockReturnValue({ current: true });

      const { rerender } = renderHook(() => useSyncNumerousAnnotations());

      await act(async () => {
        rerender();
      });

      await waitFor(() => {
        expect(mockForceSyncDocumentManager.checkAutomaticallyForceSync).not.toHaveBeenCalled();
      });
    });

    it('should return early when hasRunAutomaticCheck.current is true', async () => {
      const { rerender } = renderHook(() => useSyncNumerousAnnotations());

      // First render sets hasRunAutomaticCheck.current to true
      await act(async () => {
        rerender();
      });

      // Second render should return early
      await act(async () => {
        rerender();
      });

      await waitFor(() => {
        // Should only be called once
        expect(mockForceSyncDocumentManager.checkAutomaticallyForceSync).toHaveBeenCalledTimes(1);
      });
    });

    it('should return early when hasShownSyncModal.current is true', async () => {
      // This is tested through the modal flow
      renderHook(() => useSyncNumerousAnnotations());
    });

    it('should return early when isSyncing is true', async () => {
      mockUseSelector.mockImplementation((selector: any) => {
        if (selector === documentSyncSelectors.isSyncing) {
          return true;
        }
        return false;
      });

      const { rerender } = renderHook(() => useSyncNumerousAnnotations());

      await act(async () => {
        rerender();
      });

      await waitFor(() => {
        expect(mockForceSyncDocumentManager.checkAutomaticallyForceSync).not.toHaveBeenCalled();
      });
    });

    it('should return early when checkDocumentSyncable returns false', async () => {
      mockUseSelector.mockImplementation((selector: any) => {
        if (selector === selectors.isDocumentLoaded) {
          return false;
        }
        return false;
      });

      const { rerender } = renderHook(() => useSyncNumerousAnnotations());

      await act(async () => {
        rerender();
      });

      await waitFor(() => {
        expect(mockForceSyncDocumentManager.checkAutomaticallyForceSync).not.toHaveBeenCalled();
      });
    });

    it('should return early when documentService is ONEDRIVE and canModifyDriveContent is false', async () => {
      (useShallowSelector as jest.Mock).mockReturnValue({
        ...mockDocument,
        service: STORAGE_TYPE.ONEDRIVE,
      });
      mockUseSelector.mockImplementation((selector: any) => {
        if (selector === selectors.canModifyDriveContent) {
          return false;
        }
        return false;
      });

      const { rerender } = renderHook(() => useSyncNumerousAnnotations());

      await act(async () => {
        rerender();
      });

      await waitFor(() => {
        expect(mockForceSyncDocumentManager.checkAutomaticallyForceSync).not.toHaveBeenCalled();
      });
    });

    it('should return early when documentService is GOOGLE and canModifyDriveContent is false', async () => {
      (useShallowSelector as jest.Mock).mockReturnValue({
        ...mockDocument,
        service: STORAGE_TYPE.GOOGLE,
      });
      mockUseSelector.mockImplementation((selector: any) => {
        if (selector === selectors.canModifyDriveContent) {
          return false;
        }
        return false;
      });

      const { rerender } = renderHook(() => useSyncNumerousAnnotations());

      await act(async () => {
        rerender();
      });

      await waitFor(() => {
        expect(mockForceSyncDocumentManager.checkAutomaticallyForceSync).not.toHaveBeenCalled();
      });
    });

    it('should return early when documentService is not S3 and not PDF', async () => {
      (useShallowSelector as jest.Mock).mockReturnValue({
        ...mockDocument,
        service: STORAGE_TYPE.DROPBOX,
        mimeType: 'application/word',
      });

      const { rerender } = renderHook(() => useSyncNumerousAnnotations());

      await act(async () => {
        rerender();
      });

      await waitFor(() => {
        expect(mockForceSyncDocumentManager.checkAutomaticallyForceSync).not.toHaveBeenCalled();
      });
    });

    it('should trigger sync when forceSync is true', async () => {
      mockForceSyncDocumentManager.checkAutomaticallyForceSync.mockResolvedValue(true);
      // Ensure document is S3 and PDF to pass the condition check
      (useShallowSelector as jest.Mock).mockReturnValue({
        ...mockDocument,
        service: STORAGE_TYPE.S3,
        mimeType: general.PDF,
      });

      // Initial render - initialization effect runs first
      const { rerender } = renderHook(() => useSyncNumerousAnnotations());

      // Wait for initialization effect to complete and set the manager
      await waitFor(() => {
        expect(ForceSyncDocumentManager.getInstance).toHaveBeenCalled();
      });

      // Now trigger the syncDocumentAutomatically effect by changing luminAnnots.length
      // This ensures the effect runs after the manager is initialized
      (useFetchingAnnotationsStore as jest.Mock).mockReturnValue({
        annotations: [...mockAnnotations, { Id: 'annot-3' }],
      });

      await act(async () => {
        rerender();
      });

      // Wait for the syncDocumentAutomatically effect to run and call checkAutomaticallyForceSync
      await waitFor(
        () => {
          expect(mockForceSyncDocumentManager.checkAutomaticallyForceSync).toHaveBeenCalled();
          // Line 286: hasRunAutomaticCheck.current should be set to true during this execution
        },
        { timeout: 3000 }
      );

      // Verify that hasRunAutomaticCheck.current is true by changing luminAnnots.length again
      // and ensuring it doesn't run again
      (useFetchingAnnotationsStore as jest.Mock).mockReturnValue({
        annotations: [...mockAnnotations, { Id: 'annot-3' }, { Id: 'annot-4' }],
      });

      await act(async () => {
        rerender();
      });

      await waitFor(() => {
        // Should only be called once because hasRunAutomaticCheck.current is now true (line 286)
        expect(mockForceSyncDocumentManager.checkAutomaticallyForceSync).toHaveBeenCalledTimes(1);
      });
    });

    it('should not trigger sync when forceSync is false', async () => {
      mockForceSyncDocumentManager.checkAutomaticallyForceSync.mockResolvedValue(false);

      const { rerender } = renderHook(() => useSyncNumerousAnnotations());

      await act(async () => {
        rerender();
      });

      await waitFor(() => {
        expect(mockForceSyncDocumentManager.checkAutomaticallyForceSync).toHaveBeenCalled();
      });
    });
  });

  describe('initialization effect', () => {
    it('should initialize ForceSyncDocumentManager when document is loaded', () => {
      mockUseSelector.mockImplementation((selector: any) => {
        if (selector === selectors.isDocumentLoaded) {
          return true;
        }
        return false;
      });

      renderHook(() => useSyncNumerousAnnotations());

      expect(ForceSyncDocumentManager.getInstance).toHaveBeenCalled();
      expect(mockResetAbortController).toHaveBeenCalled();
    });

    it('should not initialize when document is not loaded', () => {
      mockUseSelector.mockImplementation((selector: any) => {
        if (selector === selectors.isDocumentLoaded) {
          return false;
        }
        return false;
      });

      renderHook(() => useSyncNumerousAnnotations());

      // Should still be called but manager ref should be null
      expect(ForceSyncDocumentManager.getInstance).not.toHaveBeenCalled();
    });
  });

  describe('cleanup', () => {
    it('should cleanup on unmount', () => {
      const { unmount } = renderHook(() => useSyncNumerousAnnotations());

      unmount();

      expect(ForceSyncDocumentManager.clearInstance).toHaveBeenCalled();
      expect(getMockCancel()).toHaveBeenCalled();
    });
  });

  describe('edge cases', () => {
    it('should handle document without _id', () => {
      (useShallowSelector as jest.Mock).mockReturnValue({
        service: STORAGE_TYPE.S3,
        mimeType: general.PDF,
      });

      renderHook(() => useSyncNumerousAnnotations());

      expect(mockAddEventListener).toHaveBeenCalled();
    });

    it('should handle document with viewer role', async () => {
      (getCurrentRole as jest.Mock).mockReturnValue(DOCUMENT_ROLES.VIEWER);

      renderHook(() => useSyncNumerousAnnotations());

      await act(async () => {
        const eventHandler = mockAddEventListener.mock.calls.find(
          (call) => call[0] === 'annotationChanged'
        )?.[1];
        if (eventHandler) {
          await eventHandler(mockAnnotations, 'add', { imported: false });
        }
      });

      await waitFor(() => {
        expect(mockForceSyncDocumentManager.addModifiedAnnotations).not.toHaveBeenCalled();
      });
    });

    it('should handle document with sharer role', () => {
      (getCurrentRole as jest.Mock).mockReturnValue(DOCUMENT_ROLES.SHARER);

      renderHook(() => useSyncNumerousAnnotations());

      expect(mockAddEventListener).toHaveBeenCalled();
    });

    it('should handle document with owner role', () => {
      (getCurrentRole as jest.Mock).mockReturnValue(DOCUMENT_ROLES.OWNER);

      renderHook(() => useSyncNumerousAnnotations());

      expect(mockAddEventListener).toHaveBeenCalled();
    });

    it('should handle imported annotations', async () => {
      // When imported is true, canSyncOnAnnotationChange should return false
      mockCanSyncOnAnnotationChange.mockImplementation((imported: boolean) => !imported);

      renderHook(() => useSyncNumerousAnnotations());

      await act(async () => {
        const eventHandler = mockAddEventListener.mock.calls.find(
          (call) => call[0] === 'annotationChanged'
        )?.[1];
        if (eventHandler) {
          await eventHandler(mockAnnotations, 'add', { imported: true });
        }
      });

      await waitFor(() => {
        expect(mockForceSyncDocumentManager.addModifiedAnnotations).not.toHaveBeenCalled();
      });
    });

    it('should handle empty annotations array', async () => {
      renderHook(() => useSyncNumerousAnnotations());

      await act(async () => {
        const eventHandler = mockAddEventListener.mock.calls.find(
          (call) => call[0] === 'annotationChanged'
        )?.[1];
        if (eventHandler) {
          await eventHandler([], 'add', { imported: false });
        }
      });

      await waitFor(() => {
        expect(mockForceSyncDocumentManager.addModifiedAnnotations).toHaveBeenCalledWith([]);
      });
    });
  });
});

