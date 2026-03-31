import { CropDimensionType } from '../types';

/**
 * Truncates the dimensions to 4 decimal places.
 * 12.123456789 becomes 12.1234
 * 5.1 becomes 5.1
 */

export const truncateDimensions = (dimensions: CropDimensionType): CropDimensionType =>
  Object.fromEntries(Object.entries(dimensions).map(([key, value]) => [key, Math.floor(value * 10000) / 10000]));
