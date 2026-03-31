export const OAUTH_ENDPOINT_URL = 'https://oauth2.googleapis.com/tokeninfo?id_token=';
export const SCRIPT_INITIALIZED_FLAG = '__googleOneTapScript__';
export const PROMPT_ANCHOR_ID = 'one-tap-anchor';
export const GOOGLE_READY_POLL_INTERVAL_MS = 100;
export const GOOGLE_READY_POLL_TIMEOUT_MS = 5000;
export const GOOGLE_PROMPT_WIDTH = 391;

export enum OryLoginMethod {
  Password = 'password',
  Oidc = 'oidc',
}

export enum OryProvider {
  Google = 'google',
  Dropbox = 'dropbox',
  Apple = 'apple',
}

export enum LoginService {
  EMAIL_PASSWORD = 'EMAIL_PASSWORD',
  DROPBOX = 'DROPBOX',
  GOOGLE = 'GOOGLE',
  APPLE = 'APPLE',
}
