import { renderHook } from '@testing-library/react';

import { useGoogleOneTapPrompt } from '../useGoogleOneTapPrompt';
import { SCRIPT_INITIALIZED_FLAG } from '../../constants';

describe('useGoogleOneTapPrompt', () => {
  const mockPrompt = jest.fn();
  const mockCancel = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    delete (window as unknown as Record<string, unknown>)[SCRIPT_INITIALIZED_FLAG];
    (window as unknown as Record<string, unknown>).google = {
      accounts: {
        id: {
          prompt: mockPrompt,
          cancel: mockCancel,
        },
      },
    };
  });

  afterEach(() => {
    delete (window as unknown as Record<string, unknown>)[SCRIPT_INITIALIZED_FLAG];
    delete (window as unknown as Record<string, unknown>).google;
  });

  describe('prompt display', () => {
    it('should show prompt when Google is ready and script is initialized', () => {
      (window as unknown as Record<string, unknown>)[SCRIPT_INITIALIZED_FLAG] = true;

      renderHook(() =>
        useGoogleOneTapPrompt({ isGoogleReady: true, disabled: false, disableCancelOnUnmount: false })
      );

      expect(mockPrompt).toHaveBeenCalledTimes(1);
    });

    it('should not show prompt when Google is not ready', () => {
      (window as unknown as Record<string, unknown>)[SCRIPT_INITIALIZED_FLAG] = true;

      renderHook(() =>
        useGoogleOneTapPrompt({ isGoogleReady: false, disabled: false, disableCancelOnUnmount: false })
      );

      expect(mockPrompt).not.toHaveBeenCalled();
    });

    it('should not show prompt when script is not initialized', () => {
      renderHook(() =>
        useGoogleOneTapPrompt({ isGoogleReady: true, disabled: false, disableCancelOnUnmount: false })
      );

      expect(mockPrompt).not.toHaveBeenCalled();
    });

    it('should not show prompt when disabled is true', () => {
      (window as unknown as Record<string, unknown>)[SCRIPT_INITIALIZED_FLAG] = true;

      renderHook(() =>
        useGoogleOneTapPrompt({ isGoogleReady: true, disabled: true, disableCancelOnUnmount: false })
      );

      expect(mockPrompt).not.toHaveBeenCalled();
    });
  });

  describe('prompt cancellation when disabled', () => {
    it('should cancel prompt when disabled becomes true', () => {
      (window as unknown as Record<string, unknown>)[SCRIPT_INITIALIZED_FLAG] = true;

      renderHook(() =>
        useGoogleOneTapPrompt({ isGoogleReady: true, disabled: true, disableCancelOnUnmount: false })
      );

      expect(mockCancel).toHaveBeenCalledTimes(1);
      expect(mockPrompt).not.toHaveBeenCalled();
    });

    it('should not cancel when not initialized', () => {
      renderHook(() =>
        useGoogleOneTapPrompt({ isGoogleReady: true, disabled: true, disableCancelOnUnmount: false })
      );

      expect(mockCancel).not.toHaveBeenCalled();
    });
  });

  describe('cleanup on unmount', () => {
    it('should cancel prompt on unmount by default', () => {
      (window as unknown as Record<string, unknown>)[SCRIPT_INITIALIZED_FLAG] = true;

      const { unmount } = renderHook(() =>
        useGoogleOneTapPrompt({ isGoogleReady: true, disabled: false, disableCancelOnUnmount: false })
      );

      expect(mockPrompt).toHaveBeenCalledTimes(1);
      mockCancel.mockClear();

      unmount();

      expect(mockCancel).toHaveBeenCalledTimes(1);
    });

    it('should not cancel prompt on unmount when disableCancelOnUnmount is true', () => {
      (window as unknown as Record<string, unknown>)[SCRIPT_INITIALIZED_FLAG] = true;

      const { unmount } = renderHook(() =>
        useGoogleOneTapPrompt({ isGoogleReady: true, disabled: false, disableCancelOnUnmount: true })
      );

      expect(mockPrompt).toHaveBeenCalledTimes(1);
      mockCancel.mockClear();

      unmount();

      expect(mockCancel).not.toHaveBeenCalled();
    });
  });

  describe('state transitions', () => {
    it('should show prompt when transitioning from not ready to ready', () => {
      (window as unknown as Record<string, unknown>)[SCRIPT_INITIALIZED_FLAG] = true;

      const { rerender } = renderHook(
        ({ isGoogleReady, disabled }) =>
          useGoogleOneTapPrompt({ isGoogleReady, disabled, disableCancelOnUnmount: false }),
        { initialProps: { isGoogleReady: false, disabled: false } }
      );

      expect(mockPrompt).not.toHaveBeenCalled();

      rerender({ isGoogleReady: true, disabled: false });

      expect(mockPrompt).toHaveBeenCalledTimes(1);
    });

    it('should cancel prompt when transitioning from enabled to disabled', () => {
      (window as unknown as Record<string, unknown>)[SCRIPT_INITIALIZED_FLAG] = true;

      const { rerender } = renderHook(
        ({ isGoogleReady, disabled }) =>
          useGoogleOneTapPrompt({ isGoogleReady, disabled, disableCancelOnUnmount: false }),
        { initialProps: { isGoogleReady: true, disabled: false } }
      );

      expect(mockPrompt).toHaveBeenCalledTimes(1);
      mockCancel.mockClear();

      rerender({ isGoogleReady: true, disabled: true });

      expect(mockCancel).toHaveBeenCalled();
    });

    it('should show prompt again when transitioning from disabled to enabled', () => {
      (window as unknown as Record<string, unknown>)[SCRIPT_INITIALIZED_FLAG] = true;

      const { rerender } = renderHook(
        ({ isGoogleReady, disabled }) =>
          useGoogleOneTapPrompt({ isGoogleReady, disabled, disableCancelOnUnmount: false }),
        { initialProps: { isGoogleReady: true, disabled: true } }
      );

      expect(mockCancel).toHaveBeenCalledTimes(1);
      mockPrompt.mockClear();
      mockCancel.mockClear();

      rerender({ isGoogleReady: true, disabled: false });

      expect(mockPrompt).toHaveBeenCalledTimes(1);
    });
  });

  describe('edge cases', () => {
    it('should handle google object being undefined safely', () => {
      (window as unknown as Record<string, unknown>)[SCRIPT_INITIALIZED_FLAG] = true;
      delete (window as unknown as Record<string, unknown>).google;

      expect(() => {
        renderHook(() =>
          useGoogleOneTapPrompt({ isGoogleReady: true, disabled: true, disableCancelOnUnmount: false })
        );
      }).not.toThrow();
    });

    it('should handle google.accounts being undefined safely', () => {
      (window as unknown as Record<string, unknown>)[SCRIPT_INITIALIZED_FLAG] = true;
      (window as unknown as Record<string, unknown>).google = {};

      expect(() => {
        renderHook(() =>
          useGoogleOneTapPrompt({ isGoogleReady: true, disabled: true, disableCancelOnUnmount: false })
        );
      }).not.toThrow();
    });

    it('should handle multiple rerenders correctly', () => {
      (window as unknown as Record<string, unknown>)[SCRIPT_INITIALIZED_FLAG] = true;

      const { rerender } = renderHook(
        ({ isGoogleReady, disabled }) =>
          useGoogleOneTapPrompt({ isGoogleReady, disabled, disableCancelOnUnmount: false }),
        { initialProps: { isGoogleReady: true, disabled: false } }
      );

      expect(mockPrompt).toHaveBeenCalledTimes(1);

      rerender({ isGoogleReady: true, disabled: false });
      rerender({ isGoogleReady: true, disabled: false });

      expect(mockPrompt).toHaveBeenCalledTimes(1);
    });
  });

  describe('combined conditions', () => {
    it('should not show prompt when both Google is not ready and disabled', () => {
      renderHook(() =>
        useGoogleOneTapPrompt({ isGoogleReady: false, disabled: true, disableCancelOnUnmount: false })
      );

      expect(mockPrompt).not.toHaveBeenCalled();
      expect(mockCancel).not.toHaveBeenCalled();
    });

    it('should not show prompt when script not initialized even if other conditions are met', () => {
      renderHook(() =>
        useGoogleOneTapPrompt({ isGoogleReady: true, disabled: false, disableCancelOnUnmount: false })
      );

      expect(mockPrompt).not.toHaveBeenCalled();
    });
  });
});
