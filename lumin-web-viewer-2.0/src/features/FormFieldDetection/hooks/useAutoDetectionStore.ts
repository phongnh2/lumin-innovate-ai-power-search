import { create, StateCreator } from 'zustand';
import { immer } from 'zustand/middleware/immer';

import { logger } from 'hooks/zustandStore/logger';

export interface IState {
  autoDetectAnnotationId: string | null;
  setAutoDetectAnnotationId: (params: { annotationId: string }) => void;
  removeAutoDetectAnnotationId: () => void;
}

const createAutoDetectionSlice: StateCreator<IState, [], [['zustand/immer', never]]> = immer((set) => ({
  autoDetectAnnotationId: null,
  setAutoDetectAnnotationId: ({ annotationId }) => set({ autoDetectAnnotationId: annotationId }),
  removeAutoDetectAnnotationId: () => set({ autoDetectAnnotationId: null }),
}));

export const useAutoDetectionStore = create<IState, [['zustand/immer', never]]>(
  logger(createAutoDetectionSlice, 'useAutoDetectionStore')
);
