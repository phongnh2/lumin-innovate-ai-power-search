import { create, StateCreator } from 'zustand';
import { immer } from 'zustand/middleware/immer';

import { logger } from 'hooks/zustandStore/logger';

export interface IState {
  activeApp: {
    appId: string;
    appName: string;
  };
  setActiveApp: (activeApp: { appId: string; appName: string }) => void;
  resetActiveApp: () => void;
}

const createMiniAppsSlice: StateCreator<IState, [], [['zustand/immer', never]]> = immer((set) => ({
  activeApp: {
    appId: '',
    appName: '',
  },
  setActiveApp: (activeApp) => set({ activeApp }),
  resetActiveApp: () => set({ activeApp: { appId: '', appName: '' } }),
}));

export const useMiniAppsStore = create<IState, [['zustand/immer', never]]>(
  logger(createMiniAppsSlice, 'useMiniAppsStore')
);
