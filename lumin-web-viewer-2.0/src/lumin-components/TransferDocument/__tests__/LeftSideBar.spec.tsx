import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mutable mock state
const mockState = {
  isEnableReskin: false,
  isTabletMatch: false,
  isOldProfessional: true,
  isPersonalTargetSelected: false,
  showAllLocation: false,
  selectedTargetId: 'org-1',
  destinationScrollTo: null as string | null,
  destinationType: 'ORGANIZATION',
  setSelectedTarget: jest.fn(),
  setDestination: jest.fn(),
  setExpandedItem: jest.fn(),
  setPersonalTargetSelected: jest.fn(),
  getFolders: jest.fn(),
  getNestedFolders: jest.fn().mockResolvedValue({}),
};

jest.mock('luminComponents/TransferDocument/hooks', () => ({
  useTransferDocumentContext: () => ({
    getter: {
      organizations: [
        { _id: 'org-1', name: 'Organization 1', avatarRemoteId: 'avatar-1' },
        { _id: 'org-2', name: 'Organization 2', avatarRemoteId: 'avatar-2' },
      ],
      selectedTarget: { _id: mockState.selectedTargetId, name: 'Organization 1' },
      personalData: {
        _id: 'user-123',
        isOldProfessional: mockState.isOldProfessional,
        originUser: { _id: 'user-123', name: 'Test User' },
      },
      getFolders: mockState.getFolders,
      context: { showAllLocation: mockState.showAllLocation },
      isPersonalTargetSelected: mockState.isPersonalTargetSelected,
      destination: {
        scrollTo: mockState.destinationScrollTo,
        type: mockState.destinationType,
      },
    },
    setter: {
      setSelectedTarget: mockState.setSelectedTarget,
      setExpandedItem: mockState.setExpandedItem,
      setDestination: mockState.setDestination,
      setPersonalTargetSelected: mockState.setPersonalTargetSelected,
      getNestedFolders: mockState.getNestedFolders,
    },
  }),
}));

jest.mock('hooks', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
  useTabletMatch: () => mockState.isTabletMatch,
  useEnableWebReskin: () => ({ isEnableReskin: mockState.isEnableReskin }),
}));

jest.mock('hooks/useKeyboardAccessibility', () => ({
  __esModule: true,
  default: () => ({ onKeyDown: jest.fn() }),
}));

jest.mock('luminComponents/Icomoon', () => ({
  __esModule: true,
  default: ({ className }: { className: string }) =>
    require('react').createElement('span', { 'data-testid': `icon-${className}` }, 'icon'),
}));

jest.mock('luminComponents/Shared/Tooltip', () => ({
  __esModule: true,
  default: ({ children, title }: React.PropsWithChildren<{ title: string }>) =>
    require('react').createElement('div', { 'data-testid': 'tooltip', 'data-title': title }, children),
}));

jest.mock('lumin-ui/kiwi-ui', () => ({
  Icomoon: ({ type }: { type: string }) =>
    require('react').createElement('span', { 'data-testid': `kiwi-icon-${type}` }, 'icon'),
  PlainTooltip: ({ children, content }: React.PropsWithChildren<{ content: string }>) =>
    require('react').createElement('div', { 'data-testid': 'plain-tooltip', 'data-content': content }, children),
  Avatar: ({ src }: { src: string }) =>
    require('react').createElement('img', { 'data-testid': 'kiwi-avatar', src }),
}));

jest.mock('assets/reskin/lumin-svgs/default-org-avatar.png', () => 'default-org-avatar.png');

jest.mock('utils/avatar', () => ({
  __esModule: true,
  default: { getAvatar: jest.fn((id) => (id ? `avatar-url-${id}` : null)) },
}));

jest.mock('features/NestedFolders/constants', () => ({
  RootTypes: { Personal: 'Personal', Organization: 'Organization' },
}));

jest.mock('constants/folderConstant', () => ({
  FolderType: { PERSONAL: 'PERSONAL', ORGANIZATION: 'ORGANIZATION' },
}));

jest.mock('constants/styles', () => ({
  Colors: { NEUTRAL_100: '#000' },
}));

