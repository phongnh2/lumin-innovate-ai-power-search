import { combineReducers } from '@reduxjs/toolkit';

import { accountReducer } from '@/features/account/account-slice';
import { userReducer } from '@/features/account/user-slice';
import { api } from '@/features/api-slice';
import { commonReducer } from '@/features/common-slice';
import { modalReducer } from '@/features/modal-slice';
import { oauth2Reducer } from '@/features/oauth2/oauth2-slice';
import { themeReducer } from '@/features/theme-slice';
import { visibilityReducer } from '@/features/visibility-slice';

export const rootReducer = combineReducers({
  theme: themeReducer,
  account: accountReducer,
  oauth2: oauth2Reducer,
  currentUser: userReducer,
  visibility: visibilityReducer,
  modalData: modalReducer,
  [api.reducerPath]: api.reducer,
  common: commonReducer
});
export type RootState = ReturnType<typeof rootReducer>;
