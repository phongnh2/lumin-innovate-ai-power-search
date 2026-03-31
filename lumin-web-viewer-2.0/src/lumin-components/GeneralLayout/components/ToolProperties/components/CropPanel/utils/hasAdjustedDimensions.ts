import { CropDimensionType } from '../types';

/**
 * Checks whether crop dimensions were adjusted during validation.
 * to update the crop dimension UI when it has been adjusted
 *
 * @param original - Original dimensions before validation
 * @param validated - Dimensions after validation
 * @returns true if any dimension was changed, false otherwise
 */
export const hasAdjustedDimensions = (original: CropDimensionType, validated: CropDimensionType): boolean => {
  const keysToCheck = Object.keys(validated) as Array<keyof CropDimensionType>;

  return keysToCheck.some((key) => {
    const originalValue = original[key];
    const validatedValue = validated[key];

    if (originalValue !== undefined && validatedValue !== undefined) {
      return Math.abs(originalValue - validatedValue) > 0.001;
    }

    return false;
  });
};
