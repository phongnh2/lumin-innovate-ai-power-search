import { memo, useEffect, useState } from 'react';

import { environment } from '@/configs/environment';
import { LoggerReason } from '@/constants/logger';
import { CookieConsentEnum, cookieConsents } from '@/features/cookieConsents/cookieConsents';
import { useAppSelector } from '@/lib/hooks';
import { clientLogger } from '@/lib/logger';
import { cookieConsentsLoaded } from '@/selectors';
import { getErrorMessage } from '@/utils/error.utils';

const GoogleAnalytics = () => {
  const [gtmLoaded, setGtmLoaded] = useState(false);

  const haveCookieConsentsLoaded = useAppSelector(cookieConsentsLoaded);
  const loadGtm = () =>
    new Promise((resolve, reject) => {
      const script = 'script';
      const layer = 'dataLayer';
      window[layer as any] = window[layer as any] || [];
      const f = document.getElementsByTagName(script)[0];
      const j = document.createElement(script);
      const dl = layer !== 'dataLayer' ? `&l=${layer}` : '';
      j.async = true;
      j.src = `https://www.googletagmanager.com/gtm.js?id=${environment.public.gtag.gtmId}${dl}`;
      j.onload = resolve;
      j.onerror = reject;
      f.parentNode?.insertBefore(j, f);
    });

  const insertGa4 = () => {
    (window as any).dataLayer = (window as any).dataLayer || [];
    window.gtag = function () {
      // eslint-disable-next-line prefer-rest-params
      (window as any).dataLayer.push(arguments as never);
    };
    window.gtag('js', new Date());
    console.info('🎉 GA4 script has been loaded.');
  };

  useEffect(() => {
    loadGtm()
      .then(() => {
        insertGa4();
        setGtmLoaded(true);
      })
      .catch(error => {
        clientLogger.error({
          message: getErrorMessage(error),
          reason: LoggerReason.FAIL_TO_LOAD_GTM,
          attributes: error
        });
      });
    cookieConsents.load();
  }, []);

  useEffect(() => {
    if (!gtmLoaded || !haveCookieConsentsLoaded) return;
    const acceptCookie = cookieConsents.isCookieAllowed(CookieConsentEnum.NonEssential);
    if (acceptCookie) {
      cookieConsents.grantAllGtagConsents();
    }
  }, [gtmLoaded, haveCookieConsentsLoaded]);

  return null;
};
export default memo(GoogleAnalytics);
