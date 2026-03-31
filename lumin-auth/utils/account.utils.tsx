import dayjs from 'dayjs';

import { SocialSignInProvider } from '@/components/SettingsPage/SocialSignIn/constant';
import { environment } from '@/configs/environment';
import { DATE_FORMAT, NUMBER_DAYS_DELETED_ACCOUNT } from '@/constants/common';
import { OryProvider } from '@/interfaces/ory/core';
import { LoginService } from '@/interfaces/user';
import LogoApple from 'public/assets/logo-apple.svg';
import LogoDropbox from 'public/assets/logo-dropbox.svg';
import LogoGoogle from 'public/assets/logo-google.svg';
import LogoMicrosoft from 'public/assets/logo-microsoft.svg';
import LogoSso from 'public/assets/logo-sso.svg';
import LogoXero from 'public/assets/logo-xero.svg';

export const OidcLogo = {
  [LoginService.DROPBOX]: LogoDropbox,
  [LoginService.GOOGLE]: LogoGoogle,
  [LoginService.APPLE]: LogoApple,
  [LoginService.MICROSOFT]: LogoMicrosoft,
  [LoginService.XERO]: LogoXero,
  [LoginService.EMAIL_PASSWORD]: null,
  [LoginService.SAML_SSO]: LogoSso
};

export const SocialSignInProviderLogo = {
  [SocialSignInProvider.GOOGLE]: LogoGoogle,
  [SocialSignInProvider.MICROSOFT]: LogoMicrosoft,
  [SocialSignInProvider.XERO]: LogoXero
};

export const OidcProviderMapping = {
  [OryProvider.Dropbox]: {
    loginService: LoginService.DROPBOX,
    providerId: environment.public.dropbox.providerId
  },
  [OryProvider.Google]: {
    loginService: LoginService.GOOGLE,
    providerId: OryProvider.Google
  },
  [OryProvider.Apple]: {
    loginService: LoginService.APPLE,
    providerId: OryProvider.Apple
  },
  [OryProvider.Microsoft]: {
    loginService: LoginService.MICROSOFT,
    providerId: OryProvider.Microsoft
  },
  [OryProvider.Xero]: {
    loginService: LoginService.XERO,
    providerId: OryProvider.Xero
  }
};

export const formatDeleteAccountTime = (date: Date) => {
  return dayjs(date).add(NUMBER_DAYS_DELETED_ACCOUNT, 'day').format(DATE_FORMAT);
};

export const emitToNativeWebView = (message: string) => {
  // for mobile only
  if ('ReactNativeWebView' in window) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    window.ReactNativeWebView.postMessage(message);
  }
};

export const getEmailDomain = (email: string): string => {
  return email.split('@')[1] || '';
};
