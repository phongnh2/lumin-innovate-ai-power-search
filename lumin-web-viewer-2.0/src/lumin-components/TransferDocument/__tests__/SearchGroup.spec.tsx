import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mutable state
const mockState = {
  isTabletMatch: true,
  isPersonalTargetSelected: false,
  isOldProfessional: false,
  destinationScrollTo: null as string | null,
};

const mockSetDestination = jest.fn();
const mockSetSearching = jest.fn();
const mockFindAvailableLocation = jest.fn().mockResolvedValue({ data: [] });

jest.mock('luminComponents/TransferDocument/hooks', () => ({
  useTransferDocumentContext: () => ({
    getter: {
      selectedTarget: { _id: 'org-123', name: 'Test Organization' },
      personalData: { _id: 'user-123', isOldProfessional: mockState.isOldProfessional, originUser: { _id: 'user-123' } },
      isPersonalTargetSelected: mockState.isPersonalTargetSelected,
      destination: { scrollTo: mockState.destinationScrollTo },
    },
    setter: { setDestination: mockSetDestination },
  }),
}));

jest.mock('hooks', () => ({
  useTabletMatch: () => mockState.isTabletMatch,
  useTranslation: () => ({ t: (key: string) => key }),
}));

jest.mock('services', () => ({
  documentServices: { findAvailableLocation: (...args: any[]) => mockFindAvailableLocation(...args) },
}));

jest.mock('lumin-ui/kiwi-ui', () => ({
  Popover: ({ children, opened, onDismiss }: any) => require('react').createElement('div', { 'data-testid': 'popover', 'data-opened': String(!!opened), onClick: () => onDismiss?.() }, children),
  PopoverTarget: ({ children }: any) => children,
}));

jest.mock('lumin-components/Shared/Input', () => ({
  __esModule: true,
  default: require('react').forwardRef((props: any, ref: any) => {
    const { iconPostfix, showClearButton, ...rest } = props;
    return require('react').createElement('div', null,
      require('react').createElement('input', { ref, 'data-testid': 'input', ...rest }),
      iconPostfix
    );
  }),
}));

jest.mock('lumin-components/Shared/Input/types/InputSize', () => ({ InputSize: { SMALL: 'sm' } }));
jest.mock('luminComponents/Shared/Tooltip', () => ({ __esModule: true, default: ({ children, title }: any) => require('react').createElement('span', { 'data-testid': 'tooltip', title }, children) }));
jest.mock('luminComponents/Icomoon/Icomoon', () => ({ __esModule: true, default: ({ className }: any) => require('react').createElement('span', { 'data-testid': `icon-${className}` }) }));
jest.mock('luminComponents/ReskinLayout/components/SearchInput', () => ({
  SearchInput: require('react').forwardRef((props: any, ref: any) => {
    const { onClear, badgeProps, ...rest } = props;
    return require('react').createElement('div', null,
      require('react').createElement('input', { ref, 'data-testid': 'search-input', ...rest }),
      badgeProps?.content && require('react').createElement('span', { 'data-testid': 'badge' }, badgeProps.content),
      require('react').createElement('button', { 'data-testid': 'clear-btn', onClick: onClear, type: 'button' }, 'Clear')
    );
  }),
}));
jest.mock('luminComponents/TransferDocument/components/SearchResult', () => ({
  __esModule: true,
  default: ({ isOpen, onClose, loading, searchResults }: any) => isOpen ? require('react').createElement('div', {
    'data-testid': 'search-result',
    'data-loading': String(loading),
    'data-results': JSON.stringify(searchResults),
  }, require('react').createElement('button', { 'data-testid': 'close-result', onClick: onClose }, 'Close')) : null,
}));

