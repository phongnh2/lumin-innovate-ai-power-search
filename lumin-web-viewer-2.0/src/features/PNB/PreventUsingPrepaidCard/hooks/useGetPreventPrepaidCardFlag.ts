import { useGrowthBook } from 'hooks/growthBook';

import { FeatureFlags } from 'constants/featureFlagsConstant';

const useGetPreventPrepaidCardFlag = () => {
  const gb = useGrowthBook();

  const getPreventPrepaidCardFlag = () => gb.isOn(FeatureFlags.PREVENT_USING_PREPAID_CARD);

  return {
    getPreventPrepaidCardFlag,
  };
};

export { useGetPreventPrepaidCardFlag };
