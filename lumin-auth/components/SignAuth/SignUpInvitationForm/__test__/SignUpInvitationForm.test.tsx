/* eslint-disable unused-imports/no-unused-vars */
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable sonarjs/no-duplicate-string */

jest.mock('@emotion/react', () => ({
  css: () => ({})
}));

jest.mock('@/ui', () => ({
  Input: ({ register, inputData, ...props }: any) => <input data-testid='input' {...props} />,
  PasswordInput: ({ register, inputData, ...props }: any) => <input type='password' data-testid='password-input' {...props} />,
  VerticalGap: ({ children }: any) => <div>{children}</div>,
  Alert: ({ children, show }: any) => (show ? <div data-testid='alert'>{children}</div> : null),
  ErrorMessage: ({ children }: any) => <span data-testid='error-message'>{children}</span>
}));

jest.mock('@/ui/Button', () => ({
  ButtonSize: { XL: 'xl' }
}));

jest.mock('@/components/SignAuth/Auth.styled', () => ({
  AcceptTermsWrapper: ({ children, register, ...props }: any) => <div>{children}</div>,
  SubmitButton: ({ children, fullWidth, loading, ...props }: any) => <button {...props}>{children}</button>
}));

jest.mock('../SignUpInvitationForm.styled', () => ({
  EmailPreserve: ({ children }: any) => <span data-testid='email-preserve'>{children}</span>
}));

jest.mock('next/dynamic', () => () => {
  return ({ register, dataAttribute, ...props }: any) => <div data-testid='accept-terms' {...props} />;
});

jest.mock('@/hooks/useTranslation', () => ({
  __esModule: true,
  default: () => ({
    t: (key: string) => key
  })
}));

const mockSignUpPassword = jest.fn();
const mockSignUpOidc = jest.fn(() => jest.fn());
const mockSignUpWithGoogle = jest.fn();
const mockRegister = jest.fn(() => ({}));

jest.mock('@/hooks/auth', () => ({
  useSignUp: jest.fn(() => ({
    register: mockRegister,
    signUpPassword: mockSignUpPassword,
    signUpOidc: mockSignUpOidc,
    signUpWithGoogle: mockSignUpWithGoogle,
    formState: {
      errors: { name: { message: 'Name is required' }, password: { message: 'Password is required' }, terms: { message: 'Terms are required' } },
      isSubmitting: false
    },
    serverError: null
  }))
}));

jest.mock('@/components/Form', () => {
  return ({ children, onSubmit, ...props }: any) => (
    <form onSubmit={onSubmit} {...props}>
      {children}
    </form>
  );
});

jest.mock('@/components/SignAuth/AuthMethodDivider', () => {
  return () => <div data-testid='auth-divider'>Divider</div>;
});

jest.mock('@/components/SignAuth/SocialAuthGroup', () => {
  return (props: any) => (
    <div data-testid='social-auth-group'>
      <button onClick={props.onGoogleClick} data-testid='google-btn'>
        Google
      </button>
      <button onClick={props.onMicrosoftClick} data-testid='microsoft-btn'>
        Microsoft
      </button>
    </div>
  );
});

jest.mock('@/features/errors', () => ({
  isSerializedError: jest.fn(() => false),
  getServerError: jest.fn(() => ({})),
  isFrontendApiError: jest.fn(() => false)
}));

jest.mock('@/utils/error.utils', () => ({
  getErrorMessageTranslated: jest.fn((msg: string) => msg)
}));

import { render, screen, fireEvent, waitFor } from '@testing-library/react';

import SignUpInvitationForm from '../SignUpInvitationForm';

