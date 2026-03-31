import { createSlice } from '@reduxjs/toolkit';

interface RenameDocumentModal {
  isOpen: boolean;
}

const initialState: RenameDocumentModal = {
  isOpen: false,
};

const renameDocumentModalSlice = createSlice({
  name: 'RENAME_DOCUMENT_MODAL',
  initialState,
  reducers: {
    openRenameDocumentModal: (state) => {
      state.isOpen = true;
    },
    closeRenameDocumentModal: (state) => {
      state.isOpen = false;
    },
  },
});

export const { openRenameDocumentModal, closeRenameDocumentModal } = renameDocumentModalSlice.actions;

export default renameDocumentModalSlice.reducer;

export const renameDocumentModalSelectors = {
  renameDocumentModal: (state: { renameDocumentModal: RenameDocumentModal }) => state.renameDocumentModal,
};
