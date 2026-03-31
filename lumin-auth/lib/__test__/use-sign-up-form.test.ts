/* eslint-disable sonarjs/no-duplicate-string */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { renderHook, act } from '@testing-library/react';
import { useRouter } from 'next/router';

import { ElementName } from '@/constants/common';
import { OAUTH2_CHALLENGE } from '@/constants/sessionKey';
import { SOCKET_EMIT } from '@/constants/socket';
import { DEFAULT_RETURN_TO_VALUE } from '@/constants/url';
import { useEnsureRegistrationFlowMutation, useSignUpMutation, useSignUpOidcMutation } from '@/features/account/account-api-slice';
import { setLoginChallenge } from '@/features/oauth2/oauth2-slice';
import { closeElement, openElement } from '@/features/visibility-slice';
import { useGetQueryValuesFromReturnTo } from '@/hooks';
import useVerifyAuthencationMethod from '@/hooks/useVerifyAuthenticationMethod';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';

import { authEvent } from '../factory/auth.event';
import { buttonEvent } from '../factory/button.event';
import socket from '../socket';
import { useSignUpForm } from '../use-sign-up-form';

jest.mock('@/lib/jwt', () => ({
  JWTService: jest.fn().mockImplementation(() => ({
    sign: jest.fn(),
    verify: jest.fn()
  }))
}));

jest.mock('../factory/button.event', () => ({
  buttonEvent: {
    signInOidc: jest.fn()
  }
}));

jest.mock('../factory/auth.event', () => ({
  authEvent: {
    signUp: jest.fn()
  }
}));

jest.mock('next/router', () => ({
  useRouter: jest.fn()
}));

jest.mock('@/lib/hooks', () => ({
  useAppDispatch: jest.fn(),
  useAppSelector: jest.fn()
}));

jest.mock('@/hooks/useVerifyAuthenticationMethod');
jest.mock('@/hooks');

jest.mock('@/features/account/account-api-slice');
jest.mock('../socket', () => ({
  emit: jest.fn()
}));

jest.mock('@/lib/react-hook-form', () => ({
  useForm: () => ({
    register: jest.fn(),
    handleSubmit: (fn: any) => fn,
    watch: jest.fn(),
    getValues: jest.fn(() => ({ email: 'test@mail.com' })),
    formState: { errors: {} }
  })
}));

const dispatch = jest.fn();
const replace = jest.fn();

const ensureFlow = jest.fn().mockReturnValue({
  unwrap: () => Promise.resolve('new-flow')
});

const signUp = jest.fn();
const signUpOidc = jest.fn();

