import { PRECISION_FRACTIONAL_PRESET } from '../constants';

export const isFractionalPrecision = (precision: number) =>
  PRECISION_FRACTIONAL_PRESET.some((item) => item.value === precision);
