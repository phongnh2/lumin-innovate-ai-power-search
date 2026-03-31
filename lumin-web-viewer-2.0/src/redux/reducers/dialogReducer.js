export default (initialState) => (state = initialState, action = {}) => {
  const { type, payload } = action;
  switch (type) {
    case 'OPEN_DIALOG':
      return {
        ...state,
        open: true,
      };
    case 'CLOSE_DIALOG':
      return {
        ...state,
        open: false,
      };
    case 'UPDATE_DIALOG_STATUS':
      return {
        ...state,
        open: payload.isOpen,
      };
    default:
      return state;
  }
};
