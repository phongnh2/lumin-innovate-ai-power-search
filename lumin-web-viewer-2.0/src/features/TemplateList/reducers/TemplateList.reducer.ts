import { DocumentTemplate } from 'interfaces/document/document.interface';

import { TemplateListState } from '../types/templateList';

export enum ActionTypes {
  SET_TEMPLATES = 'SET_TEMPLATES',
  SET_FETCHING_TEMPLATES = 'SET_FETCHING_TEMPLATES',
  ADD_TEMPLATE = 'ADD_TEMPLATE',
  UPDATE_TEMPLATE_INFO = 'UPDATE_TEMPLATE_INFO',
  DELETE_TEMPLATE = 'DELETE_TEMPLATE',
}

type SetTemplatesAction = {
  type: ActionTypes.SET_TEMPLATES;
  payload: {
    documents: DocumentTemplate[];
    hasNextPage: boolean;
    cursor: string;
  };
};

type SetFetchingTemplatesAction = {
  type: ActionTypes.SET_FETCHING_TEMPLATES;
  payload: {
    isFetching: boolean;
  };
};

type AddTemplateAction = {
  type: ActionTypes.ADD_TEMPLATE;
  payload: {
    document: DocumentTemplate;
  };
};

type UpdateTemplateInfoAction = {
  type: ActionTypes.UPDATE_TEMPLATE_INFO;
  payload: {
    document: DocumentTemplate;
  };
};

type DeleteTemplateAction = {
  type: ActionTypes.DELETE_TEMPLATE;
  payload: {
    documentIds: string[];
  };
};

export type TemplateListAction =
  | SetTemplatesAction
  | SetFetchingTemplatesAction
  | AddTemplateAction
  | UpdateTemplateInfoAction
  | DeleteTemplateAction;

export const initialState: TemplateListState = {
  documents: [],
  pagination: {
    hasNextPage: false,
    cursor: '',
  },
  isFetching: true,
};

export const templateListReducer = (state: TemplateListState, action: TemplateListAction): TemplateListState => {
  switch (action.type) {
    case ActionTypes.SET_TEMPLATES:
      return {
        ...state,
        documents: action.payload.documents,
        pagination: {
          hasNextPage: action.payload.hasNextPage,
          cursor: action.payload.cursor,
        },
      };
    case ActionTypes.SET_FETCHING_TEMPLATES:
      return {
        ...state,
        isFetching: action.payload.isFetching,
      };
    case ActionTypes.ADD_TEMPLATE: {
      const { document } = action.payload;
      const existingIndex = state.documents.findIndex((doc) => doc._id === document._id);

      let updatedDocuments: DocumentTemplate[];
      if (existingIndex !== -1) {
        // Move existing template to the beginning
        updatedDocuments = [
          state.documents[existingIndex],
          ...state.documents.slice(0, existingIndex),
          ...state.documents.slice(existingIndex + 1),
        ];
      } else {
        // Add new template to the beginning
        updatedDocuments = [document, ...state.documents];
      }

      return {
        ...state,
        documents: updatedDocuments,
      };
    }
    case ActionTypes.UPDATE_TEMPLATE_INFO: {
      const { document } = action.payload;
      const updatedDocuments = state.documents.map((doc) =>
        doc._id === document._id ? { ...doc, ...document } : doc
      );

      return {
        ...state,
        documents: updatedDocuments,
      };
    }
    case ActionTypes.DELETE_TEMPLATE: {
      const { documentIds } = action.payload;
      const updatedDocuments = state.documents.filter((doc) => !documentIds.includes(doc._id));

      return {
        ...state,
        documents: updatedDocuments,
      };
    }
    default:
      return state;
  }
};
