import { useSelector } from 'react-redux';

import selectors from 'selectors';

import useBannerData from 'luminComponents/ViewerBanner/hooks/useBannerData';

import { useViewerMatch } from 'hooks/useViewerMatch';

import { BannerViewerPosition } from 'constants/banner';

const useShowTopViewerBanner = () => {
  const { isViewer } = useViewerMatch();
  const { selectedBanner, shouldShowBanner } = useBannerData() as { selectedBanner: { position: string }; shouldShowBanner: boolean };
  const isDocumentLoaded = useSelector(selectors.isDocumentLoaded);
  return shouldShowBanner && selectedBanner.position === BannerViewerPosition.TOP && isDocumentLoaded && isViewer;
};

export default useShowTopViewerBanner;