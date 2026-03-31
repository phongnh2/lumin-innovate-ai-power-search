import { create, StateCreator } from 'zustand';
import { immer } from 'zustand/middleware/immer';

import { logger } from 'hooks/zustandStore/logger';

export interface IState {
  abortController: AbortController | null;
  createAbortController: () => void;
}

const createEditorChatBotAbortSlice: StateCreator<IState, [], [['zustand/immer', never]]> = immer((set) => ({
  abortController: null,
  createAbortController: () => set({ abortController: new AbortController() }),
}));

export const useEditorChatBotAbortStore = create<IState, [['zustand/immer', never]]>(
  logger(createEditorChatBotAbortSlice, 'useEditorChatBotAbortStore')
);
