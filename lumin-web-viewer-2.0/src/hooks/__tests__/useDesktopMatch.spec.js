import { renderHook } from '@testing-library/react';
import { useMedia } from 'react-use';

import {
  useDesktopMatch,
  useXlrMatch,
  useLargeDesktopMatch,
  useResponsiveToolbarForLargeScreens,
  useLgMatch,
} from '../useDesktopMatch';

import { Breakpoints } from 'constants/styles';
import { ToolbarRelatedWidth } from 'constants/toolbar';

jest.mock('react-use', () => ({
  useMedia: jest.fn(),
}));

describe('useDesktopMatch', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('useDesktopMatch', () => {
    it('should call useMedia with xl breakpoint', () => {
      useMedia.mockReturnValue(true);

      const { result } = renderHook(() => useDesktopMatch());

      expect(useMedia).toHaveBeenCalledWith(`(min-width: ${Breakpoints.xl}px)`);
      expect(result.current).toBe(true);
    });

    it('should return false when screen is smaller than xl breakpoint', () => {
      useMedia.mockReturnValue(false);

      const { result } = renderHook(() => useDesktopMatch());

      expect(result.current).toBe(false);
    });
  });

  describe('useXlrMatch', () => {
    it('should call useMedia with xlr breakpoint', () => {
      useMedia.mockReturnValue(true);

      const { result } = renderHook(() => useXlrMatch());

      expect(useMedia).toHaveBeenCalledWith(`(min-width: ${Breakpoints.xlr}px)`);
      expect(result.current).toBe(true);
    });

    it('should return false when screen is smaller than xlr breakpoint', () => {
      useMedia.mockReturnValue(false);

      const { result } = renderHook(() => useXlrMatch());

      expect(result.current).toBe(false);
    });
  });

  describe('useLargeDesktopMatch', () => {
    it('should call useMedia with xxl breakpoint', () => {
      useMedia.mockReturnValue(true);

      const { result } = renderHook(() => useLargeDesktopMatch());

      expect(useMedia).toHaveBeenCalledWith(`(min-width: ${Breakpoints.xxl}px)`);
      expect(result.current).toBe(true);
    });

    it('should return false when screen is smaller than xxl breakpoint', () => {
      useMedia.mockReturnValue(false);

      const { result } = renderHook(() => useLargeDesktopMatch());

      expect(result.current).toBe(false);
    });
  });

  describe('useResponsiveToolbarForLargeScreens', () => {
    it('should call useMedia with xxl breakpoint plus right panel width', () => {
      useMedia.mockReturnValue(true);

      const { result } = renderHook(() => useResponsiveToolbarForLargeScreens());

      expect(useMedia).toHaveBeenCalledWith(
        `(min-width: ${Breakpoints.xxl + ToolbarRelatedWidth.DEFAULT_RIGHT_PANEL}px)`
      );
      expect(result.current).toBe(true);
    });

    it('should return false when screen is smaller than threshold', () => {
      useMedia.mockReturnValue(false);

      const { result } = renderHook(() => useResponsiveToolbarForLargeScreens());

      expect(result.current).toBe(false);
    });
  });

  describe('useLgMatch', () => {
    it('should call useMedia with lg breakpoint', () => {
      useMedia.mockReturnValue(true);

      const { result } = renderHook(() => useLgMatch());

      expect(useMedia).toHaveBeenCalledWith(`(min-width: ${Breakpoints.lg}px)`);
      expect(result.current).toBe(true);
    });

    it('should return false when screen is smaller than lg breakpoint', () => {
      useMedia.mockReturnValue(false);

      const { result } = renderHook(() => useLgMatch());

      expect(result.current).toBe(false);
    });
  });
});

