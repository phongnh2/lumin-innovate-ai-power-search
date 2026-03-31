import { useCallback } from 'react';

import { DisplayUnit, PaperUnit, PRECISION_FRACTIONAL_PRESET, PRECISION_PRESET } from '../constants';
import { parseFtIn } from '../utils/parseFtIn';
import { parseInch } from '../utils/parseInch';

export interface FormatDisplayValueProps {
  value: number;
  unit: string;
  precisionValue: number;
  isFractional: boolean;
}

export const formatDisplayValue = ({ value, unit, precisionValue, isFractional }: FormatDisplayValueProps): string => {
  if (unit === DisplayUnit.ftIn || (unit === DisplayUnit.in && isFractional)) {
    return Core.Scale.getFormattedValue(value, unit, precisionValue, false);
  }

  return String(value);
};

export const calculateDecimalValue = ({
  value,
  unit,
  isFractional,
}: {
  value: string;
  unit: DisplayUnit | PaperUnit;
  isFractional: boolean;
}): number => {
  if (unit === DisplayUnit.ftIn) {
    return parseFtIn(value, isFractional);
  }
  if (unit === DisplayUnit.in) {
    return parseInch(value, isFractional);
  }
  return Number(value);
};

export const formatPrecisionData = (isFractional: boolean) => {
  const precisionData = isFractional ? PRECISION_FRACTIONAL_PRESET : PRECISION_PRESET;

  return precisionData.map((precisionItem) => ({
    label: precisionItem.label,
    value: precisionItem.value.toString(),
  }));
};

export const useScaleFormatting = (isFractional: boolean) => {
  const getFormattedCurrentValue = useCallback(
    (currentValue: string | number, fromUnit: string): number => {
      if (fromUnit === DisplayUnit.in) {
        return parseInch(currentValue, isFractional);
      }
      if (fromUnit === DisplayUnit.ftIn) {
        return parseFtIn(currentValue as string, isFractional);
      }
      return Number(currentValue);
    },
    [isFractional]
  );

  return {
    getFormattedCurrentValue,
    formatDisplayValue,
  };
};
