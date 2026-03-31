export default (initialState: Record<string, unknown>) =>
  // eslint-disable-next-line @typescript-eslint/default-param-last
  (state = initialState, action: { type: string; payload: Record<string, unknown> }) => {
    const { type, payload } = action;

    switch (type) {
      case 'SET_FOCUSING_PAGE_SEARCH':
        return { ...state, isFocusing: payload };
      case 'SET_SEARCH_KEY_PAGE_SEARCH':
        return { ...state, searchKey: payload };
      case 'FIND_DOCUMENT_BY_NAME':
        return { ...state, searchKey: payload, findDocumentByName: Boolean(payload) };
      default:
        return state;
    }
  };
