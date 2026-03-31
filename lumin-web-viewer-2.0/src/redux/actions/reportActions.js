export const setURL = (URLS) => (dispatch) => {
  setUrlRequest(dispatch);
  dispatch({
    type: 'SET_URLS',
    payload: URLS,
  });
  setUrlSuccess(dispatch);
  setTimeout(() => resetUrlStatus(dispatch), 1000);
};

const setUrlRequest = (dispatch) => {
  dispatch({
    type: 'SET_URLS_REQUEST',
  });
};

const setUrlSuccess = (dispatch) => {
  dispatch({
    type: 'SET_URLS_SUCCESS',
  });
};

const resetUrlStatus = (dispatch) => {
  dispatch({
    type: 'RESET_URLS_STATUS',
  });
};
