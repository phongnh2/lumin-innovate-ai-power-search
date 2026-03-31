import { create, StateCreator } from 'zustand';
import { immer } from 'zustand/middleware/immer';

import { logger } from 'hooks/zustandStore/logger';

import { annotationStreamService } from 'services/annotationStreamService';

import { IAnnotation } from 'interfaces/document/document.interface';

interface IState {
  documentId: string | null;
  annotations: IAnnotation[];
  isLoading: boolean;
  error: Error | null;
  isFromStream: boolean | null;
  abortController?: AbortController;

  fetchAnnotations: (documentId: string) => void;
  setAnnotations: (annotations: IAnnotation[]) => void;
  clearCurrentDocument: () => void;
  reset: () => void;
}

const createCurrentAnnotationsSlice: StateCreator<IState, [], [['zustand/immer', never]]> = immer((set, get) => ({
  documentId: null,
  annotations: [],
  isLoading: false,
  error: null,
  isFromStream: null,
  abortController: undefined,

  fetchAnnotations: async (documentId: string) => {
    const state = get();

    if (state.documentId !== documentId) {
      if (state.abortController) {
        state.abortController.abort();
      }
      set({
        documentId,
        annotations: [],
        isLoading: false,
        error: null,
        isFromStream: null,
        abortController: undefined,
      });
    }

    if (state.documentId === documentId && state.isLoading) {
      return;
    }

    if (state.abortController) {
      state.abortController.abort();
    }

    const abortController = new AbortController();

    set({
      documentId,
      isLoading: true,
      error: null,
      annotations: [],
      isFromStream: null,
      abortController,
    });

    try {
      const result = await annotationStreamService.fetchAnnotations({
        documentId,
        onMessage: (newAnnotations) => {
          set((draft) => {
            if (draft.documentId === documentId) {
              draft.annotations.push(...newAnnotations);
            }
          });
        },
        onError: (error) => {
          set((draft) => {
            if (draft.documentId === documentId) {
              draft.error = error;
            }
          });
        },
        signal: abortController.signal,
      });

      set((draft) => {
        if (draft.documentId === documentId) {
          if (result.error) {
            draft.error = result.error;
          } else {
            draft.annotations = result.annotations;
            draft.isFromStream = result.isFromStream;
          }
          draft.isLoading = false;
          draft.abortController = undefined;
        }
      });
    } catch (error) {
      if (error instanceof Error && error.name !== 'AbortError') {
        set((draft) => {
          if (draft.documentId === documentId) {
            draft.error = error;
            draft.isLoading = false;
            draft.abortController = undefined;
          }
        });
      }
    }
  },

  setAnnotations: (annotations: IAnnotation[]) => {
    set((draft) => {
      draft.annotations = annotations;
    });
  },

  clearCurrentDocument: () => {
    const state = get();

    if (state.abortController) {
      state.abortController.abort();
    }

    set({
      documentId: null,
      annotations: [],
      isLoading: false,
      error: null,
      isFromStream: null,
      abortController: undefined,
    });
  },

  reset: () => {
    const state = get();

    if (state.abortController) {
      state.abortController.abort();
    }

    annotationStreamService.reset();

    set({
      documentId: null,
      annotations: [],
      isLoading: false,
      error: null,
      isFromStream: null,
      abortController: undefined,
    });
  },
}));

export const useCurrentAnnotationsStore = create<IState, [['zustand/immer', never]]>(
  logger(createCurrentAnnotationsSlice, 'useCurrentAnnotationsStore')
);
