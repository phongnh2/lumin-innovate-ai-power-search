import { UNITS_VALUE } from '../constants';
import { UnitType } from '../types';

const DEFAULT_DPI = 72;

export const pixelsToUnit = (pixels: number, unit: UnitType, dpi: number = DEFAULT_DPI): number => {
  if (unit === UNITS_VALUE.PIXEL) {
    return pixels;
  }

  const inches = pixels / dpi;

  switch (unit) {
    case UNITS_VALUE.INCH:
      return inches;
    case UNITS_VALUE.CM:
      return inches * 2.54;
    case UNITS_VALUE.MM:
      return inches * 25.4;
    default:
      return pixels;
  }
};

export const unitToPixels = (value: number, unit: UnitType, dpi: number = DEFAULT_DPI): number => {
  if (unit === UNITS_VALUE.PIXEL) {
    return value;
  }

  let inches: number;

  switch (unit) {
    case UNITS_VALUE.INCH:
      inches = value;
      break;
    case UNITS_VALUE.CM:
      inches = value / 2.54;
      break;
    case UNITS_VALUE.MM:
      inches = value / 25.4;
      break;
    default:
      return value;
  }

  return inches * dpi;
};

export const formatValueForDisplay = (value: number, unit: UnitType): number => {
  switch (unit) {
    case UNITS_VALUE.INCH:
      return Math.round(value * 100) / 100;
    case UNITS_VALUE.CM:
      return Math.round(value * 10) / 10;
    case UNITS_VALUE.MM:
      return Math.round(value);
    case UNITS_VALUE.PIXEL:
      return Math.round(value);
    default:
      return Math.round(value * 100) / 100;
  }
};
