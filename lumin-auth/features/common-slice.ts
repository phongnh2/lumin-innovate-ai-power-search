import { createSlice } from '@reduxjs/toolkit';

interface CommonState {
  cookieConsentsLoaded: boolean;
}

const initialState: CommonState = {
  cookieConsentsLoaded: false
};

const commonSlice = createSlice({
  name: 'common',
  initialState,
  reducers: {
    loadCookieConsentsSuccess: state => {
      state.cookieConsentsLoaded = true;
    }
  }
});

export const { loadCookieConsentsSuccess } = commonSlice.actions;
export const commonReducer = commonSlice.reducer;
