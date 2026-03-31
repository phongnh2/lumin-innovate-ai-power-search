export const OpenGoogleCookie = {
  GoogleAccessToken: '_google_at',
  GoogleLoginHint: 'google_login_hint',
};

export const PinpointEventsCookie = {
  DriveFileOpen: 'driveFileOpen',
};

export const CommonOpenFlowCookie = {
  LoginHint: 'login_hint',
  InFlow: 'in_flow',
};

export const GoogleScope = {
  DriveFile: 'https://www.googleapis.com/auth/drive.file',
  DriveInstall: 'https://www.googleapis.com/auth/drive.install',
  Email: 'email',
  Profile: 'profile',
};

export const OpenOneDriveCookie = {
  OneDriveAccessToken: 'onedrive_at',
  OneDriveKey: 'onedrive_key',
};

export const OneDrivePermission = {
  Email: 'email',
  Profile: 'profile',
  FilesReadWriteAll: 'Files.ReadWrite.All',
};

export enum AuthenticationStatus {
  SIGN_IN = 'sign_in',
  SIGN_UP = 'sign_up',
  AUTHENTICATED = 'authenticated',
}
