import { createContext } from 'react';

export const DocumentListContext = createContext({
  externalDocumentExistenceGuard: null,
  onMoveDocumentsDecorator: null,
  onHandleDocumentOvertimeLimit: (_) => {},
});

export const DocumentListRendererContext = createContext();
