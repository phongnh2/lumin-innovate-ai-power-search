import axios from 'axios';
import { isEmpty, isUndefined } from 'lodash';

import { environment } from '@/configs/environment';
import { CookieStorageKey } from '@/constants/cookieKey';
import { COUNTRY_SHOW_COOKIE_BANNER, REGION_NAME } from '@/constants/countryCode';
import { AllConsentGrantedParams } from '@/constants/gtagConsents';
import { clientLogger } from '@/lib/logger';
import { store } from '@/lib/store';
import { cookieConsentsLoaded } from '@/selectors';
import { isClientSide } from '@/utils/commonUtils';
import CookieUtils from '@/utils/cookie.utils';
import { getErrorMessage } from '@/utils/error.utils';

import { loadCookieConsentsSuccess } from '../common-slice';

export enum CookieConsentEnum {
  Essential = 'essential',
  NonEssential = 'non-essential'
}

type CookieConsentsType = {
  [CookieConsentEnum.Essential]: boolean;
  [CookieConsentEnum.NonEssential]?: boolean;
};

class CookieConsents {
  private _cookies: CookieConsentsType = {
    [CookieConsentEnum.Essential]: true,
    [CookieConsentEnum.NonEssential]: false
  };

  getCookieBannerAcceptFromCookie(): boolean | undefined {
    const nonEssential = isClientSide() && CookieUtils.get(CookieStorageKey.COOKIE_BANNER_ACCEPT);
    switch (nonEssential) {
      case 'true':
        return true;
      case 'false':
        return false;
      default:
        return undefined;
    }
  }

  isFromStrictedLocation(countryCode: string, region: string): boolean {
    if (countryCode === 'US') {
      clientLogger.info({
        reason: 'StrictedCookieLocation',
        message: `User from ${countryCode} ${region} region`,
        attributes: {}
      });
      return REGION_NAME.includes(region);
    }
    return COUNTRY_SHOW_COOKIE_BANNER.includes(countryCode);
  }

  getLocation = async (): Promise<void> => {
    const response: {
      data: { countryCode: string; regionName: string };
    } = await axios.get(environment.public.host.backendUrl + '/user/user-location', { withCredentials: true });
    if (!isEmpty(response.data) && isClientSide()) {
      this._cookies = {
        [CookieConsentEnum.Essential]: true,
        [CookieConsentEnum.NonEssential]: !this.isFromStrictedLocation(response.data?.countryCode, response.data?.regionName)
      };
    }
  };

  load(): void {
    const state = store?.getState();
    const hasLoaded = (state && cookieConsentsLoaded(state)) || false;
    if (hasLoaded) {
      return;
    }
    const cookieBannerAccept = this.getCookieBannerAcceptFromCookie();
    if (!isUndefined(cookieBannerAccept)) {
      this._cookies = {
        [CookieConsentEnum.Essential]: true,
        [CookieConsentEnum.NonEssential]: cookieBannerAccept
      };
      store?.dispatch(loadCookieConsentsSuccess());
      return;
    }
    this.getLocation()
      .catch((e: Error) => {
        clientLogger.error({
          message: getErrorMessage(e),
          reason: 'CookieConsentLocationError',
          attributes: {}
        });
      })
      .finally(() => {
        store?.dispatch(loadCookieConsentsSuccess());
      });
  }

  isCookieAllowed(type: CookieConsentEnum): boolean | undefined {
    // eslint-disable-next-line sonarjs/no-small-switch
    switch (type) {
      case CookieConsentEnum.NonEssential:
        return this._cookies[CookieConsentEnum.NonEssential];
      default:
        return this._cookies[CookieConsentEnum.Essential];
    }
  }

  grantAllGtagConsents(): void {
    window.gtag('consent', 'update', AllConsentGrantedParams);
    (window as any).dataLayer.push({ event: 'app_cookie_consent_given' });
  }
}

export const cookieConsents = new CookieConsents();
