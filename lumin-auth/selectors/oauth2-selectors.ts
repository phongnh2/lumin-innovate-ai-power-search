import { RootState } from '@/lib/reducers';

export const getLoginChallenge = (state: RootState): string => state.oauth2.loginChallenge || '';
