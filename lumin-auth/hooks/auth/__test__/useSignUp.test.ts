/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable sonarjs/no-duplicate-string */
import { SerializedError } from '@reduxjs/toolkit';
import { FetchBaseQueryError } from '@reduxjs/toolkit/dist/query';
import { renderHook, waitFor } from '@testing-library/react';
import jwtDecode from 'jwt-decode';
import { useRouter } from 'next/router';
import { act } from 'react-dom/test-utils';

import { ElementName } from '@/constants/common';
import { EventCookieKey } from '@/constants/cookieKey';
import { SIGN_AUTH_METHOD } from '@/constants/signAuthMethod';
import { useEnsureRegistrationFlowMutation, useSignUpWithInvitationMutation } from '@/features/account/account-api-slice';
import { setVerificationEmail } from '@/features/account/account-slice';
import { useEnsureLoginFlowMutation, useLoginOidcMutation } from '@/features/account/sign-in-api-slice';
import { closeElement, openElement } from '@/features/visibility-slice';
import { OryProvider } from '@/interfaces/ory';
import { buttonEvent } from '@/lib/factory/button.event';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { clientLogger } from '@/lib/logger';
import { useForm } from '@/lib/react-hook-form';
import { getVerificationEmail } from '@/selectors';
import CookieUtils from '@/utils/cookie.utils';

import useSignUp from '../useSignUp';

jest.mock('next/router', () => ({
  useRouter: jest.fn()
}));

jest.mock('@/features/account/account-api-slice', () => ({
  useEnsureRegistrationFlowMutation: jest.fn(),
  useSignUpWithInvitationMutation: jest.fn()
}));

jest.mock('@/features/account/sign-in-api-slice', () => ({
  useEnsureLoginFlowMutation: jest.fn(),
  useLoginOidcMutation: jest.fn()
}));

jest.mock('@/features/account/account-slice', () => ({
  setVerificationEmail: jest.fn((email: string) => ({ type: 'SET_VERIFICATION_EMAIL', payload: email }))
}));

jest.mock('@/features/visibility-slice', () => ({
  openElement: jest.fn((element: string) => ({ type: 'OPEN_ELEMENT', payload: element })),
  closeElement: jest.fn((element: string) => ({ type: 'CLOSE_ELEMENT', payload: element }))
}));

jest.mock('@/lib/hooks', () => ({
  useAppDispatch: jest.fn(),
  useAppSelector: jest.fn()
}));

jest.mock('@/lib/react-hook-form', () => ({
  useForm: jest.fn()
}));

jest.mock('@/selectors', () => ({
  getVerificationEmail: jest.fn()
}));

jest.mock('@/utils/cookie.utils', () => ({
  __esModule: true,
  default: {
    set: jest.fn(),
    setAuthEventCookie: jest.fn()
  }
}));

