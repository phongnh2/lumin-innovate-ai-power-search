export default (initialState) => (state = initialState, action) => {
  const { type, payload } = action;
  switch (type) {
    case 'SET_URLS': {
      return {
        ...state,
        urlsArray: payload,
      };
    }
    case 'SET_URLS_REQUEST': {
      return {
        ...state,
        status: 'PENDING',
      };
    }
    case 'SET_URLS_SUCCESS': {
      return {
        ...state,
        status: 'SUCCESS',
      };
    }
    case 'RESET_URLS_STATUS': {
      return {
        ...state,
        status: 'IDLE',
      };
    }
    default:
      return state;
  }
};
