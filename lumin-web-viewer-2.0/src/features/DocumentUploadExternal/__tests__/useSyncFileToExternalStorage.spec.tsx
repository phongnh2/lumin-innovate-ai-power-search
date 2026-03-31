import { act, renderHook, waitFor } from '@testing-library/react';
import axios, { AxiosError } from 'axios';
import React from 'react';
import { useDispatch } from 'react-redux';
import toastUtils from 'lumin-components/GeneralLayout/utils/toastUtils';
import actions from 'actions';
import core from 'core';
import logger from 'helpers/logger';
import dropboxError from 'utils/dropboxError';
import { socket } from '@socket';
import { setIsExceedQuotaExternalStorage } from 'features/QuotaExternalStorage/slices';
import { AnimationBanner } from 'constants/banner';
import { ConversionError } from 'constants/errorCode';
import { LOGGER, ModalTypes, STORAGE_TYPE, STORAGE_TYPE_DESC } from 'constants/lumin-common';
import { ERROR_TIMEOUT_MESSAGE } from 'constants/messages';
import { SOCKET_EMIT } from 'constants/socketConstant';
import { OneDriveErrorCode } from 'services/oneDriveServices';
import { IDocumentBase } from 'interfaces/document/document.interface';

import useSyncFileToExternalStorage from '../useSyncFileToExternalStorage';
import useCheckPermission from '../useCheckPermission';
import useRequestPermission from '../useRequestPermission';
import useUploadFile from '../useUploadFile';

jest.mock('react-redux', () => ({
  useDispatch: jest.fn(),
}));

jest.mock('axios', () => ({
  isCancel: jest.fn(),
  get: jest.fn(),
  post: jest.fn(),
  create: jest.fn(() => ({
    interceptors: {
      request: { use: jest.fn(), eject: jest.fn() },
      response: { use: jest.fn(), eject: jest.fn() },
    },
  })),
}));


jest.mock('actions', () => ({
  openViewerModal: jest.fn((payload) => ({ type: 'OPEN_VIEWER_MODAL', payload })),
  closeModal: jest.fn(() => ({ type: 'CLOSE_MODAL' })),
  setDocumentNotFound: jest.fn(() => ({ type: 'SET_DOCUMENT_NOT_FOUND' })),
  setShouldShowRating: jest.fn((payload) => ({ type: 'SET_SHOULD_SHOW_RATING', payload })),
  setInternalAnnotationIds: jest.fn((payload) => ({ type: 'SET_INTERNAL_ANNOTATION_IDS', payload })),
}));

jest.mock('core', () => ({
  getAnnotationsList: jest.fn().mockReturnValue([]),
}));

jest.mock('hooks/useTranslation', () => ({
  useTranslation: jest.fn().mockReturnValue({ t: jest.fn((key) => key) }),
}));

jest.mock('services/oneDriveServices', () => ({
  OneDriveErrorCode: {
    ITEM_NOT_FOUND: 'itemNotFound',
    ACCESS_DENIED: 'accessDenied',
    QUOTA_LIMIT_REACHED: 'quotaLimitReached',
  },
}));

jest.mock('helpers/logger', () => ({
  logInfo: jest.fn(),
  logError: jest.fn(),
}));

jest.mock('utils/dropboxError', () => ({
  isFileNotFoundError: jest.fn(),
}));

jest.mock('@socket', () => ({
  socket: {
    emit: jest.fn(),
  },
}));

// Mock Feature Slices
jest.mock('features/QuotaExternalStorage/slices', () => ({
  setIsExceedQuotaExternalStorage: jest.fn((payload) => ({ type: 'SET_IS_EXCEED_QUOTA', payload })),
}));

jest.mock('../useCheckPermission', () => jest.fn());
jest.mock('../useRequestPermission', () => jest.fn());
jest.mock('../useUploadFile', () => jest.fn());

