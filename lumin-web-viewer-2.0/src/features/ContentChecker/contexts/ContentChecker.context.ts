import { createContext } from 'react';

import { useCheckFormFieldIndicatorInContent } from '../hooks/useCheckFormFieldIndicatorInContent';

export const ContentCheckerContext = createContext({} as ReturnType<typeof useCheckFormFieldIndicatorInContent>);
