import { useShallow } from "zustand/shallow";

import { useSmartFindingStore } from "./smartFindingStore";

export const useModalVisibilitySelector = () =>
  useSmartFindingStore((state) => state.isModalOpen);

export const useModalActionsSelector = () =>
  useSmartFindingStore(
    useShallow((state) => ({
      openModal: state.openModal,
      closeModal: state.closeModal,
    })),
  );

export const useFormStateSelector = () =>
  useSmartFindingStore(
    useShallow((state) => ({
      answers: state.answers,
      freeText: state.freeText,
      mode: state.mode,
    })),
  );

export const useFormActionsSelector = () =>
  useSmartFindingStore(
    useShallow((state) => ({
      setAnswers: state.setAnswers,
      updateAnswer: state.updateAnswer,
      setFreeText: state.setFreeText,
      setMode: state.setMode,
    })),
  );

export const useCurrentStepSelector = () =>
  useSmartFindingStore((state) => state.currentStep);
export const useSetCurrentStepSelector = () =>
  useSmartFindingStore((state) => state.setCurrentStep);

export const useSearchStateSelector = () =>
  useSmartFindingStore(
    useShallow((state) => ({
      searchQuery: state.searchQuery,
      searchResults: state.searchResults,
      followUpData: state.followUpData,
      isSearching: state.isSearching,
    })),
  );

export const useSearchActionsSelector = () =>
  useSmartFindingStore(
    useShallow((state) => ({
      submitSearch: state.submitSearch,
      submitFollowUp: state.submitFollowUp,
    })),
  );

export const useContextStateSelector = () =>
  useSmartFindingStore(
    useShallow((state) => ({
      contextQuestions: state.contextQuestions,
      contextAnswers: state.contextAnswers,
      isLoadingContext: state.isLoadingContext,
      searchQuery: state.searchQuery,
    })),
  );

export const useContextActionsSelector = () =>
  useSmartFindingStore(
    useShallow((state) => ({
      setContextAnswer: state.setContextAnswer,
      submitWithContext: state.submitWithContext,
      skipContext: state.skipContext,
    })),
  );

export const useResetActionsSelector = () =>
  useSmartFindingStore(
    useShallow((state) => ({
      resetForm: state.resetForm,
      resetAll: state.resetAll,
    })),
  );
