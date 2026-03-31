import { FEATURE_VALIDATION } from 'constants/lumin-common';
import { TOOLS_NAME } from 'constants/toolsName';

interface AvailableFeatures {
  protectPdf?: boolean;
}

interface UseToolAvailabilityProps {
  availableFeatures: AvailableFeatures;
  validateType: string;
  isToolAvailable: boolean;
}

export const useToolAvailability = ({ availableFeatures, validateType, isToolAvailable }: UseToolAvailabilityProps) => {
  const getPasswordProtectionAvailability = () =>
    (availableFeatures.protectPdf && validateType === FEATURE_VALIDATION.PREMIUM_FEATURE) || isToolAvailable;

  return {
    [TOOLS_NAME.PASSWORD_PROTECTION]: {
      isAvailable: getPasswordProtectionAvailability(),
    },
  };
};
