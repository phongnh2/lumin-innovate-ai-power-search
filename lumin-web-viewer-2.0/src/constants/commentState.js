const REOPENED_MESSAGE = 'common.reopenedMessage';
const RESOLVED_MESSAGE = 'common.resolvedMessage';

export default {
  Resolved: { // resolve by button
    state: 'Completed',
    message: RESOLVED_MESSAGE,
  },
  Open: { // reopen by button
    state: 'None',
    message: REOPENED_MESSAGE,
  },
  Cancelled: { // reopen by reply
    state: 'Cancelled',
    message: REOPENED_MESSAGE,
  },
  Rejected: { // keep state when delete reply
    state: 'Rejected',
    message: REOPENED_MESSAGE,
  },
};
