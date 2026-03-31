const ftInRegex = /^(?:(\d+\.?\d*)ft(?:-(\d+\.?\d*)in)?|(\d+\.?\d*)in)$/;

const fractionalFtInRegex = /^(?:(\d+)'-)?(?:(\d+)(?:\s+(\d+)\/(\d+)|(?:\s+0))?|(\d+)|(\d+)\/(\d+))\s*"$/;

const convertFtInFromDecimal = (input: string) => {
  const matches = input.match(ftInRegex);
  if (matches) {
    const feet = matches[1] ? parseFloat(matches[1]) : 0;
    let inches = 0;
    if (matches[2]) {
      inches = parseFloat(matches[2]);
    } else if (matches[3]) {
      inches = parseFloat(matches[3]);
    }
    const result = feet + inches / 12;
    if (Number.isFinite(result)) {
      return result;
    }
  }
  return null;
};

const convertFtInFromFraction = (value: string) => {
  const matches = value.match(fractionalFtInRegex);
  if (matches) {
    const feet = matches[1] ? parseInt(matches[1]) : 0;
    const wholeInches = parseInt(matches[2] || matches[5] || '0');
    const fraction =
      (matches[3] && matches[4] ? parseInt(matches[3]) / parseInt(matches[4]) : 0) ||
      (matches[6] && matches[7] ? parseInt(matches[6]) / parseInt(matches[7]) : 0);
    const result = feet + (wholeInches + fraction) / 12;
    if (Number.isFinite(result)) {
      return result;
    }
  }
  return null;
};

/**
 * Parse the feet and inches input value
 * @param input - The input value to parse
 * @param isFractional - Whether the input is fractional
 * @returns The parsed value as a number or null if the input is invalid
 * @example
 * # isFractional = false
 * parseFtIn("1ft-6in")
 * parseFtIn("1.5ft")
 * parseFtIn("1ft-4.0in")
 * parseFtIn("1ft-4in")
 *
 * # isFractional = true
 * parseFtIn(`1'-1/2"`, true)
 * parseFtIn(`1'-1 1/16"`, true)
 */
export const parseFtIn = (input: string, isFractional?: boolean) => {
  if (isFractional) {
    return convertFtInFromFraction(input);
  }
  return convertFtInFromDecimal(input);
};
