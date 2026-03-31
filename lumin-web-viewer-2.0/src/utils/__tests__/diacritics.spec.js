import diacritics from '../diacritics';

describe('removeDiacritics', () => {
    it('should pass function', () => {
        expect(diacritics.remove('Räksmörgås')).toBe('Raksmorgas');
    });
});