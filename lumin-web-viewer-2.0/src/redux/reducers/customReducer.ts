/* eslint-disable sonarjs/no-small-switch */
/* eslint-disable @typescript-eslint/no-unsafe-return */
export default (initialState: Record<string, unknown>) =>
  // eslint-disable-next-line @typescript-eslint/default-param-last
  (state = initialState, action: { type: string; payload: Record<string, unknown> }) => {
    const { type, payload } = action;

    switch (type) {
      case 'FORCE_RELOAD_VERSION':
        return { ...state, forceReloadVersion: payload.forceReloadVersion };
      case 'SET_ERROR': {
        return { ...state, error: payload.error };
      }
      default:
        return state;
    }
  };
