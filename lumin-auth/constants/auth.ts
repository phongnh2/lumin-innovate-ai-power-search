import { OryProvider } from '@/interfaces/ory';
import { LoginService } from '@/interfaces/user';

export const LOGIN_SERVICE_TO_ORY_PROVIDER = {
  [LoginService.GOOGLE]: OryProvider.Google,
  [LoginService.DROPBOX]: OryProvider.Dropbox,
  [LoginService.MICROSOFT]: OryProvider.Microsoft,
  [LoginService.APPLE]: OryProvider.Apple,
  [LoginService.XERO]: OryProvider.Xero,
  [LoginService.EMAIL_PASSWORD]: null,
  [LoginService.SAML_SSO]: null
};

export const OIDC_PROVIDER_TO_LOGIN_SERVICE = {
  [OryProvider.Google]: LoginService.GOOGLE,
  [OryProvider.Dropbox]: LoginService.DROPBOX,
  [OryProvider.Microsoft]: LoginService.MICROSOFT,
  [OryProvider.Apple]: LoginService.APPLE,
  [OryProvider.Xero]: LoginService.XERO
};
