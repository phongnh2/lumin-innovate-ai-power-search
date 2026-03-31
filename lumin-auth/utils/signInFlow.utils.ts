import { Routes } from '@/configs/routers';
import { QUERY_KEYS } from '@/constants/common';

export function isSignInFlowUrl(url: string) {
  try {
    const signInFlowUrl = new URL(url);
    const searchParams = signInFlowUrl.searchParams;
    return signInFlowUrl.pathname === Routes.SignIn && searchParams.has(QUERY_KEYS.REDIRECT) && searchParams.has(QUERY_KEYS.LOGIN_HINT);
  } catch (err: unknown) {
    return false;
  }
}
