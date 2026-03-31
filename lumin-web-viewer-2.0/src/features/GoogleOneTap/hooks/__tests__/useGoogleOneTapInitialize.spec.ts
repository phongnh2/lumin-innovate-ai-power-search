import { renderHook } from '@testing-library/react';
import React from 'react';

import { useGoogleOneTapInitialize } from '../useGoogleOneTapInitialize';
import { PROMPT_ANCHOR_ID, SCRIPT_INITIALIZED_FLAG } from '../../constants';
import { createGoogleCallback } from '../../utils';
import { IUseGoogleOneTapLogin } from '../../types';

jest.mock('../../utils', () => ({
  createGoogleCallback: jest.fn(),
}));

describe('useGoogleOneTapInitialize', () => {
  const mockInitialize = jest.fn();
  const mockOnSuccess = jest.fn();
  const mockOnError = jest.fn();
  const mockCallback = jest.fn();
  const mockCreatedCallback = jest.fn();

  const mockGoogleAccountConfigs = {
    client_id: 'test-client-id',
  };

  const createMockRefs = (overrides?: Partial<{
    configs: IUseGoogleOneTapLogin['googleAccountConfigs'];
    onSuccess: IUseGoogleOneTapLogin['onSuccess'];
    onError: IUseGoogleOneTapLogin['onError'];
  }>) => ({
    configsRef: { current: overrides?.configs ?? mockGoogleAccountConfigs } as React.RefObject<IUseGoogleOneTapLogin['googleAccountConfigs']>,
    onSuccessRef: { current: overrides?.onSuccess ?? mockOnSuccess } as React.RefObject<IUseGoogleOneTapLogin['onSuccess']>,
    onErrorRef: { current: overrides?.onError ?? mockOnError } as React.RefObject<IUseGoogleOneTapLogin['onError']>,
  });

  beforeEach(() => {
    jest.clearAllMocks();
    delete (window as Record<string, unknown>)[SCRIPT_INITIALIZED_FLAG];
    (window as Record<string, unknown>).google = {
      accounts: {
        id: {
          initialize: mockInitialize,
        },
      },
    };
    (createGoogleCallback as jest.Mock).mockReturnValue(mockCreatedCallback);
  });

  afterEach(() => {
    delete (window as Record<string, unknown>)[SCRIPT_INITIALIZED_FLAG];
    delete (window as Record<string, unknown>).google;
  });

  describe('initialization', () => {
    it('should initialize Google One Tap when Google API is ready', () => {
      const mockRefs = createMockRefs();

      renderHook(() =>
        useGoogleOneTapInitialize({
          isGoogleReady: true,
          ...mockRefs,
        })
      );

      expect(mockInitialize).toHaveBeenCalledTimes(1);
    });

    it('should not initialize when Google API is not ready', () => {
      const mockRefs = createMockRefs();

      renderHook(() =>
        useGoogleOneTapInitialize({
          isGoogleReady: false,
          ...mockRefs,
        })
      );

      expect(mockInitialize).not.toHaveBeenCalled();
    });

    it('should not initialize when script is already initialized', () => {
      (window as Record<string, unknown>)[SCRIPT_INITIALIZED_FLAG] = true;
      const mockRefs = createMockRefs();

      renderHook(() =>
        useGoogleOneTapInitialize({
          isGoogleReady: true,
          ...mockRefs,
        })
      );

      expect(mockInitialize).not.toHaveBeenCalled();
    });

    it('should set SCRIPT_INITIALIZED_FLAG after initialization', () => {
      const mockRefs = createMockRefs();

      renderHook(() =>
        useGoogleOneTapInitialize({
          isGoogleReady: true,
          ...mockRefs,
        })
      );

      expect(window[SCRIPT_INITIALIZED_FLAG]).toBe(true);
    });
  });

  describe('initialization config', () => {
    it('should initialize with correct configuration', () => {
      const mockRefs = createMockRefs();

      renderHook(() =>
        useGoogleOneTapInitialize({
          isGoogleReady: true,
          ...mockRefs,
        })
      );

      expect(mockInitialize).toHaveBeenCalledWith(
        expect.objectContaining({
          client_id: 'test-client-id',
          callback: mockCreatedCallback,
          prompt_parent_id: PROMPT_ANCHOR_ID,
          cancel_on_tap_outside: false,
          use_fedcm_for_prompt: true,
          auto_select: false,
          context: 'signin',
          itp_support: true,
        })
      );
    });

    it('should use custom callback from configs when provided', () => {
      const customCallback = jest.fn();
      const mockRefs = createMockRefs({
        configs: { client_id: 'test-client-id', callback: customCallback },
      });

      renderHook(() =>
        useGoogleOneTapInitialize({
          isGoogleReady: true,
          ...mockRefs,
        })
      );

      expect(mockInitialize).toHaveBeenCalledWith(
        expect.objectContaining({
          callback: customCallback,
        })
      );
      expect(createGoogleCallback).not.toHaveBeenCalled();
    });

    it('should create callback using createGoogleCallback when no custom callback provided', () => {
      const mockRefs = createMockRefs();

      renderHook(() =>
        useGoogleOneTapInitialize({
          isGoogleReady: true,
          ...mockRefs,
        })
      );

      expect(createGoogleCallback).toHaveBeenCalledWith(mockOnSuccess, mockOnError);
      expect(mockInitialize).toHaveBeenCalledWith(
        expect.objectContaining({
          callback: mockCreatedCallback,
        })
      );
    });

    it('should merge custom configs with default options', () => {
      const mockRefs = createMockRefs({
        configs: {
          client_id: 'custom-client-id',
          nonce: 'custom-nonce',
        },
      });

      renderHook(() =>
        useGoogleOneTapInitialize({
          isGoogleReady: true,
          ...mockRefs,
        })
      );

      expect(mockInitialize).toHaveBeenCalledWith(
        expect.objectContaining({
          client_id: 'custom-client-id',
          nonce: 'custom-nonce',
          prompt_parent_id: PROMPT_ANCHOR_ID,
        })
      );
    });
  });

  describe('effect dependencies', () => {
    it('should not re-initialize when isGoogleReady changes from true to true', () => {
      const mockRefs = createMockRefs();

      const { rerender } = renderHook(
        ({ isGoogleReady }) =>
          useGoogleOneTapInitialize({
            isGoogleReady,
            ...mockRefs,
          }),
        { initialProps: { isGoogleReady: true } }
      );

      expect(mockInitialize).toHaveBeenCalledTimes(1);

      rerender({ isGoogleReady: true });

      expect(mockInitialize).toHaveBeenCalledTimes(1);
    });

    it('should not initialize again when already initialized and isGoogleReady becomes true', () => {
      const mockRefs = createMockRefs();
      (window as Record<string, unknown>)[SCRIPT_INITIALIZED_FLAG] = true;

      const { rerender } = renderHook(
        ({ isGoogleReady }) =>
          useGoogleOneTapInitialize({
            isGoogleReady,
            ...mockRefs,
          }),
        { initialProps: { isGoogleReady: false } }
      );

      expect(mockInitialize).not.toHaveBeenCalled();

      rerender({ isGoogleReady: true });

      expect(mockInitialize).not.toHaveBeenCalled();
    });
  });

  describe('edge cases', () => {
    it('should handle null configsRef.current', () => {
      const mockRefs = {
        configsRef: { current: null } as React.RefObject<IUseGoogleOneTapLogin['googleAccountConfigs']>,
        onSuccessRef: { current: mockOnSuccess } as React.RefObject<IUseGoogleOneTapLogin['onSuccess']>,
        onErrorRef: { current: mockOnError } as React.RefObject<IUseGoogleOneTapLogin['onError']>,
      };

      renderHook(() =>
        useGoogleOneTapInitialize({
          isGoogleReady: true,
          ...mockRefs,
        })
      );

      expect(createGoogleCallback).toHaveBeenCalledWith(mockOnSuccess, mockOnError);
      expect(mockInitialize).toHaveBeenCalled();
    });

    it('should handle undefined onSuccess and onError refs', () => {
      const mockRefs = {
        configsRef: { current: mockGoogleAccountConfigs } as React.RefObject<IUseGoogleOneTapLogin['googleAccountConfigs']>,
        onSuccessRef: { current: undefined } as React.RefObject<IUseGoogleOneTapLogin['onSuccess']>,
        onErrorRef: { current: undefined } as React.RefObject<IUseGoogleOneTapLogin['onError']>,
      };

      renderHook(() =>
        useGoogleOneTapInitialize({
          isGoogleReady: true,
          ...mockRefs,
        })
      );

      expect(createGoogleCallback).toHaveBeenCalledWith(undefined, undefined);
    });
  });
});

