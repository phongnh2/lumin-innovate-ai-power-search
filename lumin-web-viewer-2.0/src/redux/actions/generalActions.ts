import { Dispatch } from 'redux';

export const setDocumentTabType = (payload: { type: string }) => (dispatch: Dispatch) => {
  dispatch({
    type: 'SET_DOCUMENT_TAB_TYPE',
    payload,
  });
};
