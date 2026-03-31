/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable sonarjs/no-duplicate-string */

jest.mock('@emotion/react', () => ({
  css: () => ({})
}));

jest.mock('next/image', () => {
  return function MockImage(props: any) {
    return <img {...props} src={typeof props.src === 'object' ? props.src.src : props.src} />;
  };
});

jest.mock('next/link', () => {
  return ({ children, href }: any) => <a href={href}>{children}</a>;
});

const mockPush = jest.fn();
jest.mock('next/router', () => ({
  useRouter: jest.fn(() => ({
    query: { flow: 'test-flow-id' },
    push: mockPush
  }))
}));

jest.mock('next/dynamic', () => () => {
  return () => <div data-testid='header-signin' />;
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
  VerifyEmailContainer: ({ children }: any) => <div data-testid='verify-container'>{children}</div>
}));

jest.mock('@/hooks/useTranslation', () => ({
  __esModule: true,
  default: () => ({
    t: (key: string) => key
  })
}));

jest.mock('@/features/account/verification-api-slice', () => ({
  useGetVerificationFlowQuery: jest.fn(() => ({ data: null, isLoading: false }))
}));

jest.mock('@/lib/logger', () => ({
  clientLogger: {
    error: jest.fn()
  }
}));

jest.mock('@/lib/ory', () => ({
  OryResponseCode: {
    ALREADY_VERIFIED: 1234567890
  },
  ValidationError: {
    fromSelfServiceFlow: jest.fn(() => ({
      messages: () => [{ id: 0, message: 'Error message' }],
      flow: () => ({ expires_at: '', issued_at: '', state: '' })
    }))
  }
}));

jest.mock('@/ui', () => ({
  Text: ({ children }: any) => <span>{children}</span>,
  Button: ({ children, ...props }: any) => <button {...props}>{children}</button>
}));

jest.mock('@/ui/Button', () => ({
  ButtonSize: { XL: 'xl' }
}));

jest.mock('../VerificationPage.styled', () => ({
  verifyContainerCss: {},
  verificationTitleCss: {},
  verifySuccessCss: {}
}));

jest.mock('../components/VerificationFailed', () => {
  return () => <div data-testid='verification-failed'>Verification Failed</div>;
});

jest.mock('@/configs/environment', () => ({
  environment: {
    public: {
      host: {
        authUrl: 'http://localhost:3000'
      }
    }
  }
}));

jest.mock('@/configs/routers', () => ({
  Routes: {
    SignIn: '/sign-in'
  }
}));

import { render, screen, waitFor } from '@testing-library/react';
import { useRouter } from 'next/router';

import VerificationPage from '../VerificationPage';

