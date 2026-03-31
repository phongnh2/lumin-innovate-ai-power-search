import { isNil, merge, omitBy } from 'lodash';

import { cookieManager } from 'helpers/cookieManager';
import logger from 'helpers/logger';

import { getCommonAttributes } from 'utils/getCommonAttributes';

import { AWS_EVENTS, SIGN_AUTH_METHOD } from 'constants/awsEvents';
import { EventCookieKey } from 'constants/cookieName';
import { LOGGER } from 'constants/lumin-common';
import { SESSION_STORAGE_KEY } from 'constants/sessionStorageKey';

import { EventCollection } from './EventCollection';
import BrazeAdapter from '../BrazeAdapter';
import GaAdapter from '../GaAdapter';

const modalName = {
  REQUEST_ACCESS_TOKEN: 'requestAccessToken',
};

export class GoogleDriveEventCollection extends EventCollection {
  totalPopupInSession() {
    const attributes = {
      modalName: modalName.REQUEST_ACCESS_TOKEN,
      totalPopup: sessionStorage.getItem(SESSION_STORAGE_KEY.TOTAL_GOOGLE_POPUP) || 0,
    };
    this.record({
      name: AWS_EVENTS.MODAL.VIEWED,
      attributes,
    });
    sessionStorage.removeItem(SESSION_STORAGE_KEY.TOTAL_GOOGLE_POPUP);
  }

  // eslint-disable-next-line class-methods-use-this
  async onOpenGoogleRedirect() {
    try {
      const userSignUp = cookieManager.get(EventCookieKey.USER_SIGNED_UP);
      if (userSignUp) {
        const { userId } = JSON.parse(decodeURIComponent(userSignUp));
        const params = {
          name: AWS_EVENTS.AUTH.USER_SIGNUP,
          attributes: {
            method: SIGN_AUTH_METHOD.GOOGLE,
            LuminUserId: userId,
          },
        };
        const mergedParams = omitBy(
          merge({}, { attributes: await getCommonAttributes(params.attributes) }, params),
          isNil
        );
        // We don't forward this event to Datadog, it is already tracked on the backend side
        GaAdapter.send(mergedParams);
        BrazeAdapter.send(mergedParams);
        this.getInstance()
          .then(() => this.recordService.record(mergedParams))
          .catch((e) => logger.logError({ error: { ...e, attributes: mergedParams } }));

        cookieManager.delete(EventCookieKey.USER_SIGNED_UP);
      }
    } catch (error) {
      logger.logError({
        reason: LOGGER.Service.TRACK_EVENT_ERROR,
        error,
      });
    }
  }
}

export default new GoogleDriveEventCollection();
