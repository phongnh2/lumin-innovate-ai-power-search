import { parseFtIn } from "../parseFtIn";

describe('parseFtIn', () => {

  describe('valid format', () => {
    it('should parse a non fractional ft-in value', () => {
      expect(parseFtIn('1ft-6in', false)).toBe(1.5);
      expect(parseFtIn('1ft-6.0in', false)).toBe(1.5);
      expect(parseFtIn('1.00ft-0in', false)).toBe(1);
      expect(parseFtIn(`1ft`, false)).toBe(1);
      expect(parseFtIn(`1ft-0in`, false)).toBe(1);
      expect(parseFtIn(`1in`, false)).toBe(1/12);
      expect(parseFtIn(`1.0in`, false)).toBe(1/12);
    });
  
    it('should parse a fractional ft-in value', () => {
      expect(parseFtIn(`1'-0 1/2"`, true)).toBe(1 + 1/2/12);
      expect(parseFtIn(`1'-1/2"`, true)).toBe(1 + 1/2/12);
      expect(parseFtIn(`1'-0"`, true)).toBe(1);
      expect(parseFtIn(`2'-6"`, true)).toBe(2.5);
      expect(parseFtIn(`3'-0 3/4"`, true)).toBe(3.0625);
      expect(parseFtIn(`0'-11 1/2"`, true)).toBe(0.9583333333333334);
      expect(parseFtIn(`10'-0"`, true)).toBe(10);
      expect(parseFtIn(`5'-6 3/4"`, true)).toBe(5.5625);
      expect(parseFtIn(`1"`, true)).toBe(1/12);
    });
  })

  describe('invalid format', () => {
    it('should return null when receive invalid non-fraction format', () => {
      expect(parseFtIn('abc')).toBe(null);
      expect(parseFtIn('1ft-')).toBe(null);
      expect(parseFtIn('ft-6in')).toBe(null);
      expect(parseFtIn('1ft-abc')).toBe(null);
      expect(parseFtIn('1.5.5ft-6in')).toBe(null);
      expect(parseFtIn('1ft-6.6.6in')).toBe(null);
      expect(parseFtIn('')).toBe(null);
      expect(parseFtIn('1ft6in')).toBe(null);
    })

    it('should return null when receive invalid fraction format', () => {
      expect(parseFtIn('1ft-', true)).toBe(null);
      expect(parseFtIn('', true)).toBe(null);
      expect(parseFtIn('1\'-', true)).toBe(null);
      expect(parseFtIn('1\' 6"', true)).toBe(null);
      expect(parseFtIn('1\'-6', true)).toBe(null);
      expect(parseFtIn('1\'-6/', true)).toBe(null);
      expect(parseFtIn('1\'-6/0"', true)).toBe(null);
      expect(parseFtIn('1\'-6 1/', true)).toBe(null);
      expect(parseFtIn('1\'-6 1/0"', true)).toBe(null);
      expect(parseFtIn('1\'-6 2/1/3"', true)).toBe(null);
      expect(parseFtIn('1\'-6 1 1/2"', true)).toBe(null);
      expect(parseFtIn('1\'-6 -1/2"', true)).toBe(null);
      expect(parseFtIn('1\'-6 1/-2"', true)).toBe(null);
    });
  })
});
