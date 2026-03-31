/* eslint-disable default-param-last */
export default (initialState) =>
  (state = initialState, action) => {
    const { type, payload } = action;
    if (!payload?.bannerName) {
      return state;
    }
    const { bannerName, isShow } = payload;

    // eslint-disable-next-line sonarjs/no-small-switch
    switch (type) {
      case 'SET_SHOW_BANNER': {
        return { ...state, [bannerName]: isShow };
      }
      default:
        return state;
    }
};