describe('useSignUpForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    (useRouter as jest.Mock).mockReturnValue({
      query: {},
      replace
    });

    (useAppDispatch as jest.Mock).mockReturnValue(dispatch);
    (useAppSelector as jest.Mock).mockReturnValue(null);

    (useEnsureRegistrationFlowMutation as jest.Mock).mockReturnValue([ensureFlow, { data: 'flow' }]);

    (useSignUpMutation as jest.Mock).mockReturnValue([signUp, { isSuccess: false, error: null, data: null }]);

    (useSignUpOidcMutation as jest.Mock).mockReturnValue([signUpOidc, { error: null }]);

    (useVerifyAuthencationMethod as jest.Mock).mockReturnValue({
      error: null
    });

    (useGetQueryValuesFromReturnTo as jest.Mock).mockReturnValue({
      returnToValue: '',
      returnToParams: {}
    });
  });

  it('should use fromQuery in getFromAttributes when fromQuery exists', () => {
    (useRouter as jest.Mock).mockReturnValue({
      query: { from: 'from-query' },
      replace
    });
    (useSignUpMutation as jest.Mock).mockReturnValue([jest.fn(), { isSuccess: true, error: null, data: { id: 'ory-id' } }]);

    renderHook(() => useSignUpForm());

    expect(authEvent.signUp).toHaveBeenCalledWith(
      expect.objectContaining({
        from: 'from-query'
      })
    );
  });

  it('should use from param when fromQuery does not exist', () => {
    (useRouter as jest.Mock).mockReturnValue({
      query: {},
      replace
    });

    (useGetQueryValuesFromReturnTo as jest.Mock).mockReturnValue({
      returnToValue: '',
      returnToParams: { from: 'from-param' }
    });

    (useSignUpMutation as jest.Mock).mockReturnValue([jest.fn(), { isSuccess: true, error: null, data: { id: 'ory-id' } }]);

    renderHook(() => useSignUpForm());

    expect(authEvent.signUp).toHaveBeenCalledWith(
      expect.objectContaining({
        from: 'from-param'
      })
    );
  });

  it('should handle event and loginChallenge in signInOidc', async () => {
    const fakeEvent = { preventDefault: jest.fn() };

    (useAppSelector as jest.Mock).mockReturnValue('challenge-123');

    const setItemSpy = jest.spyOn(Storage.prototype, 'setItem');

    const { result } = renderHook(() => useSignUpForm());

    await act(async () => {
      await result.current.signInOidc('google' as any)(fakeEvent as any);
    });

    expect(buttonEvent.signInOidc).toHaveBeenCalled();
    expect(setItemSpy).toHaveBeenCalledWith(OAUTH2_CHALLENGE, 'challenge-123');
  });

  it('should encode currentReturnTo into signUpRef', () => {
    (useGetQueryValuesFromReturnTo as jest.Mock).mockReturnValue({
      returnToValue: '/dashboard?tab=profile&mode=edit',
      returnToParams: {}
    });

    renderHook(() => useSignUpForm());

    expect(ensureFlow).toHaveBeenCalledWith(
      expect.objectContaining({
        ref: encodeURIComponent('/dashboard?tab=profile&mode=edit')
      })
    );
  });

  it('should convert flowQuery to string when flowQuery exists', () => {
    (useRouter as jest.Mock).mockReturnValue({
      query: { flow: 'flow-id-123' },
      replace
    });

    renderHook(() => useSignUpForm());

    expect(useEnsureRegistrationFlowMutation).toHaveBeenCalled();

    expect(ensureFlow).toHaveBeenCalledWith(
      expect.objectContaining({
        initialId: 'flow-id-123'
      })
    );
  });

  it('should return platform from query when platform is string', async () => {
    (useRouter as jest.Mock).mockReturnValue({
      query: { platform: 'web' },
      replace
    });

    const { result } = renderHook(() => useSignUpForm());

    await act(async () => {
      await result.current.submitSignUp({
        email: 'test@mail.com',
        password: '123456',
        name: 'Test'
      } as any);
    });

    expect(signUp).toHaveBeenCalledWith(
      expect.objectContaining({
        platform: 'web'
      })
    );
  });

  it('should init registration flow', () => {
    renderHook(() => useSignUpForm());

    expect(ensureFlow).toHaveBeenCalledWith({
      initialId: null,
      returnTo: DEFAULT_RETURN_TO_VALUE,
      ref: ''
    });
  });

  it('should submit signup successfully', async () => {
    const { result } = renderHook(() => useSignUpForm());

    await act(async () => {
      await result.current.submitSignUp({
        email: 'test@mail.com',
        password: '123456',
        name: 'Test'
      } as any);
    });

    expect(dispatch).toHaveBeenCalledWith(openElement(ElementName.LUMIN_LOADING));
    expect(signUp).toHaveBeenCalled();
  });

  it('should set verification email on signup success', () => {
    (useSignUpMutation as jest.Mock).mockReturnValue([jest.fn(), { isSuccess: true, error: null, data: { id: 'ory-id' } }]);

    renderHook(() => useSignUpForm());

    expect(dispatch).toHaveBeenCalled();
  });

  it('should redirect to verify-account when verificationEmail exists', () => {
    (useAppSelector as jest.Mock).mockReturnValue('test@mail.com');

    renderHook(() => useSignUpForm());

    expect(replace).toHaveBeenCalled();
    expect(dispatch).toHaveBeenCalledWith(closeElement(ElementName.LUMIN_LOADING));
  });

  it('should handle signInOidc', async () => {
    const { result } = renderHook(() => useSignUpForm());

    await act(async () => {
      await result.current.signInOidc('google' as any)(null);
    });

    expect(dispatch).toHaveBeenCalledWith(openElement(ElementName.LUMIN_LOADING));
    expect(signUpOidc).toHaveBeenCalled();
    expect(socket.emit).toHaveBeenCalledWith(SOCKET_EMIT.User.SignIn);
  });

  it('should close loading on error', () => {
    (useVerifyAuthencationMethod as jest.Mock).mockReturnValue({
      error: {
        data: {
          meta: { loginChallenge: 'challenge' }
        }
      }
    });

    renderHook(() => useSignUpForm());

    expect(dispatch).toHaveBeenCalledWith(setLoginChallenge('challenge'));
    expect(dispatch).toHaveBeenCalledWith(closeElement(ElementName.LUMIN_LOADING));
  });
});
