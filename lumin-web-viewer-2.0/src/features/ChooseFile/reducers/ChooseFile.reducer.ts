import { IDocumentBase } from 'interfaces/document/document.interface';
import { IFolder } from 'interfaces/folder/folder.interface';

import { CurrentFolderType, CurrentLocationType, ListDataType } from '../types';

export type BreadcrumbData = {
  name: string;
  _id: string;
  folderType?: string;
};

export enum ActionTypes {
  SET_LOCATION_DATA = 'SET_LOCATION_DATA',
  SET_LOCATION_LOADING = 'SET_LOCATION_LOADING',
  SET_SELECTED_DOCUMENT = 'SET_SELECTED_DOCUMENT',
  SET_SEARCH_KEY = 'SET_SEARCH_KEY',
  SET_SELECTED_SEARCH_FOLDER = 'SET_SELECTED_SEARCH_FOLDER',
  SET_BREADCRUMB_DATA = 'SET_BREADCRUMB_DATA',
  GO_BACK_BREADCRUMB = 'GO_BACK_BREADCRUMB',
  ADD_BREADCRUMB_ITEM = 'ADD_BREADCRUMB_ITEM',
  REMOVE_BREADCRUMB_ITEM = 'REMOVE_BREADCRUMB_ITEM',
}

export type StateType = {
  currentLocation: CurrentLocationType;
  currentFolder: CurrentFolderType;
  locationData: {
    data: ListDataType[];
    pagination: {
      hasNextPage: boolean;
      cursor?: string;
    };
    isLoading: boolean;
  };
  selectedSearchFolder: IFolder;
  selectedDocument?: IDocumentBase;
  searchKey: string;
  breadcrumbData: BreadcrumbData[];
};

export const initialState: StateType = {
  currentLocation: null,
  currentFolder: null,
  selectedSearchFolder: null,
  locationData: {
    data: [],
    pagination: {
      hasNextPage: false,
    },
    isLoading: true,
  },
  searchKey: '',
  breadcrumbData: [],
};

export type Action =
  | {
      type: ActionTypes.SET_LOCATION_DATA;
      payload: {
        data: ListDataType[];
        hasNextPage: boolean;
        cursor?: string;
      };
    }
  | {
      type: ActionTypes.SET_LOCATION_LOADING;
      payload: {
        value: boolean;
      };
    }
  | {
      type: ActionTypes.SET_SELECTED_DOCUMENT;
      payload: {
        document: IDocumentBase;
      };
    }
  | {
      type: ActionTypes.SET_SEARCH_KEY;
      payload: {
        value: string;
      };
    }
  | {
      type: ActionTypes.SET_SELECTED_SEARCH_FOLDER;
      payload: {
        folder: IFolder;
      };
    }
  | {
      type: ActionTypes.SET_BREADCRUMB_DATA;
      payload: {
        breadcrumbData: BreadcrumbData[];
      };
    }
  | {
      type: ActionTypes.GO_BACK_BREADCRUMB;
    }
  | {
      type: ActionTypes.ADD_BREADCRUMB_ITEM;
      payload: {
        item: BreadcrumbData;
      };
    }
  | {
      type: ActionTypes.REMOVE_BREADCRUMB_ITEM;
      payload: {
        item: BreadcrumbData;
      };
    };

export const chooseFileReducer = (state: StateType, action: Action): StateType => {
  switch (action.type) {
    case ActionTypes.SET_LOCATION_DATA: {
      const { data, hasNextPage, cursor } = action.payload;
      return {
        ...state,
        locationData: {
          ...state.locationData,
          data,
          pagination: {
            hasNextPage,
            cursor,
          },
        },
      };
    }
    case ActionTypes.SET_LOCATION_LOADING:
      return {
        ...state,
        locationData: {
          ...state.locationData,
          isLoading: action.payload.value,
        },
      };
    case ActionTypes.SET_SELECTED_DOCUMENT:
      return {
        ...state,
        selectedDocument: action.payload.document,
      };
    case ActionTypes.SET_SEARCH_KEY:
      return {
        ...state,
        searchKey: action.payload.value,
      };
    case ActionTypes.SET_SELECTED_SEARCH_FOLDER:
      return {
        ...state,
        selectedSearchFolder: action.payload.folder,
      };
    case ActionTypes.ADD_BREADCRUMB_ITEM: {
      return {
        ...state,
        breadcrumbData: [...state.breadcrumbData, action.payload.item],
      };
    }
    case ActionTypes.REMOVE_BREADCRUMB_ITEM: {
      const index = state.breadcrumbData.findIndex((item) => item._id === action.payload.item._id);
      return {
        ...state,
        breadcrumbData: state.breadcrumbData.slice(0, index + 1),
      };
    }
    case ActionTypes.SET_BREADCRUMB_DATA: {
      return {
        ...state,
        breadcrumbData: action.payload.breadcrumbData,
      };
    }
    case ActionTypes.GO_BACK_BREADCRUMB: {
      return {
        ...state,
        breadcrumbData: state.breadcrumbData.slice(0, -1),
      };
    }
    default:
      return state;
  }
};
