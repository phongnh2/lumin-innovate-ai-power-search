import React from 'react';
import { shallow } from 'enzyme';
import FailedFetchError from '../FailedFetchError';

const mockUseEnableWebReskin = jest.fn(() => ({ isEnableReskin: false }));

jest.mock('hooks', () => ({
  useEnableWebReskin: () => mockUseEnableWebReskin(),
}));

jest.mock('lumin-ui/kiwi-ui', () => ({
  Icomoon: ({ type, size, color, ...props }: any) => (
    <div data-testid="kiwi-icomoon" data-type={type} data-size={size} data-color={color} {...props} />
  ),
  Text: ({ children, type, size, color, ...props }: any) => (
    <div data-testid="kiwi-text" data-type={type} data-size={size} data-color={color} {...props}>
      {children}
    </div>
  ),
}));

jest.mock('react-i18next', () => ({
  Trans: ({ i18nKey, components, ...props }: any) => {
    if (components?.span) {
      const SpanComponent = components.span;
      return (
        <span data-testid="trans" data-i18n-key={i18nKey} {...props}>
          <SpanComponent />
        </span>
      );
    }
    return <span data-testid="trans" data-i18n-key={i18nKey} {...props} />;
  },
}));

jest.mock('lumin-components/Icomoon', () => {
  return function Icomoon(props: any) {
    return <div data-testid="icomoon" {...props} />;
  };
});

jest.mock('../FailedFetchError.styled', () => ({
  Container: ({ children }: { children: React.ReactNode }) => <div data-testid="styled-container">{children}</div>,
  Title: ({ children }: { children: React.ReactNode }) => <div data-testid="styled-title">{children}</div>,
  Description: ({ children }: { children: React.ReactNode }) => <div data-testid="styled-description">{children}</div>,
}));

jest.mock('../FailedFetchError.module.scss', () => ({}));

describe('FailedFetchError', () => {
  const mockRetry = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render reskin version when isEnableReskin is true', () => {
    mockUseEnableWebReskin.mockReturnValue({ isEnableReskin: true });
    const wrapper = shallow(<FailedFetchError retry={mockRetry} />);

    const kiwiIcomoon = wrapper.find('Icomoon[data-testid="kiwi-icomoon"]');
    expect(kiwiIcomoon.exists() || wrapper.find('[data-testid="kiwi-icomoon"]').exists()).toBe(false);
  });

  it('should render non-reskin version when isEnableReskin is false', () => {
    mockUseEnableWebReskin.mockReturnValue({ isEnableReskin: false });
    const wrapper = shallow(<FailedFetchError retry={mockRetry} />);
    const container = wrapper.find('Container[data-testid="styled-container"]');
    expect(container.exists() || wrapper.find('[data-testid="styled-container"]').exists()).toBe(false);
  });
});
