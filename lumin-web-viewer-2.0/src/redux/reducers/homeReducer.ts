export default (initialState: Record<string, unknown>) =>
  // eslint-disable-next-line @typescript-eslint/default-param-last
  (state = initialState, action: { type: string; payload: Record<string, unknown> }) => {
    const { type, payload } = action;

    // eslint-disable-next-line sonarjs/no-small-switch
    switch (type) {
      case 'SET_TEAM_SELECTOR_DATA':
        return { ...state, teamSelectorData: payload };
      default:
        return state;
    }
  };
