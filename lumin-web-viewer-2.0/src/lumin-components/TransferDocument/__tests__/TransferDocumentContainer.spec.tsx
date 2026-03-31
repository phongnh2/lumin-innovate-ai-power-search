import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock state for controlling test scenarios
const mockState = {
  isEnableNestedFolder: false,
  currentUser: { _id: 'user-123', name: 'Test User', payment: { type: 'PROFESSIONAL' } },
  organizations: [
    { _id: 'org-1', name: 'Org 1', teams: [{ _id: 'team-1', name: 'Team 1' }] },
    { _id: 'org-2', name: 'Org 2', teams: [] },
  ],
};

// Mock services
const mockGetPersonalFolderTree = jest.fn().mockResolvedValue({ children: [{ _id: 'folder-1' }] });
const mockGetPersonalFolderTreeInOrg = jest.fn().mockResolvedValue({ children: [{ _id: 'folder-2' }] });
const mockGetOrganizationFolderTree = jest.fn().mockResolvedValue({ children: [{ _id: 'org-folder-1' }] });
const mockGetOrganizationTeamsFolderTree = jest.fn().mockResolvedValue({ teams: [{ _id: 'team-1', children: [] }] });
const mockFolderServiceGetAll = jest.fn().mockResolvedValue([]);
const mockFolderServiceGetTotal = jest.fn().mockResolvedValue(5);
const mockGetFoldersAvailability = jest.fn().mockResolvedValue({ personal: 10, organization: 20, teams: ['team-1'] });

jest.mock('react-redux', () => ({
  useSelector: jest.fn().mockImplementation(() => mockState.currentUser),
  shallowEqual: jest.fn(),
}));

jest.mock('selectors', () => ({
  getCurrentUser: jest.fn(),
}));

jest.mock('hooks/useEnableNestedFolder', () => ({
  useEnableNestedFolder: () => ({ isEnableNestedFolder: mockState.isEnableNestedFolder }),
}));

jest.mock('services/folderServices', () => {
  return jest.fn().mockImplementation(() => ({
    getAll: mockFolderServiceGetAll,
    getTotal: mockFolderServiceGetTotal,
  }));
});

jest.mock('services/graphServices/folder', () => ({
  getFoldersAvailability: (...args: unknown[]) => mockGetFoldersAvailability(...args),
}));

jest.mock('services/organizationServices', () => ({
  getPersonalFolderTree: () => mockGetPersonalFolderTree(),
  getPersonalFolderTreeInOrg: (id: string) => mockGetPersonalFolderTreeInOrg(id),
  getOrganizationFolderTree: (id: string) => mockGetOrganizationFolderTree(id),
  getOrganizationTeamsFolderTree: (params: unknown) => mockGetOrganizationTeamsFolderTree(params),
}));

jest.mock('helpers/logger', () => ({
  logError: jest.fn(),
}));

jest.mock('features/NestedFolders/constants', () => ({
  RootTypes: { Personal: 'Personal', Organization: 'Organization', Team: 'Team' },
}));

jest.mock('constants/folderConstant', () => ({
  FolderType: { PERSONAL: 'PERSONAL', ORGANIZATION: 'ORGANIZATION', ORGANIZATION_TEAM: 'ORGANIZATION_TEAM' },
}));

jest.mock('constants/lumin-common', () => ({
  LOGGER: { Service: { GRAPHQL_ERROR: 'GRAPHQL_ERROR' } },
}));

jest.mock('constants/plan', () => ({
  Plans: { PROFESSIONAL: 'PROFESSIONAL', PERSONAL: 'PERSONAL' },
}));

// Capture context value for testing
let capturedContextValue: any = null;

jest.mock('luminComponents/TransferDocument/context', () => ({
  TransferDocumentContext: {
    Provider: ({ value, children }: { value: any; children: React.ReactNode }) => {
      capturedContextValue = value;
      return require('react').createElement('div', { 'data-testid': 'context-provider' }, children);
    },
  },
}));

