/* eslint-disable unused-imports/no-unused-vars */
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable sonarjs/no-duplicate-string */

jest.mock('@/lib/jwt', () => ({
  JWTService: jest.fn().mockImplementation(() => ({
    sign: jest.fn(),
    verify: jest.fn()
  }))
}));

jest.mock('@/ui/Loading', () => ({
  __esModule: true,
  default: () => <div data-testid='loading'>Loading</div>
}));

jest.mock('@/features/account/account-api-slice', () => ({
  __esModule: true,
  useGetRegistrationFlowQuery: jest.fn(() => ({
    data: null,
    isLoading: false,
    isFetching: false,
    error: null
  }))
}));

jest.mock('@/ui/Button', () => ({
  __esModule: true,
  default: ({ children, fullWidth, loading, ...props }: any) => <button {...props}>{children}</button>,
  ButtonSize: { XL: 'xl' }
}));

jest.mock('@/ui/Button/Button.styled', () => ({
  ButtonWrapper: ({ children, fullWidth, loading, ...props }: any) => <button {...props}>{children}</button>
}));

jest.mock('jose', () => ({
  __esModule: true,
  jwtVerify: jest.fn(),
  importJWK: jest.fn(),
  SignJWT: jest.fn().mockImplementation(() => ({
    setProtectedHeader: jest.fn().mockReturnThis(),
    setIssuedAt: jest.fn().mockReturnThis(),
    setExpirationTime: jest.fn().mockReturnThis(),
    sign: jest.fn().mockResolvedValue('fake-jwt')
  }))
}));

jest.mock('@emotion/react', () => ({
  css: () => ({}),
  jsx: jest.fn(),
  keyframes: () => ''
}));

jest.mock('@/ui', () => ({
  PasswordInput: ({ register, inputData, ...props }: any) => <input type='password' data-testid='password-input' {...props} />,
  Input: ({ register, inputData, ...props }: any) => <input data-testid='input' {...props} />,
  ErrorMessage: ({ children }: any) => <span data-testid='error-message'>{children}</span>,
  VerticalGap: ({ children }: any) => <div>{children}</div>,
  Alert: ({ children, show }: any) => (show ? <div data-testid='alert'>{children}</div> : null),
  ButtonSize: { XL: 'xl' },
  useSnackbar: () => ({
    enqueueSnackbar: jest.fn(),
    closeSnackbar: jest.fn()
  })
}));

jest.mock('@/components/SignAuth/Auth.styled', () => ({
  AcceptTermsWrapper: ({ children, register, ...props }: any) => <div>{children}</div>,
  SubmitButton: ({ children, fullWidth, loading, ...props }: any) => <button {...props}>{children}</button>
}));

jest.mock('next/router', () => ({
  useRouter: jest.fn(() => ({
    query: {},
    push: jest.fn(),
    replace: jest.fn()
  }))
}));

jest.mock('next/dynamic', () => () => {
  return ({ children, loginChallenge, returnTo, dataAttribute, register, ...props }: any) => <div {...props}>{children}</div>;
});

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: {
      changeLanguage: jest.fn()
    }
  }),
  Trans: ({ children }: any) => children
}));

const mockSubmitSignUp = jest.fn();
const mockSignInOidc = jest.fn(() => jest.fn());
const mockGetValues = jest.fn(() => ({ email: 'test@example.com' }));

jest.mock('@/lib/use-sign-up-form', () => ({
  useSignUpForm: jest.fn(() => ({
    errors: {},
    register: jest.fn(() => ({})),
    submitSignUp: mockSubmitSignUp,
    signInOidc: mockSignInOidc,
    formState: { isSubmitting: false },
    serverError: null,
    getValues: mockGetValues
  }))
}));

jest.mock('@/hooks', () => ({
  useGetQueryValuesFromReturnTo: jest.fn(() => ({
    returnToValue: '/dashboard'
  }))
}));

jest.mock('@/lib/hooks', () => ({
  useAppSelector: jest.fn(() => ''),
  useAppDispatch: jest.fn(() => jest.fn())
}));

jest.mock('@/selectors', () => ({
  getLoginChallenge: jest.fn()
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
  getErrorMessageTranslated: jest.fn((msg: string) => msg)
}));

jest.mock('@/utils/account.utils', () => ({
  OidcProviderMapping: {}
}));

import { render, screen, fireEvent, waitFor } from '@testing-library/react';

import { ErrorCode } from '@/constants/errorCode';

import SignUpPage from '../SignUpPage';

