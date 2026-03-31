import { renderHook } from '@testing-library/react';
import { useMedia } from 'react-use';

import { useTabletMatch, useXlrDownMatch } from '../useTabletMatch';

import { Breakpoints } from 'constants/styles';

jest.mock('react-use', () => ({
  useMedia: jest.fn(),
}));

const mockUseMedia = useMedia as jest.Mock;

describe('useTabletMatch', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('useTabletMatch', () => {
    it('should call useMedia with md breakpoint', () => {
      mockUseMedia.mockReturnValue(true);

      const { result } = renderHook(() => useTabletMatch());

      expect(mockUseMedia).toHaveBeenCalledWith(`(min-width: ${Breakpoints.md}px)`);
      expect(result.current).toBe(true);
    });

    it('should return false when screen is smaller than md breakpoint', () => {
      mockUseMedia.mockReturnValue(false);

      const { result } = renderHook(() => useTabletMatch());

      expect(result.current).toBe(false);
    });

    it('should return true when screen is equal or larger than md breakpoint', () => {
      mockUseMedia.mockReturnValue(true);

      const { result } = renderHook(() => useTabletMatch());

      expect(result.current).toBe(true);
    });
  });

  describe('useXlrDownMatch', () => {
    it('should call useMedia with max-width xlr - 1 breakpoint', () => {
      mockUseMedia.mockReturnValue(true);

      const { result } = renderHook(() => useXlrDownMatch());

      expect(mockUseMedia).toHaveBeenCalledWith(`(max-width: ${Breakpoints.xlr - 1}px)`);
      expect(result.current).toBe(true);
    });

    it('should return false when screen is larger than xlr breakpoint', () => {
      mockUseMedia.mockReturnValue(false);

      const { result } = renderHook(() => useXlrDownMatch());

      expect(result.current).toBe(false);
    });

    it('should return true when screen is smaller than xlr breakpoint', () => {
      mockUseMedia.mockReturnValue(true);

      const { result } = renderHook(() => useXlrDownMatch());

      expect(result.current).toBe(true);
    });
  });
});

