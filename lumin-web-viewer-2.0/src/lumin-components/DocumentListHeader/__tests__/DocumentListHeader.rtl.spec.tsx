import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mutable mock state
const mockState = {
  isEnableReskin: false,
  folderType: 'individual',
  isPersonalDocPath: false,
  isVisible: false,
};

// Mock classnames
jest.mock('classnames', () => (...args: any[]) => args.filter(a => typeof a === 'string').join(' '));

// Mock lumin-ui/kiwi-ui
jest.mock('lumin-ui/kiwi-ui', () => ({
  Menu: ({ children, ComponentTarget }: any) => require('react').createElement('div', { 'data-testid': 'menu' }, ComponentTarget, children),
  MenuItem: ({ children, onClick, rightSection }: any) => require('react').createElement('div', { 'data-testid': 'menu-item', onClick }, children, rightSection),
  Icomoon: ({ type }: any) => require('react').createElement('span', { 'data-testid': `kiwi-icon-${type}` }),
  IconButton: ({ icon, onClick }: any) => require('react').createElement('button', { 'data-testid': 'icon-button', onClick }),
}));

// Mock document item styles
jest.mock('@web-new-ui/components/DocumentListItem/DocumentListItem.module.scss', () => ({
  wrapperWithoutOwnerName: 'wrapperWithoutOwnerName',
  wrapperWithOwnerName: 'wrapperWithOwnerName',
}));

// Mock Icomoon
jest.mock('luminComponents/Icomoon', () => () => require('react').createElement('span', { 'data-testid': 'icomoon' }));

// Mock PopperButton
jest.mock('luminComponents/PopperButton', () => ({ children, renderPopperContent }: any) => 
  require('react').createElement('div', { 'data-testid': 'popper-button' }, 
    children,
    require('react').createElement('div', { 'data-testid': 'popper-content' },
      renderPopperContent?.({ closePopper: jest.fn() })
    )
  )
);

// Mock HeaderPopperMenu
jest.mock('luminComponents/Shared/HeaderPopperMenu', () => ({ data, activeOption, handleClick }: any) => 
  require('react').createElement('div', { 'data-testid': 'header-popper-menu' },
    data?.map((item: any, i: number) => 
      require('react').createElement('button', { key: i, 'data-testid': `filter-option-${i}`, onClick: () => handleClick(item) }, item.label)
    )
  )
);

// Mock hooks
jest.mock('hooks', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
  useGetFolderType: () => mockState.folderType,
  useEnableWebReskin: () => ({ isEnableReskin: mockState.isEnableReskin }),
  usePersonalDocPathMatch: () => mockState.isPersonalDocPath,
}));

// Mock useChatbotStore
jest.mock('features/WebChatBot/hooks/useChatbotStore', () => ({
  useChatbotStore: () => ({ isVisible: mockState.isVisible }),
}));

// Mock constants
jest.mock('constants/documentConstants', () => ({
  ownedOptions: [
    { value: 'anyone', label: 'byAnyone' },
    { value: 'me', label: 'byMe' },
    { value: 'others', label: 'byOthers' },
  ],
  filterCondition: { ownerFilter: 'owner', modifiedFilter: 'modified' },
  ownerFilter: { byAnyone: 'anyone', byMe: 'me', byOthers: 'others' },
  folderType: { STARRED: 'starred', ORGANIZATION: 'organization', TEAMS: 'teams', INDIVIDUAL: 'individual', SHARED: 'shared' },
  layoutType: { list: 'list', grid: 'grid' },
  modifiedFilter: { modifiedByAnyone: 'modifiedByAnyone' },
}));

jest.mock('constants/lumin-common', () => ({
  CHECKBOX_TYPE: { DELETE: 'delete' },
}));

jest.mock('constants/styles', () => ({
  Colors: { NEUTRAL_50: '#666' },
}));

