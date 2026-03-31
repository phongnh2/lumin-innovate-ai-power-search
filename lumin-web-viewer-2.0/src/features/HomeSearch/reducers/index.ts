import produce from 'immer';

import { IDocumentBase } from 'interfaces/document/document.interface';
import { IFolder } from 'interfaces/folder/folder.interface';

export enum ActionTypes {
  SET_LIST_DATA = 'SET_LIST_DATA',
  SET_LOADING = 'SET_LOADING',
  UPDATE_DOCUMENT_INFO = 'UPDATE_DOCUMENT_INFO',
  DELETE_DOCUMENT = 'DELETE_DOCUMENT',
  ADD_DOCUMENT = 'ADD_DOCUMENT',
  UPDATE_FOLDER_INFO = 'UPDATE_FOLDER_INFO',
  DELETE_FOLDER = 'DELETE_FOLDER',
  SET_SEARCH_KEY = 'SET_SEARCH_KEY',
}

export type ActionType =
  | {
      type: ActionTypes.SET_LIST_DATA;
      payload: {
        folders: IFolder[];
        documents: IDocumentBase[];
        total?: number;
        cursor?: string;
      };
    }
  | {
      type: ActionTypes.SET_LOADING;
      payload: {
        value: boolean;
      };
    }
  | {
      type: ActionTypes.UPDATE_DOCUMENT_INFO;
      payload: {
        document: IDocumentBase;
      };
    }
  | {
      type: ActionTypes.DELETE_DOCUMENT;
      payload: {
        documentIds: string[];
      };
    }
  | {
      type: ActionTypes.ADD_DOCUMENT;
      payload: {
        document: IDocumentBase;
      };
    }
  | {
      type: ActionTypes.UPDATE_FOLDER_INFO;
      payload: {
        folder: IFolder;
      };
    }
  | {
      type: ActionTypes.DELETE_FOLDER;
      payload: {
        folderIds: string[];
      };
    }
  | {
      type: ActionTypes.SET_SEARCH_KEY;
      payload: {
        value: string;
      };
    };

export type StateType = {
  folders: IFolder[];
  documents: IDocumentBase[];
  total: number;
  cursor?: string;
  isLoading: boolean;
  searchKey: string;
};

export const initialState: StateType = {
  folders: [],
  documents: [],
  total: 0,
  isLoading: true,
  searchKey: '',
};

export const searchResultReducer = (state: StateType, action: ActionType) => {
  switch (action.type) {
    case ActionTypes.SET_LIST_DATA: {
      const { folders, documents, total, cursor } = action.payload;
      const updatedTotal = !total ? state.total : total;
      return {
        ...state,
        folders,
        documents,
        total: updatedTotal,
        cursor,
      };
    }
    case ActionTypes.SET_LOADING:
      return {
        ...state,
        isLoading: action.payload.value,
      };
    case ActionTypes.UPDATE_DOCUMENT_INFO: {
      const { document: updatedDocument } = action.payload;
      const { _id: documentId } = updatedDocument;
      return produce(state, (draftState) => {
        const { documents } = draftState;
        const index = documents.findIndex((doc) => doc._id === documentId);
        if (index !== -1) {
          const result = Object.assign(documents[index], updatedDocument);
          documents[index] = result;
        }
      });
    }
    case ActionTypes.DELETE_DOCUMENT: {
      const { documentIds } = action.payload;
      return produce(state, (draftState) => {
        const { documents, total } = draftState;
        const updatedDocuments = documents.filter((doc) => !documentIds.includes(doc._id));
        draftState.documents = updatedDocuments;
        draftState.total = total - (documents.length - updatedDocuments.length);
      });
    }
    case ActionTypes.ADD_DOCUMENT: {
      const { document } = action.payload;
      return produce(state, (draftState) => {
        const { documents } = draftState;
        const index = documents.findIndex((doc) => doc._id === document._id);
        if (index !== -1) {
          const [existingDocument] = documents.splice(index, 1);
          documents.unshift(existingDocument);
        } else {
          documents.unshift(document);
        }
      });
    }
    case ActionTypes.UPDATE_FOLDER_INFO: {
      const { folder: updatedFolder } = action.payload;
      const { _id: folderId } = updatedFolder;
      return produce(state, (draftState) => {
        const { folders } = draftState;
        const index = folders.findIndex((folder) => folder._id === folderId);
        if (index !== -1) {
          folders[index] = Object.assign(folders[index], updatedFolder);
        }
      });
    }
    case ActionTypes.DELETE_FOLDER: {
      const { folderIds } = action.payload;
      return produce(state, (draftState) => {
        const { folders, total } = draftState;
        const updatedFolders = folders.filter((folder) => !folderIds.includes(folder._id));
        draftState.folders = updatedFolders;
        draftState.total = total - (folders.length - updatedFolders.length);
      });
    }
    case ActionTypes.SET_SEARCH_KEY:
      return {
        ...state,
        searchKey: action.payload.value,
      };
    default:
      return state;
  }
};
