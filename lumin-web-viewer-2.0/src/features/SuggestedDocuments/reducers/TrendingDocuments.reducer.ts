import produce from 'immer';

import { ownerFilter } from 'constants/documentConstants';

import { IDocumentBase } from 'interfaces/document/document.interface';

import { ActionMap } from '../types/reducer';

export enum ActionTypes {
  SET_DOCUMENTS = 'SET_DOCUMENTS',
  SET_FETCHING_DOCUMENTS = 'SET_FETCHING_DOCUMENTS',
  SET_OWNED_FILTER = 'SET_OWNED_FILTER',
  UPDATE_DOCUMENT_INFO = 'UPDATE_DOCUMENT_INFO',
  DELETE_DOCUMENT = 'DELETE_DOCUMENT',
  ADD_DOCUMENT = 'ADD_DOCUMENT',
}

type Payload = {
  [ActionTypes.SET_DOCUMENTS]: {
    documents: IDocumentBase[];
    total: number;
    hasNextPage: boolean;
    cursor?: string;
  };
  [ActionTypes.SET_FETCHING_DOCUMENTS]: {
    isFetching: boolean;
  };
  [ActionTypes.SET_OWNED_FILTER]: {
    value: string;
  };
  [ActionTypes.UPDATE_DOCUMENT_INFO]: {
    document: IDocumentBase;
  };
  [ActionTypes.DELETE_DOCUMENT]: {
    documentIds: string[];
  };
  [ActionTypes.ADD_DOCUMENT]: {
    document: IDocumentBase;
  };
};

export type ActionType = ActionMap<Payload>[keyof ActionMap<Payload>];

export type StateType = {
  documents: IDocumentBase[];
  total: number;
  pagination: {
    hasNextPage: boolean;
    cursor?: string;
  };
  isFetching: boolean;
  ownedFilter: string;
};

export const initialState: StateType = {
  documents: [],
  total: 0,
  pagination: {
    hasNextPage: false,
  },
  isFetching: true,
  ownedFilter: ownerFilter.byAnyone,
};

export const trendingDocumentsReducer = (state: StateType, action: ActionType) => {
  switch (action.type) {
    case ActionTypes.SET_DOCUMENTS: {
      const { documents, total, hasNextPage, cursor } = action.payload;
      return {
        ...state,
        documents,
        total,
        pagination: {
          hasNextPage,
          cursor,
        },
      };
    }
    case ActionTypes.SET_FETCHING_DOCUMENTS:
      return {
        ...state,
        isFetching: action.payload.isFetching,
      };
    case ActionTypes.SET_OWNED_FILTER:
      return {
        ...state,
        ownedFilter: action.payload.value,
      };
    case ActionTypes.UPDATE_DOCUMENT_INFO: {
      const { document: updatedDocument } = action.payload;
      const { _id: documentId } = updatedDocument;
      return produce(state, (draftState) => {
        const { documents } = draftState;
        const index = documents.findIndex((doc) => doc._id === documentId);
        if (index !== -1) {
          documents[index] = Object.assign(documents[index], updatedDocument);
        }
      });
    }
    case ActionTypes.DELETE_DOCUMENT: {
      const { documentIds } = action.payload;
      return produce(state, (draftState) => {
        const { documents } = draftState;
        draftState.documents = documents.filter((doc) => !documentIds.includes(doc._id));
      });
    }
    case ActionTypes.ADD_DOCUMENT: {
      const { document } = action.payload;
      return produce(state, (draftState) => {
        const { documents } = draftState;
        documents.unshift(document);
      });
    }
    default:
      return state;
  }
};
