import { OryProvider } from '@/interfaces/ory';
import { LoginService } from '@/interfaces/user';

export enum SocialSignInProvider {
  GOOGLE = 'Google',
  MICROSOFT = 'Microsoft',
  XERO = 'Xero'
}

export const SOCIAL_SIGN_IN_PROVIDER_TO_LOGIN_SERVICE = {
  [SocialSignInProvider.GOOGLE]: LoginService.GOOGLE,
  [SocialSignInProvider.MICROSOFT]: LoginService.MICROSOFT,
  [SocialSignInProvider.XERO]: LoginService.XERO
};

export const SOCIAL_SIGN_IN_PROVIDER_TO_ORY_PROVIDER = {
  [SocialSignInProvider.GOOGLE]: OryProvider.Google,
  [SocialSignInProvider.MICROSOFT]: OryProvider.Microsoft,
  [SocialSignInProvider.XERO]: OryProvider.Xero
};

export const LOGIN_SERVICE_TO_SOCIAL_SIGN_IN_PROVIDER: Partial<Record<LoginService, string>> = {
  [LoginService.GOOGLE]: SocialSignInProvider.GOOGLE,
  [LoginService.MICROSOFT]: SocialSignInProvider.MICROSOFT,
  [LoginService.XERO]: SocialSignInProvider.XERO,
  [LoginService.EMAIL_PASSWORD]: 'email & password'
};

export enum SocialSignInStatus {
  INITIAL,
  PROMPT_SELECT_ACCOUNT,
  LINKING_ACCOUNT,
  WRONG_ACCOUNT_SELECTED,
  FAILED,
  SUCCESS,
  CANCELLED
}
