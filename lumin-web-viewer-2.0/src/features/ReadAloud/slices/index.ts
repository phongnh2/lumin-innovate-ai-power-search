import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { READ_ALOUD_DEFAULT_LANGUAGE, SPEAKING_PITCH, SPEAKING_RATE } from '../constants';
import { ReadAloudState } from '../interfaces';

const initialState: ReadAloudState = {
  isInReadAloudMode: false,
  isNoTextModalOpen: false,
  speakingSettings: {
    activeLanguage: READ_ALOUD_DEFAULT_LANGUAGE,
    activeVoice: null,
    rate: SPEAKING_RATE.DEFAULT,
    pitch: SPEAKING_PITCH.DEFAULT,
  },
  isReadingSample: false,
  isReadingDocument: false,
  isCompletedReadDocument: false,
  isReadAloudModeReady: false,
};

export const readAloudSlice = createSlice({
  name: 'READ_ALOUD',
  initialState,
  reducers: {
    setIsInReadAloudMode: (state: ReadAloudState, action: PayloadAction<ReadAloudState['isInReadAloudMode']>) => {
      state.isInReadAloudMode = action.payload;
    },
    setSpeakingRate: (state: ReadAloudState, action: PayloadAction<ReadAloudState['speakingSettings']['rate']>) => {
      state.speakingSettings.rate = action.payload;
    },
    setSpeakingLanguage: (
      state: ReadAloudState,
      action: PayloadAction<ReadAloudState['speakingSettings']['activeLanguage']>
    ) => {
      state.speakingSettings.activeLanguage = action.payload;
    },
    setSpeakingPitch: (state: ReadAloudState, action: PayloadAction<ReadAloudState['speakingSettings']['pitch']>) => {
      state.speakingSettings.pitch = action.payload;
    },
    setSpeakingVoice: (
      state: ReadAloudState,
      action: PayloadAction<ReadAloudState['speakingSettings']['activeVoice']>
    ) => {
      state.speakingSettings.activeVoice = action.payload;
    },
    setSpeakingSettings: (state: ReadAloudState, action: PayloadAction<ReadAloudState['speakingSettings']>) => {
      state.speakingSettings = action.payload;
    },
    setIsReadingSample: (state: ReadAloudState, action: PayloadAction<ReadAloudState['isReadingSample']>) => {
      state.isReadingSample = action.payload;
    },
    setIsReadingDocument: (state: ReadAloudState, action: PayloadAction<ReadAloudState['isReadingDocument']>) => {
      state.isReadingDocument = action.payload;
    },
    setIsNoTextModalOpen: (state: ReadAloudState, action: PayloadAction<ReadAloudState['isNoTextModalOpen']>) => {
      state.isNoTextModalOpen = action.payload;
    },
    setIsCompletedReadDocument: (
      state: ReadAloudState,
      action: PayloadAction<ReadAloudState['isCompletedReadDocument']>
    ) => {
      state.isCompletedReadDocument = action.payload;
    },
    setIsReadAloudModeReady: (state: ReadAloudState, action: PayloadAction<ReadAloudState['isReadAloudModeReady']>) => {
      state.isReadAloudModeReady = action.payload;
    },
    resetReadAloud: (state: ReadAloudState) => {
      state.isReadingSample = false;
      state.isReadingDocument = false;
      state.isCompletedReadDocument = false;
    },
  },
});

export const readAloudSelectors = {
  isInReadAloudMode: (state: { readAloud: ReadAloudState }) => state.readAloud.isInReadAloudMode,
  speakingSettings: (state: { readAloud: ReadAloudState }) => state.readAloud.speakingSettings,
  isReadingSample: (state: { readAloud: ReadAloudState }) => state.readAloud.isReadingSample,
  isReadingDocument: (state: { readAloud: ReadAloudState }) => state.readAloud.isReadingDocument,
  isNoTextModalOpen: (state: { readAloud: ReadAloudState }) => state.readAloud.isNoTextModalOpen,
  isCompletedReadDocument: (state: { readAloud: ReadAloudState }) => state.readAloud.isCompletedReadDocument,
  isReadAloudModeReady: (state: { readAloud: ReadAloudState }) => state.readAloud.isReadAloudModeReady,
  resetReadAloud: (state: { readAloud: ReadAloudState }) => state.readAloud,
};

export const readAloudActions = readAloudSlice.actions;

export default readAloudSlice.reducer;
