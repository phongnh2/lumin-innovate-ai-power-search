import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock TransferDocumentLibrary
const mockOnNavigate = jest.fn();
const mockOnChange = jest.fn();

jest.mock('luminComponents/TransferDocument/TransferDocumentLibrary', () => ({
  __esModule: true,
  default: {
    BreadCrumbs: ({ breadcrumb, onNavigate, search }: any) =>
      require('react').createElement('div', {
        'data-testid': 'breadcrumbs',
        'data-breadcrumb-count': breadcrumb?.length || 0,
        onClick: () => onNavigate && onNavigate(),
      }, `BreadCrumbs: ${breadcrumb?.length || 0} items`),
    ExpandedList: ({
      value,
      onChange,
      onNavigate,
      isBreadcrumbExists,
      search,
      expandedList,
      expandedStatus,
      disabledValue,
      isMultipleFile,
    }: any) =>
      require('react').createElement('div', {
        'data-testid': 'expanded-list',
        'data-value': value,
        'data-is-breadcrumb-exists': isBreadcrumbExists,
        'data-disabled-value': disabledValue,
        'data-is-multiple-file': isMultipleFile,
        onClick: () => onChange && onChange({ id: 'new-dest', name: 'New Destination' }),
      }, 'ExpandedList'),
  },
}));

import ExpandedList from 'luminComponents/TransferDocument/components/ExpandedList';

