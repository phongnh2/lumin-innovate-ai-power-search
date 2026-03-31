import { create, StateCreator } from 'zustand';
import { immer } from 'zustand/middleware/immer';

import { logger } from 'hooks/zustandStore/logger';

export interface IState {
  showModalConvertPdf: boolean;
  setShowModalConvertPdf: (showModalConvertPdf: boolean) => void;
}

const createConvertPdfSlice: StateCreator<IState, [], [['zustand/immer', never]]> = immer((set) => ({
  showModalConvertPdf: false,
  setShowModalConvertPdf: (showModalConvertPdf: boolean) => set({ showModalConvertPdf }),
}));

export const useConvertPdfStore = create<IState, [['zustand/immer', never]]>(
  logger(createConvertPdfSlice, 'useConvertPdfStore')
);
