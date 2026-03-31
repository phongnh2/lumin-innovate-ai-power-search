import React, { ReactNode } from 'react';

import { ReadDocumentContext } from 'features/ReadAloud/context/ReadDocumentContext';
import { useReadDocumentHandler } from 'features/ReadAloud/hooks/useReadDocumentHandler';

const ReadDocumentProvider = ({ children }: { children: ReactNode }) => {
  const values = useReadDocumentHandler();

  return <ReadDocumentContext.Provider value={values}>{children}</ReadDocumentContext.Provider>;
};

export default ReadDocumentProvider;
