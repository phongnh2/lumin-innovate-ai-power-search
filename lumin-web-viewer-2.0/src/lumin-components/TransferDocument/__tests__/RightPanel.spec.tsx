import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mutable mock state
const mockState = {
  isEnableReskin: false,
  isEnableNestedFolder: false,
  isPersonalTargetSelected: false,
  loading: false,
  expandedItem: '',
  disableTarget: null as string | null,
  isCopyModal: false,
  isOldProfessional: false,
  folders: [] as any[],
  teams: [{ _id: 'team-1', name: 'Team 1', avatarRemoteId: null }],
  totalFolders: {} as Record<string, any>,
  documents: [{ belongsTo: { workspaceId: null }, service: 's3' }] as any[],
  destination: { _id: 'dest-123', type: 'ORGANIZATION', scrollTo: null } as any,
};

const mockSetDestination = jest.fn();
const mockSetExpandedItem = jest.fn();
const mockResetFolders = jest.fn();
const mockGetFolders = jest.fn();

jest.mock('hooks', () => ({
  useEnableWebReskin: () => ({ isEnableReskin: mockState.isEnableReskin }),
  useTranslation: () => ({ t: (key: string, opts?: any) => opts?.orgName ? `${key} ${opts.orgName}` : key }),
}));

jest.mock('hooks/useEnableNestedFolder', () => ({
  useEnableNestedFolder: () => ({ isEnableNestedFolder: mockState.isEnableNestedFolder }),
}));

jest.mock('lumin-components/TransferDocument/hooks', () => ({
  useTransferDocumentContext: () => ({
    getter: {
      getTeamsOfSelectedOrg: () => mockState.teams,
      destination: mockState.destination,
      selectedTarget: { _id: 'org-123', name: 'Test Org', avatarRemoteId: null },
      personalData: { _id: 'user-123', isOldProfessional: mockState.isOldProfessional, originUser: { _id: 'user-123' } },
      disableTarget: mockState.disableTarget,
      folderData: { folders: mockState.folders, isLoading: false },
      getFolders: mockGetFolders,
      expandedItem: mockState.expandedItem,
      documents: mockState.documents,
      context: { isCopyModal: mockState.isCopyModal, selectAPlace: 'modalMove.selectAPlace' },
      isPersonalTargetSelected: mockState.isPersonalTargetSelected,
      totalFolders: mockState.totalFolders,
      loading: mockState.loading,
    },
    setter: { setDestination: mockSetDestination, setExpandedItem: mockSetExpandedItem, resetFolders: mockResetFolders },
  }),
}));

jest.mock('lumin-ui/kiwi-ui', () => ({
  Avatar: ({ src }: any) => require('react').createElement('img', { 'data-testid': 'avatar', src }),
  Icomoon: ({ type }: any) => require('react').createElement('span', { 'data-testid': `icon-${type}` }),
  PlainTooltip: ({ children, content }: any) => require('react').createElement('div', { 'data-testid': 'tooltip', 'data-content': content }, children),
}));

jest.mock('lumin-components/Icomoon', () => ({ __esModule: true, default: ({ className }: any) => require('react').createElement('span', { 'data-testid': `icon-${className}` }) }));
jest.mock('lumin-components/Shared/Collapse', () => ({
  __esModule: true,
  default: ({ children, isExpand, onEntered, onExited }: any) => {
    const R = require('react');
    R.useEffect(() => { if (isExpand) onEntered?.(); else onExited?.(); }, [isExpand]);
    return isExpand ? children : null;
  },
}));
jest.mock('lumin-components/Shared/Tooltip', () => ({ __esModule: true, default: ({ children, title }: any) => require('react').createElement('span', { 'data-testid': 'tooltip-old', 'data-title': title }, children) }));
jest.mock('utils/avatar', () => ({ __esModule: true, default: { getAvatar: (id: string) => id ? `avatar-${id}` : null, getTextAvatar: (name: string) => name?.[0] || 'X' } }));
jest.mock('features/NestedFolders/components', () => ({ NestedFoldersPanel: ({ loading, fullWidth }: any) => require('react').createElement('div', { 'data-testid': 'nested-folders-panel', 'data-loading': String(loading), 'data-full-width': String(fullWidth) }) }));

