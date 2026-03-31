import { create, StateCreator } from 'zustand';
import { immer } from 'zustand/middleware/immer';

import { logger } from 'hooks/zustandStore/logger';

import { IDocumentBase } from 'interfaces/document/document.interface';

export interface IState {
  selectedDocuments: IDocumentBase[];
  setSelectedDocuments: (documents: IDocumentBase[]) => void;
}

const createDocumentSelectionSlice: StateCreator<IState, [], [['zustand/immer', never]]> = immer((set) => ({
  selectedDocuments: [] as IDocumentBase[],
  setSelectedDocuments: (documents) => set({ selectedDocuments: documents }),
}));

export const useDocumentSelectionStore = create<IState, [['zustand/immer', never]]>(
  logger(createDocumentSelectionSlice, 'useDocumentSelectionStore')
);
