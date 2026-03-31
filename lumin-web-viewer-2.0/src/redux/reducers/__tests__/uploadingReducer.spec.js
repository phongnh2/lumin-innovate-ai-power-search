import UploadUtils from 'utils/uploadUtils';
import createUploadingReducer from '../uploadingReducer';

// Mock uuid
jest.mock('uuid/v4', () => jest.fn(() => 'mock-uuid'));

describe('uploadingReducer', () => {
  const initialState = {
    queue: [],
    files: {},
    openUploadingPopper: false,
  };

  const uploadingReducer = createUploadingReducer(initialState);

  describe('Initial State', () => {
    it('should return initial state when no action is provided', () => {
      const result = uploadingReducer(undefined, { type: 'UNKNOWN_ACTION' });

      expect(result).toEqual(initialState);
    });
  });

  describe('ADD_UPLOADING_FILES', () => {
    it('should add single file to queue', () => {
      const action = {
        type: 'ADD_UPLOADING_FILES',
        payload: {
          files: [
            {
              groupId: 'file-1',
              fileData: { name: 'test.pdf' },
              thumbnail: 'thumb-data',
              folderType: 'individual',
              entityId: 'user-123',
              folderId: 'folder-456',
              isNotify: true,
              handlerName: 'document_handler',
            },
          ],
        },
      };

      const result = uploadingReducer(initialState, action);

      expect(result.openUploadingPopper).toBe(true);
      expect(result.queue).toContain('file-1');
      expect(result.files['file-1']).toEqual({
        fileData: { name: 'test.pdf' },
        thumbnail: 'thumb-data',
        progress: 0,
        status: UploadUtils.UploadStatus.PROCESSING,
        cancelToken: null,
        documentId: null,
        folder: {
          type: 'individual',
          entityId: 'user-123',
          folderId: 'folder-456',
        },
        oldGroupIndice: [],
        isNotify: true,
        handlerName: 'document_handler',
        errorMessage: undefined,
      });
    });

    it('should add multiple files to queue', () => {
      const action = {
        type: 'ADD_UPLOADING_FILES',
        payload: {
          files: [
            { groupId: 'file-1', fileData: { name: 'test1.pdf' }, folderType: 'individual', entityId: 'user-1', folderId: 'folder-1' },
            { groupId: 'file-2', fileData: { name: 'test2.pdf' }, folderType: 'individual', entityId: 'user-1', folderId: 'folder-1' },
          ],
        },
      };

      const result = uploadingReducer(initialState, action);

      expect(result.queue).toHaveLength(2);
      expect(result.queue).toContain('file-1');
      expect(result.queue).toContain('file-2');
      expect(Object.keys(result.files)).toHaveLength(2);
    });

    it('should add files to beginning of queue (unshift)', () => {
      const stateWithFile = {
        ...initialState,
        queue: ['existing-file'],
        files: { 'existing-file': { status: UploadUtils.UploadStatus.UPLOADING } },
      };

      const action = {
        type: 'ADD_UPLOADING_FILES',
        payload: {
          files: [{ groupId: 'new-file', fileData: { name: 'new.pdf' }, folderType: 'individual', entityId: 'user-1', folderId: 'folder-1' }],
        },
      };

      const result = uploadingReducer(stateWithFile, action);

      expect(result.queue[0]).toBe('new-file');
      expect(result.queue[1]).toBe('existing-file');
    });

    it('should use provided status if specified', () => {
      const action = {
        type: 'ADD_UPLOADING_FILES',
        payload: {
          files: [
            {
              groupId: 'file-1',
              fileData: { name: 'test.pdf' },
              folderType: 'individual',
              entityId: 'user-1',
              folderId: 'folder-1',
              status: UploadUtils.UploadStatus.ERROR,
              errorMessage: 'Upload failed',
            },
          ],
        },
      };

      const result = uploadingReducer(initialState, action);

      expect(result.files['file-1'].status).toBe(UploadUtils.UploadStatus.ERROR);
      expect(result.files['file-1'].errorMessage).toBe('Upload failed');
    });
  });

  describe('REMOVE_UPLOADING_FILES', () => {
    it('should remove single file from queue', () => {
      const stateWithFiles = {
        queue: ['file-1', 'file-2'],
        files: {
          'file-1': { status: UploadUtils.UploadStatus.COMPLETED },
          'file-2': { status: UploadUtils.UploadStatus.UPLOADING },
        },
        openUploadingPopper: true,
      };

      const action = {
        type: 'REMOVE_UPLOADING_FILES',
        payload: { groupIds: ['file-1'] },
      };

      const result = uploadingReducer(stateWithFiles, action);

      expect(result.queue).toEqual(['file-2']);
      expect(result.files['file-1']).toBeUndefined();
      expect(result.files['file-2']).toBeDefined();
    });

    it('should remove multiple files from queue', () => {
      const stateWithFiles = {
        queue: ['file-1', 'file-2', 'file-3'],
        files: {
          'file-1': { status: UploadUtils.UploadStatus.COMPLETED },
          'file-2': { status: UploadUtils.UploadStatus.COMPLETED },
          'file-3': { status: UploadUtils.UploadStatus.UPLOADING },
        },
        openUploadingPopper: true,
      };

      const action = {
        type: 'REMOVE_UPLOADING_FILES',
        payload: { groupIds: ['file-1', 'file-2'] },
      };

      const result = uploadingReducer(stateWithFiles, action);

      expect(result.queue).toEqual(['file-3']);
      expect(Object.keys(result.files)).toEqual(['file-3']);
    });

    it('should handle removing non-existent files gracefully', () => {
      const stateWithFiles = {
        queue: ['file-1'],
        files: { 'file-1': { status: UploadUtils.UploadStatus.COMPLETED } },
        openUploadingPopper: true,
      };

      const action = {
        type: 'REMOVE_UPLOADING_FILES',
        payload: { groupIds: ['non-existent'] },
      };

      const result = uploadingReducer(stateWithFiles, action);

      expect(result.queue).toEqual(['file-1']);
      expect(result.files['file-1']).toBeDefined();
    });
  });

  describe('UPDATE_UPLOADING_FILE', () => {
    it('should update file status', () => {
      const stateWithFile = {
        queue: ['file-1'],
        files: {
          'file-1': {
            status: UploadUtils.UploadStatus.PROCESSING,
            progress: 0,
          },
        },
        openUploadingPopper: true,
      };

      const action = {
        type: 'UPDATE_UPLOADING_FILE',
        payload: {
          groupId: 'file-1',
          status: UploadUtils.UploadStatus.UPLOADING,
          progress: 50,
        },
      };

      const result = uploadingReducer(stateWithFile, action);

      expect(result.files['file-1'].status).toBe(UploadUtils.UploadStatus.UPLOADING);
      expect(result.files['file-1'].progress).toBe(50);
    });

    it('should update file with documentId', () => {
      const stateWithFile = {
        queue: ['file-1'],
        files: {
          'file-1': {
            status: UploadUtils.UploadStatus.UPLOADING,
            progress: 100,
            documentId: null,
          },
        },
        openUploadingPopper: true,
      };

      const action = {
        type: 'UPDATE_UPLOADING_FILE',
        payload: {
          groupId: 'file-1',
          status: UploadUtils.UploadStatus.COMPLETED,
          documentId: 'doc-123',
        },
      };

      const result = uploadingReducer(stateWithFile, action);

      expect(result.files['file-1'].status).toBe(UploadUtils.UploadStatus.COMPLETED);
      expect(result.files['file-1'].documentId).toBe('doc-123');
    });

    it('should update file with error information', () => {
      const stateWithFile = {
        queue: ['file-1'],
        files: {
          'file-1': {
            status: UploadUtils.UploadStatus.UPLOADING,
            progress: 25,
          },
        },
        openUploadingPopper: true,
      };

      const action = {
        type: 'UPDATE_UPLOADING_FILE',
        payload: {
          groupId: 'file-1',
          status: UploadUtils.UploadStatus.ERROR,
          errorMessage: 'Network error',
          errorCode: 'NETWORK_ERROR',
        },
      };

      const result = uploadingReducer(stateWithFile, action);

      expect(result.files['file-1'].status).toBe(UploadUtils.UploadStatus.ERROR);
      expect(result.files['file-1'].errorMessage).toBe('Network error');
      expect(result.files['file-1'].errorCode).toBe('NETWORK_ERROR');
    });

    it('should not update non-existent file', () => {
      const stateWithFile = {
        queue: ['file-1'],
        files: {
          'file-1': { status: UploadUtils.UploadStatus.UPLOADING },
        },
        openUploadingPopper: true,
      };

      const action = {
        type: 'UPDATE_UPLOADING_FILE',
        payload: {
          groupId: 'non-existent',
          status: UploadUtils.UploadStatus.COMPLETED,
        },
      };

      const result = uploadingReducer(stateWithFile, action);

      expect(result.files['non-existent']).toBeUndefined();
      expect(result.files['file-1'].status).toBe(UploadUtils.UploadStatus.UPLOADING);
    });

    it('should update file with organization and document data', () => {
      const stateWithFile = {
        queue: ['file-1'],
        files: {
          'file-1': { status: UploadUtils.UploadStatus.UPLOADING },
        },
        openUploadingPopper: true,
      };

      const action = {
        type: 'UPDATE_UPLOADING_FILE',
        payload: {
          groupId: 'file-1',
          organization: { id: 'org-123', name: 'Test Org' },
          document: { id: 'doc-456', name: 'test.pdf' },
        },
      };

      const result = uploadingReducer(stateWithFile, action);

      expect(result.files['file-1'].organization).toEqual({ id: 'org-123', name: 'Test Org' });
      expect(result.files['file-1'].document).toEqual({ id: 'doc-456', name: 'test.pdf' });
    });
  });

  describe('RETRY_UPLOADING_FILE', () => {
    it('should reset file status to PROCESSING', () => {
      const stateWithFile = {
        queue: ['file-1'],
        files: {
          'file-1': {
            status: UploadUtils.UploadStatus.ERROR,
            progress: 50,
            cancelToken: { cancel: jest.fn() },
          },
        },
        openUploadingPopper: true,
      };

      const action = {
        type: 'RETRY_UPLOADING_FILE',
        payload: { groupId: 'file-1' },
      };

      const result = uploadingReducer(stateWithFile, action);

      expect(result.files['file-1'].status).toBe(UploadUtils.UploadStatus.PROCESSING);
      expect(result.files['file-1'].progress).toBe(0);
      expect(result.files['file-1'].cancelToken).toBeNull();
    });
  });

  describe('CANCEL_UPLOADING_FILE', () => {
    it('should cancel uploading file and create new entry with ERROR status', () => {
      const mockCancelFn = jest.fn();
      const stateWithFile = {
        queue: ['file-1'],
        files: {
          'file-1': {
            status: UploadUtils.UploadStatus.UPLOADING,
            progress: 50,
            cancelToken: { cancel: mockCancelFn },
            oldGroupIndice: [],
          },
        },
        openUploadingPopper: true,
      };

      const action = {
        type: 'CANCEL_UPLOADING_FILE',
        payload: { groupId: 'file-1' },
      };

      const result = uploadingReducer(stateWithFile, action);

      expect(mockCancelFn).toHaveBeenCalled();
      expect(result.files['file-1']).toBeUndefined();
      expect(result.files['mock-uuid']).toBeDefined();
      expect(result.files['mock-uuid'].status).toBe(UploadUtils.UploadStatus.ERROR);
      expect(result.files['mock-uuid'].oldGroupIndice).toContain('file-1');
    });

    it('should not cancel file at 100% progress during UPLOADING', () => {
      const mockCancelFn = jest.fn();
      const stateWithFile = {
        queue: ['file-1'],
        files: {
          'file-1': {
            status: UploadUtils.UploadStatus.UPLOADING,
            progress: 100,
            cancelToken: { cancel: mockCancelFn },
            oldGroupIndice: [],
          },
        },
        openUploadingPopper: true,
      };

      const action = {
        type: 'CANCEL_UPLOADING_FILE',
        payload: { groupId: 'file-1' },
      };

      const result = uploadingReducer(stateWithFile, action);

      expect(mockCancelFn).not.toHaveBeenCalled();
      expect(result.files['file-1']).toBeDefined();
    });

    it('should not cancel COMPLETED file', () => {
      const stateWithFile = {
        queue: ['file-1'],
        files: {
          'file-1': {
            status: UploadUtils.UploadStatus.COMPLETED,
            progress: 100,
            cancelToken: null,
            oldGroupIndice: [],
          },
        },
        openUploadingPopper: true,
      };

      const action = {
        type: 'CANCEL_UPLOADING_FILE',
        payload: { groupId: 'file-1' },
      };

      const result = uploadingReducer(stateWithFile, action);

      expect(result.files['file-1']).toBeDefined();
      expect(result.files['file-1'].status).toBe(UploadUtils.UploadStatus.COMPLETED);
    });

    it('should cancel PROCESSING file', () => {
      const mockCancelFn = jest.fn();
      const stateWithFile = {
        queue: ['file-1'],
        files: {
          'file-1': {
            status: UploadUtils.UploadStatus.PROCESSING,
            progress: 0,
            cancelToken: { cancel: mockCancelFn },
            oldGroupIndice: [],
          },
        },
        openUploadingPopper: true,
      };

      const action = {
        type: 'CANCEL_UPLOADING_FILE',
        payload: { groupId: 'file-1' },
      };

      const result = uploadingReducer(stateWithFile, action);

      expect(mockCancelFn).toHaveBeenCalled();
      expect(result.files['mock-uuid']).toBeDefined();
      expect(result.files['mock-uuid'].status).toBe(UploadUtils.UploadStatus.ERROR);
    });

    it('should handle file without cancelToken', () => {
      const stateWithFile = {
        queue: ['file-1'],
        files: {
          'file-1': {
            status: UploadUtils.UploadStatus.UPLOADING,
            progress: 50,
            cancelToken: null,
            oldGroupIndice: [],
          },
        },
        openUploadingPopper: true,
      };

      const action = {
        type: 'CANCEL_UPLOADING_FILE',
        payload: { groupId: 'file-1' },
      };

      // Should not throw
      expect(() => uploadingReducer(stateWithFile, action)).not.toThrow();
    });
  });

  describe('CANCEL_ALL_UPLOADING_FILES', () => {
    it('should cancel all uploading and processing files', () => {
      const mockCancelFn1 = jest.fn();
      const mockCancelFn2 = jest.fn();
      const stateWithFiles = {
        queue: ['file-1', 'file-2', 'file-3'],
        files: {
          'file-1': {
            status: UploadUtils.UploadStatus.UPLOADING,
            progress: 50,
            cancelToken: { cancel: mockCancelFn1 },
            oldGroupIndice: [],
          },
          'file-2': {
            status: UploadUtils.UploadStatus.PROCESSING,
            progress: 0,
            cancelToken: { cancel: mockCancelFn2 },
            oldGroupIndice: [],
          },
          'file-3': {
            status: UploadUtils.UploadStatus.COMPLETED,
            progress: 100,
            cancelToken: null,
            oldGroupIndice: [],
          },
        },
        openUploadingPopper: true,
      };

      const action = { type: 'CANCEL_ALL_UPLOADING_FILES' };

      const result = uploadingReducer(stateWithFiles, action);

      expect(mockCancelFn1).toHaveBeenCalled();
      expect(mockCancelFn2).toHaveBeenCalled();
      // Completed file should remain unchanged
      expect(result.files['file-3']).toBeDefined();
    });
  });

  describe('REMOVE_ALL_UPLOADING', () => {
    it('should reset to empty state', () => {
      const stateWithFiles = {
        queue: ['file-1', 'file-2'],
        files: {
          'file-1': { status: UploadUtils.UploadStatus.COMPLETED },
          'file-2': { status: UploadUtils.UploadStatus.UPLOADING },
        },
        openUploadingPopper: true,
      };

      const action = { type: 'REMOVE_ALL_UPLOADING' };

      const result = uploadingReducer(stateWithFiles, action);

      expect(result).toEqual({
        queue: [],
        files: {},
        openUploadingPopper: false,
      });
    });
  });

  describe('Unknown action', () => {
    it('should return current state for unknown action', () => {
      const currentState = {
        queue: ['file-1'],
        files: { 'file-1': { status: UploadUtils.UploadStatus.UPLOADING } },
        openUploadingPopper: true,
      };

      const action = { type: 'UNKNOWN_ACTION' };

      const result = uploadingReducer(currentState, action);

      expect(result).toBe(currentState);
    });
  });
});

