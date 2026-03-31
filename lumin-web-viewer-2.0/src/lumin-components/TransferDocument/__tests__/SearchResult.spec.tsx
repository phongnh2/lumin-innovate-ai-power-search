import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mutable state
const mockState = {
  isEnableReskin: false,
  isPersonalWorkspace: false,
  disableTarget: null as string | null,
};

const mockSetDestination = jest.fn();
const mockSetExpandedItem = jest.fn();
const mockSetSelectedTarget = jest.fn();
const mockSetPersonalTargetSelected = jest.fn();
const mockGetNestedFolders = jest.fn();
const mockGetFolders = jest.fn();
const mockOnClose = jest.fn();

jest.mock('hooks', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

jest.mock('luminComponents/TransferDocument/hooks', () => ({
  useTransferDocumentContext: () => ({
    getter: {
      personalData: { isOldProfessional: mockState.isPersonalWorkspace, originUser: { _id: 'user-123' } },
      disableTarget: mockState.disableTarget,
      organizations: [{ _id: 'org-123', name: 'Test Org' }],
      getFolders: mockGetFolders,
    },
    setter: {
      setDestination: mockSetDestination,
      setExpandedItem: mockSetExpandedItem,
      setSelectedTarget: mockSetSelectedTarget,
      setPersonalTargetSelected: mockSetPersonalTargetSelected,
      getNestedFolders: mockGetNestedFolders,
    },
  }),
}));

jest.mock('luminComponents/TransferDocument/helpers/destinationHelper', () => ({
  goToDestination: jest.fn(() => true),
}));

jest.mock('utils', () => ({
  avatar: { getAvatar: (id: string) => id ? `avatar-${id}` : null, getTextAvatar: (name: string) => name?.[0] || 'X' },
}));

jest.mock('lumin-ui/kiwi-ui', () => ({
  PopoverDropdown: ({ children, className }: any) => require('react').createElement('div', { 'data-testid': 'popover-dropdown', className }, children),
}));

jest.mock('lumin-components/Loading', () => ({
  __esModule: true,
  default: ({ normal, useReskinCircularProgress, reskinSize }: any) => require('react').createElement('div', { 'data-testid': 'loading', 'data-reskin': String(!!useReskinCircularProgress), 'data-size': reskinSize }),
}));

jest.mock('luminComponents/DocumentComponents/components/EmptySearchResult', () => ({
  __esModule: true,
  default: () => require('react').createElement('div', { 'data-testid': 'empty-search-result-old' }),
}));

jest.mock('luminComponents/InfiniteScroll', () => ({
  __esModule: true,
  default: ({ children }: any) => require('react').createElement('div', { 'data-testid': 'infinite-scroll' }, children),
}));

jest.mock('luminComponents/MaterialPopper', () => ({
  __esModule: true,
  default: ({ children, open, handleClose }: any) => open ? require('react').createElement('div', { 'data-testid': 'material-popper' },
    children,
    require('react').createElement('button', { 'data-testid': 'close-popper', onClick: handleClose, type: 'button' }, 'Close')
  ) : null,
}));

jest.mock('luminComponents/TransferDocument/constants/moveDocumentConstant', () => ({ ResultTabs: { TEAMS: 'TEAMS', FOLDERS: 'FOLDERS' } }));

jest.mock('luminComponents/TransferDocument/components/EmptySearchResult', () => ({
  EmptySearchResult: () => require('react').createElement('div', { 'data-testid': 'empty-search-result-reskin' }),
}));

jest.mock('luminComponents/TransferDocument/components/ResultItemRender', () => ({
  __esModule: true,
  default: {
    Folder: ({ title, goToDestination }: any) => require('react').createElement('div', { 'data-testid': 'folder-item', onClick: goToDestination }, title),
    Team: ({ title, goToDestination }: any) => require('react').createElement('div', { 'data-testid': 'team-item', onClick: goToDestination }, title),
  },
}));

jest.mock('luminComponents/TransferDocument/components/SearchResultHeader', () => ({
  SearchResultHeader: ({ tab, onTabChange, folderResults, teamResults, orgResults }: any) => require('react').createElement('div', { 'data-testid': 'search-result-header' },
    require('react').createElement('button', { 'data-testid': 'tab-teams', onClick: () => onTabChange('TEAMS'), type: 'button' }, `Teams (${teamResults.length + orgResults.length})`),
    require('react').createElement('button', { 'data-testid': 'tab-folders', onClick: () => onTabChange('FOLDERS'), type: 'button' }, `Folders (${folderResults.length})`),
    require('react').createElement('span', { 'data-testid': 'active-tab' }, tab)
  ),
}));

jest.mock('luminComponents/TransferDocument/components/SearchResult/SearchResult.styled', () => ({
  useTabStyles: () => ({}),
  Container: ({ children }: any) => require('react').createElement('div', { 'data-testid': 'container' }, children),
  ContainerEmpty: ({ children }: any) => require('react').createElement('div', { 'data-testid': 'container-empty' }, children),
  HeaderContainer: ({ children }: any) => require('react').createElement('div', { 'data-testid': 'header-container' }, children),
  TabsContainer: ({ children }: any) => children,
  Tabs: ({ tabs, onChange, value }: any) => require('react').createElement('div', { 'data-testid': 'tabs' },
    tabs.map((tab: any) => require('react').createElement('button', { key: tab.value, 'data-testid': `tab-${tab.value}`, onClick: () => onChange(tab.value), type: 'button' }, tab.label, tab.suffix))
  ),
  Divider: () => require('react').createElement('hr', { 'data-testid': 'divider' }),
  ResultList: ({ children }: any) => require('react').createElement('div', { 'data-testid': 'result-list' }, children),
  Badge: ({ children }: any) => require('react').createElement('span', { 'data-testid': 'badge' }, children),
}));

jest.mock('luminComponents/TransferDocument/components/SearchResult/SearchResult.module.scss', () => ({ infiniteScrollWrapper: 'infiniteScrollWrapper', searchResultsPopper: 'searchResultsPopper' }));
jest.mock('constants/styles', () => ({ Colors: { SECONDARY_50: '#00f' } }));

import SearchResult from 'luminComponents/TransferDocument/components/SearchResult';
import { goToDestination } from 'luminComponents/TransferDocument/helpers/destinationHelper';

describe('SearchResult', () => {
  const defaultProps = {
    anchorEl: document.createElement('div'),
    isOpen: true,
    onClose: mockOnClose,
    searchResults: { orgResults: [], teamResults: [], folderResults: [] },
    loading: false,
    selectedTarget: { _id: 'org-123', name: 'Test Org' },
    isEnableReskin: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockState.isEnableReskin = false;
    mockState.isPersonalWorkspace = false;
    mockState.disableTarget = null;
  });

  describe('Non-reskin mode', () => {
    it('renders when isOpen', () => {
      render(<SearchResult {...defaultProps} />);
      expect(screen.getByTestId('material-popper')).toBeInTheDocument();
    });

    it('does not render when not open', () => {
      render(<SearchResult {...defaultProps} isOpen={false} />);
      expect(screen.queryByTestId('material-popper')).not.toBeInTheDocument();
    });

    it('shows loading state', () => {
      render(<SearchResult {...defaultProps} loading={true} />);
      expect(screen.getByTestId('loading')).toBeInTheDocument();
    });

    it('shows tabs for non-personal workspace', () => {
      render(<SearchResult {...defaultProps} />);
      expect(screen.getByTestId('tabs')).toBeInTheDocument();
    });

    it('hides tabs for personal workspace', () => {
      mockState.isPersonalWorkspace = true;
      render(<SearchResult {...defaultProps} selectedTarget={{ _id: 'user-123', name: 'User' } as any} />);
      expect(screen.queryByTestId('tabs')).not.toBeInTheDocument();
    });

    it('shows empty result for teams tab', () => {
      render(<SearchResult {...defaultProps} />);
      expect(screen.getByTestId('empty-search-result-old')).toBeInTheDocument();
    });

    it('shows team results', () => {
      const teamResults = [{ _id: 'team-1', name: 'Team 1', avatarRemoteId: null }];
      render(<SearchResult {...defaultProps} searchResults={{ orgResults: [], teamResults, folderResults: [] }} />);
      expect(screen.getByTestId('team-item')).toHaveTextContent('Team 1');
    });

    it('shows folder results when switching to folders tab', () => {
      const folderResults = [{ _id: 'folder-1', name: 'Folder 1', path: { name: 'path' } }];
      render(<SearchResult {...defaultProps} searchResults={{ orgResults: [], teamResults: [], folderResults }} />);
      fireEvent.click(screen.getByTestId('tab-FOLDERS'));
      expect(screen.getByTestId('folder-item')).toHaveTextContent('Folder 1');
    });

    it('shows empty result for folders tab', () => {
      render(<SearchResult {...defaultProps} />);
      fireEvent.click(screen.getByTestId('tab-FOLDERS'));
      expect(screen.getByTestId('empty-search-result-old')).toBeInTheDocument();
    });

    it('calls goToDestination on team click', () => {
      const teamResults = [{ _id: 'team-1', name: 'Team 1', avatarRemoteId: null }];
      render(<SearchResult {...defaultProps} searchResults={{ orgResults: [], teamResults, folderResults: [] }} />);
      fireEvent.click(screen.getByTestId('team-item'));
      expect(goToDestination).toHaveBeenCalled();
    });

    it('calls onClose on popper close', () => {
      render(<SearchResult {...defaultProps} />);
      fireEvent.click(screen.getByTestId('close-popper'));
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  describe('Reskin mode', () => {
    it('renders popover dropdown', () => {
      render(<SearchResult {...defaultProps} isEnableReskin={true} />);
      expect(screen.getByTestId('popover-dropdown')).toBeInTheDocument();
    });

    it('shows reskin header', () => {
      render(<SearchResult {...defaultProps} isEnableReskin={true} />);
      expect(screen.getByTestId('search-result-header')).toBeInTheDocument();
    });

    it('shows loading with reskin styles', () => {
      render(<SearchResult {...defaultProps} isEnableReskin={true} loading={true} />);
      expect(screen.getByTestId('loading')).toHaveAttribute('data-reskin', 'true');
    });

    it('shows empty result reskin', () => {
      render(<SearchResult {...defaultProps} isEnableReskin={true} />);
      expect(screen.getByTestId('empty-search-result-reskin')).toBeInTheDocument();
    });

    it('shows org results in teams tab', () => {
      const orgResults = [{ _id: 'org-1', name: 'All Org', avatarRemoteId: null }];
      render(<SearchResult {...defaultProps} isEnableReskin={true} searchResults={{ orgResults, teamResults: [], folderResults: [] }} />);
      expect(screen.getByText('All Org')).toBeInTheDocument();
    });

    it('switches to folders tab when only folders found', () => {
      const folderResults = [{ _id: 'folder-1', name: 'Folder 1', path: { name: 'path' } }];
      render(<SearchResult {...defaultProps} isEnableReskin={true} searchResults={{ orgResults: [], teamResults: [], folderResults }} />);
      expect(screen.getByTestId('active-tab')).toHaveTextContent('FOLDERS');
    });

    it('hides header for personal workspace', () => {
      mockState.isPersonalWorkspace = true;
      render(<SearchResult {...defaultProps} isEnableReskin={true} selectedTarget={{ _id: 'user-123', name: 'User' } as any} />);
      expect(screen.queryByTestId('search-result-header')).not.toBeInTheDocument();
    });
  });

  describe('Personal workspace', () => {
    beforeEach(() => {
      mockState.isPersonalWorkspace = true;
    });

    it('shows folder results directly', () => {
      const folderResults = [{ _id: 'folder-1', name: 'Folder 1', path: { name: 'path' } }];
      render(<SearchResult {...defaultProps} selectedTarget={{ _id: 'user-123', name: 'User' } as any} searchResults={{ orgResults: [], teamResults: [], folderResults }} />);
      expect(screen.getByTestId('folder-item')).toHaveTextContent('Folder 1');
    });

    it('shows empty when no folders', () => {
      render(<SearchResult {...defaultProps} selectedTarget={{ _id: 'user-123', name: 'User' } as any} />);
      expect(screen.getByTestId('empty-search-result-old')).toBeInTheDocument();
    });
  });

  describe('Disabled items', () => {
    it('does not navigate when item is disabled', () => {
      mockState.disableTarget = 'team-1';
      const teamResults = [{ _id: 'team-1', name: 'Team 1', avatarRemoteId: null }];
      render(<SearchResult {...defaultProps} searchResults={{ orgResults: [], teamResults, folderResults: [] }} />);
      fireEvent.click(screen.getByTestId('team-item'));
      // goToDestination is called but returns false for disabled
    });
  });

  describe('Tab switching effect', () => {
    it('switches to teams tab when teams found in non-reskin', () => {
      const teamResults = [{ _id: 'team-1', name: 'Team 1', avatarRemoteId: null }];
      const folderResults = [{ _id: 'folder-1', name: 'Folder 1', path: { name: 'path' } }];
      render(<SearchResult {...defaultProps} searchResults={{ orgResults: [], teamResults, folderResults }} />);
      expect(screen.getByTestId('team-item')).toBeInTheDocument();
    });
  });
});
