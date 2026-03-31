import { isAndroid, isIEEdge, isChrome } from 'helpers/device';

import { INDEXED_DB_VERSION } from 'constants/indexedDbVersion';
import { SERVICE_WORKER_VERSION } from 'constants/serviceWorker';

export const isStandaloneMode = window.matchMedia('(display-mode:standalone)').matches || window.navigator.standalone;

export const isFromMicrosoftStore = document.referrer.includes('microsoft-store');

// Hide the Available offline feature, remove `false` if enable this feature
// eslint-disable-next-line sonarjs/no-redundant-boolean
export const canEnableOffline = () => !isAndroid && (isIEEdge || isChrome) && false;

export const isSystemFileSupported = () => isIEEdge || isChrome;

export const swPath = `/sw.js?dbVersion=${INDEXED_DB_VERSION}&version=${SERVICE_WORKER_VERSION}`;

const registerOptions = {
  updateViaCache: 'none',
};

export const registerServiceWorker = async () => {
  if ('serviceWorker' in navigator && !process.env.DISABLE_PWA) {
    if (navigator.serviceWorker.controller) {
      const sw = await navigator.serviceWorker.getRegistration(swPath);
      if (sw) {
        await sw.update();
      }
    }
    await navigator.serviceWorker.register(swPath, registerOptions);
  }
};
