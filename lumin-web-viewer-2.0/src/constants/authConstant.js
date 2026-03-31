import { Routers } from './Routers';

export const DriveErrorCode = {
  SIGNIN_REQUIRED: 'signinDriveRequired',
  UNAUTHORIZED: 'unauthorized',
  PERMISSION_REQUIRED: 'permissionRequired',
  MISSING_ACCESS_TOKEN: 'missingAccessToken',
};

export const DriveScopes = {
  DRIVE_INSTALL: 'https://www.googleapis.com/auth/drive.install',
  DRIVE_FILE: 'https://www.googleapis.com/auth/drive.file',
};

export const PeopleScopes = {
  GOOGLE_CONTACT: 'https://www.googleapis.com/auth/contacts.other.readonly',
  GOOGLE_DIRECTORY: 'https://www.googleapis.com/auth/directory.readonly',
};

export const ROUTERS_HAS_LEFT_BLOCK = [
  Routers.SIGNIN,
  Routers.SIGNUP,
  Routers.FREE_SIGNUP,
  Routers.TRIAL_SIGNUP,
  Routers.TRIAL_SIGNIN,
];

export const LOGIN_SERVICES = {
  GOOGLE: 'GOOGLE',
  DROPBOX: 'DROPBOX',
  MICROSOFT: 'MICROSOFT',
  EMAIL_PASSWORD: 'EMAIL_PASSWORD',
  OPEN_FORM_FROM_TEMPLATES: 'OPEN_FORM_FROM_TEMPLATES',
  SAML_SSO: 'SAML_SSO',
};

export const LOGIN_SERVICE_TO_WORDING = {
  [LOGIN_SERVICES.DROPBOX]: 'Dropbox',
  [LOGIN_SERVICES.MICROSOFT]: 'Microsoft',
  [LOGIN_SERVICES.EMAIL_PASSWORD]: 'email & password',
};

export const AUTHORIZATION_HEADER = 'authorization-v2';

export const AUTHEN_TYPE = {
  TEMPLATES_OPEN: 'TEMPLATES_OPEN',
};
