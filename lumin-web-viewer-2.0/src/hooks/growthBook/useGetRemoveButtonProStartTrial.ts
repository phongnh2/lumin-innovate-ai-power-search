import { FeatureFlags } from 'constants/featureFlagsConstant';
import { KEY_ATTRIBUTES_GROWTH_BOOK } from 'constants/growthBookConstant';

import { useGetFeatureIsOn } from './useGetFeatureIsOn';

const useGetRemoveButtonProStartTrial = () => {
  const { isOn } = useGetFeatureIsOn({
    key: FeatureFlags.REMOVE_UPGRADE_BTN_START_TRIAL_POPOVER,
    attributeToCheckLoading: KEY_ATTRIBUTES_GROWTH_BOOK.ID,
  });

  return {
    isRemoveButtonProStartTrial: isOn,
  };
};

export { useGetRemoveButtonProStartTrial };
