import '@testing-library/jest-dom';

// Mock services before importing the module
jest.mock('services', () => ({
  FolderServices: jest.fn().mockImplementation(() => ({
    getDetail: jest.fn().mockResolvedValue({
      _id: 'folder-123',
      name: 'Test Folder',
      belongsTo: { location: { _id: 'location-123' } },
    }),
  })),
}));

// Mock constants
jest.mock('constants/folderConstant', () => ({
  FolderType: {
    PERSONAL: 'personal',
    ORGANIZATION: 'organization',
    ORGANIZATION_TEAM: 'organization_team',
  },
}));

// Mock features
jest.mock('features/NestedFolders/constants', () => ({
  RootTypes: {
    Personal: 'personal',
    Organization: 'organization',
    Team: 'team',
  },
}));

// Import after mocks
import { getOwnerId, isOrganizationDocuments, goToDestination } from 'luminComponents/TransferDocument/helpers/destinationHelper';
import { Destination, DestinationLocation } from 'luminComponents/TransferDocument/interfaces/TransferDocument.interface';

describe('destinationHelper', () => {
  describe('getOwnerId', () => {
    const mockCurrentUser = {
      _id: 'user-123',
      name: 'Test User',
    };

    it('should return currentUser._id when destination type is PERSONAL', () => {
      const destination: Destination = {
        _id: 'dest-123',
        name: 'My Documents',
        type: DestinationLocation.PERSONAL,
        belongsTo: {
          _id: 'belongs-123',
          name: 'Belongs To',
          type: DestinationLocation.PERSONAL,
        },
      };

      const result = getOwnerId(destination, mockCurrentUser as any);
      expect(result).toBe('user-123');
    });

    it('should return destination._id when destination type is ORGANIZATION_TEAM', () => {
      const destination: Destination = {
        _id: 'team-123',
        name: 'Team Documents',
        type: DestinationLocation.ORGANIZATION_TEAM,
        belongsTo: {
          _id: 'org-123',
          name: 'Organization',
          type: DestinationLocation.ORGANIZATION,
        },
      };

      const result = getOwnerId(destination, mockCurrentUser as any);
      expect(result).toBe('team-123');
    });

    it('should return belongsTo._id for ORGANIZATION destination type', () => {
      const destination: Destination = {
        _id: 'org-123',
        name: 'Organization Documents',
        type: DestinationLocation.ORGANIZATION,
        belongsTo: {
          _id: 'belongs-org-123',
          name: 'Parent Organization',
          type: DestinationLocation.ORGANIZATION,
        },
      };

      const result = getOwnerId(destination, mockCurrentUser as any);
      expect(result).toBe('belongs-org-123');
    });

    it('should return belongsTo._id for FOLDER destination type', () => {
      const destination: Destination = {
        _id: 'folder-123',
        name: 'My Folder',
        type: DestinationLocation.FOLDER,
        belongsTo: {
          _id: 'belongs-123',
          name: 'Parent',
          type: DestinationLocation.ORGANIZATION,
        },
      };

      const result = getOwnerId(destination, mockCurrentUser as any);
      expect(result).toBe('belongs-123');
    });
  });

  describe('isOrganizationDocuments', () => {
    it('should return true when destination type is ORGANIZATION', () => {
      const destination: Destination = {
        _id: 'org-123',
        name: 'Organization',
        type: DestinationLocation.ORGANIZATION,
        belongsTo: {
          _id: 'org-123',
          name: 'Organization',
          type: DestinationLocation.ORGANIZATION,
        },
      };

      const result = isOrganizationDocuments(destination);
      expect(result).toBe(true);
    });

    it('should return false when destination type is PERSONAL', () => {
      const destination: Destination = {
        _id: 'user-123',
        name: 'Personal',
        type: DestinationLocation.PERSONAL,
        belongsTo: {
          _id: 'user-123',
          name: 'User',
          type: DestinationLocation.PERSONAL,
        },
      };

      const result = isOrganizationDocuments(destination);
      expect(result).toBe(false);
    });

    it('should return false when destination type is ORGANIZATION_TEAM', () => {
      const destination: Destination = {
        _id: 'team-123',
        name: 'Team',
        type: DestinationLocation.ORGANIZATION_TEAM,
        belongsTo: {
          _id: 'org-123',
          name: 'Organization',
          type: DestinationLocation.ORGANIZATION,
        },
      };

      const result = isOrganizationDocuments(destination);
      expect(result).toBe(false);
    });

    it('should check belongsTo.type when destination type is FOLDER', () => {
      const destination: Destination = {
        _id: 'folder-123',
        name: 'My Folder',
        type: DestinationLocation.FOLDER,
        belongsTo: {
          _id: 'org-123',
          name: 'Organization',
          type: DestinationLocation.ORGANIZATION,
        },
      };

      const result = isOrganizationDocuments(destination);
      expect(result).toBe(true);
    });

    it('should return false for FOLDER when belongsTo.type is PERSONAL', () => {
      const destination: Destination = {
        _id: 'folder-123',
        name: 'My Folder',
        type: DestinationLocation.FOLDER,
        belongsTo: {
          _id: 'user-123',
          name: 'User',
          type: DestinationLocation.PERSONAL,
        },
      };

      const result = isOrganizationDocuments(destination);
      expect(result).toBe(false);
    });

    it('should return false for FOLDER when belongsTo.type is ORGANIZATION_TEAM', () => {
      const destination: Destination = {
        _id: 'folder-123',
        name: 'Team Folder',
        type: DestinationLocation.FOLDER,
        belongsTo: {
          _id: 'team-123',
          name: 'Team',
          type: DestinationLocation.ORGANIZATION_TEAM,
        },
      };

      const result = isOrganizationDocuments(destination);
      expect(result).toBe(false);
    });
  });

  describe('goToDestination', () => {
    const mockSetDestination = jest.fn();
    const mockSetExpandedItem = jest.fn();
    const mockSetSelectedTarget = jest.fn();
    const mockSetPersonalTargetSelected = jest.fn();
    const mockGetFolders = jest.fn();
    const mockGetNestedFolders = jest.fn().mockResolvedValue(undefined);

    const mockOrganizations = [
      {
        _id: 'org-123',
        name: 'Test Organization',
        teams: [
          { _id: 'team-123', name: 'Test Team' },
          { _id: 'team-456', name: 'Another Team' },
        ],
      },
    ];

    const mockSelectedTarget = {
      _id: 'org-123',
      name: 'Test Organization',
      teams: [
        { _id: 'team-123', name: 'Test Team' },
        { _id: 'team-456', name: 'Another Team' },
      ],
    };

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should handle ORGANIZATION_TEAM destination type', async () => {
      const item = {
        _id: 'team-123',
        name: 'Test Team',
        path: { _id: 'org-123' },
      };

      await goToDestination({
        organizations: mockOrganizations as any,
        setDestination: mockSetDestination,
        selectedTarget: mockSelectedTarget as any,
        item: item as any,
        type: DestinationLocation.ORGANIZATION_TEAM,
        setExpandedItem: mockSetExpandedItem,
        setSelectedTarget: mockSetSelectedTarget,
        setPersonalTargetSelected: mockSetPersonalTargetSelected,
        getFolders: mockGetFolders,
        getNestedFolders: mockGetNestedFolders,
      });

      expect(mockSetDestination).toHaveBeenCalled();
      const callArg = mockSetDestination.mock.calls[0][0];
      expect(callArg.type).toBe(DestinationLocation.ORGANIZATION_TEAM);
      expect(callArg.scrollTo).toBe('team-123');
    });

    it('should handle ORGANIZATION destination type', async () => {
      const item = {
        _id: 'org-123',
        name: 'Test Organization',
      };

      await goToDestination({
        organizations: mockOrganizations as any,
        setDestination: mockSetDestination,
        selectedTarget: mockSelectedTarget as any,
        item: item as any,
        type: DestinationLocation.ORGANIZATION,
        setExpandedItem: mockSetExpandedItem,
        setSelectedTarget: mockSetSelectedTarget,
        setPersonalTargetSelected: mockSetPersonalTargetSelected,
        getFolders: mockGetFolders,
        getNestedFolders: mockGetNestedFolders,
      });

      expect(mockSetSelectedTarget).toHaveBeenCalled();
      expect(mockSetDestination).toHaveBeenCalled();
      expect(mockSetExpandedItem).toHaveBeenCalledWith('');
      expect(mockSetPersonalTargetSelected).toHaveBeenCalledWith(false);
    });

    it('should handle FOLDER destination type in personal workspace', async () => {
      const item = {
        _id: 'folder-123',
        name: 'Test Folder',
        path: { _id: 'user-123', path: null },
      };

      await goToDestination({
        organizations: mockOrganizations as any,
        setDestination: mockSetDestination,
        selectedTarget: mockSelectedTarget as any,
        isPersonalWorkspace: true,
        item: item as any,
        type: DestinationLocation.FOLDER,
        setExpandedItem: mockSetExpandedItem,
        setSelectedTarget: mockSetSelectedTarget,
        setPersonalTargetSelected: mockSetPersonalTargetSelected,
        getFolders: mockGetFolders,
        getNestedFolders: mockGetNestedFolders,
      });

      expect(mockSetExpandedItem).toHaveBeenCalledWith('user-123');
      expect(mockGetFolders).toHaveBeenCalled();
      expect(mockGetNestedFolders).toHaveBeenCalled();
    });

    it('should handle FOLDER destination type in org team workspace', async () => {
      const item = {
        _id: 'folder-456',
        name: 'Team Folder',
        path: { _id: 'team-123', path: 'some-path' },
      };

      await goToDestination({
        organizations: mockOrganizations as any,
        setDestination: mockSetDestination,
        selectedTarget: mockSelectedTarget as any,
        isPersonalWorkspace: false,
        item: item as any,
        type: DestinationLocation.FOLDER,
        setExpandedItem: mockSetExpandedItem,
        setSelectedTarget: mockSetSelectedTarget,
        setPersonalTargetSelected: mockSetPersonalTargetSelected,
        getFolders: mockGetFolders,
        getNestedFolders: mockGetNestedFolders,
      });

      expect(mockSetExpandedItem).toHaveBeenCalledWith('team-123');
      expect(mockGetFolders).toHaveBeenCalled();
    });

    it('should handle FOLDER in org workspace (belongs to org)', async () => {
      const item = {
        _id: 'folder-789',
        name: 'Org Folder',
        path: { _id: 'org-123', path: null },
      };

      await goToDestination({
        organizations: mockOrganizations as any,
        setDestination: mockSetDestination,
        selectedTarget: mockSelectedTarget as any,
        isPersonalWorkspace: false,
        item: item as any,
        type: DestinationLocation.FOLDER,
        setExpandedItem: mockSetExpandedItem,
        setSelectedTarget: mockSetSelectedTarget,
        setPersonalTargetSelected: mockSetPersonalTargetSelected,
        getFolders: mockGetFolders,
        getNestedFolders: mockGetNestedFolders,
      });

      expect(mockSetExpandedItem).toHaveBeenCalled();
      expect(mockGetFolders).toHaveBeenCalled();
    });

    it('should handle FOLDER in org workspace (belongs to personal)', async () => {
      const item = {
        _id: 'folder-personal',
        name: 'Personal Folder',
        path: { _id: 'user-123', path: null },
      };

      await goToDestination({
        organizations: mockOrganizations as any,
        setDestination: mockSetDestination,
        selectedTarget: mockSelectedTarget as any,
        isPersonalWorkspace: false,
        item: item as any,
        type: DestinationLocation.FOLDER,
        setExpandedItem: mockSetExpandedItem,
        setSelectedTarget: mockSetSelectedTarget,
        setPersonalTargetSelected: mockSetPersonalTargetSelected,
        getFolders: mockGetFolders,
        getNestedFolders: mockGetNestedFolders,
      });

      expect(mockSetExpandedItem).toHaveBeenCalledWith('user-123');
    });

    it('should handle default case (PERSONAL type)', async () => {
      const item = { _id: 'user-123', name: 'User' };

      await goToDestination({
        organizations: mockOrganizations as any,
        setDestination: mockSetDestination,
        selectedTarget: mockSelectedTarget as any,
        item: item as any,
        type: DestinationLocation.PERSONAL,
        setExpandedItem: mockSetExpandedItem,
        setSelectedTarget: mockSetSelectedTarget,
        setPersonalTargetSelected: mockSetPersonalTargetSelected,
        getFolders: mockGetFolders,
        getNestedFolders: mockGetNestedFolders,
      });

      // Default case does nothing
      expect(mockSetDestination).not.toHaveBeenCalled();
    });
  });
});