describe('SignUpInvitationForm', () => {
  const defaultProps = {
    email: 'test@example.com',
    token: 'invitation-token'
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render without crashing', () => {
    render(<SignUpInvitationForm {...defaultProps} />);
    expect(screen.getByTestId('social-auth-group')).toBeInTheDocument();
  });

  it('should call signUpPassword on form submit', async () => {
    render(<SignUpInvitationForm {...defaultProps} />);

    const form = document.querySelector('form');
    if (form) {
      fireEvent.submit(form);
      await waitFor(() => {
        expect(mockSignUpPassword).toHaveBeenCalled();
      });
    }
  });

  it('should not show alert when there is no server error', () => {
    render(<SignUpInvitationForm {...defaultProps} />);
    expect(screen.queryByTestId('alert')).not.toBeInTheDocument();
  });

  it('should show alert when there is a server error', () => {
    const { useSignUp } = require('@/hooks/auth');
    useSignUp.mockReturnValueOnce({
      register: mockRegister,
      signUpPassword: mockSignUpPassword,
      signUpOidc: mockSignUpOidc,
      signUpWithGoogle: mockSignUpWithGoogle,
      formState: { errors: {}, isSubmitting: false },
      serverError: { message: 'Error occurred' }
    });

    render(<SignUpInvitationForm {...defaultProps} />);
    expect(screen.getByTestId('alert')).toBeInTheDocument();
  });

  it('should return mapped error from getServerError', () => {
    const { useSignUp } = require('@/hooks/auth');
    const { isSerializedError, getServerError } = require('@/features/errors');

    isSerializedError.mockReturnValue(true);
    getServerError.mockReturnValue({ SOME_ERROR: 'Mapped error message' });

    useSignUp.mockReturnValueOnce({
      register: mockRegister,
      signUpPassword: mockSignUpPassword,
      signUpOidc: mockSignUpOidc,
      signUpWithGoogle: mockSignUpWithGoogle,
      formState: { errors: {}, isSubmitting: false },
      serverError: { data: { code: 'SOME_ERROR', message: 'fallback' } }
    });

    render(<SignUpInvitationForm {...defaultProps} />);
    expect(screen.getByTestId('alert')).toHaveTextContent('Mapped error message');
  });

  it('should fallback to serverError.data.message for unknown errors', () => {
    const { useSignUp } = require('@/hooks/auth');
    const { isSerializedError, getServerError } = require('@/features/errors');

    isSerializedError.mockReturnValue(true);
    getServerError.mockReturnValue({});

    useSignUp.mockReturnValueOnce({
      register: mockRegister,
      signUpPassword: mockSignUpPassword,
      signUpOidc: mockSignUpOidc,
      signUpWithGoogle: mockSignUpWithGoogle,
      formState: { errors: {}, isSubmitting: false },
      serverError: { data: { code: 'UNKNOWN', message: 'Fallback message' } }
    });

    render(<SignUpInvitationForm {...defaultProps} />);
    expect(screen.getByTestId('alert')).toHaveTextContent('Fallback message');
  });

  it('should return SOMETHING_WENT_WRONG for non-serialized non-frontend errors', () => {
    const { useSignUp } = require('@/hooks/auth');
    const { isSerializedError, isFrontendApiError } = require('@/features/errors');

    isSerializedError.mockReturnValue(false);
    isFrontendApiError.mockReturnValue(false);

    useSignUp.mockReturnValueOnce({
      register: mockRegister,
      signUpPassword: mockSignUpPassword,
      signUpOidc: mockSignUpOidc,
      signUpWithGoogle: mockSignUpWithGoogle,
      formState: { errors: {}, isSubmitting: false },
      serverError: { message: 'Generic error' }
    });

    render(<SignUpInvitationForm {...defaultProps} />);
    expect(screen.getByTestId('alert')).toHaveTextContent('errorMessage.unknownError');
  });

  it('should handle frontend API error', () => {
    const { useSignUp } = require('@/hooks/auth');
    const { isSerializedError, isFrontendApiError, getServerError } = require('@/features/errors');

    isSerializedError.mockReturnValue(false);
    isFrontendApiError.mockReturnValue(true);
    getServerError.mockReturnValue({ API_ERROR: 'API error message' });

    useSignUp.mockReturnValueOnce({
      register: mockRegister,
      signUpPassword: mockSignUpPassword,
      signUpOidc: mockSignUpOidc,
      signUpWithGoogle: mockSignUpWithGoogle,
      formState: { errors: {}, isSubmitting: false },
      serverError: { message: 'fallback' }
    });

    render(<SignUpInvitationForm {...defaultProps} />);
    expect(screen.getByTestId('alert')).toHaveTextContent('fallback');
  });
});
