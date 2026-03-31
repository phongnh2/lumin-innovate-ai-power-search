import { createContext } from 'react';

import { useFetchingAnnotationsStore } from '../hooks/useFetchingAnnotationsStore';

export const FetchingAnnotationsContext = createContext({} as ReturnType<typeof useFetchingAnnotationsStore>);
