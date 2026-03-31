import { parseInch } from '../parseInch';

describe('parseInch', () => {
  it('should return the correct value for a fractional inch', () => {
    expect(parseInch('1-1/2"', true)).toBe(1.5);
    expect(parseInch('2 1/4"', true)).toBe(2.25);
    expect(parseInch('3 1/8"', true)).toBe(3.125);
    expect(parseInch('1/2"', true)).toBe(0.5);
    expect(parseInch('5 3/4"', true)).toBe(5.75);
    expect(parseInch('10 7/8"', true)).toBe(10.875);
    expect(parseInch('invalid', true)).toBeNull();
    expect(parseInch('', true)).toBeNull();
    expect(parseInch('1.5"', true)).toBe(1.5);
    expect(parseInch('2"', true)).toBe(2);
  });
});
