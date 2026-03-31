const fractionalInchRegex = /^(?:(\d+)[-\s])?(?:(\d+)\/(\d+))?(?:(\d+(?:\.\d+)?))?"$/;

const convertInchFromFraction = (value: string) => {
  if (!value) {
    return null;
  }

  const match = value.match(fractionalInchRegex);
  if (!match) {
    return null;
  }

  const [, wholeNumber, numerator, denominator, decimal] = match;

  if (!wholeNumber && !numerator && !denominator && !decimal) {
    return null;
  }

  let result = 0;

  if (wholeNumber) {
    result += parseFloat(wholeNumber);
  }

  if (numerator && denominator) {
    const den = parseFloat(denominator);
    if (den === 0) {
      return null;
    }
    result += parseFloat(numerator) / den;
  }

  if (decimal) {
    result += parseFloat(decimal);
  }

  return result;
};

/**
 * Parse the inch value
 * @param value - The inch value to parse
 * @param isFractional - Whether the value is fractional
 * @returns The parsed inch value
 * @example
 * parseInch('1-1/2"', true) // 1.5
 * parseInch('2 1/4"', true) // 2.25
 * parseInch('3 1/8"', true) // 3.125
 * parseInch('1/2"', true) // 0.5
 * parseInch('5 3/4"', true) // 5.75
 * parseInch('10 7/8"', true) // 10.875
 */
export const parseInch = (value: string | number, isFractional?: boolean) => {
  if (isFractional) {
    return convertInchFromFraction(value as string);
  }
  return Number(value);
};