describe('ExpandedList', () => {
  const defaultProps = {
    initialDestination: { id: 'dest-123', type: 'FOLDER' },
    breadcrumb: [{ id: 'bc-1', name: 'Root' }, { id: 'bc-2', name: 'Folder' }],
    navigateTo: jest.fn(),
    search: { text: '', onChange: jest.fn(), placeholder: 'Search...' },
    expandedList: [{ id: 'item-1', name: 'Item 1' }],
    expandedStatus: { expandedAll: true, activeDestinationSource: 0 },
    data: { destination: { id: 'current-dest', name: 'Current' } },
    setData: jest.fn(),
    isMultipleFile: false,
    isMoveModal: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('BreadCrumbs rendering', () => {
    it('should render BreadCrumbs when breadcrumb array has items', () => {
      render(<ExpandedList {...defaultProps} />);
      expect(screen.getByTestId('breadcrumbs')).toBeInTheDocument();
    });

    it('should NOT render BreadCrumbs when breadcrumb array is empty', () => {
      render(<ExpandedList {...defaultProps} breadcrumb={[]} />);
      expect(screen.queryByTestId('breadcrumbs')).not.toBeInTheDocument();
    });

    it('should pass correct props to BreadCrumbs', () => {
      render(<ExpandedList {...defaultProps} />);
      expect(screen.getByTestId('breadcrumbs')).toHaveAttribute('data-breadcrumb-count', '2');
    });
  });

  describe('ExpandedList component rendering', () => {
    it('should always render ExpandedList', () => {
      render(<ExpandedList {...defaultProps} />);
      expect(screen.getByTestId('expanded-list')).toBeInTheDocument();
    });

    it('should pass value from data.destination.id', () => {
      render(<ExpandedList {...defaultProps} />);
      expect(screen.getByTestId('expanded-list')).toHaveAttribute('data-value', 'current-dest');
    });

    it('should pass isBreadcrumbExists as true when breadcrumb.length > 1', () => {
      render(<ExpandedList {...defaultProps} breadcrumb={[{ id: '1' }, { id: '2' }]} />);
      expect(screen.getByTestId('expanded-list')).toHaveAttribute('data-is-breadcrumb-exists', 'true');
    });

    it('should pass isBreadcrumbExists as false when breadcrumb.length <= 1', () => {
      render(<ExpandedList {...defaultProps} breadcrumb={[{ id: '1' }]} />);
      expect(screen.getByTestId('expanded-list')).toHaveAttribute('data-is-breadcrumb-exists', 'false');
    });

    it('should pass isBreadcrumbExists as false when breadcrumb is empty', () => {
      render(<ExpandedList {...defaultProps} breadcrumb={[]} />);
      expect(screen.getByTestId('expanded-list')).toHaveAttribute('data-is-breadcrumb-exists', 'false');
    });
  });

  describe('isMoveModal conditional props', () => {
    it('should pass disabledValue and isMultipleFile when isMoveModal is true', () => {
      render(<ExpandedList {...defaultProps} isMoveModal={true} isMultipleFile={true} />);
      const expandedList = screen.getByTestId('expanded-list');
      expect(expandedList).toHaveAttribute('data-disabled-value', 'dest-123');
      expect(expandedList).toHaveAttribute('data-is-multiple-file', 'true');
    });

    it('should NOT pass disabledValue when isMoveModal is false', () => {
      render(<ExpandedList {...defaultProps} isMoveModal={false} />);
      const expandedList = screen.getByTestId('expanded-list');
      expect(expandedList).not.toHaveAttribute('data-disabled-value', 'dest-123');
    });

    it('should pass isMultipleFile as false when isMoveModal is true but isMultipleFile is false', () => {
      render(<ExpandedList {...defaultProps} isMoveModal={true} isMultipleFile={false} />);
      expect(screen.getByTestId('expanded-list')).toHaveAttribute('data-is-multiple-file', 'false');
    });
  });

  describe('onChange callback', () => {
    it('should call setData with updated destination when onChange is triggered', () => {
      const mockSetData = jest.fn();
      const data = { destination: { id: 'old-dest', name: 'Old' }, otherProp: 'value' };
      render(<ExpandedList {...defaultProps} data={data} setData={mockSetData} />);
      
      fireEvent.click(screen.getByTestId('expanded-list'));
      
      expect(mockSetData).toHaveBeenCalledWith({
        ...data,
        destination: { id: 'new-dest', name: 'New Destination' },
      });
    });
  });

  describe('navigateTo callback', () => {
    it('should pass navigateTo to BreadCrumbs', () => {
      const mockNavigateTo = jest.fn();
      render(<ExpandedList {...defaultProps} navigateTo={mockNavigateTo} />);
      
      fireEvent.click(screen.getByTestId('breadcrumbs'));
      
      expect(mockNavigateTo).toHaveBeenCalled();
    });
  });

  describe('Default props', () => {
    // Note: data.destination is required for component to work, so we provide minimal data
    const minimalProps = {
      data: { destination: { id: 'min-dest' } },
    };

    it('should render with minimal required props', () => {
      render(<ExpandedList {...minimalProps} />);
      expect(screen.getByTestId('expanded-list')).toBeInTheDocument();
    });

    it('should not render BreadCrumbs with default empty breadcrumb', () => {
      render(<ExpandedList {...minimalProps} />);
      expect(screen.queryByTestId('breadcrumbs')).not.toBeInTheDocument();
    });

    it('should have default isMoveModal as false (no disabledValue)', () => {
      render(<ExpandedList {...minimalProps} />);
      expect(screen.getByTestId('expanded-list')).not.toHaveAttribute('data-disabled-value');
    });

    it('should have default isMultipleFile as false', () => {
      render(<ExpandedList {...minimalProps} isMoveModal={true} />);
      expect(screen.getByTestId('expanded-list')).toHaveAttribute('data-is-multiple-file', 'false');
    });
  });

  describe('PropTypes validation', () => {
    it('should accept all valid prop types', () => {
      const validProps = {
        initialDestination: { id: 'dest-1', type: 'FOLDER' },
        breadcrumb: [{ id: 'bc-1' }],
        navigateTo: jest.fn(),
        search: { text: 'search' },
        expandedList: [{ id: 'exp-1' }],
        expandedStatus: { expandedAll: false },
        data: { destination: { id: 'data-dest' } },
        setData: jest.fn(),
        isMultipleFile: true,
        isMoveModal: true,
      };
      
      // Should not throw
      expect(() => render(<ExpandedList {...validProps} />)).not.toThrow();
    });
  });
});

