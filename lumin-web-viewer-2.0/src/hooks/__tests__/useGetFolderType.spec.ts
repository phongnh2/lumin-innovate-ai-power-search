import { renderHook } from '@testing-library/react';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router';

import useGetFolderType from '../useGetFolderType';
import useGetCurrentOrganization from '../useGetCurrentOrganization';
import { useViewerMatch } from '../useViewerMatch';
import useHomeMatch from '../useHomeMatch';
import useShallowSelector from '../useShallowSelector';
import { useHandleManipulateDateGuestMode } from 'features/GuestModeManipulateCache/useHandleManipuldateGuestMode';
import { isSystemFileSupported } from 'helpers/pwa';

import { folderType } from 'constants/documentConstants';

jest.mock('react-redux', () => ({
  useSelector: jest.fn(),
}));

jest.mock('react-router', () => ({
  useParams: jest.fn(),
}));

jest.mock('../useGetCurrentOrganization', () => jest.fn());
jest.mock('../useViewerMatch', () => ({
  useViewerMatch: jest.fn(),
}));
jest.mock('../useHomeMatch', () => jest.fn());
jest.mock('../useShallowSelector', () => jest.fn());
jest.mock('features/GuestModeManipulateCache/useHandleManipuldateGuestMode', () => ({
  useHandleManipulateDateGuestMode: jest.fn(),
}));
jest.mock('helpers/pwa', () => ({
  isSystemFileSupported: jest.fn(),
}));

const mockUseParams = useParams as jest.Mock;
const mockUseSelector = useSelector as jest.Mock;
const mockUseGetCurrentOrganization = useGetCurrentOrganization as jest.Mock;
const mockUseViewerMatch = useViewerMatch as jest.Mock;
const mockUseHomeMatch = useHomeMatch as jest.Mock;
const mockUseShallowSelector = useShallowSelector as jest.Mock;
const mockUseHandleManipulateDateGuestMode = useHandleManipulateDateGuestMode as jest.Mock;
const mockIsSystemFileSupported = isSystemFileSupported as jest.Mock;

describe('useGetFolderType', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseParams.mockReturnValue({ type: '' });
    mockUseSelector.mockReturnValue('');
    mockUseGetCurrentOrganization.mockReturnValue(null);
    mockUseViewerMatch.mockReturnValue({ isViewer: false });
    mockUseHomeMatch.mockReturnValue({ isRecentTab: false, isTrendingTab: false });
    mockUseShallowSelector.mockReturnValue(null);
    mockUseHandleManipulateDateGuestMode.mockReturnValue({ isManipulateInGuestMode: false });
    mockIsSystemFileSupported.mockReturnValue(false);
  });

  describe('type mapping from URL params', () => {
    it('should return INDIVIDUAL for personal type', () => {
      mockUseParams.mockReturnValue({ type: 'personal' });

      const { result } = renderHook(() => useGetFolderType());

      expect(result.current).toBe(folderType.INDIVIDUAL);
    });

    it('should return ORGANIZATION for workspace type', () => {
      mockUseParams.mockReturnValue({ type: 'workspace' });

      const { result } = renderHook(() => useGetFolderType());

      expect(result.current).toBe(folderType.ORGANIZATION);
    });

    it('should return SHARED for shared type', () => {
      mockUseParams.mockReturnValue({ type: 'shared' });

      const { result } = renderHook(() => useGetFolderType());

      expect(result.current).toBe(folderType.SHARED);
    });

    it('should return STARRED for starred type', () => {
      mockUseParams.mockReturnValue({ type: 'starred' });

      const { result } = renderHook(() => useGetFolderType());

      expect(result.current).toBe(folderType.STARRED);
    });

    it('should return TEAMS for space type', () => {
      mockUseParams.mockReturnValue({ type: 'space' });

      const { result } = renderHook(() => useGetFolderType());

      expect(result.current).toBe(folderType.TEAMS);
    });

    it('should handle uppercase type params', () => {
      mockUseParams.mockReturnValue({ type: 'PERSONAL' });

      const { result } = renderHook(() => useGetFolderType());

      expect(result.current).toBe(folderType.INDIVIDUAL);
    });
  });

  describe('fallback to documentTabType', () => {
    it('should use documentTabType when type param is not provided', () => {
      mockUseParams.mockReturnValue({ type: undefined });
      mockUseSelector.mockReturnValue('personal');

      const { result } = renderHook(() => useGetFolderType());

      expect(result.current).toBe(folderType.INDIVIDUAL);
    });
  });

  describe('recent tab handling', () => {
    it('should return INDIVIDUAL when on recent tab', () => {
      mockUseParams.mockReturnValue({ type: 'workspace' });
      mockUseHomeMatch.mockReturnValue({ isRecentTab: true, isTrendingTab: false });

      const { result } = renderHook(() => useGetFolderType());

      expect(result.current).toBe(folderType.INDIVIDUAL);
    });
  });

  describe('guest mode handling', () => {
    it('should return INDIVIDUAL when in guest mode manipulation', () => {
      mockUseParams.mockReturnValue({ type: 'workspace' });
      mockUseHandleManipulateDateGuestMode.mockReturnValue({ isManipulateInGuestMode: true });

      const { result } = renderHook(() => useGetFolderType());

      expect(result.current).toBe(folderType.INDIVIDUAL);
    });
  });

  describe('trending tab handling', () => {
    it('should return folderType from team selector when on trending tab', () => {
      mockUseParams.mockReturnValue({ type: 'personal' });
      mockUseHomeMatch.mockReturnValue({ isRecentTab: false, isTrendingTab: true });
      mockUseSelector.mockImplementation((selector) => {
        if (typeof selector === 'function') {
          return { folderType: folderType.TEAMS };
        }
        return '';
      });

      const { result } = renderHook(() => useGetFolderType());

      expect(result.current).toBe(folderType.TEAMS);
    });
  });

  describe('viewer mode handling', () => {
    it('should return document type when in viewer mode', () => {
      mockUseParams.mockReturnValue({ type: 'personal' });
      mockUseViewerMatch.mockReturnValue({ isViewer: true });
      mockUseShallowSelector.mockReturnValue({ documentType: 'ORGANIZATION' });

      const { result } = renderHook(() => useGetFolderType());

      expect(result.current).toBe('organization');
    });

    it('should return undefined when in viewer mode with no documentType', () => {
      mockUseParams.mockReturnValue({ type: 'personal' });
      mockUseViewerMatch.mockReturnValue({ isViewer: true });
      mockUseShallowSelector.mockReturnValue({ documentType: undefined });

      const { result } = renderHook(() => useGetFolderType());

      expect(result.current).toBeUndefined();
    });
  });

  describe('default fallback', () => {
    it('should return INDIVIDUAL for unknown type', () => {
      mockUseParams.mockReturnValue({ type: 'unknown-type' });

      const { result } = renderHook(() => useGetFolderType());

      expect(result.current).toBe(folderType.INDIVIDUAL);
    });

    it('should return INDIVIDUAL when type is empty', () => {
      mockUseParams.mockReturnValue({ type: '' });
      mockUseSelector.mockReturnValue('');

      const { result } = renderHook(() => useGetFolderType());

      expect(result.current).toBe(folderType.INDIVIDUAL);
    });
  });
});

