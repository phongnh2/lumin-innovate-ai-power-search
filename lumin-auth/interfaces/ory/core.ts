import { UiNodeGroupEnum, Identity as KratosIdentity, Session } from '@ory/client';
import { RawAxiosRequestConfig } from 'axios';

import { LoginService } from '@/interfaces/user';

export enum OryProvider {
  Google = 'google',
  Dropbox = 'dropbox',
  Apple = 'apple',
  Microsoft = 'microsoft',
  Xero = 'xero'
}

export enum OryLoginMethod {
  Password = 'password',
  Oidc = 'oidc',
  Saml = 'saml'
}

export enum OryUpdateSettingsMethod {
  Password = 'password',
  Oidc = 'oidc',
  Profile = 'profile',
  Saml = 'saml'
}

export type TOryUiNodeGroup = Extract<UiNodeGroupEnum, 'default' | 'oidc' | 'password' | 'profile'>;

export type OryAxiosRequestConfig = RawAxiosRequestConfig;

export type Traits = {
  name: string;
  email: string;
  avatarRemoteId?: string;
  sub?: string;
  loginService?: LoginService;
};

export type Identity = Omit<KratosIdentity, 'traits'> & {
  traits: Traits;
};

export type OrySession = Omit<Session, 'identity'> & { identity: Identity };
