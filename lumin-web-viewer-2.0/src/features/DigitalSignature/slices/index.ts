import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { RootState } from 'store';

interface IDigitalSignatureState {
  isProcessing: boolean;
  shouldShowBanner: boolean;
}

const initialState: IDigitalSignatureState = {
  isProcessing: false,
  shouldShowBanner: false,
};

const digitalSignatureSlice = createSlice({
  name: 'DIGITAL_SIGNATURE',
  initialState,
  reducers: {
    setIsProcessing: (state, action: PayloadAction<boolean>) => {
      state.isProcessing = action.payload;
    },
    setShouldShowBanner: (state, action: PayloadAction<boolean>) => {
      state.shouldShowBanner = action.payload;
    },
    resetDigitalSignature: (state) => {
      state.isProcessing = false;
      state.shouldShowBanner = false;
    },
  },
});

export const digitalSignatureSelectors = {
  isDigitalSignatureProcessing: (state: RootState) => state.digitalSignature.isProcessing,
  shouldShowCreateCertifiedVersionBanner: (state: RootState) => state.digitalSignature.shouldShowBanner,
};

export const digitalSignatureActions = digitalSignatureSlice.actions;

export default digitalSignatureSlice.reducer;
