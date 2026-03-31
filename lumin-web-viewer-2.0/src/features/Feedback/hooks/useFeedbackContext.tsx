import { useContext } from 'react';

import { FeedbackContext } from '../contexts';

export const useFeedbackContext = () => useContext(FeedbackContext);
