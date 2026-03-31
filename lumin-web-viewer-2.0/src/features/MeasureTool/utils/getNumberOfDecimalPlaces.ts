export const getNumberOfDecimalPlaces = (precision: number) =>
  precision === 1 ? 0 : precision?.toString().split('.')[1].length;
