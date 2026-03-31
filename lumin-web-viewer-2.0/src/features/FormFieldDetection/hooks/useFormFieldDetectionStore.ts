import { create, StateCreator } from 'zustand';
import { immer } from 'zustand/middleware/immer';

import { logger } from 'hooks/zustandStore/logger';

import { IFormFieldDetectionPrediction } from 'features/FormFieldDetection/types/detectionField.type';

export interface IState {
  currentSessionId: string;
  setCurrentSessionId: (params: { sessionId: string }) => void;
  predictionData: Record<string, IFormFieldDetectionPrediction[]>;
  setDetectionData: (params: { sessionId: string; predictions: IFormFieldDetectionPrediction[] }) => void;
  removeAllData: () => void;
}

const createFormFieldDetectionSlice: StateCreator<IState, [], [['zustand/immer', never]]> = immer((set) => ({
  currentSessionId: null,
  predictionData: {},
  setCurrentSessionId: ({ sessionId }) => set({ currentSessionId: sessionId }),
  setDetectionData: ({ sessionId, predictions }) =>
    set((state) => {
      state.currentSessionId = sessionId;
      state.predictionData[sessionId] = predictions;
    }),
  removeAllData: () =>
    set({
      currentSessionId: null,
      predictionData: {},
    }),
}));

export const useFormFieldDetectionStore = create<IState, [['zustand/immer', never]]>(
  logger(createFormFieldDetectionSlice, 'useFormFieldDetectionStore')
);
