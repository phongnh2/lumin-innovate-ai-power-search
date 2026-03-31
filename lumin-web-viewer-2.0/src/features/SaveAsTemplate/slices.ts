import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface SaveAsTemplateState {
  isOpenSaveAsTemplate: boolean;
}

const initialState: SaveAsTemplateState = {
  isOpenSaveAsTemplate: false,
};

export const saveAsTemplateSlice = createSlice({
  name: 'SAVE_AS_TEMPLATE',
  initialState,
  reducers: {
    setIsOpenSaveAsTemplate: (state, action: PayloadAction<boolean>) => {
      state.isOpenSaveAsTemplate = action.payload;
    },
  },
});

export const { setIsOpenSaveAsTemplate } = saveAsTemplateSlice.actions;

export const saveAsTemplateSelectors = {
  isOpenSaveAsTemplate: (state: { saveAsTemplate: SaveAsTemplateState }) => state.saveAsTemplate.isOpenSaveAsTemplate,
};

export default saveAsTemplateSlice.reducer;
