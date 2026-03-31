import { create, StateCreator } from 'zustand';
import { immer } from 'zustand/middleware/immer';

import { logger } from 'hooks/zustandStore/logger';

import { AttachedFileType, ReferenceUrlType } from 'features/AIChatBot/interface';

export interface IState {
  attachedFiles: AttachedFileType[];
  setAttachedFiles: (attachedFiles: AttachedFileType[]) => void;
  hasGeneratedOutlines: boolean;
  setHasGeneratedOutlines: (hasGeneratedOutlines: boolean) => void;
  needToUpload: boolean;
  setNeedToUpload: (needToUpload: boolean) => void;
  hasStartChatbotSession: boolean;
  setHasStartChatbotSession: (hasStartChatbotSession: boolean) => void;
  isUploadingDocument: boolean;
  setIsUploadingDocument: (isUploadingDocument: boolean) => void;
  resetChatbotStore: () => void;
  isValidateDocument: boolean;
  setIsValidateDocument: (isValidateDocument: boolean) => void;
  isQuickActionOpen: boolean;
  setIsQuickActionOpen: (isQuickActionOpen: boolean) => void;
  activeQuickActionCategory: string;
  setActiveQuickActionCategory: (activeQuickActionCategory: string) => void;
  referenceUrls: ReferenceUrlType[];
  setReferenceUrls: (referenceUrls: ReferenceUrlType[]) => void;
  isUploadLargeDocument: boolean;
  setIsUploadLargeDocument: (isUploadLargeDocument: boolean) => void;
}

const createChatbotSlice: StateCreator<IState, [], [['zustand/immer', never]]> = immer((set) => ({
  attachedFiles: [] as AttachedFileType[],
  setAttachedFiles: (attachedFiles) => set({ attachedFiles }),
  hasGeneratedOutlines: false,
  setHasGeneratedOutlines: (hasGeneratedOutlines) => set({ hasGeneratedOutlines }),
  needToUpload: false,
  setNeedToUpload: (needToUpload) => set({ needToUpload }),
  hasStartChatbotSession: false,
  setHasStartChatbotSession: (hasStartChatbotSession) => set({ hasStartChatbotSession }),
  isUploadingDocument: false,
  setIsUploadingDocument: (isUploadingDocument) => set({ isUploadingDocument }),
  isValidateDocument: false,
  setIsValidateDocument: (isValidateDocument) => set({ isValidateDocument }),
  isUploadLargeDocument: false,
  setIsUploadLargeDocument: (isUploadLargeDocument) => set({ isUploadLargeDocument }),
  resetChatbotStore: () =>
    set({
      needToUpload: false,
      hasStartChatbotSession: false,
      isUploadingDocument: false,
      isValidateDocument: false,
      hasGeneratedOutlines: false,
      attachedFiles: [],
      referenceUrls: [],
      isUploadLargeDocument: false,
    }),
  isQuickActionOpen: false,
  setIsQuickActionOpen: (isQuickActionOpen) => set({ isQuickActionOpen }),
  activeQuickActionCategory: 'all',
  setActiveQuickActionCategory: (activeQuickActionCategory) => set({ activeQuickActionCategory }),
  referenceUrls: [] as ReferenceUrlType[],
  setReferenceUrls: (referenceUrls) => set({ referenceUrls }),
}));

export const useChatbotStore = create<IState, [['zustand/immer', never]]>(
  logger(createChatbotSlice, 'useChatbotStore')
);
