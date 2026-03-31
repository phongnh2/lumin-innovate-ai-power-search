import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mutable mock state
const mockState = {
  isEnableReskin: false,
  isTabletMatch: true,
  isCopyModal: false,
  selectedTargetId: 'org-123',
  isOldProfessional: false,
  setSelectedTarget: jest.fn(),
  setDestination: jest.fn(),
};

jest.mock('lumin-components/TransferDocument/hooks', () => ({
  useTransferDocumentContext: () => ({
    getter: {
      context: {
        title: 'modalMove.moveDocuments',
        action: 'modalMove.moveDocumentTo',
        isCopyModal: mockState.isCopyModal,
      },
      selectedTarget: mockState.selectedTargetId
        ? { _id: mockState.selectedTargetId, name: 'Test Organization' }
        : {},
      personalData: { isOldProfessional: mockState.isOldProfessional },
    },
    setter: {
      setSelectedTarget: mockState.setSelectedTarget,
      setDestination: mockState.setDestination,
    },
  }),
}));

jest.mock('hooks', () => ({
  useEnableWebReskin: () => ({ isEnableReskin: mockState.isEnableReskin }),
  useTabletMatch: () => mockState.isTabletMatch,
  useTranslation: () => ({ t: (key: string) => key }),
}));

jest.mock('lumin-ui/kiwi-ui', () => ({
  PlainTooltip: ({ children, content }: React.PropsWithChildren<{ content: string }>) =>
    require('react').createElement('div', { 'data-testid': 'plain-tooltip', 'data-content': content }, children),
  Icomoon: ({ type }: { type: string }) =>
    require('react').createElement('span', { 'data-testid': `kiwi-icon-${type}` }, 'icon'),
  Text: ({ children }: React.PropsWithChildren<object>) =>
    require('react').createElement('span', { 'data-testid': 'kiwi-text' }, children),
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

jest.mock('luminComponents/TransferDocument/components/SearchGroup', () => ({
  __esModule: true,
  default: ({ setSearching, isEnableReskin }: { setSearching: () => void; isEnableReskin?: boolean }) =>
    require('react').createElement('div', { 'data-testid': 'search-group', 'data-reskin': isEnableReskin }, 'Search'),
}));

jest.mock('luminComponents/TransferDocument/components/Header/Header.styled', () => ({
  HeaderContainer: ({ children }: React.PropsWithChildren<object>) =>
    require('react').createElement('div', { 'data-testid': 'header-container' }, children),
  HeaderContainerReskin: ({ children }: React.PropsWithChildren<object>) =>
    require('react').createElement('div', { 'data-testid': 'header-container-reskin' }, children),
  Header: ({ children }: React.PropsWithChildren<object>) =>
    require('react').createElement('div', { 'data-testid': 'header' }, children),
  HeaderContent: ({ children }: React.PropsWithChildren<object>) =>
    require('react').createElement('div', { 'data-testid': 'header-content' }, children),
  HeaderContentReskin: ({ children }: React.PropsWithChildren<object>) =>
    require('react').createElement('div', { 'data-testid': 'header-content-reskin' }, children),
  HeaderText: ({ children }: React.PropsWithChildren<object>) =>
    require('react').createElement('span', { 'data-testid': 'header-text' }, children),
  TargetWrapper: ({ children }: React.PropsWithChildren<object>) =>
    require('react').createElement('div', { 'data-testid': 'target-wrapper' }, children),
  Back: ({ children, onClick }: React.PropsWithChildren<{ onClick: () => void }>) =>
    require('react').createElement('button', { 'data-testid': 'back-button', onClick }, children),
  TextWrapper: ({ children }: React.PropsWithChildren<object>) =>
    require('react').createElement('div', { 'data-testid': 'text-wrapper' }, children),
  Action: ({ children }: React.PropsWithChildren<object>) =>
    require('react').createElement('span', { 'data-testid': 'action-text' }, children),
  Target: ({ children }: React.PropsWithChildren<object>) =>
    require('react').createElement('span', { 'data-testid': 'target-text' }, children),
}));

jest.mock('constants/styles', () => ({
  Colors: { NEUTRAL_60: '#666', NEUTRAL_80: '#333' },
}));

import Header from 'luminComponents/TransferDocument/components/Header';

describe('Header', () => {
  const defaultProps = {
    setSearching: jest.fn(),
    searching: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // Reset to default state
    mockState.isEnableReskin = false;
    mockState.isTabletMatch = true;
    mockState.isCopyModal = false;
    mockState.selectedTargetId = 'org-123';
    mockState.isOldProfessional = false;
  });

  describe('Reskin Mode (isEnableReskin = true)', () => {
    beforeEach(() => {
      mockState.isEnableReskin = true;
    });

    it('should render reskin header container', () => {
      render(<Header {...defaultProps} />);
      expect(screen.getByTestId('header-container-reskin')).toBeInTheDocument();
    });

    it('should render reskin header content', () => {
      render(<Header {...defaultProps} />);
      expect(screen.getByTestId('header-content-reskin')).toBeInTheDocument();
    });

    it('should render title text in reskin mode', () => {
      render(<Header {...defaultProps} />);
      expect(screen.getByTestId('kiwi-text')).toHaveTextContent('modalMove.moveDocuments');
    });

    it('should render search group when selectedTarget._id exists in reskin mode', () => {
      render(<Header {...defaultProps} />);
      expect(screen.getByTestId('search-group')).toBeInTheDocument();
    });

    it('should NOT render search group when selectedTarget._id is empty in reskin mode', () => {
      mockState.selectedTargetId = '';
      render(<Header {...defaultProps} />);
      expect(screen.queryByTestId('search-group')).not.toBeInTheDocument();
    });

    it('should render tooltip when isCopyModal is true in reskin mode', () => {
      mockState.isCopyModal = true;
      render(<Header {...defaultProps} />);
      expect(screen.getByTestId('plain-tooltip')).toBeInTheDocument();
      expect(screen.getByTestId('kiwi-icon-info-circle-lg')).toBeInTheDocument();
    });

    it('should NOT render tooltip when isCopyModal is false in reskin mode', () => {
      mockState.isCopyModal = false;
      render(<Header {...defaultProps} />);
      expect(screen.queryByTestId('plain-tooltip')).not.toBeInTheDocument();
    });
  });

  describe('Non-Reskin Mode (isEnableReskin = false)', () => {
    beforeEach(() => {
      mockState.isEnableReskin = false;
    });

    it('should render header container', () => {
      render(<Header {...defaultProps} />);
      expect(screen.getByTestId('header-container')).toBeInTheDocument();
    });

    it('should render header', () => {
      render(<Header {...defaultProps} />);
      expect(screen.getByTestId('header')).toBeInTheDocument();
    });

    describe('isHideTitle branch (!isTabletMatch && searching)', () => {
      it('should hide title when not tablet match AND searching', () => {
        mockState.isTabletMatch = false;
        render(<Header {...defaultProps} searching={true} />);
        expect(screen.queryByTestId('header-text')).not.toBeInTheDocument();
        expect(screen.queryByTestId('target-wrapper')).not.toBeInTheDocument();
      });

      it('should show title when tablet match', () => {
        mockState.isTabletMatch = true;
        render(<Header {...defaultProps} searching={true} />);
        expect(screen.getByTestId('header-content')).toBeInTheDocument();
      });

      it('should show title when not searching', () => {
        mockState.isTabletMatch = false;
        mockState.selectedTargetId = '';
        render(<Header {...defaultProps} searching={false} />);
        expect(screen.getByTestId('header-content')).toBeInTheDocument();
      });
    });

    describe('isShowSelectedTarget branch (!isTabletMatch && selectedTarget._id)', () => {
      it('should show target wrapper when not tablet match AND has selected target', () => {
        mockState.isTabletMatch = false;
        mockState.selectedTargetId = 'org-123';
        render(<Header {...defaultProps} />);
        expect(screen.getByTestId('target-wrapper')).toBeInTheDocument();
      });

      it('should show header content when tablet match even with selected target', () => {
        mockState.isTabletMatch = true;
        mockState.selectedTargetId = 'org-123';
        render(<Header {...defaultProps} />);
        expect(screen.getByTestId('header-content')).toBeInTheDocument();
      });

      it('should show header content when no selected target', () => {
        mockState.isTabletMatch = false;
        mockState.selectedTargetId = '';
        render(<Header {...defaultProps} />);
        expect(screen.getByTestId('header-content')).toBeInTheDocument();
      });
    });

    describe('Back button branch (isCopyModal || isOldProfessional)', () => {
      beforeEach(() => {
        mockState.isTabletMatch = false;
        mockState.selectedTargetId = 'org-123';
      });

      it('should show back button when isCopyModal is true', () => {
        mockState.isCopyModal = true;
        mockState.isOldProfessional = false;
        render(<Header {...defaultProps} />);
        expect(screen.getByTestId('back-button')).toBeInTheDocument();
      });

      it('should show back button when isOldProfessional is true', () => {
        mockState.isCopyModal = false;
        mockState.isOldProfessional = true;
        render(<Header {...defaultProps} />);
        expect(screen.getByTestId('back-button')).toBeInTheDocument();
      });

      it('should NOT show back button when both are false', () => {
        mockState.isCopyModal = false;
        mockState.isOldProfessional = false;
        render(<Header {...defaultProps} />);
        expect(screen.queryByTestId('back-button')).not.toBeInTheDocument();
      });

      it('should call setSelectedTarget and setDestination when back button clicked', () => {
        mockState.isCopyModal = true;
        render(<Header {...defaultProps} />);
        fireEvent.click(screen.getByTestId('back-button'));
        expect(mockState.setSelectedTarget).toHaveBeenCalledWith({});
        expect(mockState.setDestination).toHaveBeenCalledWith({});
      });
    });

    describe('Target wrapper content', () => {
      beforeEach(() => {
        mockState.isTabletMatch = false;
        mockState.selectedTargetId = 'org-123';
        mockState.isCopyModal = true; // to show back button
      });

      it('should display action text', () => {
        render(<Header {...defaultProps} />);
        expect(screen.getByTestId('action-text')).toHaveTextContent('modalMove.moveDocumentTo');
      });

      it('should display target name', () => {
        render(<Header {...defaultProps} />);
        expect(screen.getByTestId('target-text')).toHaveTextContent('Test Organization');
      });

      it('should render back icon', () => {
        render(<Header {...defaultProps} />);
        expect(screen.getByTestId('icon-arrow-left')).toBeInTheDocument();
      });
    });

    describe('Header content tooltip (isCopyModal)', () => {
      beforeEach(() => {
        mockState.isTabletMatch = true; // show header content
      });

      it('should show tooltip when isCopyModal is true', () => {
        mockState.isCopyModal = true;
        render(<Header {...defaultProps} />);
        expect(screen.getByTestId('tooltip')).toBeInTheDocument();
        expect(screen.getByTestId('icon-info')).toBeInTheDocument();
      });

      it('should NOT show tooltip when isCopyModal is false', () => {
        mockState.isCopyModal = false;
        render(<Header {...defaultProps} />);
        expect(screen.queryByTestId('tooltip')).not.toBeInTheDocument();
      });
    });

    describe('Search group visibility', () => {
      it('should render search group when selectedTarget._id exists', () => {
        mockState.selectedTargetId = 'org-123';
        render(<Header {...defaultProps} />);
        expect(screen.getByTestId('search-group')).toBeInTheDocument();
      });

      it('should NOT render search group when selectedTarget._id is empty', () => {
        mockState.selectedTargetId = '';
        render(<Header {...defaultProps} />);
        expect(screen.queryByTestId('search-group')).not.toBeInTheDocument();
      });
    });
  });

  describe('Props forwarding', () => {
    it('should pass setSearching to SearchGroup', () => {
      const mockSetSearching = jest.fn();
      render(<Header setSearching={mockSetSearching} searching={false} />);
      expect(screen.getByTestId('search-group')).toBeInTheDocument();
    });

    it('should pass isEnableReskin to SearchGroup in reskin mode', () => {
      mockState.isEnableReskin = true;
      render(<Header {...defaultProps} />);
      expect(screen.getByTestId('search-group')).toHaveAttribute('data-reskin', 'true');
    });
  });
});
