import { RootState } from '@/lib/reducers';

export const getVerificationEmail = (state: RootState) => state.account.verificationEmail;

export const isGSILoaded = (state: RootState) => state.account.gsiLoaded;
