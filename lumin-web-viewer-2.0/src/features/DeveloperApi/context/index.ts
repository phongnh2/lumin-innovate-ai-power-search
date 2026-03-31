import { createContext } from 'react';

import { useApiAppsHandler } from '../components/ApiApps/hooks/useApiAppsHandler';

export const ApiAppContext = createContext<ReturnType<typeof useApiAppsHandler> | null>(null);
