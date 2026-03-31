import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { COMPRESS_RESOLUTION } from '../constants';
import { CompressLevelType, CompressOptionsType, CompressPdfState } from '../types';

const initialState: CompressPdfState = {
  compressLevel: COMPRESS_RESOLUTION.NONE,
  isEditingCompressOptions: false,
  compressOptions: {
    isDownSample: true,
    dpiImage: 96,
    isEmbedFont: true,
    isSubsetFont: true,
    removeAnnotation: false,
    removeDocInfo: false,
  },
};

export const compressPdfSlice = createSlice({
  name: 'COMPRESS_PDF',
  initialState,
  reducers: {
    setCompressLevel: (state, action: PayloadAction<CompressLevelType>) => {
      state.compressLevel = action.payload;
    },
    setIsEditingCompressOptions: (state, action: PayloadAction<boolean>) => {
      state.isEditingCompressOptions = action.payload;
    },
    setCompressOptions: (state, action: PayloadAction<CompressOptionsType>) => {
      state.compressOptions = action.payload;
    },
  },
});

export const compressPdfSelectors = {
  getCompressLevel: (state: { compressPdf: CompressPdfState }) => state.compressPdf.compressLevel,
  getIsEditingCompressOptions: (state: { compressPdf: CompressPdfState }) => state.compressPdf.isEditingCompressOptions,
  getCompressOptions: (state: { compressPdf: CompressPdfState }) => state.compressPdf.compressOptions,
};

export const compressPdfActions = compressPdfSlice.actions;

export default compressPdfSlice.reducer;
