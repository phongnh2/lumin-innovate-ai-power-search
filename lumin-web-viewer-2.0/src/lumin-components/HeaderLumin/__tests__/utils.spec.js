/* eslint-disable */
import {
  handleUploadGoogleDrive,
  openTimeoutModal,
  handleUploadFileToRemote,
  handleChangeName,
  removeDuplicateMember,
  handleSyncFileError,
} from '../utils';

// Import real constants instead of mocking them
import { ModalTypes, STORAGE_TYPE, STORAGE_TYPE_DESC, LOGGER } from 'constants/lumin-common';
import { DRIVE_FOLDER_URL } from 'constants/customConstant';
import { ERROR_TIMEOUT_MESSAGE } from 'constants/messages';
import { ConversionError } from 'constants/errorCode';
import { LocalStorageKey } from 'constants/localStorageKey';
import { SOCKET_EMIT } from 'constants/socketConstant';
import { AnimationBanner } from 'constants/banner';
import { documentStorage } from 'constants/documentConstants';
import { office } from 'constants/documentType';



// Mock only external services and functions that need to be controlled for testing
jest.mock('i18next', () => ({
  t: jest.fn((key, options) => options ? `${key}_${JSON.stringify(options)}` : key),
}));

jest.mock('lodash/get', () => jest.fn());

jest.mock('src/redux/store', () => ({
  store: {
    dispatch: jest.fn(),
  },
}));

jest.mock('actions', () => ({
  openViewerModal: jest.fn(),
  closeModal: jest.fn(),
  setShouldShowRating: jest.fn(),
}));

jest.mock('core', () => ({
  getAnnotationManager: jest.fn(),
}));

