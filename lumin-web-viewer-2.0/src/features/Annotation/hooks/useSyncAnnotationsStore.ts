import { create, StateCreator } from 'zustand';
import { immer } from 'zustand/middleware/immer';

import { logger } from 'hooks/zustandStore/logger';

export interface IState {
  abortController?: AbortController | null;
  isSyncing: boolean;
  resetAbortController: () => void;
  setIsSyncing: (isSyncing: boolean) => void;
}

const createSyncAnnotationsSlice: StateCreator<IState, [], [['zustand/immer', never]]> = immer((set) => ({
  abortController: null,
  isSyncing: false,
  resetAbortController: () => set({ abortController: new AbortController() }),
  setIsSyncing: (isSyncing: boolean) => set({ isSyncing }),
}));

export const useSyncAnnotationsStore = create<IState, [['zustand/immer', never]]>(
  logger(createSyncAnnotationsSlice, 'useSyncAnnotationsStore')
);
