import React from 'react';
import { useSelector } from 'react-redux';

import Banner from '@new-ui/general-components/Banner';

import selectors from 'selectors';

import { BannerViewerPosition } from 'constants/banner';

import useBannerData from './hooks/useBannerData';
import { useTrackBannerView } from './hooks/useTrackBannerView';

const ViewerBanner = () => {
  const { selectedBanner, onClickBannerLink, onClickCloseBanner, shouldShowBanner } = useBannerData();
  const isAnnotationLoaded = useSelector(selectors.getAnnotationsLoaded);
  const showBanner = shouldShowBanner && isAnnotationLoaded && selectedBanner.position === BannerViewerPosition.INSIDE;
  useTrackBannerView({
    bannerEvent: selectedBanner.bannerEvent,
    shouldTrack: showBanner,
  });

  if (!showBanner) {
    return null;
  }

  return (
    <Banner
      key={selectedBanner.title}
      {...selectedBanner}
      onClickBannerLink={onClickBannerLink}
      onClickCloseBanner={onClickCloseBanner}
    />
  );
};

export default ViewerBanner;
