import { create, StateCreator } from 'zustand';
import { immer } from 'zustand/middleware/immer';

import { logger } from 'hooks/zustandStore/logger';

export interface IState {
  isClickFocusModeBtn: boolean;
  setIsClickFocusModeBtn: (isClickFocusMode: boolean) => void;
}

const createFocusModeSlice: StateCreator<IState, [], [['zustand/immer', never]]> = immer((set) => ({
  isClickFocusModeBtn: false,
  setIsClickFocusModeBtn: (isClickFocusModeBtn) => set({ isClickFocusModeBtn }),
}));

export const useFocusModeToggleStore = create<IState, [['zustand/immer', never]]>(
  logger(createFocusModeSlice, 'useFocusModeToggleStore')
);
