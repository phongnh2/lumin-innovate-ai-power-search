import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';

// Mock lumin-ui components
jest.mock('lumin-ui/kiwi-ui', () => ({
  Button: (props: Record<string, unknown>) => (
    <button
      data-testid="authorize-button"
      onClick={props.onClick as () => void}
      data-variant={props.variant as string}
      data-size={props.size as string}
      data-lumin-btn-name={props['data-lumin-btn-name'] as string}
    >
      {props.children as React.ReactNode}
    </button>
  ),
  Text: (props: Record<string, unknown>) => (
    <span data-testid="text">{props.children as React.ReactNode}</span>
  ),
}));

// Mock assets
jest.mock('assets/reskin/images/sign-in-slack-dark.png', () => 'sign-in-slack-dark.png');
jest.mock('assets/reskin/images/sign-in-slack-light.png', () => 'sign-in-slack-light.png');

// Mock hooks
const mockHandleAuthorize = jest.fn();
jest.mock('../hooks/useAuthorize', () => ({
  useAuthorize: () => ({
    handleAuthorize: mockHandleAuthorize,
    isLoading: false,
  }),
}));

jest.mock('hooks', () => ({
  useThemeMode: () => 'light',
  useGetCurrentUser: () => ({ _id: 'user-123', email: 'test@example.com' }),
  useTranslation: () => ({ t: (key: string) => key }),
}));

// Mock constants
jest.mock('constants/lumin-common', () => ({
  THEME_MODE: {
    LIGHT: 'light',
    DARK: 'dark',
  },
}));

// Mock ButtonName
jest.mock('utils/Factory/EventCollection/constants/ButtonEvent', () => ({
  ButtonName: {
    SHARE_IN_SLACK_AUTHORIZE: 'share_in_slack_authorize',
  },
}));

import SignInWithSlack from '../components/SignInWithSlack';

const mockStore = configureMockStore([]);

describe('SignInWithSlack', () => {
  let reduxStore: ReturnType<typeof mockStore>;

  beforeEach(() => {
    jest.clearAllMocks();
    reduxStore = mockStore({});
  });

  const renderComponent = () => {
    return render(
      <Provider store={reduxStore}>
        <SignInWithSlack />
      </Provider>
    );
  };

  describe('Rendering', () => {
    it('should render the component', () => {
      renderComponent();
      expect(screen.getByTestId('authorize-button')).toBeInTheDocument();
    });

    it('should render authorize button with correct text', () => {
      renderComponent();
      expect(screen.getByTestId('authorize-button')).toHaveTextContent('common.authorize');
    });

    it('should render text content', () => {
      renderComponent();
      expect(screen.getByTestId('text')).toBeInTheDocument();
    });

    it('should render Sign in with Slack image', () => {
      renderComponent();
      const img = screen.getByAltText('Sign in with Slack');
      expect(img).toBeInTheDocument();
    });
  });

  describe('Authorize Button', () => {
    it('should call handleAuthorize when clicked', () => {
      renderComponent();

      fireEvent.click(screen.getByTestId('authorize-button'));

      expect(mockHandleAuthorize).toHaveBeenCalledTimes(1);
    });

    it('should have correct variant', () => {
      renderComponent();
      expect(screen.getByTestId('authorize-button')).toHaveAttribute('data-variant', 'outlined');
    });

    it('should have correct size', () => {
      renderComponent();
      expect(screen.getByTestId('authorize-button')).toHaveAttribute('data-size', 'lg');
    });

    it('should have data-lumin-btn-name attribute', () => {
      renderComponent();
      expect(screen.getByTestId('authorize-button')).toHaveAttribute(
        'data-lumin-btn-name',
        'share_in_slack_authorize'
      );
    });
  });
});
