/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable sonarjs/no-duplicate-string */
/* eslint-disable unused-imports/no-unused-vars */
jest.mock('next/dynamic', () => () => {
  return ({ returnTo, ...props }: any) => <div data-testid='header-signin' {...props} />;
});

jest.mock('@/components/Header', () => ({
  Header: ({ right }: any) => (
    <div data-testid='header'>
      Header
      {right}
    </div>
  )
}));

jest.mock('@/components/SignAuth/Auth.styled', () => ({
  ForgotPasswordContainer: ({ children }: any) => <div data-testid='forgot-password-container'>{children}</div>
}));

jest.mock('@/hooks', () => ({
  useGetQueryValuesFromReturnTo: jest.fn(() => ({
    returnToValue: '/dashboard'
  }))
}));

const mockUseForgotPassword = {
  isSendEmailSuccess: false,
  errorSendEmail: null,
  formState: { errors: {}, isSubmitting: false },
  register: jest.fn(() => ({})),
  resetField: jest.fn(),
  handleSubmit: jest.fn(),
  getValues: jest.fn((field: string) => (field === 'email' ? 'test@example.com' : ''))
};

jest.mock('../hooks/useForgotPassword', () => ({
  __esModule: true,
  default: jest.fn(() => mockUseForgotPassword)
}));

jest.mock('../EmailSent', () => {
  return ({ email }: any) => <div data-testid='email-sent'>Email sent to {email}</div>;
});

jest.mock('../ForgotPassword', () => {
  return (props: any) => (
    <div data-testid='forgot-password-form'>
      <button onClick={props.handleSubmit} data-testid='submit-btn'>
        Submit
      </button>
      {props.error && <span data-testid='error'>{props.error.message}</span>}
    </div>
  );
});

import { render, screen } from '@testing-library/react';

import ForgotPasswordPage from '../ForgotPasswordPage';

describe('ForgotPasswordPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render EmailSent component when email sent successfully', () => {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const useForgotPassword = require('../hooks/useForgotPassword').default;
    useForgotPassword.mockReturnValueOnce({
      ...mockUseForgotPassword,
      isSendEmailSuccess: true,
      getValues: jest.fn((field: string) => (field === 'email' ? 'user@example.com' : ''))
    });

    render(<ForgotPasswordPage />);
    expect(screen.getByTestId('email-sent')).toBeInTheDocument();
    expect(screen.queryByTestId('forgot-password-form')).not.toBeInTheDocument();
  });
});
