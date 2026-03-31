import parseAltImageName from '../parseAltImageName';

describe('parseAltImageName function', () => {
    it('parseAltImageName', () => {
      expect(parseAltImageName.parseAltName('a.png')).toBe('a');
    });
});

