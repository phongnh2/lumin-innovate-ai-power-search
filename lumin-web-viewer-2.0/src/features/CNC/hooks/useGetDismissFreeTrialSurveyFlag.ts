import { useGetFeatureValue } from 'hooks/growthBook/useGetFeatureValue';

import { FeatureFlags } from 'constants/featureFlagsConstant';
import { KEY_ATTRIBUTES_GROWTH_BOOK } from 'constants/growthBookConstant';

export enum VARIANT_DISMISS_FREE_TRIAL_SURVEY {
  MODAL = 'MODAL',
  POPOVER = 'POPOVER',
}

enum CLOSE_DISMISS_FREE_TRIAL_SURVEY {
  BUTTON = 'BUTTON',
  ICON = 'ICON',
}

type DismissFreeTrialSurveyModal = {
  variant: VARIANT_DISMISS_FREE_TRIAL_SURVEY;
  closeType: CLOSE_DISMISS_FREE_TRIAL_SURVEY
};

const useGetDismissFreeTrialSurveyFlag = () => {
  const { value } = useGetFeatureValue<DismissFreeTrialSurveyModal>({
    key: FeatureFlags.DISMISS_FREE_TRIAL_SURVEY,
    fallback: null,
    attributeToCheckLoading: KEY_ATTRIBUTES_GROWTH_BOOK.ORG_ID,
  });

  return {
    canShowSurvey: Boolean(value),
    isVariantModal: value?.variant === VARIANT_DISMISS_FREE_TRIAL_SURVEY.MODAL,
    isVariantPopover: value?.variant === VARIANT_DISMISS_FREE_TRIAL_SURVEY.POPOVER,
    isCloseByButton: value?.closeType === CLOSE_DISMISS_FREE_TRIAL_SURVEY.BUTTON,
    isCloseByIcon: value?.closeType === CLOSE_DISMISS_FREE_TRIAL_SURVEY.ICON,
  };
};

export { useGetDismissFreeTrialSurveyFlag };