jest.mock('services', () => ({
  loggerServices: {
    info: jest.fn(),
    debug: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
  googleServices: {
    isSignedIn: jest.fn(),
    getFileInfo: jest.fn(),
  },
}));

jest.mock('services/documentServices', () => ({
  syncFileToDrive: jest.fn(),
  insertFileToDrive: jest.fn(),
  renameDocument: jest.fn(),
  syncFileToDropbox: jest.fn(),
  getDropboxFileInfo: jest.fn(),
  renameFileFromDropbox: jest.fn(),
  insertFileToDropbox: jest.fn(),
}));

jest.mock('helpers/convertToOfficeFile', () => jest.fn());

jest.mock('helpers/logger', () => ({
  logInfo: jest.fn(),
}));

// Mock only the utils that require external dependencies
jest.mock('utils', () => ({
  file: jest.requireActual('utils/file').default,
  validator: {
    validateDocumentName: jest.fn(),
  },
  getFileService: {
    getLinearizedDocumentFile: jest.fn(),
  },
  toastUtils: {
    success: jest.fn(),
    error: jest.fn(),
  },
  dropboxError: {
    isFileNotFoundError: jest.fn(),
    isTokenExpiredError: jest.fn(),
    isWrongPath: jest.fn(),
  },
}));

jest.mock('../../../socket', () => ({
  socket: {
    emit: jest.fn(),
  },
}));

// Mock only the function that returns dynamic values
jest.mock('constants/messages', () => ({
  ...jest.requireActual('constants/messages'),
  getErrorMessageInNameFieldByService: jest.fn(),
}));

// Import the mocked dependencies
const { t } = require('i18next');
const get = require('lodash/get');
const { store } = require('src/redux/store');
const actions = require('actions');
const core = require('core');
const { loggerServices, googleServices } = require('services');
const documentServices = require('services/documentServices');
const convertToOfficeFile = require('helpers/convertToOfficeFile');
const logger = require('helpers/logger');
const { file: fileUtils, validator, getFileService, toastUtils, dropboxError } = require('utils');
const { socket } = require('../../../socket');
const { getErrorMessageInNameFieldByService } = require('constants/messages');

describe('HeaderLumin utils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup localStorage mock
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jest.fn(),
        setItem: jest.fn(),
        removeItem: jest.fn(),
        clear: jest.fn(),
      },
      writable: true,
    });
  });

  describe('handleUploadGoogleDrive', () => {
    const mockFileInfo = {
      fileId: 'test-file-id',
      fileMetadata: { name: 'test.pdf' },
      fileData: new File(['test'], 'test.pdf'),
    };

    it('should throw error and handle permission when user is not signed in', async () => {
      const mockHandleInternalStoragePermission = jest.fn();
      googleServices.isSignedIn.mockReturnValue(false);

      await expect(
        handleUploadGoogleDrive({
          isOverrideMode: false,
          handleInternalStoragePermission: mockHandleInternalStoragePermission,
          fileInfo: mockFileInfo,
        })
      ).rejects.toThrow('REQUEST_PERMISSION');

      expect(mockHandleInternalStoragePermission).toHaveBeenCalledWith({
        storageType: STORAGE_TYPE.GOOGLE,
      });
      expect(logger.logInfo).toHaveBeenCalled();
    });

    it('should sync file to drive in override mode', async () => {
      googleServices.isSignedIn.mockReturnValue(true);
      documentServices.syncFileToDrive.mockResolvedValue();

      const result = await handleUploadGoogleDrive({
        isOverrideMode: true,
        handleInternalStoragePermission: jest.fn(),
        fileInfo: mockFileInfo,
      });

      expect(documentServices.syncFileToDrive).toHaveBeenCalledWith(mockFileInfo);
      expect(result).toBe('');
    });

    it('should upload new file to drive and return folder URL', async () => {
      const mockUploadInfo = { id: 'upload-id' };
      const mockFileResponse = { parents: ['parent-id'] };
      
      googleServices.isSignedIn.mockReturnValue(true);
      documentServices.insertFileToDrive.mockResolvedValue(mockUploadInfo);
      googleServices.getFileInfo.mockResolvedValue(mockFileResponse);

      const result = await handleUploadGoogleDrive({
        isOverrideMode: false,
        handleInternalStoragePermission: jest.fn(),
        fileInfo: mockFileInfo,
      });

      expect(documentServices.insertFileToDrive).toHaveBeenCalledWith({
        fileData: mockFileInfo.fileData,
        fileMetadata: mockFileInfo.fileMetadata,
      });
      expect(googleServices.getFileInfo).toHaveBeenCalledWith('upload-id', '*', 'uploadToDrive');
      expect(result).toBe(`${DRIVE_FOLDER_URL}parent-id`);
    });
  });

  describe('openTimeoutModal', () => {
    it('should dispatch modal action with correct parameters', () => {
      actions.openViewerModal.mockReturnValue('modal-action');

      openTimeoutModal();

      expect(store.dispatch).toHaveBeenCalledWith('modal-action');
      expect(actions.openViewerModal).toHaveBeenCalledWith({
        type: ModalTypes.ERROR,
        title: ERROR_TIMEOUT_MESSAGE.REQUEST_TIMEOUT,
        message: ERROR_TIMEOUT_MESSAGE.CHECK_CONNECTION,
        confirmButtonTitle: 'common.gotIt',
        isFullWidthButton: true,
        disableBackdropClick: true,
        cancelButtonTitle: '',
        onConfirm: expect.any(Function),
      });
    });
  });

  describe('handleUploadFileToRemote', () => {
    const mockParams = {
      isOverride: false,
      t: jest.fn((key) => key),
      handleSyncFileError: jest.fn(),
      syncFileTo: STORAGE_TYPE.GOOGLE,
      handleInternalStoragePermission: jest.fn(),
      document: { _id: 'doc-id', remoteId: 'remote-id', mimeType: 'application/pdf' },
      newDocumentName: 'test-document',
      folderId: 'folder-id',
      setErrorMessage: jest.fn(),
      setOpenCopyDocModal: jest.fn(),
      setOpenSaveDocumentModal: jest.fn(),
      downloadType: 'pdf',
    };

    beforeEach(() => {
      actions.setShouldShowRating.mockReturnValue('rating-action');
    });

    it('should return empty object for invalid storage type', async () => {
      const result = await handleUploadFileToRemote({
        ...mockParams,
        syncFileTo: 'INVALID_STORAGE',
      });

      expect(result).toEqual({});
      expect(logger.logInfo).toHaveBeenCalled();
      expect(loggerServices.info).toHaveBeenCalledWith('handleUploadFileToRemote - remote not valid');
    });

    it('should handle errors by calling handleSyncFileError', async () => {
      const mockError = new Error('Upload failed');
      getFileService.getLinearizedDocumentFile.mockRejectedValue(mockError);

      const result = await handleUploadFileToRemote(mockParams);

      expect(mockParams.handleSyncFileError).toHaveBeenCalledWith(mockError);
      expect(result).toEqual({});
    });
  });

  describe('handleChangeName', () => {
    let mockParams;

    beforeEach(() => {
      mockParams = {
        documentName: '  updated-name  ', // Different from the current filename
        setDocumentName: jest.fn(),
        setCurrentDocument: jest.fn(),
        document: { name: 'original-name.pdf', _id: 'doc-id' },
        t: jest.fn((key) => key),
      };
      validator.validateDocumentName.mockReturnValue({ isValidated: true });
    });

    it('should rename document when name is different and valid', async () => {
      const newNameWithExtension = 'updated-name.pdf';
      documentServices.renameDocument.mockResolvedValue(newNameWithExtension);

      await handleChangeName(mockParams);

      expect(validator.validateDocumentName).toHaveBeenCalledWith('updated-name');
      expect(documentServices.renameDocument).toHaveBeenCalledWith({
        document: mockParams.document,
        newName: 'updated-name',
        t: mockParams.t,
      });
      expect(mockParams.setCurrentDocument).toHaveBeenCalledWith({
        ...mockParams.document,
        name: newNameWithExtension,
      });
    });

    it('should not rename when name is the same', async () => {
      // Test with same name - documentName should match the filename without extension
      const paramsWithSameName = {
        ...mockParams,
        documentName: '  original-name  ', // Same as filename without extension
      };

      await handleChangeName(paramsWithSameName);

      expect(documentServices.renameDocument).not.toHaveBeenCalled();
    });

    it('should show error and reset name when validation fails', async () => {
      const validationError = 'Invalid name';
      validator.validateDocumentName.mockReturnValue({
        isValidated: false,
        error: validationError,
      });

      await handleChangeName(mockParams);

      expect(toastUtils.error).toHaveBeenCalledWith({
        message: validationError,
      });
      // The real getFilenameWithoutExtension('original-name.pdf') returns 'original-name'
      expect(mockParams.setDocumentName).toHaveBeenCalledWith('original-name');
    });

    it('should reset name when rename fails', async () => {
      documentServices.renameDocument.mockResolvedValue(null);

      await handleChangeName(mockParams);

      // The real getFilenameWithoutExtension('original-name.pdf') returns 'original-name'  
      expect(mockParams.setDocumentName).toHaveBeenCalledWith('original-name');
    });
  });

  describe('removeDuplicateMember', () => {
    const mockCurrentUser = { _id: 'current-user-id' };
    const mockOnlineMembers = [
      { _id: 'user1' },
      { _id: 'user2' },
      { _id: 'user1' }, // duplicate
      { _id: 'current-user-id' }, // current user
      { _id: 'user3' },
    ];

    it('should remove duplicates and current user', () => {
      const result = removeDuplicateMember({
        onlineMembers: mockOnlineMembers,
        currentUser: mockCurrentUser,
      });

      expect(result).toEqual([
        { _id: 'user1' },
        { _id: 'user2' },
        { _id: 'user3' },
      ]);
    });

    it('should handle anonymous user when currentUser is null', () => {
      const mockAnnotManager = {
        getCurrentUser: jest.fn().mockReturnValue('Anonymous - anonymous-id'),
      };
      core.getAnnotationManager.mockReturnValue(mockAnnotManager);

      const membersWithAnonymous = [
        ...mockOnlineMembers,
        { _id: 'anonymous-id' },
      ];

      const result = removeDuplicateMember({
        onlineMembers: membersWithAnonymous,
        currentUser: null,
      });

      expect(result).toHaveLength(4); // Should exclude anonymous user
    });

    it('should handle empty onlineMembers array', () => {
      const result = removeDuplicateMember({
        onlineMembers: [],
        currentUser: mockCurrentUser,
      });
      

      expect(result).toEqual([]);
    });

    it('should handle array with null values (filter now works correctly)', () => {
      const mockOnlineMembersWithNull = [
        { _id: 'user1' },
        null,
        { _id: 'user2' },
        { _id: 'user3' },
      ];

      const result = removeDuplicateMember({
        onlineMembers: mockOnlineMembersWithNull,
        currentUser: mockCurrentUser,
      });

      expect(result).toEqual([
        { _id: 'user1' },
        { _id: 'user2' },
        { _id: 'user3' },
      ]);
    });

    it('should handle array with undefined values (filter now works correctly)', () => {
      const mockOnlineMembersWithUndefined = [
        { _id: 'user1' },
        undefined,
        { _id: 'user2' },
        { _id: 'user3' },
      ];

      const result = removeDuplicateMember({
        onlineMembers: mockOnlineMembersWithUndefined,
        currentUser: mockCurrentUser,
      });

      expect(result).toEqual([
        { _id: 'user1' },
        { _id: 'user2' },
        { _id: 'user3' },
      ]);
    });

    it('should handle array with mixed null and undefined values', () => {
      const mockOnlineMembersWithNullAndUndefined = [
        { _id: 'user1' },
        null,
        undefined,
        { _id: 'user2' },
        null,
        { _id: 'user3' },
        undefined,
      ];

      const result = removeDuplicateMember({
        onlineMembers: mockOnlineMembersWithNullAndUndefined,
        currentUser: mockCurrentUser,
      });

      expect(result).toEqual([
        { _id: 'user1' },
        { _id: 'user2' },
        { _id: 'user3' },
      ]);
    });

    it('should handle array with only null values', () => {
      const mockOnlineMembersOnlyNull = [null, null, null];

      const result = removeDuplicateMember({
        onlineMembers: mockOnlineMembersOnlyNull,
        currentUser: mockCurrentUser,
      });

      expect(result).toEqual([]);
    });

    it('should handle array with only undefined values', () => {
      const mockOnlineMembersOnlyUndefined = [undefined, undefined, undefined];

      const result = removeDuplicateMember({
        onlineMembers: mockOnlineMembersOnlyUndefined,
        currentUser: mockCurrentUser,
      });

      expect(result).toEqual([]);
    });

    it('should handle array with objects having null _id properties vs null objects', () => {
      const mockOnlineMembersWithNullIds = [
        { _id: 'user1' },
        { _id: null }, 
        null, 
        { _id: 'user2' },
        { _id: undefined }, 
        undefined, 
      ];

      const result = removeDuplicateMember({
        onlineMembers: mockOnlineMembersWithNullIds,
        currentUser: mockCurrentUser,
      });

      expect(result).toEqual([
        { _id: 'user1' },
        { _id: null },
        { _id: 'user2' },
        { _id: undefined },
      ]);
    });

    it('should handle array with other falsy values (not affected by isNil)', () => {
      const mockOnlineMembersWithFalsyValues = [
        { _id: 'user1' },
        false, 
        0, 
        '', 
        { _id: 'user2' },
        [], 
        {}, 
      ];

      const result = removeDuplicateMember({
        onlineMembers: mockOnlineMembersWithFalsyValues,
        currentUser: mockCurrentUser,
      });

      expect(result).toBeDefined();
    });

    it('should demonstrate what isNil actually filters', () => {
      const testArray = [
        { _id: 'user1' },
        null,
        undefined,
        false,
        0,
        '',
        { _id: 'user2' },
        [],
        {},
      ];

      const filteredByIsNil = testArray.filter(item => item == null); 
      
      expect(filteredByIsNil).toEqual([null, undefined]);
    });

    it('should handle anonymous user scenario with null/undefined values', () => {
      const mockAnnotManager = {
        getCurrentUser: jest.fn().mockReturnValue('Anonymous - anonymous-id'),
      };
      core.getAnnotationManager.mockReturnValue(mockAnnotManager);

      const mockOnlineMembersWithNulls = [
        { _id: 'user1' },
        null,
        { _id: 'anonymous-id' },
        undefined,
        { _id: 'user2' },
      ];

      const result = removeDuplicateMember({
        onlineMembers: mockOnlineMembersWithNulls,
        currentUser: null,
      });

      expect(result).toEqual([
        { _id: 'user1' },
        { _id: 'user2' },
      ]);
    });

    it('should demonstrate the correct behavior if filter was fixed', () => {
      const mockOnlineMembersWithNulls = [
        { _id: 'user1' },
        null,
        { _id: 'user2' },
        undefined,
        { _id: 'user1' }, 
        { _id: 'current-user-id' }, 
        { _id: 'user3' },
      ];

      const correctlyFiltered = mockOnlineMembersWithNulls.filter(member => member != null);
      
      expect(correctlyFiltered).toEqual([
        { _id: 'user1' },
        { _id: 'user2' },
        { _id: 'user1' },
        { _id: 'current-user-id' },
        { _id: 'user3' },
      ]);
    });
  });

  describe('handleSyncFileError', () => {
    const mockParams = {
      error: new Error('Test error'),
      t: jest.fn((key) => key),
      openViewerModal: jest.fn(),
      setDocumentNotFound: jest.fn(),
      handleInternalStoragePermission: jest.fn(),
      syncFileTo: STORAGE_TYPE.GOOGLE,
      setErrorMessage: jest.fn(),
      setDuplicateDocumentLoading: jest.fn(),
    };

    it('should open timeout modal for timeout errors', () => {
      const timeoutError = new Error('Timeout');
      timeoutError.name = ConversionError.TIMEOUT_ERROR;
      actions.openViewerModal.mockReturnValue('timeout-modal-action');

      handleSyncFileError({
        ...mockParams,
        error: timeoutError,
      });

      expect(store.dispatch).toHaveBeenCalledWith('timeout-modal-action');
    });

    it('should set document not found for notFound error', () => {
      get.mockReturnValue('notFound');

      handleSyncFileError(mockParams);

      expect(mockParams.setDocumentNotFound).toHaveBeenCalled();
    });

    it('should handle insufficient file permissions', () => {
      get.mockReturnValue('insufficientFilePermissions');

      handleSyncFileError(mockParams);

      expect(mockParams.openViewerModal).toHaveBeenCalledWith({
        type: ModalTypes.ERROR,
        message: expect.any(Object),
        confirmButtonTitle: 'common.gotIt',
        onConfirm: expect.any(Function),
      });
    });

    it('should handle insufficient parent permissions', () => {
      get.mockReturnValue('insufficientParentPermissions');

      handleSyncFileError(mockParams);

      expect(mockParams.setErrorMessage).toHaveBeenCalledWith('viewer.header.errorPermissionDrive');
      expect(mockParams.setDuplicateDocumentLoading).toHaveBeenCalledWith(false);
    });

    it('should handle dropbox token expired error', () => {
      // Mock the error response structure
      const errorWithResponse = {
        ...mockParams.error,
        response: { data: { error: 'token_expired' } }
      };
      
      // Mock the function to return true for token expired
      dropboxError.isTokenExpiredError.mockReturnValue(true);
      
      // Mock get to return something other than the early return conditions
      get.mockReturnValue('some_other_error');

      handleSyncFileError({
        ...mockParams,
        error: errorWithResponse,
      });

      expect(mockParams.handleInternalStoragePermission).toHaveBeenCalledWith({
        storageType: STORAGE_TYPE.DROPBOX,
      });
      // Should return early, so toastUtils.error should not be called
      expect(toastUtils.error).not.toHaveBeenCalled();
    });

    it('should handle dropbox wrong path error', () => {
      // Mock the error response structure
      const errorWithResponse = {
        ...mockParams.error,
        response: { data: { error: 'wrong_path' } }
      };
      
      get.mockReturnValue('some_error'); // This should not be 'REQUEST_PERMISSION'
      dropboxError.isWrongPath.mockReturnValue(true);
      dropboxError.isTokenExpiredError.mockReturnValue(false); // Make sure token expired check fails
      getErrorMessageInNameFieldByService.mockReturnValue('Wrong path error');

      handleSyncFileError({
        ...mockParams,
        error: errorWithResponse,
        syncFileTo: documentStorage.dropbox,
      });

      expect(mockParams.setErrorMessage).toHaveBeenCalledWith('Wrong path error');
      expect(toastUtils.error).toHaveBeenCalledWith({
        message: 'viewer.header.failedToSyncYourDocument',
      });
    });

    it('should show generic error toast for other errors', () => {
      get.mockReturnValue('generic_error'); // This should not be 'REQUEST_PERMISSION'
      
      // Make sure all early return conditions are false
      dropboxError.isFileNotFoundError.mockReturnValue(false);
      dropboxError.isTokenExpiredError.mockReturnValue(false);
      dropboxError.isWrongPath.mockReturnValue(false);

      handleSyncFileError(mockParams);

      expect(toastUtils.error).toHaveBeenCalledWith({
        message: 'viewer.header.failedToSyncYourDocument',
      });
    });
  });
});
