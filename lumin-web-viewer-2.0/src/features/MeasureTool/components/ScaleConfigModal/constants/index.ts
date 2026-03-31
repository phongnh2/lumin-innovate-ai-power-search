import {
  DisplayUnit,
  FractionalUnitSupport,
  PaperUnit,
  COMMON_FRACTIONAL_SCALE_FACTORS,
  COMMON_SCALE_FACTORS,
  PRECISION_FRACTIONAL_PRESET,
  PRECISION_PRESET,
} from '../../../constants';

export const getCommonScaleFactors = (isFractional: boolean) =>
  isFractional ? COMMON_FRACTIONAL_SCALE_FACTORS : COMMON_SCALE_FACTORS;

export const getPrecisionData = (isFractional: boolean) =>
  isFractional ? PRECISION_FRACTIONAL_PRESET : PRECISION_PRESET;

export const canUseFractionalUnit = (paperUnit: PaperUnit, displayUnit: DisplayUnit): boolean =>
  FractionalUnitSupport.includes(paperUnit) && FractionalUnitSupport.includes(displayUnit);
