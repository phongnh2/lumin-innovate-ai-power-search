import { renderHook, act } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router', () => ({
  useNavigate: () => mockNavigate,
}));

// Mock hooks
const mockOpenDeleteModal = jest.fn();
jest.mock('hooks/useDeleteFolder', () => ({
  __esModule: true,
  default: () => ({
    openDeleteModal: mockOpenDeleteModal,
  }),
}));

const mockFolderUrl = '/folder/folder-1';
jest.mock('hooks/useGetFolderUrl', () => ({
  __esModule: true,
  default: () => mockFolderUrl,
}));

// Mock FolderServices
const mockStarFolder = jest.fn().mockResolvedValue(undefined);
jest.mock('services', () => ({
  FolderServices: jest.fn().mockImplementation(() => ({
    starFolder: mockStarFolder,
  })),
}));

// Mock constants
jest.mock('constants/folderConstant', () => ({
  FolderAction: {
    INFO: 'info',
    EDIT: 'edit',
  },
  FolderLocationTypeMapping: {
    PERSONAL: 'personal',
    ORGANIZATION: 'organization',
    ORGANIZATION_TEAM: 'team',
  },
}));

// Import after mocks
import useFolderActions from '../hooks/useFolderActions';

describe('useFolderActions', () => {
  const mockFolder = {
    _id: 'folder-1',
    name: 'Test Folder',
    belongsTo: {
      type: 'PERSONAL',
      _id: 'personal-1',
    },
  };

  const mockOpenFolderModal = jest.fn();

  const defaultProps = {
    folder: mockFolder as any,
    openFolderModal: mockOpenFolderModal,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('open action', () => {
    it('navigates to folder url', () => {
      const { result } = renderHook(() => useFolderActions(defaultProps));
      
      act(() => {
        result.current.actions.open();
      });

      expect(mockNavigate).toHaveBeenCalledWith(mockFolderUrl);
    });
  });

  describe('viewInfo action', () => {
    it('opens folder modal in info mode', () => {
      const { result } = renderHook(() => useFolderActions(defaultProps));
      
      act(() => {
        result.current.actions.viewInfo();
      });

      expect(mockOpenFolderModal).toHaveBeenCalledWith({
        mode: 'info',
        folder: mockFolder,
      });
    });
  });

  describe('rename action', () => {
    it('opens folder modal in edit mode', () => {
      const { result } = renderHook(() => useFolderActions(defaultProps));
      
      act(() => {
        result.current.actions.rename();
      });

      expect(mockOpenFolderModal).toHaveBeenCalledWith({
        mode: 'edit',
        folder: mockFolder,
      });
    });
  });

  describe('markFavorite action', () => {
    it('calls star folder service', async () => {
      const { result } = renderHook(() => useFolderActions(defaultProps));
      
      await act(async () => {
        await result.current.actions.markFavorite();
      });

      expect(mockStarFolder).toHaveBeenCalledWith('folder-1');
    });
  });

  describe('remove action', () => {
    it('opens delete modal', () => {
      const { result } = renderHook(() => useFolderActions(defaultProps));
      
      act(() => {
        result.current.actions.remove();
      });

      expect(mockOpenDeleteModal).toHaveBeenCalled();
    });
  });

  describe('folder type mapping', () => {
    it('maps PERSONAL folder type', () => {
      const { result } = renderHook(() => useFolderActions(defaultProps));
      expect(result.current.actions).toBeDefined();
    });

    it('maps ORGANIZATION folder type', () => {
      const orgFolder = {
        ...mockFolder,
        belongsTo: { type: 'ORGANIZATION', _id: 'org-1' },
      };
      const { result } = renderHook(() => useFolderActions({ ...defaultProps, folder: orgFolder as any }));
      expect(result.current.actions).toBeDefined();
    });

    it('maps ORGANIZATION_TEAM folder type', () => {
      const teamFolder = {
        ...mockFolder,
        belongsTo: { type: 'ORGANIZATION_TEAM', _id: 'team-1' },
      };
      const { result } = renderHook(() => useFolderActions({ ...defaultProps, folder: teamFolder as any }));
      expect(result.current.actions).toBeDefined();
    });
  });
});