// Mock styled components
jest.mock('../DocumentListHeader.styled', () => ({
  Container: ({ children, $isEmpty, $isSelecting }: any) => 
    require('react').createElement('div', { 'data-testid': 'container', 'data-empty': String($isEmpty), 'data-selecting': String($isSelecting) }, children),
  ContainerReskin: ({ children }: any) => require('react').createElement('div', { 'data-testid': 'container-reskin' }, children),
  Title: ({ children }: any) => require('react').createElement('span', { 'data-testid': 'title' }, children),
  TitleReskin: ({ children }: any) => require('react').createElement('span', { 'data-testid': 'title-reskin' }, children),
  OwnerTitle: ({ children, onClick, $filterable }: any) => 
    require('react').createElement('span', { 'data-testid': 'owner-title', 'data-filterable': String($filterable), onClick }, children),
  OwnerTitleReskin: ({ children }: any) => require('react').createElement('span', { 'data-testid': 'owner-title-reskin' }, children),
  TitleTablet: ({ children, $display }: any) => 
    require('react').createElement('span', { 'data-testid': 'title-tablet', 'data-display': String($display) }, children),
  TitleTabletReskin: ({ children }: any) => require('react').createElement('span', { 'data-testid': 'title-tablet-reskin' }, children),
  UploadedTitle: ({ children }: any) => require('react').createElement('span', { 'data-testid': 'uploaded-title' }, children),
  UploadedTitleReskin: ({ children }: any) => require('react').createElement('span', { 'data-testid': 'uploaded-title-reskin' }, children),
  SelectDocument: ({ children, onClick }: any) => 
    require('react').createElement('button', { 'data-testid': 'select-document', onClick }, children),
  SelectDocumentReskin: ({ children, onClick }: any) => 
    require('react').createElement('button', { 'data-testid': 'select-document-reskin', onClick }, children),
  DisplayTablet: ({ children }: any) => require('react').createElement('div', { 'data-testid': 'display-tablet' }, children),
  MobileDisplay: ({ children }: any) => require('react').createElement('div', { 'data-testid': 'mobile-display' }, children),
}));

// Mock styles
jest.mock('../DocumentListHeader.module.scss', () => ({
  container: 'container',
  displayTablet: 'displayTablet',
  uploadedTitle: 'uploadedTitle',
  column: 'column',
  storage: 'storage',
  lastOpened: 'lastOpened',
  mobileDisplay: 'mobileDisplay',
  ownerTitle: 'ownerTitle',
  wrapperWithOwnerName: 'wrapperWithOwnerName',
}));

import DocumentListHeader from '../DocumentListHeader';

