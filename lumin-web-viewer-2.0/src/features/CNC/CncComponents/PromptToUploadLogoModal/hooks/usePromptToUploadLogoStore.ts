import { create, StateCreator } from 'zustand';
import { immer } from 'zustand/middleware/immer';

import { logger } from 'hooks/zustandStore/logger';

import { PROMPT_TO_UPLOAD_LOGO_TYPE } from 'features/CNC/constants/customConstant';

import { IOrganization } from 'interfaces/organization/organization.interface';

type PromptToUploadLogoType = typeof PROMPT_TO_UPLOAD_LOGO_TYPE[keyof typeof PROMPT_TO_UPLOAD_LOGO_TYPE];
type OnChange = (file: File) => void;

export interface PromptToUploadLogoState {
  isOpen: boolean;

  promptType: PromptToUploadLogoType | null;
  onChange: OnChange | null;

  currentOrgToUpdateAvatar: IOrganization;

  open: (params: { promptType: PromptToUploadLogoType; onChange: OnChange }) => void;
  close: () => void;

  setIsOpen: (isOpen: boolean) => void;
  setCurrentOrgToUpdateAvatar: (currentOrgToUpdateAvatar: IOrganization) => void;
  resetPromptToUploadLogoStore: () => void;
  hasSetSuggestionAvatar: boolean;
  setHasSetSuggestionAvatar: (hasSetSuggestionAvatar: boolean) => void;
}

const createPromptToUploadLogoStore: StateCreator<PromptToUploadLogoState, [], [['zustand/immer', never]]> = immer(
  (set) => ({
    isOpen: false,
    promptType: null as PromptToUploadLogoType | null,
    onChange: null as OnChange | null,
    currentOrgToUpdateAvatar: {} as IOrganization,
    hasSetSuggestionAvatar: false,
    setHasSetSuggestionAvatar: (hasSetSuggestionAvatar) =>
      set((state) => {
        state.hasSetSuggestionAvatar = hasSetSuggestionAvatar;
      }),

    open: ({ promptType, onChange }) =>
      set((state) => {
        state.isOpen = true;
        state.promptType = promptType;
        state.onChange = onChange;
      }),

    close: () =>
      set((state) => {
        state.isOpen = false;
        state.promptType = null;
        state.onChange = null;
      }),

    setIsOpen: (isOpen) =>
      set((state) => {
        state.isOpen = isOpen;
        if (!isOpen) {
          state.promptType = null;
          state.onChange = null;
        }
      }),

    setCurrentOrgToUpdateAvatar: (currentOrgToUpdateAvatar) =>
      set((state) => {
        state.currentOrgToUpdateAvatar = currentOrgToUpdateAvatar;
      }),

    resetPromptToUploadLogoStore: () =>
      set((state) => {
        state.isOpen = false;
        state.promptType = null;
        state.onChange = null;
        state.currentOrgToUpdateAvatar = {} as IOrganization;
      }),
  })
);

export const usePromptToUploadLogoStore = create<PromptToUploadLogoState, [['zustand/immer', never]]>(
  logger(createPromptToUploadLogoStore, 'usePromptToUploadLogoStore')
);