jest.mock('assets/reskin/lumin-svgs/default-org-avatar.png', () => 'default-org-avatar.png');
jest.mock('assets/reskin/lumin-svgs/default-team-avatar.png', () => 'default-team-avatar.png');

jest.mock('constants/documentConstants', () => ({ documentStorage: { s3: 's3' } }));
jest.mock('constants/folderConstant', () => ({ FolderType: { PERSONAL: 'PERSONAL', ORGANIZATION: 'ORGANIZATION', ORGANIZATION_TEAM: 'ORGANIZATION_TEAM' } }));
jest.mock('constants/lumin-common', () => ({ TOOLTIP_MAX_WIDTH: 300 }));
jest.mock('constants/styles', () => ({ Colors: { NEUTRAL_100: '#000' } }));

jest.mock('luminComponents/TransferDocument/components/RightPanel/RightPanelSkeleton', () => ({
  __esModule: true,
  default: () => require('react').createElement('div', { 'data-testid': 'right-panel-skeleton' }),
}));

jest.mock('luminComponents/TransferDocument/components/LeftSideBar/LeftSideBar.styled', () => ({
  ItemNameReskin: ({ children }: any) => require('react').createElement('span', { 'data-testid': 'item-name-reskin' }, children),
}));

jest.mock('luminComponents/TransferDocument/components/RightPanel/RightPanel.styled', () => ({
  RightSideBarContainer: ({ children }: any) => require('react').createElement('div', { 'data-testid': 'right-sidebar-container' }, children),
  RightSideBarContainerReskin: ({ children, className }: any) => require('react').createElement('div', { 'data-testid': 'right-sidebar-container-reskin', className }, children),
  RightSideBar: ({ children }: any) => require('react').createElement('div', { 'data-testid': 'right-sidebar' }, children),
  Title: ({ children }: any) => require('react').createElement('h3', { 'data-testid': 'title' }, children),
  SubTitle: ({ children }: any) => require('react').createElement('h4', { 'data-testid': 'subtitle' }, children),
  SubTitleReskin: ({ children }: any) => require('react').createElement('h4', { 'data-testid': 'subtitle-reskin' }, children),
  RightSideBarItemContainer: ({ children }: any) => children,
  RightSideBarItemWrapper: ({ children }: any) => require('react').createElement('div', { 'data-testid': 'item-wrapper' }, children),
  RightSideBarItem: ({ children, onClick, $isActive, $isDisabled }: any) => require('react').createElement('div', { 'data-testid': 'sidebar-item', onClick: $isDisabled ? undefined : onClick, 'data-active': String(!!$isActive), 'data-disabled': String(!!$isDisabled) }, children),
  RightSideBarItemReskin: ({ children, onClick, ...rest }: any) => require('react').createElement('div', { 'data-testid': 'sidebar-item-reskin', onClick, ...rest }, children),
  ArrowContainer: ({ children, onClick, $hasFolder, id }: any) => require('react').createElement('div', { 'data-testid': `arrow-container-${id}`, onClick: $hasFolder ? onClick : undefined }, children),
  ArrowButton: ({ onClick, id }: any) => require('react').createElement('button', { 'data-testid': `arrow-btn-${id}`, onClick, type: 'button' }, '>'),
  HiddenArrow: () => require('react').createElement('span', { 'data-testid': 'hidden-arrow' }),
  FolderItemContainer: ({ children }: any) => require('react').createElement('div', { 'data-testid': 'folder-item-container' }, children),
  FolderItemContainerReskin: ({ children }: any) => require('react').createElement('div', { 'data-testid': 'folder-item-container-reskin' }, children),
  FolderSection: ({ children }: any) => children,
  ItemName: ({ children }: any) => require('react').createElement('span', { 'data-testid': 'item-name' }, children),
  Avatar: ({ children, src }: any) => require('react').createElement('div', { 'data-testid': 'styled-avatar', 'data-src': src }, children),
}));

