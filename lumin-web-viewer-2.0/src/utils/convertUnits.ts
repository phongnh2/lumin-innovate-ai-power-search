import convert, { Unit as ConvertUnit } from 'convert';

export const convertPoint = (value: number, fromUnit: Unit, toUnit: Unit) => {
  if (toUnit === 'pt' && fromUnit === 'pt') {
    return value;
  }

  if (toUnit === 'pt') {
    return convert(value * 72, fromUnit as ConvertUnit).to('in');
  }

  if (fromUnit === 'pt') {
    return convert(value / 72, 'in' as ConvertUnit).to(toUnit as ConvertUnit);
  }

  return convert(value, fromUnit as ConvertUnit).to(toUnit as ConvertUnit);
};

/**
 * pt is a custom unit for point (1 pt = 1/72 inch)
 * ft-in is a custom unit for feet and inches (1.5 ft = 1ft-6in)
 */
export function convertUnits(value: number, from: Unit, to: Unit) {
  let fromUnit = from;
  let toUnit = to;

  if (from === 'ft-in') {
    fromUnit = 'ft';
  }

  if (to === 'ft-in') {
    toUnit = 'ft';
  }

  if (to === 'pt' || from === 'pt') {
    return convertPoint(value, fromUnit, toUnit);
  }

  return convert(value, fromUnit as ConvertUnit).to(toUnit as ConvertUnit);
}

export type Unit = ConvertUnit | 'pt' | 'ft-in';