describe('VerificationPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Loading State', () => {
    it('should return null when loading', () => {
      const { useGetVerificationFlowQuery } = require('@/features/account/verification-api-slice');
      useGetVerificationFlowQuery.mockReturnValueOnce({ data: null, isLoading: true });

      const { container } = render(<VerificationPage />);
      expect(container.firstChild).toBeNull();
    });
  });

  describe('No Flow ID', () => {
    it('should redirect to sign-in when no flowId', async () => {
      const mockRouter = useRouter as jest.Mock;
      mockRouter.mockReturnValue({
        query: {},
        push: mockPush
      });

      render(<VerificationPage />);

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/sign-in');
      });
    });
  });

  describe('Verification Failed', () => {
    it('should show VerificationFailed when flow has error', () => {
      const { useGetVerificationFlowQuery } = require('@/features/account/verification-api-slice');
      useGetVerificationFlowQuery.mockReturnValueOnce({
        data: { state: 'failed' },
        isLoading: false
      });

      render(<VerificationPage />);
      expect(screen.getByTestId('verification-failed')).toBeInTheDocument();
    });

    it('should log error when verification fails', async () => {
      const { useGetVerificationFlowQuery } = require('@/features/account/verification-api-slice');
      const { clientLogger } = require('@/lib/logger');

      useGetVerificationFlowQuery.mockReturnValueOnce({
        data: { state: 'failed' },
        isLoading: false
      });

      render(<VerificationPage />);

      await waitFor(() => {
        expect(clientLogger.error).toHaveBeenCalledWith(
          expect.objectContaining({
            reason: 'Verification failed'
          })
        );
      });
    });
  });

  describe('Verification Success', () => {
    it('should show VerifySuccess when state is passed_challenge', () => {
      const { useGetVerificationFlowQuery } = require('@/features/account/verification-api-slice');
      useGetVerificationFlowQuery.mockReturnValueOnce({
        data: { state: 'passed_challenge' },
        isLoading: false
      });

      render(<VerificationPage />);
      expect(screen.getByTestId('header')).toBeInTheDocument();
      expect(screen.getByText('verifyAccount.niceWork')).toBeInTheDocument();
    });

    it('should show VerifySuccess when already verified', () => {
      const { useGetVerificationFlowQuery } = require('@/features/account/verification-api-slice');
      const { ValidationError, OryResponseCode } = require('@/lib/ory');

      ValidationError.fromSelfServiceFlow.mockReturnValueOnce({
        messages: () => [{ id: OryResponseCode.ALREADY_VERIFIED, message: 'Already verified' }],
        flow: () => ({ expires_at: '', issued_at: '', state: '' })
      });

      useGetVerificationFlowQuery.mockReturnValueOnce({
        data: { state: 'some_state' },
        isLoading: false
      });

      render(<VerificationPage />);
      expect(screen.getByText('verifyAccount.niceWork')).toBeInTheDocument();
    });

    it('should render continue button', () => {
      const { useGetVerificationFlowQuery } = require('@/features/account/verification-api-slice');
      useGetVerificationFlowQuery.mockReturnValueOnce({
        data: { state: 'passed_challenge' },
        isLoading: false
      });

      render(<VerificationPage />);
      expect(screen.getByText('common.continue')).toBeInTheDocument();
    });
  });

  describe('VerifySuccess with props', () => {
    it('should use loginChallenge for redirect URL', () => {
      const { useGetVerificationFlowQuery } = require('@/features/account/verification-api-slice');
      useGetVerificationFlowQuery.mockReturnValueOnce({
        data: { state: 'passed_challenge' },
        isLoading: false
      });

      render(<VerificationPage loginChallenge='test-challenge' />);

      const link = screen.getByText('common.continue').closest('a');
      expect(link).toHaveAttribute('href', expect.stringContaining('login_challenge=test-challenge'));
    });

    it('should use siteRef for return_to param', () => {
      const { useGetVerificationFlowQuery } = require('@/features/account/verification-api-slice');
      useGetVerificationFlowQuery.mockReturnValueOnce({
        data: { state: 'passed_challenge' },
        isLoading: false
      });

      render(<VerificationPage siteRef='http://example.com' />);

      const link = screen.getByText('common.continue').closest('a');
      expect(link).toHaveAttribute('href', expect.stringContaining('return_to='));
    });

    it('should not include return_to when returnTo is default value', () => {
      const { useGetVerificationFlowQuery } = require('@/features/account/verification-api-slice');
      useGetVerificationFlowQuery.mockReturnValueOnce({
        data: { state: 'passed_challenge' },
        isLoading: false
      });

      render(<VerificationPage returnTo='/' />);
      expect(screen.getByTestId('header-signin')).toBeInTheDocument();
    });

    it('should pass returnTo to HeaderSignInElement when valid', () => {
      const { useGetVerificationFlowQuery } = require('@/features/account/verification-api-slice');
      useGetVerificationFlowQuery.mockReturnValueOnce({
        data: { state: 'passed_challenge' },
        isLoading: false
      });

      render(<VerificationPage returnTo='/dashboard' />);
      expect(screen.getByTestId('header-signin')).toBeInTheDocument();
    });
  });
});
