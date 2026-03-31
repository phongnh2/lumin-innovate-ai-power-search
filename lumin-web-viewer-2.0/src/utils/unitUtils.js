const unitsMapping = {
  1000: 'k',
  10000000: 'm',
  1000000000: 'b',
};

const NUMBER_OF_DIGITS = 1;

function getValueWithUnit(value, digit) {
  const getDigit = () => (typeof digit === 'number' ? digit : NUMBER_OF_DIGITS);
  const keys = Object.keys(unitsMapping).map((val) => parseInt(val));
  if (value < keys[0]) {
    return value;
  }
  for (let i = 0; i < keys.length; i++) {
    if (value < keys[i]) {
      const result = value / keys[i - 1];
      const roundedResult = Number.isInteger(result)
        ? result
        : Number(result).toFixed(getDigit());
      return `${roundedResult}${unitsMapping[keys[i - 1]]}`;
    }
  }
  return value;
}

export default {
  getValueWithUnit,
};
