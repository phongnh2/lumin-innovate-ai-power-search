import { createSlice } from '@reduxjs/toolkit';

interface AgreementGenState {
  isEditInAgreementGenModalOpen: boolean;
}

const initialState: AgreementGenState = {
  isEditInAgreementGenModalOpen: false,
};

export const agreementGenSlice = createSlice({
  name: 'AGREEMENT_GEN',
  initialState,
  reducers: {
    openEditInAgreementGenModal: (state) => {
      state.isEditInAgreementGenModalOpen = true;
    },
    closeEditInAgreementGenModal: (state) => {
      state.isEditInAgreementGenModalOpen = false;
    },
  },
});

export const { openEditInAgreementGenModal, closeEditInAgreementGenModal } = agreementGenSlice.actions;

export const agreementGenSelectors = {
  isEditInAgreementGenModalOpen: (state: { agreementGen: AgreementGenState }) =>
    state.agreementGen.isEditInAgreementGenModalOpen,
};

export default agreementGenSlice.reducer;
