import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { ErrorModalType } from '../constants';
import { ErrorDocument, MultipleDownloadState } from '../interfaces';

const initialState: MultipleDownloadState = {
  errorDocuments: [],
  errorModal: {
    type: ErrorModalType.SOME_ITEMS_FAILED_TO_DOWNLOAD,
    opened: false,
  },
  errorTypes: [],
  hasOpenedDropboxAuthWindow: false,
};

export const multipleDownloadSlice = createSlice({
  name: 'MULTIPLE_DOWNLOAD',
  initialState,
  reducers: {
    setErrorModalType: (state, action: PayloadAction<ErrorModalType>) => {
      state.errorModal.type = action.payload;
    },
    setErrorModalOpened: (state, action: PayloadAction<boolean>) => {
      state.errorModal.opened = action.payload;
    },
    setErrorDocuments: (state, action: PayloadAction<ErrorDocument[]>) => {
      state.errorDocuments = action.payload;
    },
    addErrorDocument: (state, action: PayloadAction<ErrorDocument>) => {
      state.errorDocuments.push(action.payload);
    },
    setErrorTypes: (state, action: PayloadAction<string[]>) => {
      state.errorTypes = action.payload;
    },
    addErrorType: (state, action: PayloadAction<string>) => {
      state.errorTypes.push(action.payload);
    },
    setHasOpenedDropboxAuthWindow: (state, action: PayloadAction<boolean>) => {
      state.hasOpenedDropboxAuthWindow = action.payload;
    },
    resetHasOpenedDropboxAuthWindow: (state) => {
      state.hasOpenedDropboxAuthWindow = false;
    },
  },
});

export const {
  setErrorModalType,
  setErrorModalOpened,
  setErrorDocuments,
  addErrorDocument,
  setErrorTypes,
  addErrorType,
  setHasOpenedDropboxAuthWindow,
  resetHasOpenedDropboxAuthWindow,
} = multipleDownloadSlice.actions;

export const multipleDownloadSelectors = {
  getErrorDocuments: (state: { multipleDownload: MultipleDownloadState }) => state.multipleDownload.errorDocuments,
  getErrorModal: (state: { multipleDownload: MultipleDownloadState }) => state.multipleDownload.errorModal,
  getErrorTypes: (state: { multipleDownload: MultipleDownloadState }) => state.multipleDownload.errorTypes,
  getHasOpenedDropboxAuthWindow: (state: { multipleDownload: MultipleDownloadState }) =>
    state.multipleDownload.hasOpenedDropboxAuthWindow,
};

export default multipleDownloadSlice.reducer;