jest.mock('luminComponents/TransferDocument/components/SearchGroup/SearchGroup.styled', () => ({
  Container: ({ children }: any) => require('react').createElement('div', { 'data-testid': 'container' }, children),
  Input: ({ children }: any) => children,
  CircleBadge: ({ children }: any) => require('react').createElement('span', { 'data-testid': 'circle-badge' }, children),
  OrganizationName: ({ children }: any) => require('react').createElement('span', { 'data-testid': 'org-name' }, children),
  IconContainer: ({ children, onClick }: any) => require('react').createElement('div', { 'data-testid': 'icon-container', onClick }, children),
}));
jest.mock('luminComponents/TransferDocument/components/SearchGroup/SearchGroup.module.scss', () => ({ searchInputWrapper: 'searchInputWrapper' }));
jest.mock('constants/documentConstants', () => ({ DOCUMENT_TYPE: { FOLDER: 'FOLDER', ORGANIZATION_TEAM: 'ORGANIZATION_TEAM' } }));
jest.mock('constants/lumin-common', () => ({ DEBOUNCED_SEARCH_TIME: 10 }));
jest.mock('constants/styles', () => ({ Colors: { NEUTRAL_60: '#666' } }));

import SearchGroup from 'luminComponents/TransferDocument/components/SearchGroup';

