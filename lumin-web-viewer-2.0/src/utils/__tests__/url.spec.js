import UrlUtils from '../url';
import { UrlSearchParam } from 'constants/UrlSearchParam';

describe('urlUtils', () => {
  it('encodeContinue should encode URL', () => {
    expect(UrlUtils.encodeContinue('https://google.com')).toBe(
      `${UrlSearchParam.CONTINUE_URL}=${encodeURIComponent('https://google.com')}`
    );
    expect(UrlUtils.encodeContinue()).toBe('');
  });

  it('decode should return decoded value', () => {
    expect(UrlUtils.decode(`?${UrlSearchParam.CONTINUE_URL}=https%3A%2F%2Fgoogle.com`, UrlSearchParam.CONTINUE_URL)).toBe('https://google.com');
    expect(UrlUtils.decode()).toBe(null);
  });

  it('decodeContinue should work', () => {
    const query = `?${UrlSearchParam.CONTINUE_URL}=abc123`;
    expect(UrlUtils.decodeContinue(query)).toBe('abc123');
  });

  it('decodeRedirectState should parse JSON', () => {
    const obj = { a: 1 };
    const query = `?${UrlSearchParam.REDIRECT_STATE}=${encodeURIComponent(JSON.stringify(obj))}`;

    expect(UrlUtils.decodeRedirectState(query)).toEqual(obj);
    expect(UrlUtils.decodeRedirectState()).not.toBeNull();
  });
});
