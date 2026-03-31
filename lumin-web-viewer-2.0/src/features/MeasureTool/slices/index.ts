import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import uniqBy from 'lodash/uniqBy';

import { MeasureToolState, ScaleInfo } from '../interfaces';

const initialState: MeasureToolState = {
  isActive: false,
  configModal: {
    isOpen: false,
  },
  scales: [],
  selectedScale: null,
};

export const measureToolSlice = createSlice({
  name: 'MEASURE_TOOL',
  initialState,
  reducers: {
    setConfigModal: (state: MeasureToolState, action: PayloadAction<MeasureToolState['configModal']>) => {
      state.configModal = action.payload;
    },
    toggleActive: (state: MeasureToolState) => {
      state.isActive = !state.isActive;
    },
    setIsActive: (state: MeasureToolState, action: PayloadAction<MeasureToolState['isActive']>) => {
      state.isActive = action.payload;
    },
    setScales: (state: MeasureToolState, action: PayloadAction<ScaleInfo[]>) => {
      state.scales = action.payload;
    },
    addScale: (state: MeasureToolState, action: PayloadAction<ScaleInfo>) => {
      state.scales.push(action.payload);
    },
    deleteScale: (state: MeasureToolState, action: PayloadAction<ScaleInfo>) => {
      state.scales = state.scales.filter((scale) => scale.title !== action.payload.title);
    },
    replaceScale: (
      state: MeasureToolState,
      action: PayloadAction<{ originalScale: ScaleInfo; replaceScale: ScaleInfo }>
    ) => {
      const index = state.scales.findIndex((scale) => scale.title === action.payload.originalScale.title);
      if (index !== -1) {
        state.scales[index] = action.payload.replaceScale;
      }
      const uniqueScales = uniqBy(state.scales, 'title');
      state.scales = uniqueScales;
    },
    setSelectedScale: (state: MeasureToolState, action: PayloadAction<ScaleInfo>) => {
      state.selectedScale = action.payload;
    },
  },
});

export const measureToolSelectors = {
  isActive: (state: { measureTool: MeasureToolState }) => state.measureTool.isActive,
  getScales: (state: { measureTool: MeasureToolState }) => state.measureTool.scales,
  getSelectedScale: (state: { measureTool: MeasureToolState }) => state.measureTool.selectedScale,
  getConfigModal: (state: { measureTool: MeasureToolState }) => state.measureTool.configModal,
};

export const measureToolActions = measureToolSlice.actions;

export default measureToolSlice.reducer;
