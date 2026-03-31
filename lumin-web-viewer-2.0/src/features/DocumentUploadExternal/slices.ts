import { createSlice } from '@reduxjs/toolkit';

export enum SYNC_STATUS {
  SYNCING= 'syncing',
  SAVED= 'saved',
  DEFAULT= 'default',
};

interface DocumentUploadExternalState {
  syncStatus: SYNC_STATUS;
}

const initialState = {
  syncStatus: SYNC_STATUS.DEFAULT,
};

export const documentUploadExternalSlice = createSlice({
  name: 'DOCUMENT_UPLOAD_EXTERNAL',
  initialState,
  reducers: {
    setIsSyncing: (state) => {
      state.syncStatus = SYNC_STATUS.SYNCING;
    },
    setIsSaved: (state) => {
      state.syncStatus = SYNC_STATUS.SAVED;
    },
    resetSyncStatus: (state) => {
      state.syncStatus = SYNC_STATUS.DEFAULT;
    },
  },
});

export const documentUploadExternalActions = documentUploadExternalSlice.actions;

export const documentUploadExternalSelectors = {
  syncStatus: (state: { documentUploadExternal: DocumentUploadExternalState }) => state.documentUploadExternal.syncStatus,
  isSyncing: (state: { documentUploadExternal: DocumentUploadExternalState }) => state.documentUploadExternal.syncStatus === SYNC_STATUS.SYNCING,
};

export default documentUploadExternalSlice.reducer;
