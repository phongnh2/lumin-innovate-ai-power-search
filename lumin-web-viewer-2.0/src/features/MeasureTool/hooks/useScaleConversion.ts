import { useCallback } from 'react';

import { convertUnits } from 'utils/convertUnits';

import { formatDisplayValue } from './useScaleFormatting';
import {
  DisplayUnit,
  PaperUnit,
  PRECISION_FRACTIONAL_PRESET,
  PRECISION_PRESET,
  COMMON_FRACTIONAL_SCALE_FACTORS,
  COMMON_SCALE_FACTORS,
} from '../constants';

export interface ConvertValueProps {
  value: string;
  fromUnit: DisplayUnit | PaperUnit;
  toUnit: DisplayUnit | PaperUnit;
  precisionValue: number;
  isFractional: boolean;
}

export const useScaleConversion = (
  getFormattedCurrentValue: (currentValue: string | number, fromUnit: string) => number
) => {
  const getConvertedValue = useCallback(
    ({ value, fromUnit, toUnit, precisionValue, isFractional }: ConvertValueProps): string => {
      const currentValue = getFormattedCurrentValue(value, fromUnit);
      const convertedValue = convertUnits(currentValue, fromUnit, toUnit);

      return formatDisplayValue({
        value: convertedValue,
        unit: toUnit,
        precisionValue,
        isFractional,
      });
    },
    [getFormattedCurrentValue]
  );

  return {
    getConvertedValue,
  };
};

export const updateSettingsForFractionalMode = (
  isUseFractionalUnits: boolean,
  units: { displayUnit: DisplayUnit; paperUnit: PaperUnit },
  distances: { displayDistance: string; paperDistance: string },
  getConvertedValue: (props: ConvertValueProps) => string,
  setIsFractional: (value: boolean) => void,
  setPresetScale: (value: string) => void,
  setPrecision: (value: number) => void,
  setDistances: (distances: { displayDistance: string; paperDistance: string }) => void
) => {
  const currentPrecision = (isUseFractionalUnits ? PRECISION_FRACTIONAL_PRESET : PRECISION_PRESET)[0].value;
  const currentPresetScale = (
    isUseFractionalUnits ? COMMON_FRACTIONAL_SCALE_FACTORS : COMMON_SCALE_FACTORS
  )[0].value.toString();

  const formattedDisplayValue = getConvertedValue({
    value: distances.displayDistance,
    fromUnit: units.displayUnit,
    toUnit: units.displayUnit,
    precisionValue: currentPrecision,
    isFractional: isUseFractionalUnits,
  });

  const formattedPaperDistance = getConvertedValue({
    value: distances.paperDistance,
    fromUnit: units.paperUnit,
    toUnit: units.paperUnit,
    precisionValue: currentPrecision,
    isFractional: isUseFractionalUnits,
  });

  setIsFractional(isUseFractionalUnits);
  setPresetScale(currentPresetScale);
  setPrecision(currentPrecision);
  setDistances({
    displayDistance: formattedDisplayValue,
    paperDistance: formattedPaperDistance,
  });
};
