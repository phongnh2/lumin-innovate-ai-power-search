import React from 'react';

import { IDocumentBase } from 'interfaces/document/document.interface';

type DocumentListContextType = {
  externalDocumentExistenceGuard?: (document: IDocumentBase, onSuccess?: () => void, documentAction?: string) => void;
  onMoveDocumentsDecorator?: (documents: IDocumentBase[], onSuccess?: () => void) => void;
  onHandleDocumentOvertimeLimit?: (document: IDocumentBase) => void;
  onMergeDocumentsDecorator?: (documents: IDocumentBase[], onSuccess?: () => void) => void;
};

export const DocumentListContext: React.Context<DocumentListContextType>;

export const DocumentListRendererContext: React.Context<any>;
