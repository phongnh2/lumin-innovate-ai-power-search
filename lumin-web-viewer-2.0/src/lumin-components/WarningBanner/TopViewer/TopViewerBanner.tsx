/* eslint-disable react/jsx-no-target-blank */
import React from 'react';
import { useSelector } from 'react-redux';
import { useMatch } from 'react-router';
import { Link } from 'react-router-dom';

import selectors from 'selectors';

import SvgElement from 'luminComponents/SvgElement';
import useBannerData from 'luminComponents/ViewerBanner/hooks/useBannerData';
import { useTrackBannerView } from 'luminComponents/ViewerBanner/hooks/useTrackBannerView';

import { BannerViewerPosition, WarningBannerType } from 'constants/banner';
import { ROUTE_MATCH } from 'constants/Routers';

import styles from './TopViewerBanner.module.scss';

interface Props {
  renderClose?: (props: {
    onClick: () => void;
    customColor?: string;
    isReskin?: boolean;
    banner: string;
  }) => React.ReactNode;
}

const TopViewerBanner = ({ renderClose }: Props) => {
  const { shouldShowBanner, selectedBanner, onClickBannerLink, onClickCloseBanner } = useBannerData();
  const isViewer = useMatch({ path: ROUTE_MATCH.VIEWER, end: false });
  const isDocumentLoaded = useSelector(selectors.isDocumentLoaded);
  const shouldShow =
    isViewer && shouldShowBanner && selectedBanner.position === BannerViewerPosition.TOP && isDocumentLoaded;

  useTrackBannerView({
    bannerEvent: selectedBanner.bannerEvent,
    shouldTrack: shouldShow,
  });

  const renderActionButton = () => {
    if (selectedBanner?.btnData.btnDirectTo) {
      if (selectedBanner?.btnData.btnDirectToNewTab) {
        return (
          <a
            href={selectedBanner?.btnData.btnDirectTo}
            target="_blank"
            className={styles.redirectButton}
            onClick={onClickBannerLink}
          >
            {selectedBanner?.btnData.btnContent}
          </a>
        );
      }
      return (
        <Link to={selectedBanner?.btnData.btnDirectTo} className={styles.redirectButton} onClick={onClickBannerLink}>
          {selectedBanner?.btnData.btnContent}
        </Link>
      );
    }
    return (
      <button onClick={onClickBannerLink} className={styles.redirectButton}>
        {selectedBanner?.btnData.btnContent}
      </button>
    );
  };

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.titleWrapper}>
          {selectedBanner?.startIcon ? (
            selectedBanner?.startIcon
          ) : (
            <SvgElement content="icon-three-stars" width={24} height={24} />
          )}
          <p>{selectedBanner?.title}</p>
          <p>-</p>
          {renderActionButton()}
        </div>
      </div>
      <div className={styles.closeButton}>
        {renderClose &&
          renderClose({ onClick: onClickCloseBanner, banner: WarningBannerType.VIEWER_BANNER.value, isReskin: true })}
      </div>
    </div>
  );
};

export default TopViewerBanner;
