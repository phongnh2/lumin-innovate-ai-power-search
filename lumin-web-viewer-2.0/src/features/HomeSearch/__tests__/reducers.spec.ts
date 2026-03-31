import { searchResultReducer, ActionTypes, initialState, StateType } from '../reducers';

describe('searchResultReducer', () => {
  describe('initialState', () => {
    it('has correct default values', () => {
      expect(initialState).toEqual({
        folders: [],
        documents: [],
        total: 0,
        isLoading: true,
        searchKey: '',
      });
    });
  });

  describe('SET_LIST_DATA', () => {
    it('sets folders and documents', () => {
      const folders = [{ _id: 'folder-1', name: 'Folder 1' }];
      const documents = [{ _id: 'doc-1', name: 'Document 1' }];
      
      const result = searchResultReducer(initialState, {
        type: ActionTypes.SET_LIST_DATA,
        payload: { folders, documents, total: 2, cursor: 'cursor-1' } as any,
      });

      expect(result.folders).toEqual(folders);
      expect(result.documents).toEqual(documents);
      expect(result.total).toBe(2);
      expect(result.cursor).toBe('cursor-1');
    });

    it('preserves existing total when not provided', () => {
      const stateWithTotal = { ...initialState, total: 10 };
      
      const result = searchResultReducer(stateWithTotal, {
        type: ActionTypes.SET_LIST_DATA,
        payload: { folders: [], documents: [] } as any,
      });

      expect(result.total).toBe(10);
    });

    it('updates total when provided', () => {
      const stateWithTotal = { ...initialState, total: 10 };
      
      const result = searchResultReducer(stateWithTotal, {
        type: ActionTypes.SET_LIST_DATA,
        payload: { folders: [], documents: [], total: 5 } as any,
      });

      expect(result.total).toBe(5);
    });
  });

  describe('SET_LOADING', () => {
    it('sets loading to true', () => {
      const result = searchResultReducer({ ...initialState, isLoading: false }, {
        type: ActionTypes.SET_LOADING,
        payload: { value: true },
      });

      expect(result.isLoading).toBe(true);
    });

    it('sets loading to false', () => {
      const result = searchResultReducer(initialState, {
        type: ActionTypes.SET_LOADING,
        payload: { value: false },
      });

      expect(result.isLoading).toBe(false);
    });
  });

  describe('UPDATE_DOCUMENT_INFO', () => {
    it('updates existing document', () => {
      const state: StateType = {
        ...initialState,
        documents: [
          { _id: 'doc-1', name: 'Old Name' } as any,
          { _id: 'doc-2', name: 'Document 2' } as any,
        ],
      };

      const result = searchResultReducer(state, {
        type: ActionTypes.UPDATE_DOCUMENT_INFO,
        payload: { document: { _id: 'doc-1', name: 'New Name' } as any },
      });

      expect(result.documents[0].name).toBe('New Name');
      expect(result.documents[1].name).toBe('Document 2');
    });

    it('does nothing when document not found', () => {
      const state: StateType = {
        ...initialState,
        documents: [{ _id: 'doc-1', name: 'Document 1' } as any],
      };

      const result = searchResultReducer(state, {
        type: ActionTypes.UPDATE_DOCUMENT_INFO,
        payload: { document: { _id: 'non-existent', name: 'New Name' } as any },
      });

      expect(result.documents.length).toBe(1);
      expect(result.documents[0].name).toBe('Document 1');
    });
  });

  describe('DELETE_DOCUMENT', () => {
    it('deletes document by id', () => {
      const state: StateType = {
        ...initialState,
        documents: [
          { _id: 'doc-1', name: 'Document 1' } as any,
          { _id: 'doc-2', name: 'Document 2' } as any,
        ],
        total: 2,
      };

      const result = searchResultReducer(state, {
        type: ActionTypes.DELETE_DOCUMENT,
        payload: { documentIds: ['doc-1'] },
      });

      expect(result.documents.length).toBe(1);
      expect(result.documents[0]._id).toBe('doc-2');
      expect(result.total).toBe(1);
    });

    it('deletes multiple documents', () => {
      const state: StateType = {
        ...initialState,
        documents: [
          { _id: 'doc-1', name: 'Document 1' } as any,
          { _id: 'doc-2', name: 'Document 2' } as any,
          { _id: 'doc-3', name: 'Document 3' } as any,
        ],
        total: 3,
      };

      const result = searchResultReducer(state, {
        type: ActionTypes.DELETE_DOCUMENT,
        payload: { documentIds: ['doc-1', 'doc-3'] },
      });

      expect(result.documents.length).toBe(1);
      expect(result.documents[0]._id).toBe('doc-2');
      expect(result.total).toBe(1);
    });
  });

  describe('ADD_DOCUMENT', () => {
    it('adds new document to beginning', () => {
      const state: StateType = {
        ...initialState,
        documents: [{ _id: 'doc-1', name: 'Document 1' } as any],
      };

      const result = searchResultReducer(state, {
        type: ActionTypes.ADD_DOCUMENT,
        payload: { document: { _id: 'doc-2', name: 'Document 2' } as any },
      });

      expect(result.documents.length).toBe(2);
      expect(result.documents[0]._id).toBe('doc-2');
    });

    it('moves existing document to beginning', () => {
      const state: StateType = {
        ...initialState,
        documents: [
          { _id: 'doc-1', name: 'Document 1' } as any,
          { _id: 'doc-2', name: 'Document 2' } as any,
        ],
      };

      const result = searchResultReducer(state, {
        type: ActionTypes.ADD_DOCUMENT,
        payload: { document: { _id: 'doc-2', name: 'Document 2' } as any },
      });

      expect(result.documents.length).toBe(2);
      expect(result.documents[0]._id).toBe('doc-2');
    });
  });

  describe('UPDATE_FOLDER_INFO', () => {
    it('updates existing folder', () => {
      const state: StateType = {
        ...initialState,
        folders: [
          { _id: 'folder-1', name: 'Old Name' } as any,
          { _id: 'folder-2', name: 'Folder 2' } as any,
        ],
      };

      const result = searchResultReducer(state, {
        type: ActionTypes.UPDATE_FOLDER_INFO,
        payload: { folder: { _id: 'folder-1', name: 'New Name' } as any },
      });

      expect(result.folders[0].name).toBe('New Name');
      expect(result.folders[1].name).toBe('Folder 2');
    });

    it('does nothing when folder not found', () => {
      const state: StateType = {
        ...initialState,
        folders: [{ _id: 'folder-1', name: 'Folder 1' } as any],
      };

      const result = searchResultReducer(state, {
        type: ActionTypes.UPDATE_FOLDER_INFO,
        payload: { folder: { _id: 'non-existent', name: 'New Name' } as any },
      });

      expect(result.folders.length).toBe(1);
      expect(result.folders[0].name).toBe('Folder 1');
    });
  });

  describe('DELETE_FOLDER', () => {
    it('deletes folder by id', () => {
      const state: StateType = {
        ...initialState,
        folders: [
          { _id: 'folder-1', name: 'Folder 1' } as any,
          { _id: 'folder-2', name: 'Folder 2' } as any,
        ],
        total: 2,
      };

      const result = searchResultReducer(state, {
        type: ActionTypes.DELETE_FOLDER,
        payload: { folderIds: ['folder-1'] },
      });

      expect(result.folders.length).toBe(1);
      expect(result.folders[0]._id).toBe('folder-2');
      expect(result.total).toBe(1);
    });

    it('deletes multiple folders', () => {
      const state: StateType = {
        ...initialState,
        folders: [
          { _id: 'folder-1', name: 'Folder 1' } as any,
          { _id: 'folder-2', name: 'Folder 2' } as any,
          { _id: 'folder-3', name: 'Folder 3' } as any,
        ],
        total: 3,
      };

      const result = searchResultReducer(state, {
        type: ActionTypes.DELETE_FOLDER,
        payload: { folderIds: ['folder-1', 'folder-3'] },
      });

      expect(result.folders.length).toBe(1);
      expect(result.folders[0]._id).toBe('folder-2');
      expect(result.total).toBe(1);
    });
  });

  describe('SET_SEARCH_KEY', () => {
    it('sets search key', () => {
      const result = searchResultReducer(initialState, {
        type: ActionTypes.SET_SEARCH_KEY,
        payload: { value: 'test query' },
      });

      expect(result.searchKey).toBe('test query');
    });

    it('clears search key', () => {
      const state = { ...initialState, searchKey: 'existing query' };
      
      const result = searchResultReducer(state, {
        type: ActionTypes.SET_SEARCH_KEY,
        payload: { value: '' },
      });

      expect(result.searchKey).toBe('');
    });
  });

  describe('default case', () => {
    it('returns current state for unknown action', () => {
      const state = { ...initialState, searchKey: 'test' };
      
      const result = searchResultReducer(state, { type: 'UNKNOWN_ACTION' } as any);

      expect(result).toEqual(state);
    });
  });
});

