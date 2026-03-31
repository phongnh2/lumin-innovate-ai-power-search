import { create, StateCreator } from 'zustand';
import { immer } from 'zustand/middleware/immer';

import { logger } from 'hooks/zustandStore/logger';

export interface IState {
  hasCloseViewerBanner: boolean;
  setHasCloseViewerBanner: (hasCloseViewerBanner: boolean) => void;
  hasCloseFormFieldDetectionBanner: boolean;
  setHasCloseFormFieldDetectionBanner: (hasCloseFormFieldDetectionBanner: boolean) => void;
  resetBannerStates: () => void;
}

const createFormFieldDetectionBannerSlice: StateCreator<IState, [], [['zustand/immer', never]]> = immer((set) => ({
  hasCloseViewerBanner: false,
  setHasCloseViewerBanner: (hasCloseViewerBanner) => set({ hasCloseViewerBanner }),
  hasCloseFormFieldDetectionBanner: false,
  setHasCloseFormFieldDetectionBanner: (hasCloseFormFieldDetectionBanner) => set({ hasCloseFormFieldDetectionBanner }),
  resetBannerStates: () =>
    set({
      hasCloseViewerBanner: false,
      hasCloseFormFieldDetectionBanner: false,
    }),
}));

export const useFormFieldDetectionBannerStore = create<IState, [['zustand/immer', never]]>(
  logger(createFormFieldDetectionBannerSlice, 'useFormFieldDetectionBannerStore')
);
