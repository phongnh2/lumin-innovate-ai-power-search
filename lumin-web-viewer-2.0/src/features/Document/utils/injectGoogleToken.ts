import { gapiLoader } from 'navigation/Router/setupGoogleClient';

import { googleServices } from 'services';

import { cookieManager } from 'helpers/cookieManager';
import logger from 'helpers/logger';

import googleDriveEvent from 'utils/Factory/EventCollection/GoogleDriveEventCollection';
import { redirectFlowUtils } from 'utils/redirectFlow';

import { CookieStorageKey } from 'constants/cookieName';
import { LocalStorageKey } from 'constants/localStorageKey';
import { LOGGER } from 'constants/lumin-common';

export const injectGoogleToken = (onCompleteCallback: () => void) => {
  gapiLoader.load().on('client_loaded', () => {
    try {
      const isFromOpenGoogle = cookieManager.get(CookieStorageKey.IN_FLOW) === 'true';
      const accessTokenCookie = cookieManager.get(redirectFlowUtils.loadGoogleCookieNames().googleAccessToken);
      if (isFromOpenGoogle && accessTokenCookie) {
        googleDriveEvent.onOpenGoogleRedirect().catch(() => {});
        cookieManager.delete(CookieStorageKey.IN_FLOW);
        const accessTokenData = JSON.parse(decodeURIComponent(accessTokenCookie)) as {
          accessToken: string;
          scope: string;
          email: string;
          expireAt: string;
          userRemoteId: string;
        };
        const { accessToken, scope, email, expireAt, userRemoteId } = accessTokenData;

        const { email: authorizedUserEmail } = googleServices.getImplicitAccessToken() || {};
        if (authorizedUserEmail !== email) {
          localStorage.setItem(LocalStorageKey.FORCE_UPDATE_PROMPT_INVITE_SHARED_USERS, 'true');
        }

        googleServices.setOAuth2Token(
          {
            access_token: accessToken,
            scope,
            email,
            userRemoteId,
          },
          Math.floor(Number(expireAt) / 1000)
        );
      }
    } catch (e) {
      logger.logError({
        reason: LOGGER.Service.COMMON_ERROR,
        message: 'Failed to inject google token after opened with Google!',
        error: e,
      });
    } finally {
      onCompleteCallback();
    }
  });
};