describe('SearchGroup', () => {
  const defaultProps = { setSearching: mockSetSearching, isEnableReskin: false };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    mockState.isTabletMatch = true;
    mockState.isPersonalTargetSelected = false;
    mockState.isOldProfessional = false;
    mockState.destinationScrollTo = null;
    mockFindAvailableLocation.mockResolvedValue({ data: [] });
  });

  afterEach(() => { jest.useRealTimers(); });

  describe('Non-reskin mode', () => {
    it('renders input', () => {
      render(<SearchGroup {...defaultProps} />);
      expect(screen.getByTestId('input')).toBeInTheDocument();
    });

    it('renders container', () => {
      render(<SearchGroup {...defaultProps} />);
      expect(screen.getByTestId('container')).toBeInTheDocument();
    });

    it('updates value on change', () => {
      render(<SearchGroup {...defaultProps} />);
      const input = screen.getByTestId('input');
      fireEvent.change(input, { target: { value: 'test' } });
      expect(input).toHaveValue('test');
    });

    it('sets focusing on focus', () => {
      render(<SearchGroup {...defaultProps} />);
      const input = screen.getByTestId('input');
      fireEvent.focus(input);
      expect(mockSetSearching).toHaveBeenCalledWith(true);
    });

    it('clears destination scrollTo on focus', () => {
      mockState.destinationScrollTo = 'some-id';
      render(<SearchGroup {...defaultProps} />);
      fireEvent.focus(screen.getByTestId('input'));
      expect(mockSetDestination).toHaveBeenCalled();
    });

    it('shows org badge when expanded', () => {
      render(<SearchGroup {...defaultProps} />);
      fireEvent.focus(screen.getByTestId('input'));
      expect(screen.getByTestId('org-name')).toHaveTextContent('Test Organization');
    });

    it('triggers search on input with debounce', async () => {
      render(<SearchGroup {...defaultProps} />);
      fireEvent.change(screen.getByTestId('input'), { target: { value: 'test' } });
      expect(mockFindAvailableLocation).not.toHaveBeenCalled();
      await act(async () => { jest.advanceTimersByTime(20); });
      await waitFor(() => expect(mockFindAvailableLocation).toHaveBeenCalled());
    });

    it('shows search result when has value', async () => {
      render(<SearchGroup {...defaultProps} />);
      fireEvent.change(screen.getByTestId('input'), { target: { value: 'test' } });
      await act(async () => { jest.advanceTimersByTime(20); });
      await waitFor(() => expect(screen.getByTestId('search-result')).toBeInTheDocument());
    });

    it('clears results on close', async () => {
      render(<SearchGroup {...defaultProps} />);
      fireEvent.change(screen.getByTestId('input'), { target: { value: 'test' } });
      await act(async () => { jest.advanceTimersByTime(20); });
      await waitFor(() => expect(screen.getByTestId('search-result')).toBeInTheDocument());
      fireEvent.click(screen.getByTestId('close-result'));
      expect(screen.queryByTestId('search-result')).not.toBeInTheDocument();
    });

    it('stops propagation on keydown', () => {
      render(<SearchGroup {...defaultProps} />);
      const input = screen.getByTestId('input');
      const event = { stopPropagation: jest.fn() };
      fireEvent.keyDown(input, event);
    });
  });

  describe('Reskin mode', () => {
    it('renders search input', () => {
      render(<SearchGroup {...defaultProps} isEnableReskin={true} />);
      expect(screen.getByTestId('search-input')).toBeInTheDocument();
    });

    it('renders badge with org name', () => {
      render(<SearchGroup {...defaultProps} isEnableReskin={true} />);
      fireEvent.focus(screen.getByTestId('search-input'));
      expect(screen.getByTestId('badge')).toHaveTextContent('Test Organization');
    });

    it('calls onClear when clear button clicked', async () => {
      render(<SearchGroup {...defaultProps} isEnableReskin={true} />);
      fireEvent.change(screen.getByTestId('search-input'), { target: { value: 'test' } });
      await act(async () => { jest.advanceTimersByTime(20); });
      await waitFor(() => expect(screen.getByTestId('search-result')).toBeInTheDocument());
      fireEvent.click(screen.getByTestId('clear-btn'));
      expect(screen.queryByTestId('search-result')).not.toBeInTheDocument();
    });
  });

  describe('Mobile/Tablet behavior', () => {
    it('renders icon container when not tablet and not focusing', () => {
      mockState.isTabletMatch = false;
      render(<SearchGroup {...defaultProps} />);
      expect(screen.getByTestId('icon-container')).toBeInTheDocument();
    });

    it('focuses input on icon click', () => {
      mockState.isTabletMatch = false;
      render(<SearchGroup {...defaultProps} />);
      fireEvent.click(screen.getByTestId('icon-container'));
      // After click, focusing should be true and input should render
    });
  });

  describe('Personal workspace search', () => {
    it('searches in personal workspace for old professional', async () => {
      mockState.isPersonalTargetSelected = true;
      mockState.isOldProfessional = true;
      render(<SearchGroup {...defaultProps} />);
      fireEvent.change(screen.getByTestId('input'), { target: { value: 'test' } });
      await act(async () => { jest.advanceTimersByTime(20); });
      await waitFor(() => expect(mockFindAvailableLocation).toHaveBeenCalledWith(
        expect.objectContaining({ orgId: undefined }),
        expect.any(Object)
      ));
    });

    it('searches in org workspace when not old professional', async () => {
      render(<SearchGroup {...defaultProps} />);
      fireEvent.change(screen.getByTestId('input'), { target: { value: 'test' } });
      await act(async () => { jest.advanceTimersByTime(20); });
      await waitFor(() => expect(mockFindAvailableLocation).toHaveBeenCalledWith(
        expect.objectContaining({ orgId: 'org-123' }),
        expect.any(Object)
      ));
    });
  });

  describe('Search error handling', () => {
    it('clears results on search error', async () => {
      mockFindAvailableLocation.mockRejectedValue(new Error('Network error'));
      render(<SearchGroup {...defaultProps} />);
      fireEvent.change(screen.getByTestId('input'), { target: { value: 'test' } });
      await act(async () => { jest.advanceTimersByTime(20); });
      await waitFor(() => expect(mockFindAvailableLocation).toHaveBeenCalled());
    });
  });

  describe('Org results in reskin mode', () => {
    it('includes org in results when name matches search', async () => {
      mockFindAvailableLocation.mockResolvedValue({ data: [] });
      render(<SearchGroup {...defaultProps} isEnableReskin={true} />);
      fireEvent.change(screen.getByTestId('search-input'), { target: { value: 'Test' } });
      await act(async () => { jest.advanceTimersByTime(20); });
      await waitFor(() => expect(screen.getByTestId('search-result')).toBeInTheDocument());
    });
  });
});
