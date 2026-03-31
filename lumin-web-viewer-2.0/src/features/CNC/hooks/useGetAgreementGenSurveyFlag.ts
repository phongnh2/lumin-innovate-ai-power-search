import { useGetFeatureIsOn } from 'hooks/growthBook/useGetFeatureIsOn';

import { FeatureFlags } from 'constants/featureFlagsConstant';
import { KEY_ATTRIBUTES_GROWTH_BOOK } from 'constants/growthBookConstant';

const useGetAgreementGenSurveyFlag = () => {
  const { isOn } = useGetFeatureIsOn({
    key: FeatureFlags.SHOW_AGREEMENT_GEN_SURVEY,
    attributeToCheckLoading: KEY_ATTRIBUTES_GROWTH_BOOK.ID,
  });

  return {
    enabled: isOn,
  };
};

export { useGetAgreementGenSurveyFlag };