describe('DocumentListHeader RTL', () => {
  const mockSetOwnedFilter = jest.fn();
  const mockSetLastModifiedFilter = jest.fn();
  const mockSetSelectDocMode = jest.fn();
  const mockSetRemoveDocList = jest.fn();
  const mockSetRemoveFolderList = jest.fn();

  const defaultProps = {
    ownedFilterCondition: 'anyone',
    setOwnedFilter: mockSetOwnedFilter,
    setLastModifiedFilter: mockSetLastModifiedFilter,
    type: 'list',
    isEmptyList: false,
    selectedDocList: [],
    selectDocMode: false,
    setSelectDocMode: mockSetSelectDocMode,
    setRemoveDocList: mockSetRemoveDocList,
    setRemoveFolderList: mockSetRemoveFolderList,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockState.isEnableReskin = false;
    mockState.folderType = 'individual';
    mockState.isPersonalDocPath = false;
    mockState.isVisible = false;
  });

  describe('Non-reskin mode', () => {
    it('renders container', () => {
      render(<DocumentListHeader {...defaultProps} />);
      expect(screen.getByTestId('container')).toBeInTheDocument();
    });

    it('renders uploaded title', () => {
      render(<DocumentListHeader {...defaultProps} />);
      expect(screen.getByTestId('uploaded-title')).toHaveTextContent('common.uploaded');
    });

    it('renders select button', () => {
      render(<DocumentListHeader {...defaultProps} />);
      expect(screen.getAllByTestId('select-document').length).toBeGreaterThan(0);
    });

    it('toggles selection mode when select clicked', () => {
      render(<DocumentListHeader {...defaultProps} />);
      fireEvent.click(screen.getAllByTestId('select-document')[0]);
      expect(mockSetSelectDocMode).toHaveBeenCalledWith(true);
    });

    it('clears lists when exiting select mode', () => {
      render(<DocumentListHeader {...defaultProps} selectDocMode={true} />);
      fireEvent.click(screen.getAllByTestId('select-document')[0]);
      expect(mockSetRemoveDocList).toHaveBeenCalledWith({ data: [], type: 'delete' });
      expect(mockSetRemoveFolderList).toHaveBeenCalledWith({ data: [], type: 'delete' });
    });

    it('shows cancel text when in select mode', () => {
      render(<DocumentListHeader {...defaultProps} selectDocMode={true} />);
      expect(screen.getAllByText('common.cancel').length).toBeGreaterThan(0);
    });

    it('shows select text when not in select mode', () => {
      render(<DocumentListHeader {...defaultProps} selectDocMode={false} />);
      expect(screen.getAllByText('common.select').length).toBeGreaterThan(0);
    });

    it('shows storage column for list type', () => {
      render(<DocumentListHeader {...defaultProps} type="list" />);
      const tablets = screen.getAllByTestId('title-tablet');
      expect(tablets[0]).toHaveAttribute('data-display', 'true');
    });

    it('hides storage column for grid type', () => {
      render(<DocumentListHeader {...defaultProps} type="grid" />);
      const tablets = screen.getAllByTestId('title-tablet');
      expect(tablets[0]).toHaveAttribute('data-display', 'false');
    });

    it('passes isEmpty prop to container', () => {
      render(<DocumentListHeader {...defaultProps} isEmptyList={true} />);
      expect(screen.getByTestId('container')).toHaveAttribute('data-empty', 'true');
    });

    it('passes isSelecting prop to container', () => {
      render(<DocumentListHeader {...defaultProps} selectedDocList={[{ _id: '1' }]} />);
      expect(screen.getByTestId('container')).toHaveAttribute('data-selecting', 'true');
    });
  });

  describe('Reskin mode', () => {
    beforeEach(() => {
      mockState.isEnableReskin = true;
    });

    it('returns null when isEmptyList is true', () => {
      const { container } = render(<DocumentListHeader {...defaultProps} isEmptyList={true} />);
      expect(container.innerHTML).toBe('');
    });

    it('returns null when selectedDocList has items', () => {
      const { container } = render(<DocumentListHeader {...defaultProps} selectedDocList={[{ _id: '1' }]} />);
      expect(container.innerHTML).toBe('');
    });

    it('returns null when selectDocMode is true', () => {
      const { container } = render(<DocumentListHeader {...defaultProps} selectDocMode={true} />);
      expect(container.innerHTML).toBe('');
    });

    it('renders content when list is not empty', () => {
      render(<DocumentListHeader {...defaultProps} />);
      expect(screen.getByText('common.name')).toBeInTheDocument();
    });

    it('renders storage column', () => {
      render(<DocumentListHeader {...defaultProps} type="list" />);
      expect(screen.getByText('common.storage')).toBeInTheDocument();
    });

    it('renders last opened column', () => {
      render(<DocumentListHeader {...defaultProps} type="list" />);
      expect(screen.getByText('documentPage.lastOpened')).toBeInTheDocument();
    });
  });

  describe('Owner filter dropdown', () => {
    beforeEach(() => {
      mockState.folderType = 'organization';
    });

    it('renders dropdown for organization folder', () => {
      render(<DocumentListHeader {...defaultProps} type="list" />);
      expect(screen.getByTestId('popper-button')).toBeInTheDocument();
    });

    it('renders dropdown for teams folder', () => {
      mockState.folderType = 'teams';
      render(<DocumentListHeader {...defaultProps} type="list" />);
      expect(screen.getByTestId('popper-button')).toBeInTheDocument();
    });

    it('renders dropdown for starred folder', () => {
      mockState.folderType = 'starred';
      render(<DocumentListHeader {...defaultProps} type="list" />);
      expect(screen.getByTestId('popper-button')).toBeInTheDocument();
    });

    it('does not render dropdown for individual folder', () => {
      mockState.folderType = 'individual';
      render(<DocumentListHeader {...defaultProps} type="list" />);
      expect(screen.queryByTestId('popper-button')).not.toBeInTheDocument();
    });

    it('calls setOwnedFilter when filter option clicked', () => {
      render(<DocumentListHeader {...defaultProps} type="list" />);
      fireEvent.click(screen.getByTestId('filter-option-1'));
      expect(mockSetOwnedFilter).toHaveBeenCalledWith('me');
    });
  });

  describe('Personal documents route', () => {
    it('hides owner column on personal docs route', () => {
      mockState.isPersonalDocPath = true;
      mockState.isEnableReskin = true;
      render(<DocumentListHeader {...defaultProps} type="list" />);
      expect(screen.queryByTestId('owner-title-reskin')).not.toBeInTheDocument();
    });
  });

  describe('Grid layout', () => {
    it('shows foldersAndFiles title for grid type', () => {
      mockState.isEnableReskin = true;
      render(<DocumentListHeader {...defaultProps} type="grid" />);
      expect(screen.getByText('documentPage.foldersAndFiles')).toBeInTheDocument();
    });
  });

  describe('Chatbot state', () => {
    it('sets data-chatbot-opened attribute', () => {
      mockState.isEnableReskin = true;
      mockState.isVisible = true;
      render(<DocumentListHeader {...defaultProps} />);
      expect(document.querySelector('[data-chatbot-opened="true"]')).toBeInTheDocument();
    });
  });

  describe('Reskin owner filter menu', () => {
    beforeEach(() => {
      mockState.isEnableReskin = true;
      mockState.folderType = 'organization';
    });

    it('renders kiwi menu for reskin mode', () => {
      render(<DocumentListHeader {...defaultProps} type="list" />);
      expect(screen.getByTestId('menu')).toBeInTheDocument();
    });

    it('renders menu items', () => {
      render(<DocumentListHeader {...defaultProps} type="list" />);
      expect(screen.getAllByTestId('menu-item').length).toBeGreaterThan(0);
    });
  });
});