jest.mock('@/utils/getLanguage', () => ({
  getFullPathWithLanguageFromUrl: jest.fn().mockReturnValue('/en')
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

jest.mock('jwt-decode', () => ({
  __esModule: true,
  default: jest.fn()
}));

jest.mock('@/configs/environment', () => ({
  environment: {
    public: {
      host: {
        appUrl: 'http://localhost:3000'
      }
    }
  }
}));

const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;
const mockUseEnsureRegistrationFlowMutation = useEnsureRegistrationFlowMutation as jest.MockedFunction<typeof useEnsureRegistrationFlowMutation>;
const mockUseSignUpWithInvitationMutation = useSignUpWithInvitationMutation as jest.MockedFunction<typeof useSignUpWithInvitationMutation>;
const mockUseEnsureLoginFlowMutation = useEnsureLoginFlowMutation as jest.MockedFunction<typeof useEnsureLoginFlowMutation>;
const mockUseLoginOidcMutation = useLoginOidcMutation as jest.MockedFunction<typeof useLoginOidcMutation>;
const mockUseAppDispatch = useAppDispatch as jest.MockedFunction<typeof useAppDispatch>;
const mockUseAppSelector = useAppSelector as jest.MockedFunction<typeof useAppSelector>;
const mockUseForm = useForm as jest.MockedFunction<typeof useForm>;
const mockGetVerificationEmail = getVerificationEmail as jest.MockedFunction<typeof getVerificationEmail>;
const mockCookieUtils = CookieUtils as jest.Mocked<typeof CookieUtils>;
const mockButtonEvent = buttonEvent as jest.Mocked<typeof buttonEvent>;
const mockClientLogger = clientLogger as jest.Mocked<typeof clientLogger>;
const mockJwtDecode = jwtDecode as jest.MockedFunction<typeof jwtDecode>;

describe('useSignUp', () => {
  const mockDispatch = jest.fn();
  const mockRouter = {
    query: {},
    replace: jest.fn(),
    push: jest.fn()
  };
  const mockRegister = jest.fn();
  const mockHandleSubmit = jest.fn((fn: any) => fn);
  const mockFormState = { errors: {}, isSubmitting: false };
  const defaultProps = {
    token: 'test-token',
    defaultValues: {
      email: 'test@example.com',
      name: 'Test User',
      password: 'password123'
    }
  };

  let mockEnsureRegistrationFlow: jest.Mock;
  let mockSignUpWithInvitation: jest.Mock;
  let mockEnsureFlow: jest.Mock;
  let mockLoginOidc: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseRouter.mockReturnValue(mockRouter as any);
    mockUseAppDispatch.mockReturnValue(mockDispatch);
    mockUseAppSelector.mockImplementation((selector: any) => {
      if (selector === mockGetVerificationEmail) {
        return selector({ account: { verificationEmail: null } });
      }
      return null;
    });
    mockGetVerificationEmail.mockReturnValue(null);
    mockUseForm.mockReturnValue({
      handleSubmit: mockHandleSubmit,
      register: mockRegister,
      formState: mockFormState
    } as any);
    const createMockMutation = (mockFn: jest.Mock) => {
      const mutationFn = jest.fn((...args: any[]) => {
        const result = mockFn(...args);
        return {
          unwrap: jest.fn().mockResolvedValue(result)
        };
      });
      (mutationFn as any).unwrap = jest.fn();
      return mutationFn;
    };

    mockEnsureRegistrationFlow = jest.fn().mockResolvedValue({ id: 'flow-id' });
    mockSignUpWithInvitation = jest.fn().mockResolvedValue({ success: true });
    mockEnsureFlow = jest.fn().mockResolvedValue({ id: 'login-flow-id' });
    mockLoginOidc = jest.fn().mockResolvedValue({ success: true });

    mockUseEnsureRegistrationFlowMutation.mockReturnValue([
      createMockMutation(mockEnsureRegistrationFlow),
      { data: null, error: null, isLoading: false }
    ] as any);

    mockUseSignUpWithInvitationMutation.mockReturnValue([createMockMutation(mockSignUpWithInvitation), { error: null, isLoading: false }] as any);

    mockUseEnsureLoginFlowMutation.mockReturnValue([createMockMutation(mockEnsureFlow), { data: null, error: null, isLoading: false }] as any);

    mockUseLoginOidcMutation.mockReturnValue([mockLoginOidc, { error: null, isLoading: false }] as any);

    Object.defineProperty(window, 'location', {
      value: {
        origin: 'http://localhost:3000',
        pathname: '/sign-up'
      },
      writable: true
    });
  });

  describe('initialization', () => {
    it('should return hook values correctly', () => {
      const { result } = renderHook(() => useSignUp(defaultProps));

      expect(result.current.register).toBe(mockRegister);
      expect(result.current.formState).toBe(mockFormState);
      expect(result.current.signUpPassword).toBeDefined();
      expect(result.current.signUpWithGoogle).toBeDefined();
      expect(result.current.signUpOidc).toBeDefined();
    });
  });

  describe('signUpPassword', () => {
    it('should handle successful sign up with password', async () => {
      const { result } = renderHook(() => useSignUp(defaultProps));

      await act(async () => {
        await result.current.signUpPassword({
          email: 'test@example.com',
          name: 'Test User',
          password: 'password123'
        } as any);
      });

      expect(mockDispatch).toHaveBeenCalledWith(openElement(ElementName.LUMIN_LOADING));
      expect(mockEnsureRegistrationFlow).toHaveBeenCalled();
      expect(mockSignUpWithInvitation).toHaveBeenCalled();
      expect(mockCookieUtils.set).toHaveBeenCalledWith({
        name: EventCookieKey.USER_SIGN_UP_USERNAME_PASSWORD,
        value: JSON.stringify({
          method: SIGN_AUTH_METHOD.UserName,
          url: 'http://localhost:3000/sign-up'
        })
      });
      expect(mockCookieUtils.setAuthEventCookie).toHaveBeenCalledWith(SIGN_AUTH_METHOD.UserName);
      expect(mockDispatch).toHaveBeenCalledWith(setVerificationEmail('test@example.com'));
    });

    it('should handle sign up with return_to query parameter', async () => {
      mockRouter.query = { return_to: '/dashboard' };
      const { result } = renderHook(() => useSignUp(defaultProps));

      await act(async () => {
        await result.current.signUpPassword({
          email: 'test@example.com',
          name: 'Test User',
          password: 'password123'
        } as any);
      });

      expect(mockEnsureRegistrationFlow).toHaveBeenCalledWith({
        initial: null,
        ref: encodeURIComponent('/dashboard')
      });
    });

    it('should throw error when token is missing', async () => {
      const { result } = renderHook(() => useSignUp({ ...defaultProps, token: '' }));

      await act(async () => {
        await result.current.signUpPassword({
          email: 'test@example.com',
          name: 'Test User',
          password: 'password123'
        } as any);
      });

      expect(mockDispatch).toHaveBeenCalledWith(closeElement(ElementName.LUMIN_LOADING));
      expect(mockClientLogger.error).toHaveBeenCalled();
    });

    it('should handle error when ensureRegistrationFlow fails', async () => {
      const error = new Error('Registration flow error');
      const mockMutationWithError = jest.fn().mockReturnValue({
        unwrap: jest.fn().mockRejectedValue(error)
      });
      mockUseEnsureRegistrationFlowMutation.mockReturnValueOnce([mockMutationWithError, { data: null, error: null, isLoading: false }] as any);

      const { result } = renderHook(() => useSignUp(defaultProps));

      await act(async () => {
        await result.current.signUpPassword({
          email: 'test@example.com',
          name: 'Test User',
          password: 'password123'
        } as any);
      });

      expect(mockDispatch).toHaveBeenCalledWith(closeElement(ElementName.LUMIN_LOADING));
      expect(mockClientLogger.error).toHaveBeenCalled();
    });

    it('should handle error when signUpWithInvitation fails', async () => {
      const error = new Error('Sign up error');
      const mockMutationWithError = jest.fn().mockReturnValue({
        unwrap: jest.fn().mockRejectedValue(error)
      });
      mockUseSignUpWithInvitationMutation.mockReturnValueOnce([mockMutationWithError, { error: null, isLoading: false }] as any);

      const { result } = renderHook(() => useSignUp(defaultProps));

      await act(async () => {
        await result.current.signUpPassword({
          email: 'test@example.com',
          name: 'Test User',
          password: 'password123'
        } as any);
      });

      expect(mockDispatch).toHaveBeenCalledWith(closeElement(ElementName.LUMIN_LOADING));
      expect(mockClientLogger.error).toHaveBeenCalled();
    });
  });

  describe('signUpOidc', () => {
    it('should handle OIDC sign up with event', async () => {
      const mockEvent = { preventDefault: jest.fn() } as any;
      const { result } = renderHook(() => useSignUp(defaultProps));

      await act(async () => {
        const signUpOidcFn = result.current.signUpOidc({
          provider: OryProvider.Google,
          loginHint: 'test@example.com'
        });
        await signUpOidcFn(mockEvent);
      });

      expect(mockButtonEvent.signInOidc).toHaveBeenCalledWith({
        e: mockEvent,
        isSignIn: true
      });
      expect(mockEnsureFlow).toHaveBeenCalled();
      expect(mockLoginOidc).toHaveBeenCalled();
      expect(mockCookieUtils.setAuthEventCookie).toHaveBeenCalledWith(SIGN_AUTH_METHOD.google);
    });

    it('should handle OIDC sign up without event', async () => {
      const { result } = renderHook(() => useSignUp(defaultProps));

      await act(async () => {
        const signUpOidcFn = result.current.signUpOidc({
          provider: OryProvider.Microsoft,
          loginHint: 'test@example.com'
        });
        await signUpOidcFn(null);
      });

      expect(mockButtonEvent.signInOidc).not.toHaveBeenCalled();
      expect(mockEnsureFlow).toHaveBeenCalled();
      expect(mockLoginOidc).toHaveBeenCalled();
      expect(mockCookieUtils.setAuthEventCookie).toHaveBeenCalledWith(SIGN_AUTH_METHOD.microsoft);
    });
  });

  describe('signUpWithGoogle', () => {
    it('should decode JWT and call signUpOidc', async () => {
      const mockCredential = 'jwt-token';
      const decodedToken = { email: 'test@example.com' };
      mockJwtDecode.mockReturnValue(decodedToken);

      const { result } = renderHook(() => useSignUp(defaultProps));

      await act(async () => {
        await result.current.signUpWithGoogle({ credential: mockCredential });
      });

      expect(mockJwtDecode).toHaveBeenCalledWith(mockCredential);
      expect(mockEnsureFlow).toHaveBeenCalled();
      expect(mockLoginOidc).toHaveBeenCalledWith({
        flow: { id: 'login-flow-id' },
        provider: OryProvider.Google,
        hintEmail: 'test@example.com'
      });
    });
  });

  describe('useEffect - verificationEmail', () => {
    it('should redirect to verify-account when verificationEmail is set', async () => {
      mockGetVerificationEmail.mockReturnValue('test@example.com');
      mockUseAppSelector.mockImplementation((selector: any) => {
        if (selector === mockGetVerificationEmail) {
          return 'test@example.com';
        }
        return null;
      });

      renderHook(() => useSignUp(defaultProps));

      await waitFor(() => {
        expect(mockRouter.replace).toHaveBeenCalledWith(
          expect.objectContaining({
            pathname: '/verify-account'
          })
        );
        expect(mockDispatch).toHaveBeenCalledWith(closeElement(ElementName.LUMIN_LOADING));
      });
    });

    it('should not redirect when verificationEmail is null', () => {
      mockGetVerificationEmail.mockReturnValue(null);
      mockUseAppSelector.mockImplementation((selector: any) => {
        if (selector === mockGetVerificationEmail) {
          return null;
        }
        return null;
      });

      renderHook(() => useSignUp(defaultProps));

      expect(mockRouter.replace).not.toHaveBeenCalled();
    });
  });

  describe('serverError', () => {
    it('should return signUpInvitationError when present', () => {
      const mockError: FetchBaseQueryError = {
        status: 400,
        data: { message: 'Sign up error' }
      };
      mockUseSignUpWithInvitationMutation.mockReturnValue([mockSignUpWithInvitation, { error: mockError, isLoading: false }] as any);

      const { result } = renderHook(() => useSignUp(defaultProps));

      expect(result.current.serverError).toEqual(mockError);
    });

    it('should return ensureSignUpError when present', () => {
      const mockError: SerializedError = {
        name: 'Error',
        message: 'Ensure sign up error'
      };
      mockUseEnsureRegistrationFlowMutation.mockReturnValue([mockEnsureRegistrationFlow, { data: null, error: mockError, isLoading: false }] as any);

      const { result } = renderHook(() => useSignUp(defaultProps));

      expect(result.current.serverError).toEqual(mockError);
    });

    it('should return undefined when no errors', () => {
      const { result } = renderHook(() => useSignUp(defaultProps));

      expect(result.current.serverError).toBeNull();
    });
  });
});