// Mock toastUtils to prevent react-notifications-component errors
jest.mock('lumin-components/GeneralLayout/utils/toastUtils', () => ({
  __esModule: true,
  default: {
    error: jest.fn(),
    success: jest.fn(),
    warn: jest.fn(),
    info: jest.fn(),
    neutral: jest.fn(),
    openToastMulti: jest.fn(),
    openUnknownErrorToast: jest.fn(),
    removeById: jest.fn(),
    REMOVED_BY: {
      MANUAL: 'manual',
      TIMEOUT: 'timeout',
      CLICK: 'click',
    },
  },
}));

describe('useSyncFileToExternalStorage', () => {
  const mockDispatch = jest.fn();
  const mockCheckPermission = useCheckPermission as jest.Mock;
  const mockRequestPermission = useRequestPermission as jest.Mock;
  const mockUseUploadFile = useUploadFile as jest.Mock;
  const mockHandleUpload = jest.fn();
  const mockRequestPermissionFunc = jest.fn();

  // Default Mock Data
  const mockCurrentDocument = { _id: 'doc123' } as IDocumentBase;
  const mockFile = new File([''], 'test.pdf');
  const mockSignal = new AbortController().signal;

  beforeEach(() => {
    jest.clearAllMocks();
    (useDispatch as jest.Mock).mockReturnValue(mockDispatch);

    // Setup Internal Hooks Mocks
    mockUseUploadFile.mockReturnValue(mockHandleUpload);
    mockRequestPermission.mockReturnValue(mockRequestPermissionFunc);

    // Default behaviors - useCheckPermission returns a function that returns boolean
    mockCheckPermission.mockReturnValue(() => true); // Permission granted by default
    mockHandleUpload.mockResolvedValue('https://mock-url.com');
    (axios.isCancel as unknown as jest.Mock).mockReturnValue(false);
    (core.getAnnotationsList as jest.Mock).mockReturnValue([{ Id: 'ann1' }, { Id: 'ann2' }]);
    (dropboxError.isFileNotFoundError as jest.Mock).mockReturnValue(false);
  });

  const defaultInput = {
    isOverride: false,
    currentDocument: mockCurrentDocument,
    shouldShowRatingModal: false,
    newDocumentName: 'New Doc',
    file: mockFile,
    signal: mockSignal,
    flattenPdf: false,
  };

  it('should upload successfully when permission is already granted', async () => {
    mockCheckPermission.mockReturnValue(() => true);

    const { result } = renderHook(() => useSyncFileToExternalStorage(STORAGE_TYPE.GOOGLE));
    const syncFunction = result.current;

    const response = await syncFunction(defaultInput);

    expect(mockCheckPermission).toHaveBeenCalled();
    expect(mockHandleUpload).toHaveBeenCalledWith(expect.objectContaining({
      isOverride: false,
      newDocumentName: 'New Doc',
    }));
    expect(response).toEqual({
      successMsg: expect.stringContaining('viewer.header.copyIsCreatedOnYour'),
      destinationStorage: STORAGE_TYPE_DESC[STORAGE_TYPE.GOOGLE],
      documentLocation: 'https://mock-url.com',
    });

    // Annotations should be synced
    expect(core.getAnnotationsList).toHaveBeenCalled();
    expect(mockDispatch).toHaveBeenCalledWith(actions.setInternalAnnotationIds(['ann1', 'ann2']));
  });

  it('should handle request permission flow successfully if permission is missing', async () => {
    mockCheckPermission.mockReturnValue(() => false);
    // Mock request permission to succeed (execute the success callback)
    mockRequestPermissionFunc.mockImplementation((successCb: () => void, errorCb: (err: unknown) => void) => {
      successCb();
    });

    const { result } = renderHook(() => useSyncFileToExternalStorage(STORAGE_TYPE.DROPBOX));

    await act(async () => {
       await result.current(defaultInput);
    });

    expect(mockCheckPermission).toHaveBeenCalled();
    expect(mockRequestPermissionFunc).toHaveBeenCalled();
    expect(mockHandleUpload).toHaveBeenCalled();
  });

  it('should handle "Override" flow: Socket emit, Logger, and Rating Modal', async () => {
    mockCheckPermission.mockReturnValue(() => true);
    const overrideInput = { ...defaultInput, isOverride: true, shouldShowRatingModal: true };

    const { result } = renderHook(() => useSyncFileToExternalStorage(STORAGE_TYPE.GOOGLE));
    const response = await result.current(overrideInput);

    // 1. Logger check
    expect(logger.logInfo).toHaveBeenCalledWith(expect.objectContaining({
      message: LOGGER.EVENT.CLEAR_ANNOTATION_AND_MANIPULATION_OF_DOCUMENT,
      attributes: { documentId: mockCurrentDocument._id },
    }));

    // 2. Socket check
    expect(socket.emit).toHaveBeenCalledWith(
      SOCKET_EMIT.CLEAR_ANNOTATION_AND_MANIPULATION_OF_DOCUMENT,
      mockCurrentDocument._id
    );

    // 3. Rating Modal check
    expect(mockDispatch).toHaveBeenCalledWith(actions.setShouldShowRating(AnimationBanner.SHOW));

    // 4. Success message difference
    expect(response.successMsg).toContain('viewer.header.yourFileHasBeenSyncedTo');
  });

  // ---------------------------------------------------------------------------
  // ERROR HANDLING TESTS
  // ---------------------------------------------------------------------------

  describe('Error Handling', () => {

    const triggerError = async (error: any, storageType: typeof STORAGE_TYPE.GOOGLE | typeof STORAGE_TYPE.ONEDRIVE | typeof STORAGE_TYPE.DROPBOX = STORAGE_TYPE.GOOGLE) => {
       mockCheckPermission.mockReturnValue(() => true);
       mockHandleUpload.mockRejectedValue(error);
       const { result } = renderHook(() => useSyncFileToExternalStorage(storageType));
       return await result.current(defaultInput);
    };

    it('should handle Timeout Error', async () => {
      const error = { name: ConversionError.TIMEOUT_ERROR, message: 'timeout' };
      const response = await triggerError(error);

      expect(mockDispatch).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'OPEN_VIEWER_MODAL',
          payload: expect.objectContaining({
            title: ERROR_TIMEOUT_MESSAGE.REQUEST_TIMEOUT,
            type: ModalTypes.ERROR,
          })
        })
      );

      // Test the modal onConfirm
      const callArgs = (mockDispatch as jest.Mock).mock.calls.find(call => call[0].type === 'OPEN_VIEWER_MODAL')[0];
      callArgs.payload.onConfirm();
      expect(actions.closeModal).toHaveBeenCalled();
      expect(response).toEqual({});
    });

    // --- OneDrive Specific Errors ---

    it('should handle OneDrive: Item Not Found', async () => {
      const error = {
        message: 'Err',
        response: { data: { error: { code: OneDriveErrorCode.ITEM_NOT_FOUND } } },
      };

      await triggerError(error, STORAGE_TYPE.ONEDRIVE);
      expect(mockDispatch).toHaveBeenCalledWith(actions.setDocumentNotFound());
    });

    it('should handle OneDrive: Access Denied', async () => {
      const error = {
        message: 'Err',
        response: { data: { error: { code: OneDriveErrorCode.ACCESS_DENIED } } },
      };

      await triggerError(error, STORAGE_TYPE.ONEDRIVE);
      expect(mockDispatch).toHaveBeenCalledWith(
        expect.objectContaining({
          payload: expect.objectContaining({
            message: 'errorMessage.accessDenied',
            type: ModalTypes.ERROR,
          }),
        })
      );
    });

    it('should handle OneDrive: Quota Limit Reached', async () => {
      const error = {
        message: 'Err',
        response: { data: { error: { code: OneDriveErrorCode.QUOTA_LIMIT_REACHED } } },
      };

      await triggerError(error, STORAGE_TYPE.ONEDRIVE);
      expect(mockDispatch).toHaveBeenCalledWith(setIsExceedQuotaExternalStorage(true));
    });

    it('should handle OneDrive: Default/Other Error', async () => {
      const error = {
        message: 'Err',
        response: { data: { error: { code: 'UnknownCode' } } },
      };

      await triggerError(error, STORAGE_TYPE.ONEDRIVE);
      expect(toastUtils.error).toHaveBeenCalledWith({
        message: 'viewer.header.failedToSyncYourDocument',
      });
    });

    it('should ignore OneDrive error if Axios Cancelled', async () => {
      (axios.isCancel as unknown as jest.Mock).mockReturnValue(true);
      const error = { response: { data: { error: { code: 'Unknown' } } } };

      await triggerError(error, STORAGE_TYPE.ONEDRIVE);
      expect(toastUtils.error).not.toHaveBeenCalled();
    });

    // --- General/Dropbox Errors ---

    it('should handle General: Document Not Found (reason: notFound)', async () => {
      const error = { errors: [{ reason: 'notFound' }], message: '' };
      await triggerError(error, STORAGE_TYPE.GOOGLE);
      expect(mockDispatch).toHaveBeenCalledWith(actions.setDocumentNotFound());
    });

    it('should handle Dropbox: File Not Found', async () => {
      (dropboxError.isFileNotFoundError as jest.Mock).mockReturnValue(true);
      const error = { response: { data: { error: 'path/not_found' } } };

      await triggerError(error, STORAGE_TYPE.DROPBOX);
      expect(mockDispatch).toHaveBeenCalledWith(actions.setDocumentNotFound());
    });

    it('should handle General: Insufficient File Permissions', async () => {
      const error: { errors: Array<{ reason: string }>; message: string; response?: unknown } = { errors: [{ reason: 'insufficientFilePermissions' }], message: '', response: undefined };

      await triggerError(error, STORAGE_TYPE.GOOGLE);

      expect(mockDispatch).toHaveBeenCalledWith(
        expect.objectContaining({
            payload: expect.objectContaining({
                type: ModalTypes.ERROR,
                message: expect.anything(), // React fragment
            })
        })
      );

      // Also expect toast since implementation doesn't return early
      expect(toastUtils.error).toHaveBeenCalledWith({
        message: 'viewer.header.failedToSyncYourDocument',
      });

      // Trigger onConfirm to cover coverage
      const call = (mockDispatch as jest.Mock).mock.calls.find(c => c[0].payload?.type === ModalTypes.ERROR);
      call[0].payload.onConfirm();
    });

    it('should handle General: Insufficient Parent Permissions (Ignore)', async () => {
      (dropboxError.isFileNotFoundError as jest.Mock).mockReturnValue(false);
      const error: { errors: Array<{ reason: string }>; message: string; response?: unknown } = { errors: [{ reason: 'insufficientParentPermissions' }], message: '', response: undefined };

      await triggerError(error, STORAGE_TYPE.GOOGLE);

      expect(mockDispatch).not.toHaveBeenCalledWith(actions.setDocumentNotFound());
      expect(toastUtils.error).not.toHaveBeenCalled();
    });

    it('should ignore General error if Axios Cancelled', async () => {
      (axios.isCancel as unknown as jest.Mock).mockReturnValue(true);
      const error = { message: 'cancelled' };

      await triggerError(error, STORAGE_TYPE.GOOGLE);

      expect(toastUtils.error).not.toHaveBeenCalled();
    });

    it('should handle General: Fallback generic error', async () => {
      (dropboxError.isFileNotFoundError as jest.Mock).mockReturnValue(false);
      const error: { message: string; errors: Array<unknown>; response?: unknown } = { message: 'Some random error', errors: [], response: undefined };

      await triggerError(error, STORAGE_TYPE.GOOGLE);

      expect(toastUtils.error).toHaveBeenCalledWith({
        message: 'viewer.header.failedToSyncYourDocument',
      });
    });

    it('should catch error during Permission Request', async () => {
        (dropboxError.isFileNotFoundError as jest.Mock).mockReturnValue(false);
        mockCheckPermission.mockReturnValue(() => false);
        mockRequestPermissionFunc.mockImplementation((successCb: () => void, errorCb: (err: unknown) => void) => {
            errorCb({ message: 'Permission denied', errors: [], response: undefined });
        });

        const { result } = renderHook(() => useSyncFileToExternalStorage(STORAGE_TYPE.GOOGLE));

        await act(async () => {
            await result.current(defaultInput);
        });

        expect(toastUtils.error).toHaveBeenCalled(); // General error catch block logic
    });
  });
});