import { useSelector } from 'react-redux';

import selectors from 'selectors';

import { useGetFeatureIsOn } from 'hooks/growthBook/useGetFeatureIsOn';
import useShallowSelector from 'hooks/useShallowSelector';

import { general } from 'constants/documentType';
import { DownloadType } from 'constants/downloadPdf';
import { FeatureFlags } from 'constants/featureFlagsConstant';
import { KEY_ATTRIBUTES_GROWTH_BOOK } from 'constants/growthBookConstant';

export const useEnabledCompressPdf = () => {
  const isOffline = useSelector(selectors.isOffline);
  const downloadType = useSelector(selectors.getDownloadType);
  const currentDocument = useShallowSelector(selectors.getCurrentDocument);
  const { enabled: enabledByPlanPolicy } = currentDocument?.premiumToolsInfo?.compressPdf || {};

  const isLocalFile = currentDocument?.isSystemFile;
  const isPdfFile = currentDocument.mimeType === general.PDF;

  const { isOn: enabledOnGrowthbook } = useGetFeatureIsOn({
    key: FeatureFlags.COMPRESS_PDF,
    attributeToCheckLoading: KEY_ATTRIBUTES_GROWTH_BOOK.ID,
  });

  return {
    isEnabled:
      enabledOnGrowthbook &&
      enabledByPlanPolicy &&
      !isOffline &&
      !isLocalFile &&
      isPdfFile &&
      downloadType === DownloadType.PDF,
  };
};
