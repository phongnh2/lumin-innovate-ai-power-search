import { createContext } from 'react';

import useMatchMediaLayout from '../hooks/useMatchMediaLayout';

export const MatchMediaLayoutContext = createContext({} as ReturnType<typeof useMatchMediaLayout>);
