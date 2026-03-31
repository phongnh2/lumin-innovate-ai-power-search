import Link from 'next/link';
import { NextRouter } from 'next/router';
import { TFunction, Trans } from 'next-i18next';

import { environment } from '@/configs/environment';
import { Routes } from '@/configs/routers';
import { QUERY_KEYS } from '@/constants/common';
import { CookieStorageKey } from '@/constants/cookieKey';
import { ErrorCode } from '@/constants/errorCode';
import { LUMIN_SESSION } from '@/constants/sessionKey';
import { CANNY_AUTH_REGEX } from '@/constants/url';
import { OryProvider } from '@/interfaces/ory/core';
import { LoginService } from '@/interfaces/user';
import { Text } from '@/ui/Text';

import CookieUtils from './cookie.utils';
import { getErrorMetadata } from './error.utils';
import { getFullPathWithLanguageFromUrl } from './getLanguage';
import { isGoogleOpenPath } from './openGoogle.utils';

export const getAuthenticationMethodText = (loginService: LoginService | 'unknown_third_party', t: TFunction) =>
  ({
    [LoginService.DROPBOX]: 'Dropbox',
    [LoginService.GOOGLE]: 'Google',
    [LoginService.EMAIL_PASSWORD]: t('errorMessage.email&password'),
    [LoginService.APPLE]: 'Apple',
    [LoginService.MICROSOFT]: 'Microsoft',
    [LoginService.XERO]: 'Xero',
    [LoginService.SAML_SSO]: 'SSO',
    unknown_third_party: t('errorMessage.unknownThirdParty')
  }[loginService]);

export const getAuthenticationMethodMessage = (loginService: string, showHyperLink?: boolean) => (
  <Trans
    i18nKey={'errorMessage.alreadySignUpBy'}
    values={{ loginService }}
    components={{ b: showHyperLink ? <Text as={Link} href={Routes.SignIn} underline variant='highlight' bold level={6} /> : <span /> }}
  />
);

export const isLoginWithThirdParty = (method?: LoginService) =>
  [LoginService.DROPBOX, LoginService.GOOGLE, LoginService.APPLE, LoginService.XERO].includes(method as LoginService);

export const removeAuthenticationCredentials = () => {
  const isProductionOrDevelopment = ['development', 'production'].includes(environment.public.common.environment);
  CookieUtils.delete(LUMIN_SESSION.AUTHENTICATION);
  CookieUtils.delete(
    isProductionOrDevelopment ? CookieStorageKey.GOOGLE_ACCESS_TOKEN : `${CookieStorageKey.GOOGLE_ACCESS_TOKEN}_${environment.public.common.environment}`
  );
  localStorage.removeItem('token');
  window.location.reload();
};

export const checkOrySessionExpiry = (error: unknown) => {
  return getErrorMetadata(error)?.errorCode === ErrorCode.Auth.SESSION_REFRESH_REQUIRED;
};

export const extractReturnToFromRouter = (router: NextRouter): string | null => {
  const { asPath } = router;
  const queryParams = new URLSearchParams(asPath.split('?')[1]);
  return queryParams.get(QUERY_KEYS.RETURN_TO);
};

export const extractKeyFromReturnToUrl = ({ returnTo, key }: { returnTo: string; key: QUERY_KEYS }): string | null => {
  const returnToUrl = new URL(returnTo);
  const queryParams = new URLSearchParams(returnToUrl.search);
  return queryParams.get(key);
};

export const getReturnParamValues = (returnToQuery: string) => {
  const [from, action, agGuest] = [QUERY_KEYS.FROM, QUERY_KEYS.ACTION, QUERY_KEYS.AG_GUEST].map(key =>
    extractKeyFromReturnToUrl({ returnTo: decodeURIComponent(returnToQuery), key })
  );

  return {
    from,
    action,
    agGuest
  };
};

export const handleReturnTo = ({
  router,
  getReturnTo,
  email,
  provider
}: {
  router: NextRouter;
  getReturnTo: () => string | undefined;
  email: string;
  provider?: OryProvider;
}) => {
  const gateWay = environment.public.host.authUrl + getFullPathWithLanguageFromUrl('/authentication/gateway');
  let returnTo = getReturnTo();
  const loginHint = router.query[QUERY_KEYS.LOGIN_HINT] as string;
  const searchParams = new URLSearchParams();

  if (loginHint && isGoogleOpenPath(returnTo as string)) {
    if ([OryProvider.Dropbox, OryProvider.Microsoft].includes(provider as OryProvider)) {
      searchParams.append('redirect_to', `${returnTo}&guestEmail=${loginHint}`);
      return gateWay + `?` + searchParams.toString();
    }
    if (decodeURIComponent(loginHint) !== email) {
      return gateWay;
    }
    if (provider === OryProvider.Google) {
      const urlParams = new URLSearchParams(returnTo);
      searchParams.append('redirect_to', urlParams.get(QUERY_KEYS.RETURN_TO) as string);
      return gateWay + `?` + searchParams.toString();
    }
  }
  if (router.asPath.match(CANNY_AUTH_REGEX)) {
    const cannyRedirectUrl = router.query[QUERY_KEYS.REDIRECT];
    returnTo = `${environment.public.host.authUrl}/authentication/canny?redirect=${cannyRedirectUrl}`;
  }

  const isAutoTriggeredXero = provider === OryProvider.Xero && (router.query[QUERY_KEYS.PROVIDER] as string)?.toLowerCase() === 'xero';

  if (isAutoTriggeredXero && returnTo) {
    const redirectTo = new URL(returnTo, environment.public.host.appUrl);
    redirectTo.searchParams.append(QUERY_KEYS.FROM_XERO_APP_STORE, 'true');
    returnTo = redirectTo.toString();
  }

  searchParams.append('redirect_to', returnTo || '');
  return gateWay + '?' + searchParams.toString() || '';
};
