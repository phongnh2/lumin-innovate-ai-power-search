import React from 'react';

import { DocumentVersioningContext } from 'features/DocumentRevision/contexts';
import { useDocumentVersioningHandler } from 'features/DocumentRevision/hooks/useDocumentVersioningHandler';

const DocumentVersioningProvider = ({ children }: { children: React.ReactNode }) => {
  const contextValues = useDocumentVersioningHandler();

  return <DocumentVersioningContext.Provider value={contextValues}>{children}</DocumentVersioningContext.Provider>;
};

export default DocumentVersioningProvider;
