import { createContext } from 'react';

import { useDocumentVersioningHandler } from '../hooks/useDocumentVersioningHandler';

export const DocumentVersioningContext = createContext({} as ReturnType<typeof useDocumentVersioningHandler>);
