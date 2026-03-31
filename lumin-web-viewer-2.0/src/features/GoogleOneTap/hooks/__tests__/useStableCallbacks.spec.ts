import { renderHook } from '@testing-library/react';

import { useStableCallbacks } from '../useStableCallbacks';
import { IUseGoogleOneTapLogin } from '../../types';

describe('useStableCallbacks', () => {
  const mockOnSuccess = jest.fn();
  const mockOnError = jest.fn();
  const mockGoogleAccountConfigs = {
    client_id: 'test-client-id',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('ref initialization', () => {
    it('should return refs for onSuccess, onError, and configs', () => {
      const { result } = renderHook(() =>
        useStableCallbacks({
          onSuccess: mockOnSuccess,
          onError: mockOnError,
          googleAccountConfigs: mockGoogleAccountConfigs,
        })
      );

      expect(result.current.onSuccessRef).toBeDefined();
      expect(result.current.onErrorRef).toBeDefined();
      expect(result.current.configsRef).toBeDefined();
    });

    it('should initialize refs with provided values', () => {
      const { result } = renderHook(() =>
        useStableCallbacks({
          onSuccess: mockOnSuccess,
          onError: mockOnError,
          googleAccountConfigs: mockGoogleAccountConfigs,
        })
      );

      expect(result.current.onSuccessRef.current).toBe(mockOnSuccess);
      expect(result.current.onErrorRef.current).toBe(mockOnError);
      expect(result.current.configsRef.current).toBe(mockGoogleAccountConfigs);
    });
  });

  describe('ref stability', () => {
    it('should maintain stable ref objects across rerenders', () => {
      const { result, rerender } = renderHook(() =>
        useStableCallbacks({
          onSuccess: mockOnSuccess,
          onError: mockOnError,
          googleAccountConfigs: mockGoogleAccountConfigs,
        })
      );

      const initialOnSuccessRef = result.current.onSuccessRef;
      const initialOnErrorRef = result.current.onErrorRef;
      const initialConfigsRef = result.current.configsRef;

      rerender();

      expect(result.current.onSuccessRef).toBe(initialOnSuccessRef);
      expect(result.current.onErrorRef).toBe(initialOnErrorRef);
      expect(result.current.configsRef).toBe(initialConfigsRef);
    });
  });

  describe('ref value updates', () => {
    it('should update onSuccessRef.current when onSuccess changes', () => {
      const newOnSuccess = jest.fn();

      const { result, rerender } = renderHook(
        (props: Pick<IUseGoogleOneTapLogin, 'onSuccess' | 'onError' | 'googleAccountConfigs'>) =>
          useStableCallbacks(props),
        {
          initialProps: {
            onSuccess: mockOnSuccess,
            onError: mockOnError,
            googleAccountConfigs: mockGoogleAccountConfigs,
          },
        }
      );

      expect(result.current.onSuccessRef.current).toBe(mockOnSuccess);

      rerender({
        onSuccess: newOnSuccess,
        onError: mockOnError,
        googleAccountConfigs: mockGoogleAccountConfigs,
      });

      expect(result.current.onSuccessRef.current).toBe(newOnSuccess);
    });

    it('should update onErrorRef.current when onError changes', () => {
      const newOnError = jest.fn();

      const { result, rerender } = renderHook(
        (props: Pick<IUseGoogleOneTapLogin, 'onSuccess' | 'onError' | 'googleAccountConfigs'>) =>
          useStableCallbacks(props),
        {
          initialProps: {
            onSuccess: mockOnSuccess,
            onError: mockOnError,
            googleAccountConfigs: mockGoogleAccountConfigs,
          },
        }
      );

      expect(result.current.onErrorRef.current).toBe(mockOnError);

      rerender({
        onSuccess: mockOnSuccess,
        onError: newOnError,
        googleAccountConfigs: mockGoogleAccountConfigs,
      });

      expect(result.current.onErrorRef.current).toBe(newOnError);
    });

    it('should update configsRef.current when googleAccountConfigs changes', () => {
      const newConfigs = { client_id: 'new-client-id' };

      const { result, rerender } = renderHook(
        (props: Pick<IUseGoogleOneTapLogin, 'onSuccess' | 'onError' | 'googleAccountConfigs'>) =>
          useStableCallbacks(props),
        {
          initialProps: {
            onSuccess: mockOnSuccess,
            onError: mockOnError,
            googleAccountConfigs: mockGoogleAccountConfigs,
          },
        }
      );

      expect(result.current.configsRef.current).toBe(mockGoogleAccountConfigs);

      rerender({
        onSuccess: mockOnSuccess,
        onError: mockOnError,
        googleAccountConfigs: newConfigs,
      });

      expect(result.current.configsRef.current).toBe(newConfigs);
    });
  });

  describe('undefined values', () => {
    it('should handle undefined onSuccess', () => {
      const { result } = renderHook(() =>
        useStableCallbacks({
          onSuccess: undefined,
          onError: mockOnError,
          googleAccountConfigs: mockGoogleAccountConfigs,
        })
      );

      expect(result.current.onSuccessRef.current).toBeUndefined();
    });

    it('should handle undefined onError', () => {
      const { result } = renderHook(() =>
        useStableCallbacks({
          onSuccess: mockOnSuccess,
          onError: undefined,
          googleAccountConfigs: mockGoogleAccountConfigs,
        })
      );

      expect(result.current.onErrorRef.current).toBeUndefined();
    });

    it('should update from defined to undefined', () => {
      const { result, rerender } = renderHook(
        (props: Pick<IUseGoogleOneTapLogin, 'onSuccess' | 'onError' | 'googleAccountConfigs'>) =>
          useStableCallbacks(props),
        {
          initialProps: {
            onSuccess: mockOnSuccess,
            onError: mockOnError,
            googleAccountConfigs: mockGoogleAccountConfigs,
          },
        }
      );

      expect(result.current.onSuccessRef.current).toBe(mockOnSuccess);

      rerender({
        onSuccess: undefined,
        onError: mockOnError,
        googleAccountConfigs: mockGoogleAccountConfigs,
      });

      expect(result.current.onSuccessRef.current).toBeUndefined();
    });
  });

  describe('complex configs', () => {
    it('should handle configs with multiple properties', () => {
      const complexConfigs = {
        client_id: 'test-client-id',
        nonce: 'test-nonce',
        context: 'signin',
        auto_select: true,
        cancel_on_tap_outside: false,
      };

      const { result } = renderHook(() =>
        useStableCallbacks({
          onSuccess: mockOnSuccess,
          onError: mockOnError,
          googleAccountConfigs: complexConfigs,
        })
      );

      expect(result.current.configsRef.current).toBe(complexConfigs);
      expect(result.current.configsRef.current?.client_id).toBe('test-client-id');
      expect(result.current.configsRef.current?.nonce).toBe('test-nonce');
    });
  });

  describe('multiple updates', () => {
    it('should handle multiple consecutive updates', () => {
      const callbacks = [jest.fn(), jest.fn(), jest.fn()];

      const { result, rerender } = renderHook(
        (props: Pick<IUseGoogleOneTapLogin, 'onSuccess' | 'onError' | 'googleAccountConfigs'>) =>
          useStableCallbacks(props),
        {
          initialProps: {
            onSuccess: callbacks[0],
            onError: mockOnError,
            googleAccountConfigs: mockGoogleAccountConfigs,
          },
        }
      );

      expect(result.current.onSuccessRef.current).toBe(callbacks[0]);

      rerender({
        onSuccess: callbacks[1],
        onError: mockOnError,
        googleAccountConfigs: mockGoogleAccountConfigs,
      });

      expect(result.current.onSuccessRef.current).toBe(callbacks[1]);

      rerender({
        onSuccess: callbacks[2],
        onError: mockOnError,
        googleAccountConfigs: mockGoogleAccountConfigs,
      });

      expect(result.current.onSuccessRef.current).toBe(callbacks[2]);
    });
  });
});

