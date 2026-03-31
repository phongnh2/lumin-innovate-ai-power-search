/* eslint-disable class-methods-use-this */
import axios from 'axios';
import { isUndefined } from 'lodash';

import { createLocalStorageCache } from '@libs/browser-cache';
import { loadUserLocationSuccess } from 'actions/authActions';

import { store } from 'store';

import { cookieManager } from 'helpers/cookieManager';
import logger from 'helpers/logger';

import { CookieStorageKey } from 'constants/cookieName';
import { COUNTRY_SHOW_COOKIE_BANNER, REGION_NAME } from 'constants/countryCode';
import { AllConsentGrantedParams } from 'constants/gtagConsents';
import { AXIOS_BASEURL } from 'constants/urls';

import { CookieConsentEnum } from './constants';

const { dispatch } = store;

type CookieConsentsType = {
  [CookieConsentEnum.Essential]: boolean;
  [CookieConsentEnum.NonEssential]?: boolean;
};
class CookieConsents {
  locationCountryKey = 'user-location-country';

  locationRegionKey = 'user-location-region';

  private _cookies: CookieConsentsType = {
    [CookieConsentEnum.Essential]: true,
  };

  cache() {
    return createLocalStorageCache({
      prefix: 'cookie-consent',
      defaultTTL: 24 * 60 * 60 * 1000,
    });
  }

  getCookieBannerAcceptFromCookie(): boolean {
    const nonEssential = cookieManager.get(CookieStorageKey.COOKIE_BANNER_ACCEPT);
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
      logger.logInfo({
        reason: 'StrictedCookieLocation',
        message: `User from ${countryCode} ${region} region`,
      });
      return REGION_NAME.includes(region);
    }
    return COUNTRY_SHOW_COOKIE_BANNER.includes(countryCode);
  }

  private async fetchLocationFromApi(): Promise<{ countryCode: string; regionName: string }> {
    try {
      const response = await axios.get<{ countryCode: string; regionName: string }>(
        `${AXIOS_BASEURL}/user/user-location`,
        { withCredentials: true }
      );
      if (!response.data) {
        return { countryCode: '', regionName: '' };
      }
      return {
        countryCode: response.data.countryCode,
        regionName: response.data.regionName,
      };
    } catch (error: unknown) {
      logger.logError({
        reason: 'FetchUserLocationError',
        error,
      });
      return { countryCode: '', regionName: '' };
    }
  }

  private updateCookieConsent(countryCode: string, regionName: string): void {
    if (!countryCode || !regionName) {
      return;
    }

    this._cookies = {
      [CookieConsentEnum.Essential]: true,
      [CookieConsentEnum.NonEssential]: !this.isFromStrictedLocation(countryCode, regionName),
    };
  }

  getLocation = async (): Promise<void> => {
    const cachedCountryCode = await this.cache().get<string>(this.locationCountryKey);
    const cachedRegionName = await this.cache().get<string>(this.locationRegionKey);

    if (cachedCountryCode && cachedRegionName) {
      this.updateCookieConsent(cachedCountryCode, cachedRegionName);
      return;
    }

    const { countryCode, regionName } = await this.fetchLocationFromApi();

    if (countryCode && regionName) {
      await this.cache().set(this.locationCountryKey, countryCode);
      await this.cache().set(this.locationRegionKey, regionName);
      this.updateCookieConsent(countryCode, regionName);
    }
  };

  load = async (): Promise<void> => {
    const cookieBannerAccept = this.getCookieBannerAcceptFromCookie();
    if (!isUndefined(cookieBannerAccept)) {
      this._cookies = {
        [CookieConsentEnum.Essential]: true,
        [CookieConsentEnum.NonEssential]: cookieBannerAccept,
      };
      dispatch(loadUserLocationSuccess());
      return;
    }
    try {
      await this.getLocation();
    } catch (error: unknown) {
      logger.logError({
        reason: 'CookieConsentLocationError',
        error,
      });
    } finally {
      dispatch(loadUserLocationSuccess());
    }
  };

  isCookieAllowed(type: CookieConsentEnum): boolean {
    // eslint-disable-next-line sonarjs/no-small-switch
    switch (type) {
      case CookieConsentEnum.NonEssential:
        return this._cookies[CookieConsentEnum.NonEssential];
      default:
        return this._cookies[CookieConsentEnum.Essential];
    }
  }

  grantAllGTagConsents(): void {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    window.gtag('consent', 'update', AllConsentGrantedParams);
    window.dataLayer.push({ event: 'app_cookie_consent_given' });
  }
}

export const cookieConsents = new CookieConsents();
