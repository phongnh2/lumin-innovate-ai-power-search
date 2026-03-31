import { create, StateCreator } from 'zustand';
import { immer } from 'zustand/middleware/immer';

import { logger } from 'hooks/zustandStore/logger';

import { ReferenceUrlType, SourcePartType } from 'features/AIChatBot/interface';

export interface IState {
  isVisible: boolean;
  setIsVisible: (isVisible: boolean) => void;
  isClosedByUser: boolean;
  setIsClosedByUser: (isClosed: boolean) => void;
  setVisibleByDefault: () => void;
  referenceUrls: ReferenceUrlType[];
  setReferenceUrls: (referenceUrls: ReferenceUrlType[]) => void;
  referenceFiles: SourcePartType[];
  setReferenceFiles: (sources: SourcePartType[]) => void;
}

const createChatbotSlice: StateCreator<IState, [], [['zustand/immer', never]]> = immer((set) => ({
  isVisible: false,
  setIsVisible: (isVisible) => set({ isVisible }),
  isClosedByUser: false,
  setIsClosedByUser: (isClosed) => set({ isClosedByUser: isClosed }),
  setVisibleByDefault: () =>
    set((state) => {
      if (state.isClosedByUser || state.isVisible) {
        return { isVisible: state.isVisible };
      }
      return { isVisible: true };
    }),
  resetChatbotStore: () =>
    set({
      isVisible: false,
      referenceUrls: [],
    }),
  referenceUrls: [] as ReferenceUrlType[],
  setReferenceUrls: (referenceUrls) => set({ referenceUrls }),
  referenceFiles: [] as SourcePartType[],
  setReferenceFiles: (sources) => set({ referenceFiles: sources }),
}));

export const useChatbotStore = create<IState, [['zustand/immer', never]]>(
  logger(createChatbotSlice, 'useChatbotStore')
);
