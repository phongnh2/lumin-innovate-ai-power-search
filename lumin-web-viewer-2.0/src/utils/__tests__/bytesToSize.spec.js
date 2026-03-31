import bytesToSize from '../bytesToSize';

describe('convert byte to size', () => {
  it('should be string', () => {
    expect(bytesToSize(10241231)).toBe('9.8 MB');
  });
  it('should be string contains 0 number', () => {
    expect(bytesToSize(0)).toBe('0 KB');
  });
  it('shoul be return equal input byte if inut byte < 1024', () => {
    expect(bytesToSize(900)).toBe('900 Bytes');
  });
});
