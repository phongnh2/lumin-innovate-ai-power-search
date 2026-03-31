import { renderHook } from '@testing-library/react';

import { useGapiLoaded } from 'hooks/useGapiLoaded';

import { useGoogleOneTapLogin } from '../useGoogleOneTapLogin';
import { useGoogleOneTapInitialize } from '../useGoogleOneTapInitialize';
import { useGoogleOneTapPrompt } from '../useGoogleOneTapPrompt';
import { useStableCallbacks } from '../useStableCallbacks';
import { IUseGoogleOneTapLogin } from '../../types';

jest.mock('hooks/useGapiLoaded', () => ({
  useGapiLoaded: jest.fn(),
}));

jest.mock('../useGoogleOneTapInitialize', () => ({
  useGoogleOneTapInitialize: jest.fn(),
}));

jest.mock('../useGoogleOneTapPrompt', () => ({
  useGoogleOneTapPrompt: jest.fn(),
}));

jest.mock('../useStableCallbacks', () => ({
  useStableCallbacks: jest.fn(),
}));

describe('useGoogleOneTapLogin', () => {
  const mockOnSuccess = jest.fn();
  const mockOnError = jest.fn();
  const mockGoogleAccountConfigs = {
    client_id: 'test-client-id',
  };

  const mockRefs = {
    onSuccessRef: { current: mockOnSuccess },
    onErrorRef: { current: mockOnError },
    configsRef: { current: mockGoogleAccountConfigs },
  };

  const defaultProps: IUseGoogleOneTapLogin = {
    onSuccess: mockOnSuccess,
    onError: mockOnError,
    googleAccountConfigs: mockGoogleAccountConfigs,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useGapiLoaded as jest.Mock).mockReturnValue(true);
    (useStableCallbacks as jest.Mock).mockReturnValue(mockRefs);
  });

  describe('initialization', () => {
    it('should call useGapiLoaded to check if Google API is ready', () => {
      renderHook(() => useGoogleOneTapLogin(defaultProps));

      expect(useGapiLoaded).toHaveBeenCalled();
    });

    it('should call useStableCallbacks with correct parameters', () => {
      renderHook(() => useGoogleOneTapLogin(defaultProps));

      expect(useStableCallbacks).toHaveBeenCalledWith({
        onSuccess: mockOnSuccess,
        onError: mockOnError,
        googleAccountConfigs: mockGoogleAccountConfigs,
      });
    });

    it('should call useGoogleOneTapInitialize with correct parameters', () => {
      renderHook(() => useGoogleOneTapLogin(defaultProps));

      expect(useGoogleOneTapInitialize).toHaveBeenCalledWith({
        isGoogleReady: true,
        configsRef: mockRefs.configsRef,
        onSuccessRef: mockRefs.onSuccessRef,
        onErrorRef: mockRefs.onErrorRef,
      });
    });

    it('should call useGoogleOneTapPrompt with correct parameters', () => {
      renderHook(() => useGoogleOneTapLogin(defaultProps));

      expect(useGoogleOneTapPrompt).toHaveBeenCalledWith({
        isGoogleReady: true,
        disabled: false,
        disableCancelOnUnmount: false,
      });
    });
  });

  describe('disabled state', () => {
    it('should pass disabled=true to useGoogleOneTapPrompt when disabled prop is true', () => {
      renderHook(() => useGoogleOneTapLogin({ ...defaultProps, disabled: true }));

      expect(useGoogleOneTapPrompt).toHaveBeenCalledWith({
        isGoogleReady: true,
        disabled: true,
        disableCancelOnUnmount: false,
      });
    });

    it('should pass disabled=false to useGoogleOneTapPrompt by default', () => {
      renderHook(() => useGoogleOneTapLogin(defaultProps));

      expect(useGoogleOneTapPrompt).toHaveBeenCalledWith({
        isGoogleReady: true,
        disabled: false,
        disableCancelOnUnmount: false,
      });
    });
  });

  describe('disableCancelOnUnmount state', () => {
    it('should pass disableCancelOnUnmount=true to useGoogleOneTapPrompt when prop is true', () => {
      renderHook(() => useGoogleOneTapLogin({ ...defaultProps, disableCancelOnUnmount: true }));

      expect(useGoogleOneTapPrompt).toHaveBeenCalledWith({
        isGoogleReady: true,
        disabled: false,
        disableCancelOnUnmount: true,
      });
    });

    it('should pass disableCancelOnUnmount=false to useGoogleOneTapPrompt by default', () => {
      renderHook(() => useGoogleOneTapLogin(defaultProps));

      expect(useGoogleOneTapPrompt).toHaveBeenCalledWith({
        isGoogleReady: true,
        disabled: false,
        disableCancelOnUnmount: false,
      });
    });
  });

  describe('Google API not ready', () => {
    it('should pass isGoogleReady=false to child hooks when API is not loaded', () => {
      (useGapiLoaded as jest.Mock).mockReturnValue(false);

      renderHook(() => useGoogleOneTapLogin(defaultProps));

      expect(useGoogleOneTapInitialize).toHaveBeenCalledWith(
        expect.objectContaining({ isGoogleReady: false })
      );
      expect(useGoogleOneTapPrompt).toHaveBeenCalledWith({
        isGoogleReady: false,
        disabled: false,
        disableCancelOnUnmount: false,
      });
    });
  });

  describe('props updates', () => {
    it('should update hooks when props change', () => {
      const { rerender } = renderHook(
        (props: IUseGoogleOneTapLogin) => useGoogleOneTapLogin(props),
        { initialProps: defaultProps }
      );

      expect(useGoogleOneTapPrompt).toHaveBeenLastCalledWith({
        isGoogleReady: true,
        disabled: false,
        disableCancelOnUnmount: false,
      });

      rerender({ ...defaultProps, disabled: true });

      expect(useGoogleOneTapPrompt).toHaveBeenLastCalledWith({
        isGoogleReady: true,
        disabled: true,
        disableCancelOnUnmount: false,
      });
    });
  });

  describe('combined states', () => {
    it('should handle all props being set', () => {
      renderHook(() =>
        useGoogleOneTapLogin({
          ...defaultProps,
          disabled: true,
          disableCancelOnUnmount: true,
        })
      );

      expect(useGoogleOneTapPrompt).toHaveBeenCalledWith({
        isGoogleReady: true,
        disabled: true,
        disableCancelOnUnmount: true,
      });
    });
  });
});
