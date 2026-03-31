import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { IDocumentBase } from 'interfaces/document/document.interface';

interface MoveDocumentModalState {
  isOpen: boolean;
  documents: IDocumentBase[];
}

const initialState: MoveDocumentModalState = {
  isOpen: false,
  documents: [],
};

const moveDocumentModalSlice = createSlice({
  name: 'MOVE_DOCUMENT_MODAL',
  initialState,
  reducers: {
    openMoveDocumentModal: (state, action: PayloadAction<IDocumentBase[]>) => {
      state.isOpen = true;
      state.documents = action.payload;
    },
    closeMoveDocumentModal: (state) => {
      state.isOpen = false;
      state.documents = [];
    },
  },
});

export const { openMoveDocumentModal, closeMoveDocumentModal } = moveDocumentModalSlice.actions;

export default moveDocumentModalSlice.reducer;

export const moveDocumentModalSelectors = {
  isOpen: (state: { moveDocumentModal: MoveDocumentModalState }) => state.moveDocumentModal.isOpen,
  documents: (state: { moveDocumentModal: MoveDocumentModalState }) => state.moveDocumentModal.documents,
};
