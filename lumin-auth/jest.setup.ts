import '@testing-library/jest-dom';

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn()
  }))
});

jest.mock(
  '*.svg',
  () => {
    const React = jest.requireActual('react');
    const SvgMock = React.forwardRef((props: { 'data-testid'?: string }, ref: React.Ref<SVGSVGElement>) => {
      return React.createElement(
        'svg',
        {
          ...props,
          ref,
          'data-testid': props['data-testid'] || 'svg-mock'
        },
        React.createElement('title', null, 'Mocked SVG')
      );
    });
    SvgMock.displayName = 'SvgMock';
    return SvgMock;
  },
  { virtual: true }
);
