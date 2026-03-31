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
export default Color;
