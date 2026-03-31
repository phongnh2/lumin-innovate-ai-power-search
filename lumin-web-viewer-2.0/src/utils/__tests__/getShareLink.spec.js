import getShareLink from '../getShareLink';

describe('getShareLink function', () => {
  it('should return url', () => {
    expect(getShareLink('testtest')).toMatch('testtest');
  });
});
