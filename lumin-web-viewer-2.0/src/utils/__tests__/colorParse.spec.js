import colorParse from '../colorParse';

describe('colorParse', () => {
    it('rbgToHex', () => {
      expect(colorParse.rbgToHex('rgb(100%, 50%, 0%)')).toBe('#ff7f00');
      expect(colorParse.rbgToHex('rgb(0, 0, 0)')).toBe('#000000');
      expect(colorParse.rbgToHex()).toBe('');
    });
});
