import common from '../common';

describe('commonUtils', () => {
  it('convertHexToDec', () => {
    expect(common.convertHexToDec('10')).toBe(16);
  });
  it('getDomainFromEmail', () => {
    expect(common.getDomainFromEmail('test@gmail.com')).toBe('gmail.com');
  });
  it('replaceSpecialCharactersWithEscapse', () => {
    expect(common.replaceSpecialCharactersWithEscapse('test@gmail.com')).not.toBeNull();
  });
  it('should return true if commonUtils is valid', () => {
    expect(common.isVowel('a')).toBe(true);
  });
  it('formatTitleCaseByLocale', () => {
    expect(common.formatTitleCaseByLocale('test@gmail.com')).not.toBeNull();
    expect(common.formatTitleCaseByLocale()).not.toBeNull();
  });
  it('getHOCDisplayName', () => {
    expect(common.getHOCDisplayName('Test', () => <div>Test</div>)).not.toBeNull();
  });
  it('changeDomainToUrl', () => {
    expect(common.changeDomainToUrl('test@gmail.com')).not.toBeNull();
  });
});
