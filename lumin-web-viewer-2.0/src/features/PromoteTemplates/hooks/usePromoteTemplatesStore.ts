import { create, StateCreator } from 'zustand';
import { immer } from 'zustand/middleware/immer';

import { logger } from 'hooks/zustandStore/logger';

export interface IState {
  opened: boolean;
  setOpened: (opened: boolean) => void;
}

const createPromoteTemplatesSlice: StateCreator<IState, [], [['zustand/immer', never]]> = immer((set) => ({
  opened: false,
  setOpened: (opened) => set({ opened }),
}));

export const usePromoteTemplatesStore = create<IState, [['zustand/immer', never]]>(
  logger(createPromoteTemplatesSlice, 'usePromoteTemplatesStore')
);
