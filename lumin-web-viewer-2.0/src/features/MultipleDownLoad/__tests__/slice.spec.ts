import multipleDownloadReducer, {
  multipleDownloadSlice,
  multipleDownloadSelectors,
  setErrorModalType,
  setErrorModalOpened,
  setErrorDocuments,
  addErrorDocument,
  setErrorTypes,
  addErrorType,
  setHasOpenedDropboxAuthWindow,
  resetHasOpenedDropboxAuthWindow,
} from '../slice';
import { ErrorModalType } from '../constants';
import { ErrorDocument, MultipleDownloadState } from '../interfaces';

describe('MultipleDownload Slice', () => {
  const initialState: MultipleDownloadState = {
    errorDocuments: [],
    errorModal: {
      type: ErrorModalType.SOME_ITEMS_FAILED_TO_DOWNLOAD,
      opened: false,
    },
    errorTypes: [],
    hasOpenedDropboxAuthWindow: false,
  };

  describe('slice configuration', () => {
    it('should have correct name', () => {
      expect(multipleDownloadSlice.name).toBe('MULTIPLE_DOWNLOAD');
    });

    it('should return initial state', () => {
      expect(multipleDownloadReducer(undefined, { type: 'unknown' })).toEqual(initialState);
    });
  });

  describe('setErrorModalType', () => {
    it('should set error modal type to SOME_ITEMS_FAILED_TO_DOWNLOAD', () => {
      const action = setErrorModalType(ErrorModalType.SOME_ITEMS_FAILED_TO_DOWNLOAD);
      const state = multipleDownloadReducer(initialState, action);
      
      expect(state.errorModal.type).toBe(ErrorModalType.SOME_ITEMS_FAILED_TO_DOWNLOAD);
    });

    it('should set error modal type to ALL_ITEMS_FAILED_TO_DOWNLOAD', () => {
      const action = setErrorModalType(ErrorModalType.ALL_ITEMS_FAILED_TO_DOWNLOAD);
      const state = multipleDownloadReducer(initialState, action);
      
      expect(state.errorModal.type).toBe(ErrorModalType.ALL_ITEMS_FAILED_TO_DOWNLOAD);
    });

    it('should not affect other state properties', () => {
      const stateWithData: MultipleDownloadState = {
        ...initialState,
        errorDocuments: [{ _id: '1', name: 'test', errorMessage: 'error' }],
        errorModal: {
          type: ErrorModalType.SOME_ITEMS_FAILED_TO_DOWNLOAD,
          opened: true,
        },
      };
      
      const action = setErrorModalType(ErrorModalType.ALL_ITEMS_FAILED_TO_DOWNLOAD);
      const state = multipleDownloadReducer(stateWithData, action);
      
      expect(state.errorDocuments).toEqual(stateWithData.errorDocuments);
      expect(state.errorModal.opened).toBe(true);
    });
  });

  describe('setErrorModalOpened', () => {
    it('should set error modal opened to true', () => {
      const action = setErrorModalOpened(true);
      const state = multipleDownloadReducer(initialState, action);
      
      expect(state.errorModal.opened).toBe(true);
    });

    it('should set error modal opened to false', () => {
      const stateWithModalOpen: MultipleDownloadState = {
        ...initialState,
        errorModal: {
          ...initialState.errorModal,
          opened: true,
        },
      };
      
      const action = setErrorModalOpened(false);
      const state = multipleDownloadReducer(stateWithModalOpen, action);
      
      expect(state.errorModal.opened).toBe(false);
    });
  });

  describe('setErrorDocuments', () => {
    it('should set error documents array', () => {
      const errorDocs: ErrorDocument[] = [
        { _id: '1', name: 'doc1.pdf', errorMessage: 'Error 1' },
        { _id: '2', name: 'doc2.pdf', errorMessage: 'Error 2' },
      ];
      
      const action = setErrorDocuments(errorDocs);
      const state = multipleDownloadReducer(initialState, action);
      
      expect(state.errorDocuments).toEqual(errorDocs);
    });

    it('should replace existing error documents', () => {
      const existingState: MultipleDownloadState = {
        ...initialState,
        errorDocuments: [{ _id: 'old', name: 'old.pdf', errorMessage: 'Old error' }],
      };
      
      const newDocs: ErrorDocument[] = [
        { _id: 'new', name: 'new.pdf', errorMessage: 'New error' },
      ];
      
      const action = setErrorDocuments(newDocs);
      const state = multipleDownloadReducer(existingState, action);
      
      expect(state.errorDocuments).toEqual(newDocs);
      expect(state.errorDocuments.length).toBe(1);
    });

    it('should set empty array', () => {
      const existingState: MultipleDownloadState = {
        ...initialState,
        errorDocuments: [{ _id: '1', name: 'doc.pdf', errorMessage: 'Error' }],
      };
      
      const action = setErrorDocuments([]);
      const state = multipleDownloadReducer(existingState, action);
      
      expect(state.errorDocuments).toEqual([]);
    });
  });

  describe('addErrorDocument', () => {
    it('should add error document to empty array', () => {
      const errorDoc: ErrorDocument = { _id: '1', name: 'doc.pdf', errorMessage: 'Error' };
      
      const action = addErrorDocument(errorDoc);
      const state = multipleDownloadReducer(initialState, action);
      
      expect(state.errorDocuments).toHaveLength(1);
      expect(state.errorDocuments[0]).toEqual(errorDoc);
    });

    it('should append error document to existing array', () => {
      const existingState: MultipleDownloadState = {
        ...initialState,
        errorDocuments: [{ _id: '1', name: 'doc1.pdf', errorMessage: 'Error 1' }],
      };
      
      const newDoc: ErrorDocument = { _id: '2', name: 'doc2.pdf', errorMessage: 'Error 2' };
      
      const action = addErrorDocument(newDoc);
      const state = multipleDownloadReducer(existingState, action);
      
      expect(state.errorDocuments).toHaveLength(2);
      expect(state.errorDocuments[1]).toEqual(newDoc);
    });

    it('should handle ReactNode as errorMessage', () => {
      const errorDoc: ErrorDocument = { 
        _id: '1', 
        name: 'doc.pdf', 
        errorMessage: '<span>Error</span>' as unknown as React.ReactNode,
      };
      
      const action = addErrorDocument(errorDoc);
      const state = multipleDownloadReducer(initialState, action);
      
      expect(state.errorDocuments[0].errorMessage).toBe('<span>Error</span>');
    });
  });

  describe('setErrorTypes', () => {
    it('should set error types array', () => {
      const errorTypes = ['ERROR_1', 'ERROR_2'];
      
      const action = setErrorTypes(errorTypes);
      const state = multipleDownloadReducer(initialState, action);
      
      expect(state.errorTypes).toEqual(errorTypes);
    });

    it('should replace existing error types', () => {
      const existingState: MultipleDownloadState = {
        ...initialState,
        errorTypes: ['OLD_ERROR'],
      };
      
      const newTypes = ['NEW_ERROR_1', 'NEW_ERROR_2'];
      
      const action = setErrorTypes(newTypes);
      const state = multipleDownloadReducer(existingState, action);
      
      expect(state.errorTypes).toEqual(newTypes);
    });

    it('should set empty array', () => {
      const existingState: MultipleDownloadState = {
        ...initialState,
        errorTypes: ['ERROR'],
      };
      
      const action = setErrorTypes([]);
      const state = multipleDownloadReducer(existingState, action);
      
      expect(state.errorTypes).toEqual([]);
    });
  });

  describe('addErrorType', () => {
    it('should add error type to empty array', () => {
      const action = addErrorType('NEW_ERROR');
      const state = multipleDownloadReducer(initialState, action);
      
      expect(state.errorTypes).toHaveLength(1);
      expect(state.errorTypes[0]).toBe('NEW_ERROR');
    });

    it('should append error type to existing array', () => {
      const existingState: MultipleDownloadState = {
        ...initialState,
        errorTypes: ['ERROR_1'],
      };
      
      const action = addErrorType('ERROR_2');
      const state = multipleDownloadReducer(existingState, action);
      
      expect(state.errorTypes).toHaveLength(2);
      expect(state.errorTypes).toContain('ERROR_1');
      expect(state.errorTypes).toContain('ERROR_2');
    });

    it('should allow duplicate error types', () => {
      const existingState: MultipleDownloadState = {
        ...initialState,
        errorTypes: ['ERROR_1'],
      };
      
      const action = addErrorType('ERROR_1');
      const state = multipleDownloadReducer(existingState, action);
      
      expect(state.errorTypes).toHaveLength(2);
      expect(state.errorTypes).toEqual(['ERROR_1', 'ERROR_1']);
    });
  });

  describe('setHasOpenedDropboxAuthWindow', () => {
    it('should set hasOpenedDropboxAuthWindow to true', () => {
      const action = setHasOpenedDropboxAuthWindow(true);
      const state = multipleDownloadReducer(initialState, action);
      
      expect(state.hasOpenedDropboxAuthWindow).toBe(true);
    });

    it('should set hasOpenedDropboxAuthWindow to false', () => {
      const existingState: MultipleDownloadState = {
        ...initialState,
        hasOpenedDropboxAuthWindow: true,
      };
      
      const action = setHasOpenedDropboxAuthWindow(false);
      const state = multipleDownloadReducer(existingState, action);
      
      expect(state.hasOpenedDropboxAuthWindow).toBe(false);
    });
  });

  describe('resetHasOpenedDropboxAuthWindow', () => {
    it('should reset hasOpenedDropboxAuthWindow to false', () => {
      const existingState: MultipleDownloadState = {
        ...initialState,
        hasOpenedDropboxAuthWindow: true,
      };
      
      const action = resetHasOpenedDropboxAuthWindow();
      const state = multipleDownloadReducer(existingState, action);
      
      expect(state.hasOpenedDropboxAuthWindow).toBe(false);
    });

    it('should keep false if already false', () => {
      const action = resetHasOpenedDropboxAuthWindow();
      const state = multipleDownloadReducer(initialState, action);
      
      expect(state.hasOpenedDropboxAuthWindow).toBe(false);
    });
  });

  describe('selectors', () => {
    const mockState = {
      multipleDownload: {
        errorDocuments: [{ _id: '1', name: 'doc.pdf', errorMessage: 'Error' }],
        errorModal: {
          type: ErrorModalType.ALL_ITEMS_FAILED_TO_DOWNLOAD,
          opened: true,
        },
        errorTypes: ['ERROR_TYPE_1'],
        hasOpenedDropboxAuthWindow: true,
      } as MultipleDownloadState,
    };

    describe('getErrorDocuments', () => {
      it('should return error documents', () => {
        const result = multipleDownloadSelectors.getErrorDocuments(mockState);
        
        expect(result).toEqual(mockState.multipleDownload.errorDocuments);
      });

      it('should return empty array when no documents', () => {
        const emptyState = {
          multipleDownload: { ...initialState },
        };
        
        const result = multipleDownloadSelectors.getErrorDocuments(emptyState);
        
        expect(result).toEqual([]);
      });
    });

    describe('getErrorModal', () => {
      it('should return error modal state', () => {
        const result = multipleDownloadSelectors.getErrorModal(mockState);
        
        expect(result).toEqual(mockState.multipleDownload.errorModal);
      });

      it('should return correct modal type and opened state', () => {
        const result = multipleDownloadSelectors.getErrorModal(mockState);
        
        expect(result.type).toBe(ErrorModalType.ALL_ITEMS_FAILED_TO_DOWNLOAD);
        expect(result.opened).toBe(true);
      });
    });

    describe('getErrorTypes', () => {
      it('should return error types', () => {
        const result = multipleDownloadSelectors.getErrorTypes(mockState);
        
        expect(result).toEqual(['ERROR_TYPE_1']);
      });

      it('should return empty array when no error types', () => {
        const emptyState = {
          multipleDownload: { ...initialState },
        };
        
        const result = multipleDownloadSelectors.getErrorTypes(emptyState);
        
        expect(result).toEqual([]);
      });
    });

    describe('getHasOpenedDropboxAuthWindow', () => {
      it('should return true when dropbox auth window was opened', () => {
        const result = multipleDownloadSelectors.getHasOpenedDropboxAuthWindow(mockState);
        
        expect(result).toBe(true);
      });

      it('should return false when dropbox auth window was not opened', () => {
        const emptyState = {
          multipleDownload: { ...initialState },
        };
        
        const result = multipleDownloadSelectors.getHasOpenedDropboxAuthWindow(emptyState);
        
        expect(result).toBe(false);
      });
    });
  });

  describe('action combinations', () => {
    it('should handle multiple actions in sequence', () => {
      let state = initialState;
      
      // Add error document
      state = multipleDownloadReducer(state, addErrorDocument({
        _id: '1',
        name: 'doc.pdf',
        errorMessage: 'Error',
      }));
      
      // Add error type
      state = multipleDownloadReducer(state, addErrorType('DOCUMENT_EXPIRED'));
      
      // Open modal
      state = multipleDownloadReducer(state, setErrorModalOpened(true));
      state = multipleDownloadReducer(state, setErrorModalType(ErrorModalType.SOME_ITEMS_FAILED_TO_DOWNLOAD));
      
      expect(state.errorDocuments).toHaveLength(1);
      expect(state.errorTypes).toContain('DOCUMENT_EXPIRED');
      expect(state.errorModal.opened).toBe(true);
      expect(state.errorModal.type).toBe(ErrorModalType.SOME_ITEMS_FAILED_TO_DOWNLOAD);
    });

    it('should clear all error data', () => {
      const existingState: MultipleDownloadState = {
        errorDocuments: [{ _id: '1', name: 'doc.pdf', errorMessage: 'Error' }],
        errorModal: {
          type: ErrorModalType.ALL_ITEMS_FAILED_TO_DOWNLOAD,
          opened: true,
        },
        errorTypes: ['ERROR_1', 'ERROR_2'],
        hasOpenedDropboxAuthWindow: true,
      };
      
      let state = existingState;
      
      state = multipleDownloadReducer(state, setErrorDocuments([]));
      state = multipleDownloadReducer(state, setErrorTypes([]));
      state = multipleDownloadReducer(state, setErrorModalOpened(false));
      state = multipleDownloadReducer(state, resetHasOpenedDropboxAuthWindow());
      
      expect(state.errorDocuments).toEqual([]);
      expect(state.errorTypes).toEqual([]);
      expect(state.errorModal.opened).toBe(false);
      expect(state.hasOpenedDropboxAuthWindow).toBe(false);
    });
  });
});

