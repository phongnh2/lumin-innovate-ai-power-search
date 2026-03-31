import { createContext } from 'react';

import { useReadDocumentHandler } from '../hooks/useReadDocumentHandler';

export const ReadDocumentContext = createContext({} as ReturnType<typeof useReadDocumentHandler>);
