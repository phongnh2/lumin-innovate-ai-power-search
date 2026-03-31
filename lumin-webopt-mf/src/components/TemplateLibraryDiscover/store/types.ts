import type { ContextQuestion } from "@/interfaces/contextQuestion.interface";
import type {
  FollowUpApiResponse,
  SearchApiResponse,
} from "@/services/prompts.service";

import { InputMode, ModalStep } from "../constants";

export interface SmartFindingState {
  isModalOpen: boolean;
  answers: string[];
  freeText: string;
  mode: InputMode;
  currentStep: ModalStep;
  searchQuery: string;
  searchResults: SearchApiResponse | null;
  followUpData: FollowUpApiResponse | null;
  isSearching: boolean;
  contextQuestions: ContextQuestion[];
  contextAnswers: Record<string, string>;
  isLoadingContext: boolean;
}

export interface SmartFindingActions {
  openModal: () => void;
  closeModal: () => void;
  setAnswers: (answers: string[]) => void;
  updateAnswer: (index: number, value: string) => void;
  setFreeText: (text: string) => void;
  setMode: (mode: InputMode) => void;
  setCurrentStep: (step: ModalStep) => void;
  setSearchQuery: (query: string) => void;
  setSearchResults: (results: SearchApiResponse | null) => void;
  setFollowUpData: (data: FollowUpApiResponse | null) => void;
  submitSearch: (finalText: string) => Promise<void>;
  submitFollowUp: (chipText: string) => Promise<void>;
  setContextAnswer: (questionId: string, value: string) => void;
  submitWithContext: () => Promise<void>;
  skipContext: () => Promise<void>;
  resetForm: () => void;
  resetAll: () => void;
}

export type SmartFindingStore = SmartFindingState & SmartFindingActions;
