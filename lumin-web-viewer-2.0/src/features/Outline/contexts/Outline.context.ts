import React from 'react';

import { TDocumentOutline } from 'interfaces/document/document.interface';

import { TOutlineNode } from '../types';
import { TMoveOutlineHandler } from '../types/outlineTree';

interface IAddNewOutline {
  name: string;
  pageNumber: number;
  isAddSub?: boolean;
}

interface IModifyOutline {
  name: string;
  pageNumber: number;
}

export const OutlinePanelContext = React.createContext({
  outlineChanges: [],
  setOutlineChanges: () => {},
});

type TOutlineTreeContext = {
  activeOutlinePath: string | null;
  addOutline: (outline: IAddNewOutline) => void;
  modifyOutline: (outline: IModifyOutline) => void;
  removeOutline: () => void;
  setActiveOutlinePath: React.Dispatch<React.SetStateAction<string>>;
  lastRootOutline: string | null;
  outlines: TOutlineNode[];
  moveOutlineBeforeTarget: TMoveOutlineHandler;
  moveOutlineAfterTarget: TMoveOutlineHandler;
  moveOutlineInward: TMoveOutlineHandler;
  requestAccessModalElement: JSX.Element;
  defaultOutline: { pageNumber?: number; textContent?: string } | null;
  setDefaultOutline: React.Dispatch<React.SetStateAction<{ pageNumber?: number; textContent?: string } | null>>;
};

export const OutlineTreeContext = React.createContext<TOutlineTreeContext>({
  activeOutlinePath: null,
  addOutline: async () => {},
  modifyOutline: () => {},
  removeOutline: () => {},
  setActiveOutlinePath: () => {},
  lastRootOutline: null,
  outlines: [],
  moveOutlineBeforeTarget: () => {},
  moveOutlineAfterTarget: () => {},
  moveOutlineInward: () => {},
  requestAccessModalElement: null,
  defaultOutline: null,
  setDefaultOutline: () => {},
});

export const useOutlineTreeContext = () => React.useContext(OutlineTreeContext);

export const OutlineBranchContext = React.createContext<{
  onClose: () => void;
  outline: TDocumentOutline;
}>({
  onClose: () => {},
  outline: null,
});
