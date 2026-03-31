/* eslint-disable @typescript-eslint/no-floating-promises */
import { useEffect } from 'react';
import { useSelector } from 'react-redux';

import selectors from 'selectors';

import { cookieManager } from 'helpers/cookieManager';

import authEvent from 'utils/Factory/EventCollection/AuthEventCollection';

import { CookieConsentEnum } from 'features/cookieConsents/constants';
import { cookieConsents } from 'features/cookieConsents/cookieConsents';

import { SIGN_AUTH_METHOD } from 'constants/awsEvents';
import { EventCookieKey } from 'constants/cookieName';

import { IUser } from 'interfaces/user/user.interface';

interface Props {
  currentUser?: IUser;
}

function isGtagFunction(func: unknown): boolean {
  // Check if the function has a dataLayer property
  return func && typeof func === 'function' && func.toString().includes('dataLayer.push');
}

const useTrackingOidcAuth = ({ currentUser }: Props): void => {
  const userLocationLoaded = useSelector(selectors.hasUserLocationLoaded);

  useEffect(() => {
    const acceptedCookies = cookieConsents.isCookieAllowed(CookieConsentEnum.NonEssential);
    if (!currentUser || !userLocationLoaded || (acceptedCookies && !isGtagFunction(window.gtag))) {
      return;
    }
    const signUpUserNamePasswordParams = cookieManager.get(EventCookieKey.USER_SIGN_UP_USERNAME_PASSWORD);
    if (signUpUserNamePasswordParams) {
      authEvent.signUp({
        userId: currentUser?._id,
        ...(JSON.parse(decodeURIComponent(signUpUserNamePasswordParams)) as {
          method: string;
          url: string;
          from: string;
        }),
      });
      cookieManager.delete(EventCookieKey.USER_SIGN_UP_USERNAME_PASSWORD);
    }
    const params = cookieManager.get(EventCookieKey.USER_AUTH);
    if (!params) {
      return;
    }
    const { method, clickedAt, url, from } = JSON.parse(decodeURIComponent(params)) as {
      method: string;
      clickedAt: number;
      url: string;
      from: string;
    };
    if (clickedAt <= Date.parse(currentUser.createdAt.toString())) {
      authEvent.signUp({ method, userId: currentUser?._id, url, from });
      if (SIGN_AUTH_METHOD.USERNAME !== method) {
        authEvent.signIn({ method, url, from });
      }
    } else {
      authEvent.signIn({ method, url, from });
    }
    cookieManager.delete(EventCookieKey.USER_AUTH);
  }, [currentUser, userLocationLoaded]);
};

export default useTrackingOidcAuth;
