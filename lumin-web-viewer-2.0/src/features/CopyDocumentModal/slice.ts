import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { StorageType } from 'features/FeatureConfigs/featureStoragePolicies';

import { STORAGE_TYPE } from 'constants/lumin-common';

import { IDocumentBase } from 'interfaces/document/document.interface';

interface CopyDocumentModalState {
  isOpen: boolean;
  document: IDocumentBase | null;

  syncFileTo: StorageType;
  isOpenCopyToDriveModal: boolean;
  isOpenFileDestinationModal: boolean;
}

const initialState: CopyDocumentModalState = {
  isOpen: false,
  document: null,

  syncFileTo: STORAGE_TYPE.S3,
  isOpenCopyToDriveModal: false,
  isOpenFileDestinationModal: false,
};

const copyDocumentModalSlice = createSlice({
  name: 'COPY_DOCUMENT_MODAL',
  initialState,
  reducers: {
    // Original copy document modal reducers
    openCopyDocumentModal: (state, action: PayloadAction<IDocumentBase>) => {
      state.isOpen = true;
      state.document = action.payload;
    },
    closeCopyDocumentModal: (state) => {
      state.isOpen = false;
      state.document = null;
    },

    openCopyToDriveModal: (state) => {
      state.isOpenCopyToDriveModal = true;
    },
    closeCopyToDriveModal: (state) => {
      state.isOpenCopyToDriveModal = false;
    },
    openFileDestinationModal: (state) => {
      state.isOpenFileDestinationModal = true;
    },
    closeFileDestinationModal: (state) => {
      state.isOpenFileDestinationModal = false;
    },
    setSyncFileDestination: (state, action: PayloadAction<StorageType>) => {
      state.syncFileTo = action.payload;
    },
    resetSyncFileDestination: (state) => {
      state.syncFileTo = STORAGE_TYPE.S3;
    },
  },
});

export const {
  openCopyDocumentModal,
  closeCopyDocumentModal,

  openCopyToDriveModal,
  closeCopyToDriveModal,
  openFileDestinationModal,
  closeFileDestinationModal,
  setSyncFileDestination,
  resetSyncFileDestination,
} = copyDocumentModalSlice.actions;

export default copyDocumentModalSlice.reducer;

export const copyDocumentModalSelectors = {
  // Original copy document modal selectors
  isOpen: (state: { copyDocumentModal: CopyDocumentModalState }) => state.copyDocumentModal.isOpen,
  document: (state: { copyDocumentModal: CopyDocumentModalState }) => state.copyDocumentModal.document,

  isOpenCopyToDriveModal: (state: { copyDocumentModal: CopyDocumentModalState }) => state.copyDocumentModal.isOpenCopyToDriveModal,
  syncFileTo: (state: { copyDocumentModal: CopyDocumentModalState }) => state.copyDocumentModal.syncFileTo,
  isOpenFileDestinationModal: (state: { copyDocumentModal: CopyDocumentModalState }) => state.copyDocumentModal.isOpenFileDestinationModal,
};
