import { FeatureFlags } from 'constants/featureFlagsConstant';
import { KEY_ATTRIBUTES_GROWTH_BOOK } from 'constants/growthBookConstant';

import { useGetFeatureIsOn } from './useGetFeatureIsOn';

const useGetValueDownloadOfficeType = () => {
  const { isOn } = useGetFeatureIsOn({
    key: FeatureFlags.EXPORT_DOCUMENT_TO_DIFFERENT_FORMAT,
    attributeToCheckLoading: KEY_ATTRIBUTES_GROWTH_BOOK.ID,
  });

  return {
    isExportDocumentToDifferentFormat: isOn,
  };
};

export { useGetValueDownloadOfficeType };