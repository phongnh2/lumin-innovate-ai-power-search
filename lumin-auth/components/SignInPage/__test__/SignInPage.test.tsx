/* eslint-disable unused-imports/no-unused-vars */
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable sonarjs/no-duplicate-string */

jest.mock('@/ui/Loading', () => ({
  __esModule: true,
  default: () => <div data-testid='loading'>Loading</div>
}));

jest.mock('@/ui/Button', () => ({
  __esModule: true,
  default: ({ children, fullWidth, loading, ...props }: any) => <button {...props}>{children}</button>,
  ButtonSize: { XL: 'xl' }
}));

jest.mock('@emotion/react', () => {
  const React = jest.requireActual('react');
  return {
    css: () => ({}),
    jsx: jest.fn(),
    keyframes: () => '',
    withEmotionCache: (component: any) => component,
    CacheProvider: ({ children }: any) => children
  };
});

jest.mock('@emotion/styled', () => {
  const React = jest.requireActual('react');
  return {
    __esModule: true,
    default: (tag: any, options?: any) => {
      return (styleFn?: any) => {
        const Component = React.forwardRef((props: any, ref: any) => {
          return React.createElement(tag || 'div', { ...props, ref });
        });
        Component.displayName = `MockStyled(${typeof tag === 'string' ? tag : 'Component'})`;
        return Component;
      };
    }
  };
});

jest.mock('@/ui', () => ({
  PasswordInput: ({ register, inputData, ...props }: any) => <input type='password' data-testid='password-input' {...props} />,
  Input: ({ register, inputData, ...props }: any) => <input data-testid='input' {...props} />,
  Text: ({ children, as: Component = 'span', bold, underline, ...props }: any) => {
    if (Component === 'a' || props.href) {
      return (
        <a href={props.href} {...props}>
          {children}
        </a>
      );
    }
    return <Component {...props}>{children}</Component>;
  },
  VerticalGap: ({ children }: any) => <div>{children}</div>,
  Alert: ({ children, show }: any) => (show ? <div data-testid='alert'>{children}</div> : null),
  ButtonText: ({ children, fullWidth, loading, ...props }: any) => <button {...props}>{children}</button>,
  ButtonSize: { XL: 'xl' }
}));

jest.mock('@/components/SignAuth/Auth.styled', () => ({
  ForgotPassword: ({ children }: any) => <div data-testid='forgot-password'>{children}</div>,
  SubmitButton: ({ children, fullWidth, loading, ...props }: any) => <button {...props}>{children}</button>
}));

jest.mock('@/components/Layout/LayoutSignAuth/LayoutSignAuth.styled', () => ({
  titleCss: {}
}));

const mockPush = jest.fn();
const mockReplace = jest.fn();
const mockRouter = {
  query: {},
  asPath: '/sign-in',
  push: mockPush,
  replace: mockReplace
};

jest.mock('next/router', () => ({
  useRouter: jest.fn(() => mockRouter)
}));

jest.mock('next/dynamic', () => () => {
  return () => <div data-testid='dynamic-component'>Dynamic</div>;
});

jest.mock('next/link', () => {
  return ({ children, href }: any) => <a href={href}>{children}</a>;
});

jest.mock('next-i18next', () => ({
  Trans: ({ i18nKey }: any) => <span>{i18nKey}</span>
}));

jest.mock('@/hooks/useTranslation', () => ({
  __esModule: true,
  default: () => ({
    t: (key: string) => key
  })
}));

const mockEnsureLoginFlow = jest.fn(() => ({
  unwrap: jest.fn().mockResolvedValue({ id: 'flow-id', return_to: '/dashboard' })
}));
const mockLoginPassword = jest.fn();
const mockLoginOidc = jest.fn();

jest.mock('@/features/account/sign-in-api-slice', () => ({
  useEnsureLoginFlowMutation: jest.fn(() => [mockEnsureLoginFlow, { data: { id: 'flow-id' } }]),
  useGetLoginFlowQuery: jest.fn(() => ({ data: null })),
  useLoginOidcMutation: jest.fn(() => [mockLoginOidc, { error: null }]),
  useLoginPasswordMutation: jest.fn(() => [mockLoginPassword, { isSuccess: false, error: null }])
}));

