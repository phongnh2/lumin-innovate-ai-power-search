import { createSelector, createSlice, PayloadAction } from '@reduxjs/toolkit';

import { LUMIN_SIGN } from '@/constants/common';

export type Ref = 'bananasign' | string | null;

export type ThemeState = {
  ref: Ref;
};
const initialState: ThemeState = {
  ref: null
};

const slice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    setThemeRef: (state, { payload: ref }: PayloadAction<Ref>) => {
      state.ref = ref;
    }
  }
});

export const selectThemeRef = (theme: ThemeState) => theme.ref;
export const selectIsBananasign = createSelector(selectThemeRef, ref => ref === LUMIN_SIGN);

export const themeReducer = slice.reducer;
export const { setThemeRef } = slice.actions;
