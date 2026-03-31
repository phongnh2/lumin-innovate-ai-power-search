import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type Oauth2State = {
  loginChallenge: string | null;
};

const initialState: Oauth2State = {
  loginChallenge: null
};

const slice = createSlice({
  name: 'oauth2',
  initialState,
  reducers: {
    setLoginChallenge: (state, action: PayloadAction<string>) => {
      state.loginChallenge = action.payload;
    }
  }
});

export const oauth2Reducer = slice.reducer;
export const { setLoginChallenge } = slice.actions;