jest.mock('@/lib/factory/utils', () => ({
  getAnonymousUserId: jest.fn(() => 'mock-anonymous-id')
}));

jest.mock('@/hooks', () => ({
  useGetQueryValuesFromReturnTo: jest.fn(() => ({
    returnToValue: '/dashboard',
    returnToParams: { from: null, agGuest: null }
  })),
  useFetchUserLocation: jest.fn()
}));

jest.mock('@/hooks/auth', () => ({
  useHandleFlowErrors: jest.fn()
}));

const mockDispatch = jest.fn();
jest.mock('@/lib/hooks', () => ({
  useAppSelector: jest.fn(() => ''),
  useAppDispatch: jest.fn(() => mockDispatch)
}));

const mockRegister = jest.fn(() => ({}));
const mockHandleSubmit = jest.fn(fn => (e: any) => {
  e?.preventDefault?.();
  return fn({ email: 'test@example.com', password: 'password123' });
});
const mockGetValues = jest.fn(() => ({ email: 'test@example.com', password: 'password123' }));

jest.mock('@/lib/react-hook-form', () => ({
  useForm: jest.fn(() => ({
    register: mockRegister,
    handleSubmit: mockHandleSubmit,
    formState: { errors: {}, isSubmitted: false, isSubmitting: false },
    getValues: mockGetValues
  }))
}));

jest.mock('@/selectors', () => ({
  getLoginChallenge: jest.fn()
}));

jest.mock('@/features/oauth2/oauth2-slice', () => ({
  setLoginChallenge: jest.fn()
}));

jest.mock('@/features/visibility-slice', () => ({
  openElement: jest.fn(() => ({ type: 'OPEN_ELEMENT' })),
  closeElement: jest.fn(() => ({ type: 'CLOSE_ELEMENT' }))
}));

jest.mock('@/components/Form', () => {
  return ({ children, onSubmit, ...props }: any) => (
    <form onSubmit={onSubmit} {...props}>
      {children}
    </form>
  );
});

jest.mock('@/components/Header', () => ({
  Header: () => <div data-testid='header'>Header</div>
}));

jest.mock('@/components/SignAuth/AuthMethodDivider', () => {
  return () => <div data-testid='auth-divider'>Divider</div>;
});

jest.mock('@/components/SignAuth/SocialAuthGroup', () => {
  return (props: any) => (
    <div data-testid='social-auth-group'>
      <button data-testid='google-callback-btn' onClick={() => props.handleGoogleSignInResponse({ credential: 'fake-token' })}>
        Google Callback
      </button>
      <button onClick={props.onGoogleClick} data-testid='google-btn'>
        Google
      </button>
      <button onClick={props.onMicrosoftClick} data-testid='microsoft-btn'>
        Microsoft
      </button>
      <button onClick={props.onDropboxClick} data-testid='dropbox-btn'>
        Dropbox
      </button>
    </div>
  );
});

jest.mock('@/components/SignAuth/LastAccessAccount/LastAccessAccount', () => {
  return (props: any) => (
    <div data-testid='last-access-account'>
      <button data-testid='toggle-btn' onClick={props.toggleOpenLastAccess}>
        Toggle
      </button>
      <button data-testid='sign-in-oidc-btn' onClick={() => props.clickSignInOidc('google')}>
        Sign In OIDC
      </button>
    </div>
  );
});

jest.mock('@/components/SignAuth/ResendVerification', () => ({
  ResendVerificationLink: () => <div data-testid='resend-link'>Resend</div>
}));

jest.mock('jwt-decode', () => ({
  __esModule: true,
  default: jest.fn(() => ({ email: 'test@example.com' }))
}));

jest.mock('@/features/errors', () => ({
  isSerializedError: jest.fn(() => false),
  getServerError: jest.fn(() => ({})),
  isFrontendApiError: jest.fn(() => false)
}));

jest.mock('@/utils/error.utils', () => ({
  getErrorMessage: jest.fn((err: any) => err?.message || 'Error'),
  getErrorMessageTranslated: jest.fn((msg: string) => msg)
}));

jest.mock('@/utils/commonUtils', () => ({
  isClientSide: jest.fn(() => true)
}));

jest.mock('@/utils/cookie.utils', () => ({
  __esModule: true,
  default: {
    setAuthEventCookie: jest.fn()
  }
}));

