import React from 'react';

import { layoutType } from 'constants/documentConstants';

import { IDocumentBase } from 'interfaces/document/document.interface';
import { IFolder } from 'interfaces/folder/folder.interface';

export const DocumentContext = React.createContext<{
  documentLayout: string;
  selectedDocList: IDocumentBase[];
  setDocumentLayout: (layout: string) => void;
  setRemoveDocList: (args: { data?: IDocumentBase[]; type: string }) => void;
  showRemoveMultipleModal: () => void;
  refetchDocument: () => void;
  selectedFolders: IFolder[];
  handleSelectedItems: (selectedItems: any) => void;
  lastSelectedDocIdRef: React.MutableRefObject<string>;
  shiftHoldingRef: React.MutableRefObject<boolean>;
  setRemoveFolderList: () => void;
}>({
  documentLayout: layoutType.list,
  selectedDocList: [],
  setDocumentLayout: () => {},
  setRemoveDocList: () => {},
  showRemoveMultipleModal: () => {},
  refetchDocument: () => {},
  selectedFolders: [],
  handleSelectedItems: () => {},
  lastSelectedDocIdRef: null,
  shiftHoldingRef: null,
  setRemoveFolderList: () => {},
});

export const useDocumentContext = () => React.useContext(DocumentContext);
