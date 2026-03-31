import { OryProvider } from '@/interfaces/ory';

export const SIGN_AUTH_METHOD = {
  [OryProvider.Google]: 'Google',
  [OryProvider.Dropbox]: 'Dropbox',
  UserName: 'UsernamePassword',
  [OryProvider.Apple]: 'Apple',
  [OryProvider.Microsoft]: 'Microsoft',
  [OryProvider.Xero]: 'Xero'
};
