import getColorFromStyle from '../getColorFromStyle';

describe('get color from style', () => {
  it('should be hex string', () => {
    function Color(r, b, g, a) {
      this.toHexString = () => {
        const mockFn = jest.fn();
        mockFn.mockReturnValue('#ffffff');
        return mockFn();
      };
      return {
        R: r,
        G: g,
        B: b,
        A: a,
        toHexString: this.toHexString,
      };
    }

    const mockStyle = {
      TextColor: new Color(0, 0, 0, 1),
      StrokeColor: new Color(0, 0, 0, 1),
      FillColor: new Color(0, 0, 0, 1),
    };
    expect(getColorFromStyle(mockStyle)).toBe('#ffffff');
  });
});
