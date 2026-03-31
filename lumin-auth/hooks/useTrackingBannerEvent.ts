import { useEffect } from 'react';

import { BANNER_INTERACTIONS } from '@/constants/common';
import { bannerEvent } from '@/lib/factory/banner.event';

type TrackingProps = {
  enableCaching?: boolean;
  enableTracking?: boolean;
};

type UseTrackingBannerEventProps = {
  bannerName: string;
  bannerPurpose: string;
  trackingProps?: TrackingProps;
};

function useTrackingBannerEvent({ bannerName, bannerPurpose, trackingProps }: UseTrackingBannerEventProps) {
  const { enableCaching = true, enableTracking = true } = trackingProps || {};

  useEffect(() => {
    if (bannerName && enableTracking) {
      const cacheKey = `${bannerName}_${BANNER_INTERACTIONS.VIEWED}`;
      const isTrackedViewedBanner = enableCaching ? sessionStorage.getItem(cacheKey) : false;
      if (!isTrackedViewedBanner) {
        bannerEvent.bannerViewed({
          bannerName,
          bannerPurpose
        });
        if (enableCaching) {
          sessionStorage.setItem(cacheKey, 'true');
        }
      }
    }
  }, [bannerName, bannerPurpose, enableCaching, enableTracking]);

  const actionWrapper = (cb: () => void) => {
    if (!bannerName || !enableTracking) {
      return;
    }
    cb();
  };

  const trackBannerDismiss = () => actionWrapper(() => bannerEvent.bannerDismiss({ bannerName, bannerPurpose }));

  const trackBannerConfirmation = () => actionWrapper(() => bannerEvent.bannerConfirmation({ bannerName, bannerPurpose }));

  const trackBannerHidden = () => actionWrapper(() => bannerEvent.bannerHidden({ bannerName, bannerPurpose }));

  return {
    trackBannerConfirmation,
    trackBannerDismiss,
    trackBannerHidden
  };
}

export default useTrackingBannerEvent;
