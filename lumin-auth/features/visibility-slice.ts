import { PayloadAction, createSlice } from '@reduxjs/toolkit';

import { ElementName } from '@/constants/common';

interface VisibilityState {
  openElements: Record<ElementName, boolean>;
}

const initialState: VisibilityState = {
  openElements: {
    [ElementName.LUMIN_LOADING]: false
  }
};

const visibilitySlice = createSlice({
  name: 'visibility',
  initialState,
  reducers: {
    openElement: (state, action: PayloadAction<ElementName>) => {
      const dataElement = action.payload;
      state.openElements[dataElement] = true;
    },
    closeElement: (state, action: PayloadAction<ElementName>) => {
      const dataElement = action.payload;
      state.openElements[dataElement] = false;
    }
  }
});

export const { openElement, closeElement } = visibilitySlice.actions;
export const visibilityReducer = visibilitySlice.reducer;
