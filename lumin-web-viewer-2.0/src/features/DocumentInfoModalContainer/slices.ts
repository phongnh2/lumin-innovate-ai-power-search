import { createSlice } from '@reduxjs/toolkit';

interface DocumentInfoModalState {
  isOpen: boolean;
}

const initialState: DocumentInfoModalState = {
  isOpen: false,
};

const documentInfoModalSlice = createSlice({
  name: 'DOCUMENT_INFO_MODAL',
  initialState,
  reducers: {
    openDocumentInfoModal: (state) => {
      state.isOpen = true;
    },
    closeDocumentInfoModal: (state) => {
      state.isOpen = false;
    },
  },
});

export const { openDocumentInfoModal, closeDocumentInfoModal } = documentInfoModalSlice.actions;

export default documentInfoModalSlice.reducer;

export const documentInfoModalSelectors = {
  isOpen: (state: { documentInfoModal: DocumentInfoModalState }) => state.documentInfoModal.isOpen,
};
