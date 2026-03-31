import { RootState } from '@/lib/reducers';

export const getCurrentUser = (state: RootState) => state.currentUser;

export const getIdentity = (state: RootState) => state.account.identity;
