import produce from 'immer';

export default (initialState) => (state = initialState, action = {}) => {
  const { type, payload } = action;
  const newState = { ...initialState, ...state };

  switch (type) {
    case 'UPDATE_EVENT_TRACKING_QUEUE': {
      const { event } = payload;
      if (!(event instanceof Function)) {
        return state;
      }
      return produce(newState, (draft) => {
        draft.queue.push(event);
      });
    }
    case 'RESET_EVENT_TRACKING_QUEUE': {
      return produce(newState, (draft) => {
        draft.queue = initialState.queue;
      });
    }
    case 'LOAD_AWS_PINPOINT_SUCCESS':
      return {
        ...newState,
        pinpointLoaded: true,
      };
    default:
      return state;
  }
};
