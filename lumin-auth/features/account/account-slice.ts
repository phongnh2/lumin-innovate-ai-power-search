import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { merge } from 'lodash';

import { RecursivePartial } from '@/interfaces/custom-type';
import type { Identity } from '@/interfaces/ory';

import { accountApi } from './account-api-slice';
import { identityApi } from './identity-api-slice';
import settingsApi from './settings-api-slice';

export type AuthState = {
  verificationEmail: string | null;
  identity: Identity | null;
  gsiLoaded: boolean;
};
const initialState: AuthState = {
  verificationEmail: null,
  identity: null,
  gsiLoaded: false
};

const accountSlice = createSlice({
  name: 'account',
  initialState,
  reducers: {
    setVerificationEmail: (state, action: PayloadAction<string>) => {
      state.verificationEmail = action.payload;
    },
    setIdentity: (state, action: PayloadAction<Identity | null>) => {
      state.identity = action.payload;
    },
    updateIdentity: (state, action: PayloadAction<RecursivePartial<Identity>>) => {
      merge(state.identity, action.payload);
    },
    setGsiLoaded: (state, action: PayloadAction<boolean>) => {
      state.gsiLoaded = action.payload;
    }
  },
  extraReducers: builder => {
    // clear identity on logout
    builder.addMatcher(accountApi.endpoints.logout.matchFulfilled, state => {
      state.identity = null;
    });
    builder.addMatcher(settingsApi.endpoints.uploadAvatar.matchFulfilled, (state, action) => {
      if (state.identity) {
        state.identity.traits.avatarRemoteId = action.payload.remotePath;
      }
    });
    builder.addMatcher(settingsApi.endpoints.removeAvatar.matchFulfilled, state => {
      if (state.identity) {
        state.identity.traits.avatarRemoteId = '';
      }
    });
    builder.addMatcher(settingsApi.endpoints.updateTraits.matchFulfilled, (state, action) => {
      if (state.identity) {
        state.identity.traits = action.payload;
      }
    });
    // clear identity there's no session
    builder.addMatcher(identityApi.endpoints.getIdentity.matchFulfilled, (state, action) => {
      if (action.payload == null) {
        state.identity = null;
      }
    });
  }
});

export const accountReducer = accountSlice.reducer;
export const { setVerificationEmail, setIdentity, updateIdentity, setGsiLoaded } = accountSlice.actions;
