// eslint-disable-next-line default-param-last
export default (initialState) => (state = initialState, action) => {
  const { payload, type } = action;
  switch (type) {
    case 'FETCH_FOLDER_LIST':
      return {
        ...state,
        folderList: {
          ...state.folderList,
          loading: true,
          error: null,
        },
      };

    case 'SET_FOLDER_LIST': {
      return {
        ...state,
        folderList: {
          ...state.folderList,
          loading: false,
          data: payload.data,
          error: null,
          total: payload.data.length,
        },
      };
    }

    case 'FETCH_FOLDER_LIST_FAILED': {
      return {
        ...state,
        folderList: {
          ...state.folderList,
          loading: false,
          data: [],
          error: payload.error,
          total: 0,
        },
      };
    }

    case 'RESET_FOLDER_LIST': {
      return {
        ...state,
        folderList: {
          ...state.folderList,
          loading: true,
          data: [],
          error: null,
          total: null,
        },
      };
    }

    case 'SET_CURRENT_FOLDER': {
        return {
          ...state,
          currentFolder: payload,
        };
      }

    default:
      return state;
  }
};
