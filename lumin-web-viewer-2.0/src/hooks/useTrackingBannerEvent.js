import { useEffect } from 'react';
import { shallowEqual, useSelector } from 'react-redux';

import selectors from 'selectors';

import bannerEvent from 'utils/Factory/EventCollection/BannerEventCollection';

import { BANNER_INTERACTIONS } from 'constants/lumin-common';

export function useTrackingBannerEvent({ bannerName, bannerPurpose, trackingProps = {} }) {
  const { enableCaching = true } = trackingProps;
  const { data, loading } = useSelector(selectors.getOrganizationList, shallowEqual);

  useEffect(() => {
    if (data && !loading && bannerName) {
      const cacheKey = `${bannerName}_${BANNER_INTERACTIONS.VIEWED}`;
      const isTrackedViewedBanner = enableCaching ? sessionStorage.getItem(cacheKey) : false;
      if (!isTrackedViewedBanner) {
        bannerEvent.bannerViewed({
          bannerName,
          bannerPurpose,
        });
        if (enableCaching) {
          sessionStorage.setItem(cacheKey, true);
        }
      }
    }
  }, [loading, bannerName, enableCaching]);

  const actionWrapper = (cb) => {
    if (!bannerName) {
      return;
    }
    cb();
  };

  const trackBannerDismiss = () => actionWrapper(() => bannerEvent.bannerDismiss({ bannerName, bannerPurpose }));

  const trackBannerConfirmation = () =>
    actionWrapper(() => bannerEvent.bannerConfirmation({ bannerName, bannerPurpose }));

  const trackBannerHidden = () => actionWrapper(() => bannerEvent.bannerHidden({ bannerName, bannerPurpose }));

  return {
    trackBannerConfirmation,
    trackBannerDismiss,
    trackBannerHidden,
  };
}

export default useTrackingBannerEvent;
