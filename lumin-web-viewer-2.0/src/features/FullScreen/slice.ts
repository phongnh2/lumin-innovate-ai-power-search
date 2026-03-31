import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { RootState } from 'store';

import fitMode from 'constants/fitMode';

export type FitMode = typeof fitMode[keyof typeof fitMode];

interface IFullScreenState {
  fitMode: FitMode;
  defaultZoom: number;
}

const initialState: IFullScreenState = {
  fitMode: fitMode.FitPage,
  defaultZoom: 1,
};

const fullScreenSlice = createSlice({
  name: 'FULL_SCREEN',
  initialState,
  reducers: {
    setFitMode: (state, action: PayloadAction<FitMode>) => {
      state.fitMode = action.payload;
    },
    setDefaultZoom: (state, action: PayloadAction<number>) => {
      state.defaultZoom = action.payload;
    },
    setFitModeAndDefaultZoom: (state, action: PayloadAction<{ fitMode: FitMode; defaultZoom: number }>) => {
      state.fitMode = action.payload.fitMode;
      state.defaultZoom = action.payload.defaultZoom;
    },
  },
});

export const fullScreenSelectors = {
  presentationFitMode: (state: RootState) => state.fullScreen.fitMode,
  defaultZoom: (state: RootState) => state.fullScreen.defaultZoom,
};

export const fullScreenActions = fullScreenSlice.actions;

export default fullScreenSlice.reducer;
