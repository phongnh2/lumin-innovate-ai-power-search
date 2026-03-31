import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { RootState } from 'store';

interface IBottomToastState {
  open: boolean;
  message: string;
}

const initialState: IBottomToastState = {
  open: false,
  message: '',
};

const bottomToastSlice = createSlice({
  name: 'BOTTOM_TOAST',
  initialState,
  reducers: {
    setOpen: (state, action: PayloadAction<boolean>) => {
      state.open = action.payload;
    },
    setMessage: (state, action: PayloadAction<string>) => {
      state.message = action.payload;
    },
    resetBottomToast: (state) => {
      state.open = false;
      state.message = '';
    },
  },
});

export const bottomToastSelectors = {
  isBottomToastOpen: (state: RootState) => state.bottomToast.open,
  bottomToastMessage: (state: RootState) => state.bottomToast.message,
};

export const bottomToastActions = bottomToastSlice.actions;

export default bottomToastSlice.reducer;