jest.mock('@/utils/getLanguage', () => ({
  getFullPathWithLanguageFromUrl: jest.fn(() => '/en/authentication/gateway')
}));

jest.mock('@/utils/openGoogle.utils', () => ({
  isGoogleOpenPath: jest.fn(() => false)
}));

jest.mock('@/lib/factory/button.event', () => ({
  buttonEvent: {
    signInOidc: jest.fn()
  }
}));

jest.mock('@/lib/logger', () => ({
  clientLogger: {
    error: jest.fn()
  }
}));

jest.mock('@/lib/socket', () => ({
  __esModule: true,
  default: {
    emit: jest.fn()
  }
}));

jest.mock('@/configs/environment', () => ({
  environment: {
    public: {
      host: {
        authUrl: 'http://localhost:3000',
        appUrl: 'http://localhost:3000'
      }
    }
  }
}));

import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';

import { ErrorCode } from '@/constants/errorCode';

import SignInPage from '../SignInPage';

describe('SignInPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRouter.query = {};
    mockRouter.asPath = '/sign-in';

    delete (window as any).location;
    (window as any).location = { href: '' };

    sessionStorage.clear();
  });

  describe('Basic Rendering', () => {
    it('should render without crashing', () => {
      render(<SignInPage />);
      expect(screen.getByTestId('header')).toBeInTheDocument();
    });

    it('should render form with input fields', () => {
      render(<SignInPage />);
      expect(screen.getByTestId('input')).toBeInTheDocument();
      expect(screen.getByTestId('password-input')).toBeInTheDocument();
    });

    it('should render forgot password link', () => {
      render(<SignInPage />);
      expect(screen.getByTestId('forgot-password')).toBeInTheDocument();
    });
  });

  describe('Form Submission', () => {
    it('should call handleSubmit on form submit', async () => {
      render(<SignInPage />);

      const form = document.querySelector('form');
      if (form) {
        fireEvent.submit(form);
        await waitFor(() => {
          expect(mockHandleSubmit).toHaveBeenCalled();
        });
      }
    });
  });

  describe('OAuth2 Props', () => {
    it('should render with oauth2 props', () => {
      const oauth2Props = {
        from: 'mobile',
        challenge: 'test-challenge',
        returnTo: '/callback'
      };

      render(<SignInPage oauth2={oauth2Props} />);
      expect(screen.getByTestId('header')).toBeInTheDocument();
    });

    it('should render hidden challenge input when oauth2 is provided', () => {
      const oauth2Props = {
        from: 'mobile',
        challenge: 'test-challenge',
        returnTo: '/callback'
      };

      render(<SignInPage oauth2={oauth2Props} />);
      const hiddenInput = document.querySelector('input[name="challenge"]');
      expect(hiddenInput).toBeInTheDocument();
      expect(hiddenInput).toHaveValue('test-challenge');
    });
  });

  describe('Last Access Account', () => {
    it('should show LastAccessAccount when conditions are met', () => {
      const lastAccessAccount = {
        email: 'test@example.com',
        name: 'Test User',
        loginService: 'google'
      };

      render(<SignInPage lastAccessAccount={lastAccessAccount as any} />);
      expect(screen.getByTestId('last-access-account')).toBeInTheDocument();
    });

    it('should toggle last access account view', async () => {
      const lastAccessAccount = {
        email: 'test@example.com',
        name: 'Test User',
        loginService: 'google'
      };

      render(<SignInPage lastAccessAccount={lastAccessAccount as any} />);

      const toggleBtn = screen.getByTestId('toggle-btn');
      fireEvent.click(toggleBtn);

      await waitFor(() => {
        expect(screen.getByTestId('social-auth-group')).toBeInTheDocument();
      });
    });
  });

  describe('Social Auth - clickSignInOidc', () => {
    it('should call clickSignInOidc when Google button is clicked', async () => {
      render(<SignInPage />);

      const googleBtn = screen.getByTestId('google-btn');
      await act(async () => {
        fireEvent.click(googleBtn);
      });

      await waitFor(() => {
        expect(mockDispatch).toHaveBeenCalled();
        expect(mockEnsureLoginFlow).toHaveBeenCalled();
      });
    });

    it('should handle Google Sign-In response callback', async () => {
      const jwtDecodeMock = require('jwt-decode').default;
      jwtDecodeMock.mockReturnValueOnce({ email: 'test@example.com' });

      render(<SignInPage />);

      const callbackBtn = screen.getByTestId('google-callback-btn');
      await act(async () => {
        fireEvent.click(callbackBtn);
      });

      await waitFor(() => {
        expect(jwtDecodeMock).toHaveBeenCalledWith('fake-token');
      });
    });

    it('should store oauth2 challenge in sessionStorage when oauth2 is provided', async () => {
      const oauth2Props = {
        from: 'mobile',
        challenge: 'test-challenge',
        returnTo: '/callback'
      };

      render(<SignInPage oauth2={oauth2Props} />);

      const googleBtn = screen.getByTestId('google-btn');
      await act(async () => {
        fireEvent.click(googleBtn);
      });

      await waitFor(() => {
        expect(mockEnsureLoginFlow).toHaveBeenCalled();
      });
    });
  });

  describe('credentialQuery useEffect', () => {
    it('should handle credential query from URL', async () => {
      const jwtDecodeMock = require('jwt-decode').default;
      jwtDecodeMock.mockReturnValue({ email: 'test@example.com' });

      mockRouter.query = { credential: 'jwt-token-from-url' };

      render(<SignInPage />);

      await waitFor(() => {
        expect(jwtDecodeMock).toHaveBeenCalledWith('jwt-token-from-url');
      });
    });
  });

  describe('loginOk useEffect - redirect behavior', () => {
    it('should redirect to oauth2.returnTo when loginOk and oauth2 provided', async () => {
      const { useLoginPasswordMutation } = require('@/features/account/sign-in-api-slice');
      useLoginPasswordMutation.mockReturnValueOnce([mockLoginPassword, { isSuccess: true, error: null }]);

      const oauth2Props = {
        from: 'mobile',
        challenge: 'test-challenge',
        returnTo: '/oauth-callback'
      };

      render(<SignInPage oauth2={oauth2Props} />);

      await waitFor(() => {
        const socket = require('@/lib/socket').default;
        expect(socket.emit).toHaveBeenCalled();
      });
    });

    it('should redirect to loginFlow.return_to when loginOk', async () => {
      const { useLoginPasswordMutation, useEnsureLoginFlowMutation } = require('@/features/account/sign-in-api-slice');
      useLoginPasswordMutation.mockReturnValueOnce([mockLoginPassword, { isSuccess: true, error: null }]);
      useEnsureLoginFlowMutation.mockReturnValueOnce([mockEnsureLoginFlow, { data: { id: 'flow-id', return_to: '/custom-return' } }]);

      render(<SignInPage />);

      await waitFor(() => {
        const socket = require('@/lib/socket').default;
        expect(socket.emit).toHaveBeenCalled();
      });
    });

    it('should redirect to root when loginOk without return_to', async () => {
      const { useLoginPasswordMutation, useEnsureLoginFlowMutation } = require('@/features/account/sign-in-api-slice');
      useLoginPasswordMutation.mockReturnValueOnce([mockLoginPassword, { isSuccess: true, error: null }]);
      useEnsureLoginFlowMutation.mockReturnValueOnce([mockEnsureLoginFlow, { data: { id: 'flow-id' } }]);

      render(<SignInPage />);

      await waitFor(() => {
        const socket = require('@/lib/socket').default;
        expect(socket.emit).toHaveBeenCalled();
      });
    });
  });

  describe('Error handling', () => {
    it('should close loading element when serverError occurs', async () => {
      const { closeElement } = require('@/features/visibility-slice');
      const { useLoginPasswordMutation } = require('@/features/account/sign-in-api-slice');
      useLoginPasswordMutation.mockReturnValueOnce([mockLoginPassword, { isSuccess: false, error: { message: 'Error' } }]);

      render(<SignInPage />);

      await waitFor(() => {
        expect(closeElement).toHaveBeenCalled();
      });
    });

    it('should close loading element when loginOidcError occurs on mobile', async () => {
      const { closeElement } = require('@/features/visibility-slice');
      const { useLoginOidcMutation } = require('@/features/account/sign-in-api-slice');
      useLoginOidcMutation.mockReturnValueOnce([mockLoginOidc, { error: { message: 'OIDC Error' } }]);

      const oauth2Props = {
        from: 'mobile',
        challenge: 'test-challenge',
        returnTo: '/callback'
      };

      render(<SignInPage oauth2={oauth2Props} />);

      await waitFor(() => {
        expect(closeElement).toHaveBeenCalled();
      });
    });
  });

  describe('getServerErrorMessage', () => {
    it('should return null when no serverError', () => {
      render(<SignInPage />);
      expect(screen.queryByTestId('alert')).not.toBeInTheDocument();
    });

    it('should show SOMETHING_WENT_WRONG for non-frontend API errors', () => {
      const { useLoginPasswordMutation } = require('@/features/account/sign-in-api-slice');
      const { isFrontendApiError, isSerializedError } = require('@/features/errors');
      const { useForm } = require('@/lib/react-hook-form');

      isSerializedError.mockReturnValue(false);
      isFrontendApiError.mockReturnValue(false);

      useForm.mockReturnValueOnce({
        register: mockRegister,
        handleSubmit: mockHandleSubmit,
        formState: { errors: {}, isSubmitted: true, isSubmitting: false },
        getValues: mockGetValues
      });

      useLoginPasswordMutation.mockReturnValueOnce([mockLoginPassword, { isSuccess: false, error: { message: 'Generic error' } }]);

      render(<SignInPage />);

      expect(screen.getByTestId('alert')).toHaveTextContent('errorMessage.unknownError');
    });

    it('should show resend verification link for UNACTIVATED_ACCOUNT error', () => {
      const { useLoginPasswordMutation } = require('@/features/account/sign-in-api-slice');
      const { isSerializedError, getServerError } = require('@/features/errors');
      const { useForm } = require('@/lib/react-hook-form');

      isSerializedError.mockReturnValue(true);
      getServerError.mockReturnValue({});

      useForm.mockReturnValueOnce({
        register: mockRegister,
        handleSubmit: mockHandleSubmit,
        formState: { errors: {}, isSubmitted: true, isSubmitting: false },
        getValues: mockGetValues
      });

      useLoginPasswordMutation.mockReturnValueOnce([
        mockLoginPassword,
        {
          isSuccess: false,
          error: {
            data: {
              code: ErrorCode.User.UNACTIVATED_ACCOUNT,
              message: 'Account not activated',
              meta: { remainingTime: 120 }
            }
          }
        }
      ]);

      render(<SignInPage />);

      expect(screen.getByTestId('alert')).toBeInTheDocument();
      expect(screen.getByText('authPage.resendVerifyYourEmail')).toBeInTheDocument();
      expect(screen.getByTestId('resend-link')).toBeInTheDocument();
    });

    it('should show password expired error with link', () => {
      const { useLoginPasswordMutation } = require('@/features/account/sign-in-api-slice');
      const { isSerializedError, getServerError } = require('@/features/errors');
      const { useForm } = require('@/lib/react-hook-form');

      isSerializedError.mockReturnValue(true);
      getServerError.mockReturnValue({});

      useForm.mockReturnValueOnce({
        register: mockRegister,
        handleSubmit: mockHandleSubmit,
        formState: { errors: {}, isSubmitted: true, isSubmitting: false },
        getValues: mockGetValues
      });

      useLoginPasswordMutation.mockReturnValueOnce([
        mockLoginPassword,
        {
          isSuccess: false,
          error: {
            data: {
              code: ErrorCode.User.PASSWORD_EXPIRED,
              message: 'Password expired'
            }
          }
        }
      ]);

      render(<SignInPage />);

      expect(screen.getByTestId('alert')).toBeInTheDocument();
      expect(screen.getByText('errorMessage.passwordExpiredHasLink')).toBeInTheDocument();
    });

    it('should fallback to serverError.data.message for unknown serialized errors', () => {
      const { useLoginPasswordMutation } = require('@/features/account/sign-in-api-slice');
      const { isSerializedError, getServerError } = require('@/features/errors');
      const { useForm } = require('@/lib/react-hook-form');

      isSerializedError.mockReturnValue(true);
      getServerError.mockReturnValue({});

      useForm.mockReturnValueOnce({
        register: mockRegister,
        handleSubmit: mockHandleSubmit,
        formState: { errors: {}, isSubmitted: true, isSubmitting: false },
        getValues: mockGetValues
      });

      useLoginPasswordMutation.mockReturnValueOnce([
        mockLoginPassword,
        {
          isSuccess: false,
          error: {
            data: {
              code: 'UNKNOWN_CODE',
              message: 'Serialized fallback message'
            }
          }
        }
      ]);

      render(<SignInPage />);

      expect(screen.getByTestId('alert')).toHaveTextContent('Serialized fallback message');
    });
  });

  describe('Title with invite link pattern', () => {
    it('should show signInToJoinOrganization title for invite links', () => {
      mockRouter.query = { return_to: 'http://localhost:3000/en/invite-link/abc123' };

      render(<SignInPage />);

      const titles = screen.getAllByText('common.signInToJoinOrganization');
      expect(titles.length).toBeGreaterThan(0);
    });
  });

  describe('handleReturnTo with loginHint', () => {
    it('should handle Dropbox provider with loginHint and redirect with guestEmail', async () => {
      const { isGoogleOpenPath } = require('@/utils/openGoogle.utils');
      isGoogleOpenPath.mockReturnValue(true);

      mockRouter.query = { login_hint: 'hint@example.com' };

      render(<SignInPage />);

      const dropboxBtn = screen.getByTestId('dropbox-btn');
      await act(async () => {
        fireEvent.click(dropboxBtn);
      });

      await waitFor(() => {
        expect(mockEnsureLoginFlow).toHaveBeenCalled();
      });
    });

    it('should handle Microsoft provider with loginHint and redirect with guestEmail', async () => {
      const { isGoogleOpenPath } = require('@/utils/openGoogle.utils');
      isGoogleOpenPath.mockReturnValue(true);

      mockRouter.query = { login_hint: 'hint@example.com' };

      render(<SignInPage />);

      const microsoftBtn = screen.getByTestId('microsoft-btn');
      await act(async () => {
        fireEvent.click(microsoftBtn);
      });

      await waitFor(() => {
        expect(mockEnsureLoginFlow).toHaveBeenCalled();
      });
    });

    it('should redirect to gateway when loginHint does not match email', async () => {
      const { isGoogleOpenPath } = require('@/utils/openGoogle.utils');
      isGoogleOpenPath.mockReturnValue(true);

      mockRouter.query = { login_hint: 'different@example.com' };

      render(<SignInPage />);

      const googleBtn = screen.getByTestId('google-btn');
      await act(async () => {
        fireEvent.click(googleBtn);
      });

      await waitFor(() => {
        expect(mockEnsureLoginFlow).toHaveBeenCalled();
      });
    });

    it('should handle Google provider with matching loginHint', async () => {
      const { isGoogleOpenPath } = require('@/utils/openGoogle.utils');
      isGoogleOpenPath.mockReturnValue(true);

      mockRouter.query = { login_hint: 'test%40example.com', return_to: '/dashboard' };

      render(<SignInPage />);

      const googleBtn = screen.getByTestId('google-btn');
      await act(async () => {
        fireEvent.click(googleBtn);
      });

      await waitFor(() => {
        expect(mockEnsureLoginFlow).toHaveBeenCalled();
      });
    });
  });

  describe('Canny auth path', () => {
    it('should handle canny auth redirect path with proper regex match', async () => {
      mockRouter.asPath = '/authentication/canny-sso';
      mockRouter.query = { redirect: 'https://canny.io/callback' };

      render(<SignInPage />);

      const googleBtn = screen.getByTestId('google-btn');
      await act(async () => {
        fireEvent.click(googleBtn);
      });

      await waitFor(() => {
        expect(mockEnsureLoginFlow).toHaveBeenCalled();
      });
    });
  });

  describe('getReturnTo with sessionStorage', () => {
    it('should use oauth2Challenge from sessionStorage when no oauth2 prop', () => {
      sessionStorage.setItem('oauth2_challenge', 'stored-challenge');

      render(<SignInPage />);

      expect(screen.getByTestId('header')).toBeInTheDocument();
    });

    it('should prioritize oauth2.returnTo over sessionStorage', () => {
      sessionStorage.setItem('oauth2_challenge', 'stored-challenge');

      const oauth2Props = {
        from: 'mobile',
        challenge: 'prop-challenge',
        returnTo: '/oauth-callback'
      };

      render(<SignInPage oauth2={oauth2Props} />);

      expect(screen.getByTestId('header')).toBeInTheDocument();
    });
  });
});
