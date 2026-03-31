import { cookieManager } from 'helpers/cookieManager';

import { GTM_EVENT } from 'constants/gtm-event';

type HotjarCallable = (...args: unknown[]) => void;

type HotjarProperties = {
  q?: unknown[];
  isIncludedInSample?: () => boolean;
};

// Combined type
export type HotjarAPI = HotjarCallable & HotjarProperties;

declare global {
  interface Window {
    hj?: HotjarAPI;
    dataLayer: any[];
  }
}

window.dataLayer = window.dataLayer || [];

type HotjarAttributes = string | number | boolean | Date;

export const attachUserAttributes = (attrs: Record<string, HotjarAttributes> = {}) => {
  window.dataLayer.push({
    event: GTM_EVENT.UpdateHotjarUserAttributes,
    anonymous_user_id: cookieManager.anonymousUserId,
    ...attrs,
  });
};

/**
 * To track another User Attribute:
 *  - Create a User-Defined Variable on Google Tag Manager
 *  - Add it to the Hotjar User Attributes Tag
 *  - Push the created variable to dataLayer
 * To Debug, set the `hjDebug` cookies to `true`
 */

export const trackEvent = (eventName: string) => {
  if (window.hj) {
    window.hj('event', eventName);
  }
};
