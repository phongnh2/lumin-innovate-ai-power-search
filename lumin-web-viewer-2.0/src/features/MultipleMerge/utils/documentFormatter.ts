const DECIMAL_MEGABYTES_TO_BYTES = 1000 * 1000;

const round = (value: number, precision: number) => {
  const multiplier = 10 ** (precision || 0);
  return Math.round(value * multiplier) / multiplier;
};

export const formatDocumentSizeInMB = (size: number) => `${round(size / DECIMAL_MEGABYTES_TO_BYTES, 2)}MB`;
