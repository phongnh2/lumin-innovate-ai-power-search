import { useEffect, useState } from 'react';

import selectors from 'selectors';

import { useShallowSelector } from 'hooks/useShallowSelector';

import { eventTracking } from 'utils/recordUtil';

import UserEventConstants from 'constants/eventConstants';

export const useTrackBannerView = ({
  bannerEvent,
  shouldTrack,
}: {
  bannerEvent: { bannerName: string; bannerPurpose: string };
  shouldTrack: boolean;
}) => {
  const [trackedBannerViewed, setTrackedBannerViewed] = useState<{ [key: string]: boolean }>({});
  const currentUser = useShallowSelector(selectors.getCurrentUser);

  const eventAttributes = {
    clientId: currentUser?.clientId,
    bannerName: bannerEvent.bannerName || '',
    bannerPurpose: bannerEvent.bannerPurpose || '',
  };

  useEffect(() => {
    if (shouldTrack && eventAttributes.bannerName && !trackedBannerViewed[eventAttributes.bannerName]) {
      eventTracking(UserEventConstants.EventType.BANNER_VIEWED, eventAttributes);
      setTrackedBannerViewed((trackedData) => ({ ...trackedData, [eventAttributes.bannerName]: true }));
    }
  }, [shouldTrack, eventAttributes.bannerName]);
};
