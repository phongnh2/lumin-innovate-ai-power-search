import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface FormBuilderState {
  isInFormBuildMode: boolean;
}

const initialState = {
  isInFormBuildMode: false,
};

export const formBuilderSlice = createSlice({
  name: 'FORM_BUILDER',
  initialState,
  reducers: {
    setIsInFormBuildMode: (state, action: PayloadAction<boolean>) => {
      state.isInFormBuildMode = action.payload;
    },
  },
});

export const formBuilderActions = formBuilderSlice.actions;

export const formBuilderSelectors = {
  isInFormBuildMode: (state: { formBuilder: FormBuilderState }) => state.formBuilder.isInFormBuildMode,
};

export default formBuilderSlice.reducer;