import RightPanel from 'luminComponents/TransferDocument/components/RightPanel';

describe('RightPanel', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockState.isEnableReskin = false;
    mockState.isEnableNestedFolder = false;
    mockState.isPersonalTargetSelected = false;
    mockState.loading = false;
    mockState.expandedItem = '';
    mockState.disableTarget = null;
    mockState.isCopyModal = false;
    mockState.isOldProfessional = false;
    mockState.folders = [];
    mockState.teams = [{ _id: 'team-1', name: 'Team 1', avatarRemoteId: null }];
    mockState.totalFolders = {};
    mockState.documents = [{ belongsTo: { workspaceId: null }, service: 's3' }];
    mockState.destination = { _id: 'dest-123', type: 'ORGANIZATION', scrollTo: null };
  });

  describe('Non-reskin mode', () => {
    it('renders right sidebar container', () => {
      render(<RightPanel />);
      expect(screen.getByTestId('right-sidebar-container')).toBeInTheDocument();
    });

    it('renders title', () => {
      render(<RightPanel />);
      expect(screen.getByTestId('title')).toHaveTextContent('modalMove.selectAPlace');
    });

    it('renders my documents section', () => {
      render(<RightPanel />);
      expect(screen.getByText('modalMove.myDocuments')).toBeInTheDocument();
    });

    it('renders skeleton when loading', () => {
      mockState.loading = true;
      render(<RightPanel />);
      expect(screen.getByTestId('right-panel-skeleton')).toBeInTheDocument();
    });

    it('renders organization section', () => {
      render(<RightPanel />);
      expect(screen.getByText('modalMove.orgDocuments Test Org')).toBeInTheDocument();
    });

    it('renders teams when not personal target', () => {
      render(<RightPanel />);
      expect(screen.getByText('Team 1')).toBeInTheDocument();
    });

    it('renders subtitle for teams', () => {
      render(<RightPanel />);
      expect(screen.getByTestId('subtitle')).toHaveTextContent('teams');
    });

    it('does not render teams subtitle when no teams', () => {
      mockState.teams = [];
      render(<RightPanel />);
      expect(screen.queryByTestId('subtitle')).not.toBeInTheDocument();
    });

    it('renders folders subtitle when personal target selected', () => {
      mockState.isPersonalTargetSelected = true;
      render(<RightPanel />);
      expect(screen.getByTestId('subtitle')).toHaveTextContent('modalMove.folders');
    });

    it('calls setDestination when clicking my documents', () => {
      render(<RightPanel />);
      const items = screen.getAllByTestId('sidebar-item');
      fireEvent.click(items[0]);
      expect(mockSetDestination).toHaveBeenCalled();
    });

    it('calls setDestination when clicking organization section', () => {
      render(<RightPanel />);
      const items = screen.getAllByTestId('sidebar-item');
      fireEvent.click(items[1]);
      expect(mockSetDestination).toHaveBeenCalled();
    });

    it('calls setDestination when clicking team', () => {
      render(<RightPanel />);
      const items = screen.getAllByTestId('sidebar-item');
      fireEvent.click(items[2]);
      expect(mockSetDestination).toHaveBeenCalled();
    });

    it('does not call setDestination for disabled item', () => {
      mockState.disableTarget = 'team-1';
      render(<RightPanel />);
      const items = screen.getAllByTestId('sidebar-item');
      fireEvent.click(items[2]);
      expect(mockSetDestination).not.toHaveBeenCalledWith(expect.objectContaining({ _id: 'team-1' }));
    });

    it('shows arrow when team has folders', () => {
      mockState.totalFolders = { 'org-123': { teams: { 'team-1': 2 } } };
      render(<RightPanel />);
      expect(screen.getByTestId('arrow-container-team-1')).toBeInTheDocument();
    });

    it('expands folders on arrow click', () => {
      mockState.totalFolders = { 'org-123': { orgDocuments: 2 } };
      render(<RightPanel />);
      const arrow = screen.getByTestId('arrow-container-org-123');
      fireEvent.click(arrow);
      expect(mockSetExpandedItem).toHaveBeenCalledWith('org-123');
      expect(mockGetFolders).toHaveBeenCalled();
    });

    it('renders folder list when expanded', () => {
      mockState.expandedItem = 'org-123';
      mockState.folders = [{ _id: 'folder-1', name: 'Folder 1', belongsTo: { location: {} } }];
      render(<RightPanel />);
      expect(screen.getByText('Folder 1')).toBeInTheDocument();
    });
  });

  describe('Reskin mode', () => {
    beforeEach(() => { mockState.isEnableReskin = true; });

    it('renders reskin container', () => {
      render(<RightPanel />);
      expect(screen.getByTestId('right-sidebar-container-reskin')).toBeInTheDocument();
    });

    it('renders skeleton when loading', () => {
      mockState.loading = true;
      render(<RightPanel />);
      expect(screen.getByTestId('right-panel-skeleton')).toBeInTheDocument();
    });

    it('renders reskin subtitle for teams', () => {
      render(<RightPanel />);
      expect(screen.getByTestId('subtitle-reskin')).toHaveTextContent('teams');
    });

    it('renders folders subtitle when personal target', () => {
      mockState.isPersonalTargetSelected = true;
      render(<RightPanel />);
      expect(screen.getByTestId('subtitle-reskin')).toHaveTextContent('modalMove.folders');
    });

    it('renders All orgName for organization', () => {
      render(<RightPanel />);
      expect(screen.getByText('All Test Org')).toBeInTheDocument();
    });

    it('uses PlainTooltip for disabled items', () => {
      mockState.disableTarget = 'org-123';
      mockState.documents = [{ belongsTo: { workspaceId: null }, service: 'gcs' }];
      render(<RightPanel />);
      expect(screen.getAllByTestId('tooltip').length).toBeGreaterThan(0);
    });

    it('shows arrow button when folder exists', () => {
      mockState.totalFolders = { 'org-123': { orgDocuments: 2 } };
      render(<RightPanel />);
      expect(screen.getByTestId('arrow-btn-org-123')).toBeInTheDocument();
    });

    it('calls getFolders on arrow click', () => {
      mockState.totalFolders = { 'org-123': { orgDocuments: 2 } };
      render(<RightPanel />);
      fireEvent.click(screen.getByTestId('arrow-btn-org-123'));
      expect(mockSetExpandedItem).toHaveBeenCalled();
      expect(mockGetFolders).toHaveBeenCalled();
    });
  });

  describe('Nested folder mode', () => {
    beforeEach(() => {
      mockState.isEnableReskin = true;
      mockState.isEnableNestedFolder = true;
    });

    it('renders NestedFoldersPanel', () => {
      render(<RightPanel />);
      expect(screen.getByTestId('nested-folders-panel')).toBeInTheDocument();
    });

    it('passes loading prop', () => {
      mockState.loading = true;
      render(<RightPanel />);
      expect(screen.getByTestId('nested-folders-panel')).toHaveAttribute('data-loading', 'true');
    });

    it('passes fullWidth prop', () => {
      render(<RightPanel fullWidth={true} />);
      expect(screen.getByTestId('nested-folders-panel')).toHaveAttribute('data-full-width', 'true');
    });
  });

  describe('isCopyModal context', () => {
    it('renders correctly for copy modal', () => {
      mockState.isCopyModal = true;
      mockState.isEnableReskin = true;
      render(<RightPanel />);
      expect(screen.getByTestId('right-sidebar-container-reskin')).toBeInTheDocument();
    });
  });

  describe('Old professional user', () => {
    beforeEach(() => { mockState.isOldProfessional = true; });

    it('renders personal section with different belongsTo type', () => {
      mockState.isPersonalTargetSelected = true;
      render(<RightPanel />);
      fireEvent.click(screen.getAllByTestId('sidebar-item')[0]);
      expect(mockSetDestination).toHaveBeenCalled();
    });
  });
});
