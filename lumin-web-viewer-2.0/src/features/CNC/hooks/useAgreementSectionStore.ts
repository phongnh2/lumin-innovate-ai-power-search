import { create, StateCreator } from 'zustand';
import { immer } from 'zustand/middleware/immer';

import { logger } from 'hooks/zustandStore/logger';

interface IPrompt {
  id: number;
  title: string;
  promptMessage: string;
  imgSrc?: string;
}

export interface AgreementSectionStore {
  isOpenAgreementSurvey: boolean;
  setIsOpenAgreementSurvey: (isOpenAgreementSurvey: boolean) => void;
  isOpenAgreementThankYouMessage: boolean;
  setIsOpenAgreementThankYouMessage: (isOpenAgreementThankYouMessage: boolean) => void;
  isOpenAgreementSection: boolean;
  setIsOpenAgreementSection: (isOpenAgreementSection: boolean) => void;
  isOpenAgreementPromptModal: boolean;
  setIsOpenAgreementPromptModal: (isOpenAgreementPromptModal: boolean) => void;
  selectedPrompt: IPrompt | null;
  setSelectedPrompt: (selectedPrompt: IPrompt | null) => void;
  resetAgreementSectionStore: () => void;
}

const createAgreementSectionStore: StateCreator<AgreementSectionStore, [], [['zustand/immer', never]]> = immer(
  (set) => ({
    isOpenAgreementSurvey: false,
    setIsOpenAgreementSurvey: (isOpenAgreementSurvey) => set({ isOpenAgreementSurvey }),
    isOpenAgreementThankYouMessage: false,
    setIsOpenAgreementThankYouMessage: (isOpenAgreementThankYouMessage) => set({ isOpenAgreementThankYouMessage }),
    isOpenAgreementSection: false,
    setIsOpenAgreementSection: (isOpenAgreementSection) => set({ isOpenAgreementSection }),
    isOpenAgreementPromptModal: false,
    setIsOpenAgreementPromptModal: (isOpenAgreementPromptModal) => set({ isOpenAgreementPromptModal }),
    selectedPrompt: null as IPrompt | null,
    setSelectedPrompt: (selectedPrompt) => set({ selectedPrompt }),
    resetAgreementSectionStore: () =>
      set({
        isOpenAgreementSurvey: false,
        isOpenAgreementThankYouMessage: false,
        isOpenAgreementSection: false,
        isOpenAgreementPromptModal: false,
        selectedPrompt: null,
      }),
  })
);

export const useAgreementSectionStore = create<AgreementSectionStore, [['zustand/immer', never]]>(
  logger(createAgreementSectionStore, 'useAgreementSectionStore')
);
