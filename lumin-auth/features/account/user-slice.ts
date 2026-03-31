import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { merge } from 'lodash';

import { IUser } from '@/interfaces/user';

import { accountApi } from './account-api-slice';
import settingsApi from './settings-api-slice';

export type UserState = IUser | null;

const initialState: UserState = null;

const userSlice = createSlice({
  name: 'user',
  initialState: initialState as unknown as UserState,
  reducers: {
    setCurrentUser: (_state, action: PayloadAction<IUser>) => {
      return action.payload;
    },
    updateCurrentUser: (state, action: PayloadAction<IUser>) => {
      return merge(state, action.payload);
    }
  },
  extraReducers: builder => {
    builder.addMatcher(accountApi.endpoints.getCurrentUser.matchFulfilled, (_state, action) => {
      return action.payload;
    });
    builder.addMatcher(settingsApi.endpoints.removeAvatar.matchFulfilled, state => {
      if (state) {
        state.avatarRemoteId = '';
      }
    });
  }
});

export const userReducer = userSlice.reducer;
export const { setCurrentUser, updateCurrentUser } = userSlice.actions;
