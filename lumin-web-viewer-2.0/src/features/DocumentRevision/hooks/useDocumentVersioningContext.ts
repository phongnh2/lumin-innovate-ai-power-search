import { useContext } from 'react';

import { DocumentVersioningContext } from '../contexts';

export const useDocumentVersioningContext = () => useContext(DocumentVersioningContext);
