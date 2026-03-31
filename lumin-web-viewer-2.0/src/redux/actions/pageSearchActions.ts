import { Dispatch } from 'redux';

export const setFocusingPageSearch = (value: boolean) => (dispatch: Dispatch) => {
  dispatch({
    type: 'SET_FOCUSING_PAGE_SEARCH',
    payload: value,
  });
};

export const setSearchKeyPageSearch = (value: string) => (dispatch: Dispatch) => {
  dispatch({
    type: 'SET_SEARCH_KEY_PAGE_SEARCH',
    payload: value,
  });
};

export const findDocumentByName = (value: string) => (dispatch: Dispatch) => {
  dispatch({
    type: 'FIND_DOCUMENT_BY_NAME',
    payload: value,
  });
};
