import { useSelector } from 'react-redux';

import selectors from 'selectors';

import { useGetFeatureIsOn } from 'hooks/growthBook/useGetFeatureIsOn';
import useShallowSelector from 'hooks/useShallowSelector';

import { useTemplateViewerMatch } from 'features/Document/hooks/useTemplateViewerMatch';

import { FeatureFlags } from 'constants/featureFlagsConstant';
import { KEY_ATTRIBUTES_GROWTH_BOOK } from 'constants/growthBookConstant';

export const useEnableAppMarketplace = () => {
  const isOffline = useSelector(selectors.isOffline);
  const currentUser = useShallowSelector(selectors.getCurrentUser);
  const isLoadingDocument = useSelector(selectors.isLoadingDocument);
  const currentDocument = useShallowSelector(selectors.getCurrentDocument);
  const { isTemplateViewer } = useTemplateViewerMatch();
  const { isOn: isAppMarketplace, loading } = useGetFeatureIsOn({
    key: FeatureFlags.APP_MARKETPLACE,
    attributeToCheckLoading: KEY_ATTRIBUTES_GROWTH_BOOK.ID,
  });

  return {
    isAppMarketplaceEnabled:
      !isLoadingDocument &&
      !isOffline &&
      !!currentUser &&
      isAppMarketplace &&
      !process.env.DISABLE_APP_MARKETPLACE_MF &&
      !!currentDocument &&
      !isTemplateViewer,
    loading,
  };
};
