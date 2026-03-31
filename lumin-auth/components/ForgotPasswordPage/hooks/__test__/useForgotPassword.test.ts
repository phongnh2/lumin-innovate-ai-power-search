/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable sonarjs/no-duplicate-string */
// eslint-disable-next-line import/order
import { renderHook, waitFor, act } from '@testing-library/react';

const mockPush = jest.fn();
jest.mock('next/router', () => ({
  useRouter: jest.fn(() => ({
    query: {},
    push: mockPush
  }))
}));

const mockEnsureFlow = jest.fn(() => ({
  unwrap: jest.fn().mockResolvedValue({ id: 'flow-id' })
}));
const mockRecoverPassword = jest.fn();

jest.mock('@/features/account/account-api-slice', () => ({
  useEnsureRecoveryFlowMutation: jest.fn(() => [mockEnsureFlow, { data: { id: 'flow-id' } }]),
  useGetRecoveryFlowQuery: jest.fn(() => ({ data: null })),
  useRecoverPasswordMutation: jest.fn(() => [mockRecoverPassword, { isSuccess: false, error: null }])
}));

const mockHandleSubmit = jest.fn((fn: any) => async (e?: any) => {
  e?.preventDefault?.();
  return fn({ email: 'test@example.com', token: 'recaptcha-token' });
});
const mockRegister = jest.fn(() => ({}));
const mockResetField = jest.fn();
const mockGetValues = jest.fn(() => ({ email: 'test@example.com', token: '' }));

jest.mock('@/lib/react-hook-form', () => ({
  useForm: jest.fn(() => ({
    handleSubmit: mockHandleSubmit,
    register: mockRegister,
    resetField: mockResetField,
    getValues: mockGetValues,
    formState: { errors: {}, isSubmitting: false }
  }))
}));

jest.mock('@/lib/logger', () => ({
  clientLogger: {
    error: jest.fn()
  }
}));

jest.mock('@/lib/ory', () => ({
  ValidationError: {
    fromSelfServiceFlow: jest.fn(() => ({
      messages: () => [{ message: 'Error message' }],
      flow: () => ({ expires_at: '', issued_at: '', state: '' })
    }))
  }
}));

import { useRouter } from 'next/router';

import useForgotPassword from '../useForgotPassword';

describe('useForgotPassword', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return hook values correctly', () => {
    const { result } = renderHook(() => useForgotPassword());

    expect(result.current.isSendEmailSuccess).toBe(false);
    expect(result.current.errorSendEmail).toBeNull();
    expect(result.current.formState).toBeDefined();
    expect(result.current.register).toBeDefined();
    expect(result.current.getValues).toBeDefined();
    expect(result.current.resetField).toBeDefined();
    expect(result.current.handleSubmit).toBeDefined();
  });

  it('should call ensureFlow on mount', () => {
    renderHook(() => useForgotPassword());

    expect(mockEnsureFlow).toHaveBeenCalled();
  });

  it('should pass returnTo to ensureFlow', () => {
    const mockRouter = useRouter as jest.Mock;
    mockRouter.mockReturnValueOnce({
      query: { return_to: '/dashboard' },
      push: mockPush
    });

    renderHook(() => useForgotPassword());

    expect(mockEnsureFlow).toHaveBeenCalledWith({ returnTo: '/dashboard' });
  });

  it('should call recoverPassword when form is submitted', async () => {
    const { result } = renderHook(() => useForgotPassword());

    await act(async () => {
      await result.current.handleSubmit();
    });

    await waitFor(() => {
      expect(mockEnsureFlow).toHaveBeenCalled();
      expect(mockRecoverPassword).toHaveBeenCalled();
    });
  });

  describe('isSendEmailSuccess', () => {
    it('should return true when recoverPassword succeeds', () => {
      const { useRecoverPasswordMutation } = require('@/features/account/account-api-slice');
      useRecoverPasswordMutation.mockReturnValueOnce([mockRecoverPassword, { isSuccess: true, error: null }]);

      const { result } = renderHook(() => useForgotPassword());

      expect(result.current.isSendEmailSuccess).toBe(true);
    });
  });

  it('should log error when existingFlow has validation error', async () => {
    const { useGetRecoveryFlowQuery } = require('@/features/account/account-api-slice');
    const { clientLogger } = require('@/lib/logger');

    const mockRouter = useRouter as jest.Mock;
    mockRouter.mockReturnValue({
      query: { flow: 'existing-flow-id' },
      push: mockPush
    });

    useGetRecoveryFlowQuery.mockReturnValueOnce({
      data: { id: 'existing-flow-id', state: 'failed' }
    });

    renderHook(() => useForgotPassword());

    await waitFor(() => {
      expect(clientLogger.error).toHaveBeenCalledWith(
        expect.objectContaining({
          reason: 'Recovery failed'
        })
      );
    });
  });
});