describe('SignUpPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    it('should render without crashing', () => {
      render(<SignUpPage />);
      expect(screen.getByTestId('header')).toBeInTheDocument();
    });

    it('should render Header component', () => {
      render(<SignUpPage />);
      expect(screen.getByTestId('header')).toBeInTheDocument();
    });

    it('should render SocialAuthGroup component', () => {
      render(<SignUpPage />);
      expect(screen.getByTestId('social-auth-group')).toBeInTheDocument();
    });

    it('should render AuthMethodDivider component', () => {
      render(<SignUpPage />);
      expect(screen.getByTestId('auth-divider')).toBeInTheDocument();
    });

    it('should render form with input fields', () => {
      render(<SignUpPage />);
      expect(screen.getAllByTestId('input').length).toBeGreaterThanOrEqual(2);
      expect(screen.getByTestId('password-input')).toBeInTheDocument();
    });

    it('should render submit button', () => {
      render(<SignUpPage />);
      expect(screen.getByText('common.signUp')).toBeInTheDocument();
    });
  });

  describe('Form Submission', () => {
    it('should call submitSignUp on form submit', async () => {
      render(<SignUpPage />);

      const form = document.querySelector('form');
      if (form) {
        fireEvent.submit(form);
        await waitFor(() => {
          expect(mockSubmitSignUp).toHaveBeenCalled();
        });
      }
    });
  });

  describe('Social Auth', () => {
    it('should call signInOidc when Google button is clicked', async () => {
      render(<SignUpPage />);

      const googleBtn = screen.getByTestId('google-btn');
      fireEvent.click(googleBtn);

      expect(mockSignInOidc).toHaveBeenCalled();
    });

    it('should call signInOidc when Microsoft button is clicked', async () => {
      render(<SignUpPage />);

      const microsoftBtn = screen.getByTestId('microsoft-btn');
      fireEvent.click(microsoftBtn);

      expect(mockSignInOidc).toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    it('should not show alert when there is no server error', () => {
      render(<SignUpPage />);
      expect(screen.queryByTestId('alert')).not.toBeInTheDocument();
    });

    it('should show alert when there is a server error', () => {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const { useSignUpForm } = require('@/lib/use-sign-up-form');
      useSignUpForm.mockReturnValueOnce({
        errors: { name: { message: 'Name is required' }, email: { message: 'Email is required' }, password: { message: 'Password is required' } },
        register: jest.fn(() => ({})),
        submitSignUp: mockSubmitSignUp,
        signInOidc: mockSignInOidc,
        formState: { isSubmitting: false },
        serverError: { message: 'Error occurred' },
        getValues: mockGetValues
      });

      render(<SignUpPage />);
      expect(screen.getByTestId('alert')).toBeInTheDocument();
    });

    it('should return mapped frontend API error message', () => {
      const { useSignUpForm } = require('@/lib/use-sign-up-form');
      const { isFrontendApiError, getServerError } = require('@/features/errors');

      isFrontendApiError.mockReturnValueOnce(true);
      getServerError.mockReturnValueOnce({ SOME_ERROR: 'Translated message' });

      useSignUpForm.mockReturnValueOnce({
        errors: {},
        register: jest.fn(),
        submitSignUp: mockSubmitSignUp,
        signInOidc: mockSignInOidc,
        formState: { isSubmitting: false },
        serverError: { code: 'SOME_ERROR', message: 'fallback message' },
        getValues: mockGetValues
      });

      render(<SignUpPage />);
      expect(screen.getByTestId('alert')).toHaveTextContent('Translated message');
    });

    it('should fallback to serverError.message when mapped error is missing', () => {
      const fallbackMessage = 'fallback message';

      const { useSignUpForm } = require('@/lib/use-sign-up-form');
      const { isFrontendApiError, getServerError } = require('@/features/errors');

      isFrontendApiError.mockReturnValueOnce(true);
      getServerError.mockReturnValueOnce({});

      useSignUpForm.mockReturnValueOnce({
        errors: {},
        register: jest.fn(),
        submitSignUp: mockSubmitSignUp,
        signInOidc: mockSignInOidc,
        formState: { isSubmitting: false },
        serverError: { code: 'SOME_ERROR', message: fallbackMessage },
        getValues: mockGetValues
      });

      render(<SignUpPage />);

      expect(screen.getByTestId('alert')).toHaveTextContent(fallbackMessage);
    });

    it('should show resend verification link when account is unactivated', () => {
      const { useSignUpForm } = require('@/lib/use-sign-up-form');
      const { isSerializedError, getServerError } = require('@/features/errors');

      isSerializedError.mockReturnValueOnce(true);
      getServerError.mockReturnValueOnce({});

      useSignUpForm.mockReturnValueOnce({
        errors: {},
        register: jest.fn(),
        submitSignUp: mockSubmitSignUp,
        signInOidc: mockSignInOidc,
        formState: { isSubmitting: false },
        getValues: mockGetValues,
        serverError: {
          data: {
            code: ErrorCode.User.UNACTIVATED_ACCOUNT,
            meta: { remainingTime: 120 }
          }
        }
      });

      render(<SignUpPage />);

      expect(screen.getByTestId('alert')).toBeInTheDocument();

      expect(screen.getByText('authPage.resendVerifyYourEmail')).toBeInTheDocument();

      expect(screen.getByTestId('resend-link')).toBeInTheDocument();
    });

    it('should fallback to serverError.data.message when serialized error has no mapping', () => {
      const fallbackMessage = 'Serialized fallback message';

      const { useSignUpForm } = require('@/lib/use-sign-up-form');
      const { isSerializedError, getServerError } = require('@/features/errors');

      isSerializedError.mockReturnValueOnce(true);
      getServerError.mockReturnValueOnce({});
      useSignUpForm.mockReturnValueOnce({
        errors: {},
        register: jest.fn(),
        submitSignUp: mockSubmitSignUp,
        signInOidc: mockSignInOidc,
        formState: { isSubmitting: false },
        getValues: mockGetValues,
        serverError: {
          data: {
            code: 'UNKNOWN_ERROR',
            message: fallbackMessage,
            meta: {}
          }
        }
      });

      render(<SignUpPage />);

      const alert = screen.getByTestId('alert');
      expect(alert).toBeInTheDocument();
      expect(alert).toHaveTextContent(fallbackMessage);
    });

    it('should handle Google Sign-In response', async () => {
      const mockEmail = 'test@example.com';

      const jwtDecodeMock = require('jwt-decode').default;
      jwtDecodeMock.mockReturnValueOnce({ email: mockEmail });

      render(<SignUpPage />);

      const callbackBtn = screen.getByTestId('google-callback-btn');
      fireEvent.click(callbackBtn);

      await waitFor(() => {
        expect(jwtDecodeMock).toHaveBeenCalledWith('fake-token');
        expect(mockSignInOidc).toHaveBeenCalledWith('google', mockEmail);
      });
    });
  });
});
