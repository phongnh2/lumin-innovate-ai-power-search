import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { PasswordModalType } from '../constants';

interface PasswordProtectionState {
  modalOpened: boolean;
  type: typeof PasswordModalType[keyof typeof PasswordModalType] | null;
}

const initialState: PasswordProtectionState = {
  modalOpened: false,
  type: null,
};

export const passwordProtectionSlice = createSlice({
  name: 'PASSWORD_PROTECTION',
  initialState,
  reducers: {
    openPasswordModal: (state, action: PayloadAction<Pick<PasswordProtectionState, 'type'>>) => {
      state.modalOpened = true;
      state.type = action.payload.type;
    },
    closePasswordModal: (state) => {
      state.modalOpened = false;
      state.type = null;
    },
  },
});

export const passwordProtectionSelectors = {
  modalOpened: (state: { passwordProtection: PasswordProtectionState }) => state.passwordProtection.modalOpened,
  modalType: (state: { passwordProtection: PasswordProtectionState }) => state.passwordProtection.type,
};

export const { openPasswordModal, closePasswordModal } = passwordProtectionSlice.actions;

export default passwordProtectionSlice.reducer;
