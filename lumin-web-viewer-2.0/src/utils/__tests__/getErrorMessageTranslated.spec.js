import getErrorMessageTranslated from '../getErrorMessageTranslated';

describe('getErrorMessageTranslated', () => {
  it('getErrorMessageTranslated', () => {
    expect(getErrorMessageTranslated('test')).toBeUndefined();
    expect(getErrorMessageTranslated({ key: 'test', interpolation: { test: 'test' } })).toBeUndefined();
    expect(getErrorMessageTranslated({})).not.toBeNull();
    expect(getErrorMessageTranslated()).toBeNull();
  });
});