jest.mock('luminComponents/TransferDocument/TransferDocument', () => ({
  __esModule: true,
  default: () => require('react').createElement('div', { 'data-testid': 'transfer-document' }, 'TransferDocument'),
}));

jest.mock('luminComponents/TransferDocument/helpers/destinationHelper', () => ({
  isOrganizationDocuments: jest.fn().mockReturnValue(false),
}));

import TransferDocumentContainer from 'luminComponents/TransferDocument/TransferDocumentContainer';
import { ModalContext, DestinationLocation } from 'luminComponents/TransferDocument/interfaces/TransferDocument.interface';

describe('TransferDocumentContainer', () => {
  const defaultProps = {
    documents: [{ _id: 'doc-1', name: 'Document 1' }],
    organizations: mockState.organizations,
    onClose: jest.fn(),
    disableTarget: '',
    onSubmit: jest.fn(),
    error: '',
    destination: {
      _id: 'dest-1',
      name: 'Destination',
      type: DestinationLocation.PERSONAL,
      belongsTo: { _id: 'user-123', type: DestinationLocation.PERSONAL },
    },
    setDestination: jest.fn(),
    isProcessing: false,
    context: ModalContext.COPY,
    newNameState: {
      isOpen: false,
      value: 'New Document',
      dispatch: jest.fn(),
      error: '',
      setError: jest.fn(),
    },
    notify: {
      value: false,
      set: jest.fn(),
    },
    selectedTarget: { _id: 'user-123', name: 'Test User' },
    setSelectedTarget: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    capturedContextValue = null;
    mockState.isEnableNestedFolder = false;
    mockState.currentUser = { _id: 'user-123', name: 'Test User', payment: { type: 'PROFESSIONAL' } };
  });

  describe('Rendering', () => {
    it('should render TransferDocument component', () => {
      render(<TransferDocumentContainer {...defaultProps} />);
      expect(screen.getByTestId('transfer-document')).toBeInTheDocument();
    });

    it('should wrap content with TransferDocumentContext.Provider', () => {
      render(<TransferDocumentContainer {...defaultProps} />);
      expect(screen.getByTestId('context-provider')).toBeInTheDocument();
    });
  });

  describe('Context value - getter', () => {
    it('should provide personalData with isOldProfessional true for PROFESSIONAL users', () => {
      mockState.currentUser = { _id: 'user-123', name: 'Test User', payment: { type: 'PROFESSIONAL' } };
      render(<TransferDocumentContainer {...defaultProps} />);
      expect(capturedContextValue.getter.personalData.isOldProfessional).toBe(true);
    });

    it('should provide personalData with isOldProfessional true for PERSONAL users', () => {
      mockState.currentUser = { _id: 'user-123', name: 'Test User', payment: { type: 'PERSONAL' } };
      render(<TransferDocumentContainer {...defaultProps} />);
      expect(capturedContextValue.getter.personalData.isOldProfessional).toBe(true);
    });

    it('should provide personalData with isOldProfessional false for free users', () => {
      mockState.currentUser = { _id: 'user-123', name: 'Test User', payment: { type: 'FREE' } };
      render(<TransferDocumentContainer {...defaultProps} />);
      expect(capturedContextValue.getter.personalData.isOldProfessional).toBe(false);
    });

    it('should provide selectedTarget from props', () => {
      render(<TransferDocumentContainer {...defaultProps} />);
      expect(capturedContextValue.getter.selectedTarget).toEqual(defaultProps.selectedTarget);
    });

    it('should provide destination from props', () => {
      render(<TransferDocumentContainer {...defaultProps} />);
      expect(capturedContextValue.getter.destination).toEqual(defaultProps.destination);
    });

    it('should provide organizations from props', () => {
      render(<TransferDocumentContainer {...defaultProps} />);
      expect(capturedContextValue.getter.organizations).toEqual(defaultProps.organizations);
    });

    it('should provide COPY modal content for COPY context', () => {
      render(<TransferDocumentContainer {...defaultProps} context={ModalContext.COPY} />);
      expect(capturedContextValue.getter.context.isCopyModal).toBe(true);
      expect(capturedContextValue.getter.context.showAllLocation).toBe(true);
    });

    it('should provide MOVE modal content for MOVE context', () => {
      render(<TransferDocumentContainer {...defaultProps} context={ModalContext.MOVE} />);
      expect(capturedContextValue.getter.context.isCopyModal).toBe(false);
      expect(capturedContextValue.getter.context.showAllLocation).toBe(false);
    });
  });

  describe('Context value - setter', () => {
    it('should provide setDestination from props', () => {
      render(<TransferDocumentContainer {...defaultProps} />);
      expect(capturedContextValue.setter.setDestination).toBe(defaultProps.setDestination);
    });

    it('should provide setSelectedTarget from props', () => {
      render(<TransferDocumentContainer {...defaultProps} />);
      expect(capturedContextValue.setter.setSelectedTarget).toBe(defaultProps.setSelectedTarget);
    });

    it('should provide onClose from props', () => {
      render(<TransferDocumentContainer {...defaultProps} />);
      expect(capturedContextValue.setter.onClose).toBe(defaultProps.onClose);
    });

    it('should provide setNewDocumentName from newNameState', () => {
      render(<TransferDocumentContainer {...defaultProps} />);
      expect(capturedContextValue.setter.setNewDocumentName).toBe(defaultProps.newNameState.dispatch);
    });

    it('should provide setErrorName from newNameState', () => {
      render(<TransferDocumentContainer {...defaultProps} />);
      expect(capturedContextValue.setter.setErrorName).toBe(defaultProps.newNameState.setError);
    });

    it('should provide setIsNotify from notify', () => {
      render(<TransferDocumentContainer {...defaultProps} />);
      expect(capturedContextValue.setter.setIsNotify).toBe(defaultProps.notify.set);
    });
  });

  describe('Context value - onSubmit', () => {
    it('should provide onSubmit from props', () => {
      render(<TransferDocumentContainer {...defaultProps} />);
      expect(capturedContextValue.onSubmit).toBe(defaultProps.onSubmit);
    });
  });

  describe('getTeamsOfSelectedOrg', () => {
    it('should return teams from selected organization', () => {
      const propsWithOrgTarget = {
        ...defaultProps,
        selectedTarget: { _id: 'org-1', name: 'Org 1', teams: [{ _id: 'team-1', name: 'Team 1' }] },
      };
      render(<TransferDocumentContainer {...propsWithOrgTarget} />);
      expect(capturedContextValue.getter.getTeamsOfSelectedOrg()).toEqual([{ _id: 'team-1', name: 'Team 1' }]);
    });

    it('should return empty array when selectedTarget has no teams', () => {
      const propsWithNoTeams = {
        ...defaultProps,
        selectedTarget: { _id: 'org-2', name: 'Org 2' },
      };
      render(<TransferDocumentContainer {...propsWithNoTeams} />);
      expect(capturedContextValue.getter.getTeamsOfSelectedOrg()).toEqual([]);
    });
  });

  describe('getFolders', () => {
    it('should set empty folders immediately when nested folders enabled', async () => {
      mockState.isEnableNestedFolder = true;
      render(<TransferDocumentContainer {...defaultProps} />);
      
      await act(async () => {
        await capturedContextValue.getter.getFolders({ type: 'PERSONAL' });
      });
      
      expect(mockFolderServiceGetAll).not.toHaveBeenCalled();
    });

    it('should call folder service for PERSONAL type without nested folders', async () => {
      mockState.isEnableNestedFolder = false;
      mockFolderServiceGetAll.mockResolvedValue([{ _id: 'folder-1', name: 'Folder 1', belongsTo: {}, listUserStar: [] }]);
      render(<TransferDocumentContainer {...defaultProps} />);
      
      await act(async () => {
        await capturedContextValue.getter.getFolders({ type: 'PERSONAL', personalOnly: true });
      });
      
      expect(mockFolderServiceGetAll).toHaveBeenCalled();
    });
  });

  describe('resetFolders', () => {
    it('should provide resetFolders function in context', () => {
      render(<TransferDocumentContainer {...defaultProps} />);
      expect(typeof capturedContextValue.setter.resetFolders).toBe('function');
    });

    it('should be callable without error', () => {
      render(<TransferDocumentContainer {...defaultProps} />);
      expect(() => capturedContextValue.setter.resetFolders()).not.toThrow();
    });
  });

  describe('isPersonalTargetSelected state', () => {
    it('should be true when selectedTarget._id equals currentUser._id', () => {
      const propsWithPersonalTarget = {
        ...defaultProps,
        selectedTarget: { _id: 'user-123', name: 'Test User' },
      };
      render(<TransferDocumentContainer {...propsWithPersonalTarget} />);
      expect(capturedContextValue.getter.isPersonalTargetSelected).toBe(true);
    });

    it('should be false when selectedTarget._id differs from currentUser._id', () => {
      const propsWithOrgTarget = {
        ...defaultProps,
        selectedTarget: { _id: 'org-1', name: 'Org 1' },
      };
      render(<TransferDocumentContainer {...propsWithOrgTarget} />);
      expect(capturedContextValue.getter.isPersonalTargetSelected).toBe(false);
    });
  });

  describe('newNameState integration', () => {
    it('should provide newDocumentName from newNameState.value', () => {
      render(<TransferDocumentContainer {...defaultProps} />);
      expect(capturedContextValue.getter.newDocumentName).toBe('New Document');
    });

    it('should provide isDocumentNameOpen from newNameState.isOpen', () => {
      const propsWithOpenName = {
        ...defaultProps,
        newNameState: { ...defaultProps.newNameState, isOpen: true },
      };
      render(<TransferDocumentContainer {...propsWithOpenName} />);
      expect(capturedContextValue.getter.isDocumentNameOpen).toBe(true);
    });

    it('should provide errorName from newNameState.error', () => {
      const propsWithError = {
        ...defaultProps,
        newNameState: { ...defaultProps.newNameState, error: 'Name already exists' },
      };
      render(<TransferDocumentContainer {...propsWithError} />);
      expect(capturedContextValue.getter.errorName).toBe('Name already exists');
    });
  });

  describe('notify integration', () => {
    it('should provide isNotify from notify.value', () => {
      const propsWithNotify = {
        ...defaultProps,
        notify: { value: true, set: jest.fn() },
      };
      render(<TransferDocumentContainer {...propsWithNotify} />);
      expect(capturedContextValue.getter.isNotify).toBe(true);
    });
  });

  describe('loading state', () => {
    it('should initially have loading as false', () => {
      render(<TransferDocumentContainer {...defaultProps} />);
      expect(capturedContextValue.getter.loading).toBe(false);
    });
  });

  describe('folderData state', () => {
    it('should initially have isLoading as true', () => {
      render(<TransferDocumentContainer {...defaultProps} />);
      expect(capturedContextValue.getter.folderData.isLoading).toBe(true);
    });

    it('should initially have empty folders array', () => {
      render(<TransferDocumentContainer {...defaultProps} />);
      expect(capturedContextValue.getter.folderData.folders).toEqual([]);
    });
  });

  describe('nestedFolderData state', () => {
    it('should initially have empty personal array', () => {
      render(<TransferDocumentContainer {...defaultProps} />);
      expect(capturedContextValue.getter.nestedFolderData.personal).toEqual([]);
    });

    it('should initially have empty organization array', () => {
      render(<TransferDocumentContainer {...defaultProps} />);
      expect(capturedContextValue.getter.nestedFolderData.organization).toEqual([]);
    });

    it('should initially have empty team array', () => {
      render(<TransferDocumentContainer {...defaultProps} />);
      expect(capturedContextValue.getter.nestedFolderData.team).toEqual([]);
    });
  });

  describe('getNestedFolders', () => {
    beforeEach(() => {
      mockState.isEnableNestedFolder = true;
    });

    it('should not call services when nested folders disabled', async () => {
      mockState.isEnableNestedFolder = false;
      render(<TransferDocumentContainer {...defaultProps} />);
      
      await act(async () => {
        await capturedContextValue.setter.getNestedFolders({ rootType: 'Personal' });
      });
      
      expect(mockGetPersonalFolderTree).not.toHaveBeenCalled();
    });

    it('should call getPersonalFolderTree for Personal rootType with personal target', async () => {
      const propsWithPersonal = {
        ...defaultProps,
        selectedTarget: { _id: 'user-123', name: 'Test User' },
      };
      render(<TransferDocumentContainer {...propsWithPersonal} />);
      
      await act(async () => {
        await capturedContextValue.setter.getNestedFolders({ rootType: 'Personal', forcePersonalTarget: true });
      });
      
      expect(mockGetPersonalFolderTree).toHaveBeenCalled();
    });

    it('should call getOrganizationFolderTree for Organization rootType', async () => {
      const propsWithOrg = {
        ...defaultProps,
        selectedTarget: { _id: 'org-1', name: 'Org 1' },
      };
      render(<TransferDocumentContainer {...propsWithOrg} />);
      
      await act(async () => {
        await capturedContextValue.setter.getNestedFolders({ rootType: 'Organization' });
      });
      
      expect(mockGetOrganizationFolderTree).toHaveBeenCalledWith('org-1');
    });

    it('should not call team service when no teamId provided', async () => {
      const propsWithOrg = {
        ...defaultProps,
        selectedTarget: { _id: 'org-1', name: 'Org 1' },
      };
      render(<TransferDocumentContainer {...propsWithOrg} />);
      
      await act(async () => {
        await capturedContextValue.setter.getNestedFolders({ rootType: 'Team' });
      });
      
      expect(mockGetOrganizationTeamsFolderTree).not.toHaveBeenCalled();
    });

    it('should call team service when teamId provided', async () => {
      const propsWithOrg = {
        ...defaultProps,
        selectedTarget: { _id: 'org-1', name: 'Org 1' },
      };
      render(<TransferDocumentContainer {...propsWithOrg} />);
      
      await act(async () => {
        await capturedContextValue.setter.getNestedFolders({ rootType: 'Team', teamId: 'team-1' });
      });
      
      expect(mockGetOrganizationTeamsFolderTree).toHaveBeenCalledWith({ orgId: 'org-1', teamIds: ['team-1'] });
    });
  });

  describe('Default props', () => {
    it('should have default empty disableTarget', () => {
      const { defaultProps: compDefaults } = require('luminComponents/TransferDocument/TransferDocumentContainer');
      expect(TransferDocumentContainer.defaultProps?.disableTarget).toBe('');
    });

    it('should have default empty error', () => {
      expect(TransferDocumentContainer.defaultProps?.error).toBe('');
    });
  });

  describe('ModalContent configuration', () => {
    it('should use MOVE content when context is MOVE', () => {
      render(<TransferDocumentContainer {...defaultProps} context={ModalContext.MOVE} />);
      expect(capturedContextValue.getter.context.title).toBe('modalMove.moveDocuments');
      expect(capturedContextValue.getter.context.submit).toBe('modalMove.move');
    });

    it('should use COPY content when context is COPY', () => {
      render(<TransferDocumentContainer {...defaultProps} context={ModalContext.COPY} />);
      expect(capturedContextValue.getter.context.title).toBe('modalMakeACopy.copyDocuments');
      expect(capturedContextValue.getter.context.submit).toBe('modalMakeACopy.copy');
    });
  });
});
