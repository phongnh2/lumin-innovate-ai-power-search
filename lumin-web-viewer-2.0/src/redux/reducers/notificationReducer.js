/* eslint-disable default-param-last */
/* eslint-disable sonarjs/no-small-switch */
export default (initialState) => (state = initialState, action) => {
  const { type, payload } = action;
  switch (type) {
    case 'UPDATE_NOTIFICATION':
      return {
        ...state,
        ...payload,
      };
    default:
      return state;
  }
};
