import { produce } from "immer";
import { create } from "zustand";
import { devtools } from "zustand/middleware";

import type { ContextQuestion } from "@/interfaces/contextQuestion.interface";
import { getContextQuestions } from "@/services/claude.service";
import { loadFollowUp, searchTemplates } from "@/services/prompts.service";

import { InputMode, ModalStep } from "../constants";

import type { SmartFindingStore } from "./types";

const SEARCH_DELAY_MS = 3000;

const initialState = {
  isModalOpen: false,
  answers: [] as string[],
  freeText: "",
  mode: InputMode.GUIDED,
  currentStep: ModalStep.FORM,
  searchQuery: "",
  searchResults: null,
  followUpData: null,
  isSearching: false,
  contextQuestions: [] as ContextQuestion[],
  contextAnswers: {} as Record<string, string>,
  isLoadingContext: false,
};

export const useSmartFindingStore = create<SmartFindingStore>()(
  devtools(
    (set, get) => {
      const performSearch = async (query: string, actionName: string) => {
        set(
          produce((state: SmartFindingStore) => {
            state.searchQuery = query;
            state.currentStep = ModalStep.LOADING;
            state.isSearching = true;
          }),
          false,
          `${actionName}/start`,
        );

        await new Promise((resolve) => setTimeout(resolve, SEARCH_DELAY_MS));

        const [searchData, followUp] = await Promise.all([
          searchTemplates(query),
          loadFollowUp(query),
        ]);

        set(
          produce((state: SmartFindingStore) => {
            state.searchResults = searchData;
            state.followUpData = followUp;
            state.currentStep = ModalStep.RESULTS;
            state.isSearching = false;
          }),
          false,
          `${actionName}/success`,
        );
      };

      return {
        ...initialState,
        openModal: () => set({ isModalOpen: true }, false, "openModal"),
        closeModal: () =>
          set(
            produce((state: SmartFindingStore) => {
              state.isModalOpen = false;
            }),
            false,
            "closeModal",
          ),
        setAnswers: (answers) => set({ answers }, false, "setAnswers"),
        updateAnswer: (index, value) =>
          set(
            produce((state: SmartFindingStore) => {
              if (!state.answers[index]) {
                state.answers = [...state.answers];
              }
              state.answers[index] = value;
            }),
            false,
            "updateAnswer",
          ),
        setFreeText: (freeText) => set({ freeText }, false, "setFreeText"),
        setMode: (mode) => set({ mode }, false, "setMode"),
        setCurrentStep: (currentStep) =>
          set({ currentStep }, false, "setCurrentStep"),
        setSearchQuery: (searchQuery) =>
          set({ searchQuery }, false, "setSearchQuery"),
        setSearchResults: (searchResults) =>
          set({ searchResults }, false, "setSearchResults"),
        setFollowUpData: (followUpData) =>
          set({ followUpData }, false, "setFollowUpData"),

        submitSearch: async (finalText) => {
          const { mode } = get();

          if (mode === InputMode.GUIDED) {
            await performSearch(finalText, "submitSearch");
            return;
          }

          // Freedom mode: check if query has enough info before showing context
          set(
            produce((state: SmartFindingStore) => {
              state.searchQuery = finalText;
              state.currentStep = ModalStep.CONTEXT;
              state.isLoadingContext = true;
              state.contextQuestions = [];
              state.contextAnswers = {};
            }),
            false,
            "submitSearch/fetchContext",
          );

          try {
            const { questions } = await getContextQuestions(finalText);

            if (questions.length === 0) {
              await performSearch(finalText, "submitSearch");
              return;
            }

            set(
              produce((state: SmartFindingStore) => {
                state.contextQuestions = questions;
                state.isLoadingContext = false;
              }),
              false,
              "submitSearch/showContext",
            );
          } catch (error) {
            console.error(
              "[SmartFinding] Failed to fetch context questions:",
              error,
            );
            await performSearch(finalText, "submitSearch");
          }
        },

        submitFollowUp: async (chipText) => {
          const { searchQuery } = get();
          const newQuery = `${searchQuery} ${chipText}`;
          await performSearch(newQuery, "submitFollowUp");
        },

        setContextAnswer: (questionId, value) =>
          set(
            produce((state: SmartFindingStore) => {
              if (state.contextAnswers[questionId] === value) {
                delete state.contextAnswers[questionId];
              } else {
                state.contextAnswers[questionId] = value;
              }
            }),
            false,
            "setContextAnswer",
          ),

        submitWithContext: async () => {
          const { searchQuery, contextAnswers } = get();
          const contextSuffix = Object.values(contextAnswers)
            .filter(Boolean)
            .join(", ");
          const enrichedQuery = contextSuffix
            ? `${searchQuery} (${contextSuffix})`
            : searchQuery;
          await performSearch(enrichedQuery, "submitWithContext");
        },

        skipContext: async () => {
          const { searchQuery } = get();
          await performSearch(searchQuery, "skipContext");
        },

        resetForm: () =>
          set(
            {
              answers: [],
              freeText: "",
              mode: InputMode.GUIDED,
            },
            false,
            "resetForm",
          ),

        resetAll: () => set(initialState, false, "resetAll"),
      };
    },
    { name: "SmartFindingStore" },
  ),
);
