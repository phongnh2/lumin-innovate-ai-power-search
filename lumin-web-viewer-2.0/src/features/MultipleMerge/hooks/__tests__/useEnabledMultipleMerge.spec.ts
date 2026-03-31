import { renderHook } from '@testing-library/react';

import { folderType } from 'constants/documentConstants';

import { useEnabledMultipleMerge } from '../useEnabledMultipleMerge';

// Mock the dependency hook
jest.mock('hooks/useGetFolderType', () => ({
  __esModule: true,
  default: jest.fn(),
}));

describe('useEnabledMultipleMerge', () => {
  const mockUseGetFolderType = require('hooks/useGetFolderType').default;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('enabled folder types', () => {
    it('should return enabled: true for ORGANIZATION folder type', () => {
      mockUseGetFolderType.mockReturnValue(folderType.ORGANIZATION);

      const { result } = renderHook(() => useEnabledMultipleMerge());

      expect(result.current.enabled).toBe(true);
    });

    it('should return enabled: true for TEAMS folder type', () => {
      mockUseGetFolderType.mockReturnValue(folderType.TEAMS);

      const { result } = renderHook(() => useEnabledMultipleMerge());

      expect(result.current.enabled).toBe(true);
    });

    it('should return enabled: true for INDIVIDUAL folder type', () => {
      mockUseGetFolderType.mockReturnValue(folderType.INDIVIDUAL);

      const { result } = renderHook(() => useEnabledMultipleMerge());

      expect(result.current.enabled).toBe(true);
    });
  });

  describe('disabled folder types', () => {
    it('should return enabled: false for DEVICE folder type', () => {
      mockUseGetFolderType.mockReturnValue(folderType.DEVICE);

      const { result } = renderHook(() => useEnabledMultipleMerge());

      expect(result.current.enabled).toBe(false);
    });

    it('should return enabled: false for STARRED folder type', () => {
      mockUseGetFolderType.mockReturnValue(folderType.STARRED);

      const { result } = renderHook(() => useEnabledMultipleMerge());

      expect(result.current.enabled).toBe(false);
    });

    it('should return enabled: false for SHARED folder type', () => {
      mockUseGetFolderType.mockReturnValue(folderType.SHARED);

      const { result } = renderHook(() => useEnabledMultipleMerge());

      expect(result.current.enabled).toBe(false);
    });

    it('should return enabled: false for RECENT folder type', () => {
      mockUseGetFolderType.mockReturnValue(folderType.RECENT);

      const { result } = renderHook(() => useEnabledMultipleMerge());

      expect(result.current.enabled).toBe(false);
    });
  });

  describe('edge cases', () => {
    it('should return enabled: false for undefined folder type', () => {
      mockUseGetFolderType.mockReturnValue(undefined);

      const { result } = renderHook(() => useEnabledMultipleMerge());

      expect(result.current.enabled).toBe(false);
    });

    it('should return enabled: false for null folder type', () => {
      mockUseGetFolderType.mockReturnValue(null);

      const { result } = renderHook(() => useEnabledMultipleMerge());

      expect(result.current.enabled).toBe(false);
    });

    it('should return enabled: false for unknown folder type', () => {
      mockUseGetFolderType.mockReturnValue('unknown-folder-type');

      const { result } = renderHook(() => useEnabledMultipleMerge());

      expect(result.current.enabled).toBe(false);
    });

    it('should return enabled: false for empty string', () => {
      mockUseGetFolderType.mockReturnValue('');

      const { result } = renderHook(() => useEnabledMultipleMerge());

      expect(result.current.enabled).toBe(false);
    });
  });
});

