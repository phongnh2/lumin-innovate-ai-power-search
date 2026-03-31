import { useRouter } from 'next/router';
import { useEffect } from 'react';

import { EventCookieKey } from '@/constants/cookieKey';
import { LUMIN_SESSION } from '@/constants/sessionKey';
import { SIGN_AUTH_METHOD } from '@/constants/signAuthMethod';
import { CookieConsentEnum, cookieConsents } from '@/features/cookieConsents/cookieConsents';
import { Identity } from '@/interfaces/ory';
import { authEvent } from '@/lib/factory/auth.event';
import { useAppSelector } from '@/lib/hooks';
import { cookieConsentsLoaded } from '@/selectors';
import CookieUtils from '@/utils/cookie.utils';

interface Props {
  identity: Identity | null;
}

const useTrackingOidcAuth = ({ identity }: Props) => {
  const router = useRouter();
  const isGatewayPath = router.pathname.includes('/authentication/gateway');
  const haveCookieConsentsLoaded = useAppSelector(cookieConsentsLoaded);

  useEffect(() => {
    const acceptCookie = cookieConsents.isCookieAllowed(CookieConsentEnum.NonEssential);
    // We wait for gtag to finish loading before sending the event,
    // and we only wait if the cookie has not been loaded, or if the cookie has been accepted.
    if (!haveCookieConsentsLoaded || (acceptCookie && !window.gtag) || isGatewayPath) {
      return;
    }
    const params = CookieUtils.get(EventCookieKey.USER_AUTH);
    if (!params) {
      return;
    }
    // check if user alreadly logged in
    const isLoggedIn = Boolean(CookieUtils.get(LUMIN_SESSION.AUTHENTICATION));
    if (!isLoggedIn) {
      CookieUtils.delete(EventCookieKey.USER_AUTH);
      return;
    }
    if (!identity) {
      return;
    }
    const { method, clickedAt, url, from } = JSON.parse(decodeURIComponent(params));
    if (identity.created_at && clickedAt <= Date.parse(identity.created_at as string)) {
      authEvent.signUp({ method, oryIdentityId: identity?.id, url, from });
      if (SIGN_AUTH_METHOD.UserName !== method) {
        authEvent.signIn({ method, url, from });
      }
    } else {
      authEvent.signIn({ method, url, from });
    }
    CookieUtils.delete(EventCookieKey.USER_AUTH);
  }, [identity, haveCookieConsentsLoaded, isGatewayPath]);
};

export default useTrackingOidcAuth;
