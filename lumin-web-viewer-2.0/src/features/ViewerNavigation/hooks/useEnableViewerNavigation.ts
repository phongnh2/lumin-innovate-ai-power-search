import { useGetFeatureIsOn } from 'hooks/growthBook/useGetFeatureIsOn';
import { useGetCurrentUser } from 'hooks/useGetCurrentUser';

import { FeatureFlags } from 'constants/featureFlagsConstant';
import { KEY_ATTRIBUTES_GROWTH_BOOK } from 'constants/growthBookConstant';

export const useEnableViewerNavigation = () => {
  const { isOn: enabled, loading } = useGetFeatureIsOn({
    key: FeatureFlags.VIEWER_NAVIGATION,
    attributeToCheckLoading: KEY_ATTRIBUTES_GROWTH_BOOK.ID,
  });

  const currentUser = useGetCurrentUser();

  return {
    enabledViewerNavigation: enabled && !!currentUser,
    loading,
  };
};
