import { PayloadAction, createSlice } from '@reduxjs/toolkit';

interface ModalState {
  isProcessing: boolean;
}

const initialState: ModalState = {
  isProcessing: false
};

const modalSlice = createSlice({
  name: 'modalData',
  initialState,
  reducers: {
    updateModalProperties: (state, action: PayloadAction<{ isProcessing: boolean }>) => {
      state.isProcessing = action.payload.isProcessing;
    }
  }
});

export const { updateModalProperties } = modalSlice.actions;
export const modalReducer = modalSlice.reducer;
