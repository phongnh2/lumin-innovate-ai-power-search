/* eslint-disable class-methods-use-this */
import { cookieManager } from 'helpers/cookieManager';

import { CookieStorageKey } from 'constants/cookieName';

type TRedirectFlow = {
  bucket: number;
  percentage: number;
  variantName: 'redirect' | 'popup';
};

const isDevelopment = process.env.NODE_ENV === 'development';

const isProduction = process.env.ENV === 'production';

class RedirectFlowUtils {
  loadGoogleCookieNames(): {
    googleAccessToken: string;
  } {
    const isDevelopmentOrProduction = isProduction || isDevelopment;
    if (isDevelopmentOrProduction) {
      return {
        googleAccessToken: CookieStorageKey.GOOGLE_ACCESS_TOKEN,
      };
    }
    return {
      googleAccessToken: `${CookieStorageKey.GOOGLE_ACCESS_TOKEN}_${process.env.ENV}`,
    };
  }

  deleteCookies(): void {
    cookieManager.delete(this.loadGoogleCookieNames().googleAccessToken);
  }

  getFlowData(): TRedirectFlow {
    const redirectFlowCookie: string = cookieManager.get(CookieStorageKey.REDIRECT_FLOW);
    if (!redirectFlowCookie) {
      return {} as TRedirectFlow;
    }
    const redirectFlowBase64 = decodeURIComponent(redirectFlowCookie);
    const binString = atob(redirectFlowBase64);
    const buffer = Uint8Array.from(binString, (m) => m.codePointAt(0));
    const redirectFlow = new TextDecoder().decode(buffer);
    return JSON.parse(redirectFlow || '{}') as TRedirectFlow;
  }
}

export const redirectFlowUtils = new RedirectFlowUtils();