jest.mock('luminComponents/TransferDocument/components/LeftSideBar/LeftSideBar.styled', () => ({
  LeftSideBarContainer: ({ children }: React.PropsWithChildren<object>) =>
    require('react').createElement('div', { 'data-testid': 'left-sidebar-container' }, children),
  LeftSideBarWrapper: ({ children }: React.PropsWithChildren<object>) =>
    require('react').createElement('div', { 'data-testid': 'left-sidebar-wrapper' }, children),
  LeftSideBarItem: ({ children, onClick, $isActive }: any) =>
    require('react').createElement('div', { 'data-testid': 'left-sidebar-item', onClick, 'data-active': $isActive }, children),
  PersonalSection: ({ children, onClick, $isActive }: any) =>
    require('react').createElement('div', { 'data-testid': 'personal-section', onClick, 'data-active': $isActive }, children),
  PersonalSectionReskin: ({ children, onClick }: any) =>
    require('react').createElement('div', { 'data-testid': 'personal-section-reskin', onClick }, children),
  Title: ({ children }: React.PropsWithChildren<object>) =>
    require('react').createElement('div', { 'data-testid': 'title' }, children),
  TitleReskin: ({ children }: React.PropsWithChildren<object>) =>
    require('react').createElement('div', { 'data-testid': 'title-reskin' }, children),
  ItemName: ({ children }: React.PropsWithChildren<object>) =>
    require('react').createElement('span', { 'data-testid': 'item-name' }, children),
  ItemNameReskin: ({ children }: React.PropsWithChildren<object>) =>
    require('react').createElement('span', { 'data-testid': 'item-name-reskin' }, children),
  ItemReskin: ({ children, onClick }: any) =>
    require('react').createElement('div', { 'data-testid': 'item-reskin', onClick }, children),
  LeftSideBarWrapperReskin: ({ children }: React.PropsWithChildren<object>) =>
    require('react').createElement('div', { 'data-testid': 'left-sidebar-wrapper-reskin' }, children),
  Avatar: ({ children, src }: React.PropsWithChildren<{ src: string }>) =>
    require('react').createElement('div', { 'data-testid': 'styled-avatar', 'data-src': src }, children),
  NextArrow: ({ children }: React.PropsWithChildren<object>) =>
    require('react').createElement('div', { 'data-testid': 'next-arrow' }, children),
}));

jest.mock('luminComponents/TransferDocument/components/LeftSideBar/LeftSideBar.module.scss', () => ({
  container: 'container',
  content: 'content',
  text: 'text',
}));

import LeftSideBar from 'luminComponents/TransferDocument/components/LeftSideBar';

