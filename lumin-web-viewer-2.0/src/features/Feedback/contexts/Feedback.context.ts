import { createContext } from 'react';

import { useFeedbackHandler } from '../hooks/useFeedbackHandler';

export const FeedbackContext = createContext({} as ReturnType<typeof useFeedbackHandler>);
