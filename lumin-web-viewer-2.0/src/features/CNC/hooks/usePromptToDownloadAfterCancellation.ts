import { useGetFeatureIsOn } from 'hooks/growthBook/useGetFeatureIsOn';

import { FeatureFlags } from 'constants/featureFlagsConstant';
import { KEY_ATTRIBUTES_GROWTH_BOOK } from 'constants/growthBookConstant';

export const usePromptToDownloadAfterCancellation = () => {
  const { isOn } = useGetFeatureIsOn({
    key: FeatureFlags.PROMPT_USERS_TO_DOWNLOAD_AFTER_CANCELLATION,
    attributeToCheckLoading: KEY_ATTRIBUTES_GROWTH_BOOK.ID,
  });

  return {
    shouldPromptToDownload: isOn,
  };
};