describe('LeftSideBar', () => {
  const defaultProps = {
    collapsed: false,
    setDisplayToggleButton: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // Reset state
    mockState.isEnableReskin = false;
    mockState.isTabletMatch = false;
    mockState.isOldProfessional = true;
    mockState.isPersonalTargetSelected = false;
    mockState.showAllLocation = false;
    mockState.selectedTargetId = 'org-1';
    mockState.destinationScrollTo = null;
    mockState.destinationType = 'ORGANIZATION';
  });

  describe('Reskin Mode', () => {
    beforeEach(() => {
      mockState.isEnableReskin = true;
    });

    it('should render reskin container with correct class', () => {
      const { container } = render(<LeftSideBar {...defaultProps} />);
      expect(container.querySelector('.container')).toBeInTheDocument();
    });

    it('should render title in reskin mode', () => {
      render(<LeftSideBar {...defaultProps} />);
      expect(screen.getByTestId('title-reskin')).toBeInTheDocument();
    });

    it('should render organization items in reskin mode', () => {
      render(<LeftSideBar {...defaultProps} />);
      expect(screen.getAllByTestId('item-reskin')).toHaveLength(2);
    });

    it('should render personal section in reskin when isOldProfessional', () => {
      mockState.isOldProfessional = true;
      render(<LeftSideBar {...defaultProps} />);
      expect(screen.getByTestId('personal-section-reskin')).toBeInTheDocument();
    });

    it('should NOT render personal section in reskin when NOT isOldProfessional', () => {
      mockState.isOldProfessional = false;
      render(<LeftSideBar {...defaultProps} />);
      expect(screen.queryByTestId('personal-section-reskin')).not.toBeInTheDocument();
    });

    it('should call setDisplayToggleButton(true) on mouse enter', () => {
      const { container } = render(<LeftSideBar {...defaultProps} />);
      fireEvent.mouseEnter(container.querySelector('.container')!);
      expect(defaultProps.setDisplayToggleButton).toHaveBeenCalledWith(true);
    });

    it('should call setDisplayToggleButton(false) on mouse leave', () => {
      const { container } = render(<LeftSideBar {...defaultProps} />);
      fireEvent.mouseLeave(container.querySelector('.container')!);
      expect(defaultProps.setDisplayToggleButton).toHaveBeenCalledWith(false);
    });

    describe('Personal section click in reskin', () => {
      it('should NOT call setters when already selected', () => {
        mockState.isPersonalTargetSelected = true;
        render(<LeftSideBar {...defaultProps} />);
        fireEvent.click(screen.getByTestId('personal-section-reskin'));
        expect(mockState.setSelectedTarget).not.toHaveBeenCalled();
      });

      it('should call setters when not selected', () => {
        mockState.isPersonalTargetSelected = false;
        render(<LeftSideBar {...defaultProps} />);
        fireEvent.click(screen.getByTestId('personal-section-reskin'));
        expect(mockState.setSelectedTarget).toHaveBeenCalled();
        expect(mockState.setDestination).toHaveBeenCalled();
        expect(mockState.setPersonalTargetSelected).toHaveBeenCalledWith(true);
        expect(mockState.getFolders).toHaveBeenCalled();
        expect(mockState.getNestedFolders).toHaveBeenCalled();
      });
    });

    describe('Organization item click in reskin', () => {
      it('should call setters when clicking organization', () => {
        render(<LeftSideBar {...defaultProps} />);
        fireEvent.click(screen.getAllByTestId('item-reskin')[0]);
        expect(mockState.setSelectedTarget).toHaveBeenCalled();
        expect(mockState.setDestination).toHaveBeenCalled();
        expect(mockState.setExpandedItem).toHaveBeenCalledWith('');
        expect(mockState.setPersonalTargetSelected).toHaveBeenCalledWith(false);
      });
    });
  });

  describe('Non-Reskin Mode', () => {
    beforeEach(() => {
      mockState.isEnableReskin = false;
    });

    it('should render left sidebar container', () => {
      render(<LeftSideBar {...defaultProps} />);
      expect(screen.getByTestId('left-sidebar-container')).toBeInTheDocument();
    });

    it('should render personal section when isOldProfessional', () => {
      mockState.isOldProfessional = true;
      render(<LeftSideBar {...defaultProps} />);
      expect(screen.getByTestId('personal-section')).toBeInTheDocument();
    });

    it('should NOT render personal section when NOT isOldProfessional', () => {
      mockState.isOldProfessional = false;
      render(<LeftSideBar {...defaultProps} />);
      expect(screen.queryByTestId('personal-section')).not.toBeInTheDocument();
    });

    it('should render organization items', () => {
      render(<LeftSideBar {...defaultProps} />);
      expect(screen.getAllByTestId('left-sidebar-item')).toHaveLength(2);
    });

    describe('Title visibility (showPersonalSection || showAllLocation)', () => {
      it('should show title when isOldProfessional', () => {
        mockState.isOldProfessional = true;
        mockState.showAllLocation = false;
        render(<LeftSideBar {...defaultProps} />);
        expect(screen.getByTestId('title')).toBeInTheDocument();
      });

      it('should show title when showAllLocation', () => {
        mockState.isOldProfessional = false;
        mockState.showAllLocation = true;
        render(<LeftSideBar {...defaultProps} />);
        expect(screen.getByTestId('title')).toBeInTheDocument();
      });

      it('should NOT show title when both are false', () => {
        mockState.isOldProfessional = false;
        mockState.showAllLocation = false;
        render(<LeftSideBar {...defaultProps} />);
        expect(screen.queryByTestId('title')).not.toBeInTheDocument();
      });
    });

    describe('Personal section click', () => {
      it('should call setters when clicking personal section', () => {
        render(<LeftSideBar {...defaultProps} />);
        fireEvent.click(screen.getByTestId('personal-section'));
        expect(mockState.setSelectedTarget).toHaveBeenCalled();
        expect(mockState.setDestination).toHaveBeenCalled();
        expect(mockState.setPersonalTargetSelected).toHaveBeenCalledWith(true);
        expect(mockState.getFolders).toHaveBeenCalled();
      });
    });

    describe('Organization item click', () => {
      it('should call setters when clicking organization item', () => {
        render(<LeftSideBar {...defaultProps} />);
        fireEvent.click(screen.getAllByTestId('left-sidebar-item')[0]);
        expect(mockState.setSelectedTarget).toHaveBeenCalled();
        expect(mockState.setDestination).toHaveBeenCalled();
        expect(mockState.setExpandedItem).toHaveBeenCalledWith('');
        expect(mockState.setPersonalTargetSelected).toHaveBeenCalledWith(false);
      });
    });
  });

  describe('renderNextArrow', () => {
    it('should render next arrow when NOT tablet match', () => {
      mockState.isTabletMatch = false;
      render(<LeftSideBar {...defaultProps} />);
      expect(screen.getAllByTestId('next-arrow').length).toBeGreaterThan(0);
    });

    it('should NOT render next arrow when tablet match', () => {
      mockState.isTabletMatch = true;
      render(<LeftSideBar {...defaultProps} />);
      expect(screen.queryByTestId('next-arrow')).not.toBeInTheDocument();
    });
  });

  describe('useEffect scroll behavior', () => {
    it('should not scroll when destination.scrollTo is null', () => {
      mockState.destinationScrollTo = null;
      render(<LeftSideBar {...defaultProps} />);
      expect(mockState.setDestination).not.toHaveBeenCalled();
    });

    it('should not scroll when destination.type is not ORGANIZATION', () => {
      mockState.destinationScrollTo = 'org-1';
      mockState.destinationType = 'PERSONAL';
      render(<LeftSideBar {...defaultProps} />);
      expect(mockState.setDestination).not.toHaveBeenCalled();
    });
  });

  describe('Avatar rendering', () => {
    it('should render styled avatar in non-reskin mode', () => {
      mockState.isEnableReskin = false;
      render(<LeftSideBar {...defaultProps} />);
      expect(screen.getAllByTestId('styled-avatar')).toHaveLength(2);
    });

    it('should render kiwi avatar in reskin mode', () => {
      mockState.isEnableReskin = true;
      render(<LeftSideBar {...defaultProps} />);
      expect(screen.getAllByTestId('kiwi-avatar')).toHaveLength(2);
    });
  });

  describe('Tooltip rendering', () => {
    it('should render tooltip in non-reskin mode', () => {
      mockState.isEnableReskin = false;
      render(<LeftSideBar {...defaultProps} />);
      expect(screen.getAllByTestId('tooltip')).toHaveLength(2);
    });

    it('should render plain tooltip in reskin mode', () => {
      mockState.isEnableReskin = true;
      render(<LeftSideBar {...defaultProps} />);
      expect(screen.getAllByTestId('plain-tooltip')).toHaveLength(2);
    });
  });

  describe('Active state', () => {
    it('should mark organization as active when selected', () => {
      mockState.isEnableReskin = false;
      mockState.selectedTargetId = 'org-1';
      mockState.isPersonalTargetSelected = false;
      render(<LeftSideBar {...defaultProps} />);
      const items = screen.getAllByTestId('left-sidebar-item');
      expect(items[0]).toHaveAttribute('data-active', 'true');
      expect(items[1]).toHaveAttribute('data-active', 'false');
    });

    it('should not mark org as active when personal is selected', () => {
      mockState.isEnableReskin = false;
      mockState.selectedTargetId = 'org-1';
      mockState.isPersonalTargetSelected = true;
      render(<LeftSideBar {...defaultProps} />);
      const items = screen.getAllByTestId('left-sidebar-item');
      expect(items[0]).toHaveAttribute('data-active', 'false');
    });
  });
});
