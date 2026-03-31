export interface IUser {
  _id?: string;
  deletedAt?: string;
  avatarRemoteId?: string;
  name?: string;
  isTermsOfUseVersionChanged?: boolean;
}

export enum LoginService {
  EMAIL_PASSWORD = 'EMAIL_PASSWORD',
  DROPBOX = 'DROPBOX',
  GOOGLE = 'GOOGLE',
  APPLE = 'APPLE',
  MICROSOFT = 'MICROSOFT',
  XERO = 'XERO',
  SAML_SSO = 'SAML_SSO'
}

export enum ForceLogoutType {
  DEFAULT = 'default',
  CHANGED_PASSWORD = 'changedPassword',
  CHANGE_LOGIN_SERVICE = 'changeLoginService'
}

export const UNKNOWN_THIRD_PARTY = 'unknown_third_party';

export enum ReCaptchaAction {
  FORGOT_PASSWORD = 'forgot_password'
}
