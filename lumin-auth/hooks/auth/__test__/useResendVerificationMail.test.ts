/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable sonarjs/no-duplicate-string */
import { renderHook } from '@testing-library/react';
import { act } from 'react-dom/test-utils';

import { useEnsureVerificationFlowMutation, useResendVerificationLinkMutation } from '@/features/account/verification-api-slice';

import useResendVerificationMail from '../useResendVerificationMail';

jest.mock('@/features/account/verification-api-slice', () => ({
  useEnsureVerificationFlowMutation: jest.fn(),
  useResendVerificationLinkMutation: jest.fn()
}));

const mockUseEnsureVerificationFlowMutation = useEnsureVerificationFlowMutation as jest.MockedFunction<typeof useEnsureVerificationFlowMutation>;
const mockUseResendVerificationLinkMutation = useResendVerificationLinkMutation as jest.MockedFunction<typeof useResendVerificationLinkMutation>;

describe('useResendVerificationMail', () => {
  const mockGetValues = jest.fn();
  let mockEnsureVerificationFlow: jest.Mock;
  let mockResendVerificationLink: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();

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

    mockEnsureVerificationFlow = jest.fn().mockResolvedValue({ id: 'verification-flow-id' });
    mockResendVerificationLink = jest.fn().mockResolvedValue({ data: { success: true } });

    mockUseEnsureVerificationFlowMutation.mockReturnValue([
      createMockMutation(mockEnsureVerificationFlow),
      { data: null, error: null, isLoading: false }
    ] as any);

    mockUseResendVerificationLinkMutation.mockReturnValue([mockResendVerificationLink, { isSuccess: false, error: null, isLoading: false }] as any);
  });

  describe('resendVerificationLink', () => {
    it('should call ensureVerificationFlow and resendVerificationLink when email exists', async () => {
      mockGetValues.mockReturnValue('test@example.com');

      const { result } = renderHook(() => useResendVerificationMail(mockGetValues));

      await act(async () => {
        await result.current.resendVerificationLink();
      });

      expect(mockEnsureVerificationFlow).toHaveBeenCalledWith({
        initial: null
      });
      expect(mockGetValues).toHaveBeenCalledWith('email');
      expect(mockResendVerificationLink).toHaveBeenCalledWith({
        flow: { id: 'verification-flow-id' },
        email: 'test@example.com'
      });
    });

    it('should not call resendVerificationLink when email is empty', async () => {
      mockGetValues.mockReturnValue('');

      const { result } = renderHook(() => useResendVerificationMail(mockGetValues));

      await act(async () => {
        await result.current.resendVerificationLink();
      });

      expect(mockEnsureVerificationFlow).toHaveBeenCalled();
      expect(mockGetValues).toHaveBeenCalledWith('email');
      expect(mockResendVerificationLink).not.toHaveBeenCalled();
    });

    it('should not call resendVerificationLink when email is null', async () => {
      mockGetValues.mockReturnValue(null);

      const { result } = renderHook(() => useResendVerificationMail(mockGetValues));

      await act(async () => {
        await result.current.resendVerificationLink();
      });

      expect(mockEnsureVerificationFlow).toHaveBeenCalled();
      expect(mockGetValues).toHaveBeenCalledWith('email');
      expect(mockResendVerificationLink).not.toHaveBeenCalled();
    });

    it('should use existing verificationFlow when available', async () => {
      mockGetValues.mockReturnValue('test@example.com');
      const existingFlow = { id: 'existing-flow-id' };
      // eslint-disable-next-line sonarjs/no-identical-functions
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
      const mockEnsureFlowWithUnwrap = createMockMutation(mockEnsureVerificationFlow);
      mockUseEnsureVerificationFlowMutation.mockReturnValue([mockEnsureFlowWithUnwrap, { data: existingFlow, error: null, isLoading: false }] as any);

      const { result } = renderHook(() => useResendVerificationMail(mockGetValues));

      await act(async () => {
        await result.current.resendVerificationLink();
      });

      expect(mockEnsureVerificationFlow).toHaveBeenCalledWith({
        initial: existingFlow
      });
    });
  });

  describe('return values', () => {
    it('should return isSuccess from resendVerificationLink mutation', () => {
      mockUseResendVerificationLinkMutation.mockReturnValue([mockResendVerificationLink, { isSuccess: true, error: null, isLoading: false }] as any);

      const { result } = renderHook(() => useResendVerificationMail(mockGetValues));

      expect(result.current.isSuccess).toBe(true);
    });

    it('should return serverError from ensureVerificationFlow when present', () => {
      const mockError = { message: 'Ensure verification error', code: 'ERROR_CODE' };
      mockUseEnsureVerificationFlowMutation.mockReturnValue([mockEnsureVerificationFlow, { data: null, error: mockError, isLoading: false }] as any);

      const { result } = renderHook(() => useResendVerificationMail(mockGetValues));

      expect(result.current.serverError).toEqual(mockError);
    });

    it('should return serverError from resendVerificationLink when present', () => {
      const mockError = { message: 'Resend error', code: 'RESEND_ERROR' };
      mockUseResendVerificationLinkMutation.mockReturnValue([mockResendVerificationLink, { isSuccess: false, error: mockError, isLoading: false }] as any);

      const { result } = renderHook(() => useResendVerificationMail(mockGetValues));

      expect(result.current.serverError).toEqual(mockError);
    });

    it('should return undefined when no errors', () => {
      const { result } = renderHook(() => useResendVerificationMail(mockGetValues));

      expect(result.current.serverError).toBeFalsy();
    });
  });
});
