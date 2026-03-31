import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { RootState } from 'store';

const initialState = {
  isApplyingFormFieldDetection: false,
  hasEnteredFormFieldDetection: false,
};

export const formFieldDetectionSlice = createSlice({
  name: 'FORM_FIELD_DETECTION',
  initialState,
  reducers: {
    setIsApplyingFormFieldDetection: (state, action: PayloadAction<boolean>) => {
      state.isApplyingFormFieldDetection = action.payload;
    },
    setHasEnteredFormFieldDetection: (state, action: PayloadAction<boolean>) => {
      state.hasEnteredFormFieldDetection = action.payload;
    },
    resetFormFieldDetectionState: (state) => {
      state.isApplyingFormFieldDetection = false;
      state.hasEnteredFormFieldDetection = false;
    },
  },
});

export const formFieldDetectionSelectors = {
  hasEnteredFormFieldDetection: (state: RootState) => state.formFieldDetection.hasEnteredFormFieldDetection,
};

export const { setIsApplyingFormFieldDetection, setHasEnteredFormFieldDetection, resetFormFieldDetectionState } =
  formFieldDetectionSlice.actions;

export default formFieldDetectionSlice.reducer;
