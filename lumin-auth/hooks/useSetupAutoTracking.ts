import { useRouter } from 'next/router';
import { useEffect, useRef } from 'react';

import { Routes } from '@/configs/routers';
import analyticContainer from '@/lib/factory/analytic.container';
import { AWSAnalytics } from '@/lib/factory/aws-analytics';
import { getAttributes } from '@/lib/factory/utils';

const useSetupAutoTracking = () => {
  const router = useRouter();
  const enableAutoTrackPageView = useRef(false);

  useEffect(() => {
    if (!enableAutoTrackPageView.current && !router.pathname.includes(Routes.Gateway)) {
      const awsAnalytics = analyticContainer.get<AWSAnalytics>(AWSAnalytics.providerName);
      awsAnalytics.getInstance().then(Analytics => {
        Analytics?.autoTrack('pageView', {
          enable: true,
          type: 'SPA',
          provider: 'AWSPinpoint',
          attributes: () => getAttributes({ referrer: document.referrer }),
          getUrl: () => window.location.origin + window.location.pathname
        });
      });

      enableAutoTrackPageView.current = true;
    }
  }, [router.pathname]);
};

export default useSetupAutoTracking;
