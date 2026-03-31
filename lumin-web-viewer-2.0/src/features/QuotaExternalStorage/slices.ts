import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface ExternalQuotaSpace {
  total: number;
  used: number;
  remaining: number;
}

interface ExternalStorageState {
  isExceedQuotaExternalStorage: boolean;
  externalQuotaSpace: ExternalQuotaSpace;
}

const initialState: ExternalStorageState = {
  isExceedQuotaExternalStorage: false,
  externalQuotaSpace: {
    total: 0,
    used: 0,
    remaining: 0,
  },
};

export const externalStorageSlice = createSlice({
  name: 'EXTERNAL_STORAGE',
  initialState,
  reducers: {
    setIsExceedQuotaExternalStorage: (state, action: PayloadAction<boolean>) => {
      state.isExceedQuotaExternalStorage = action.payload;
    },
    setExternalQuotaSpace: (state, action: PayloadAction<Partial<ExternalQuotaSpace>>) => {
      state.externalQuotaSpace = {
        ...state.externalQuotaSpace,
        ...action.payload,
      };
    },
    resetExternalStorageState: (state) => {
      state.isExceedQuotaExternalStorage = false;
      state.externalQuotaSpace = {
        total: 0,
        used: 0,
        remaining: 0,
      };
    },
  },
});

export const { setIsExceedQuotaExternalStorage, setExternalQuotaSpace, resetExternalStorageState } =
  externalStorageSlice.actions;

export const selectors = {
  getExternalQuotaSpace: (state: { quotaExternalStorage: ExternalStorageState }) =>
    state.quotaExternalStorage.externalQuotaSpace,
  getIsExceedQuotaExternalStorage: (state: { quotaExternalStorage: ExternalStorageState }) =>
    state.quotaExternalStorage.isExceedQuotaExternalStorage,
};

export default externalStorageSlice.reducer;
