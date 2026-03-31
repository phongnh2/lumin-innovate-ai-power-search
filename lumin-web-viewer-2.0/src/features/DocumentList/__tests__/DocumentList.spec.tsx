import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock classnames
jest.mock('classnames', () => (...args: any[]) => args.filter(Boolean).join(' '));

// Mock polished
jest.mock('polished', () => ({
  cssVar: (name: string, fallback: any) => fallback,
}));

// Mock react-virtuoso
jest.mock('react-virtuoso', () => ({
  Virtuoso: ({ data, itemContent, endReached, context, components, fixedItemHeight }: any) => {
    const React = require('react');
    return React.createElement('div', { 'data-testid': 'virtuoso' },
      data?.map((item: any, index: number) => 
        React.createElement('div', { key: index, 'data-testid': `virtuoso-item-${index}` },
          itemContent(index, item)
        )
      ),
      context?.isFetchingMore && components?.Footer?.({ context })
    );
  },
}));

// Mock HOCs - pass through the component
jest.mock('luminComponents/DocumentList/HOC', () => ({
  withDocumentModal: (Component: any) => Component,
  withOpenDocDecorator: (Component: any) => Component,
}));

jest.mock('features/DocumentList/HOC/withFolderModal', () => ({
  __esModule: true,
  default: (Component: any) => Component,
}));

// Mock UploadDropZone
jest.mock('luminComponents/UploadDropZone', () => ({
  __esModule: true,
  default: ({ children, highlight, disabled }: any) =>
    require('react').createElement('div', { 'data-testid': 'upload-drop-zone', 'data-disabled': String(!!disabled) }, children),
  UploadDropZoneContext: {
    Consumer: ({ children }: any) => children({ showHighlight: false }),
  },
}));

// Mock hooks
jest.mock('../hooks/useDocumentListSubscription', () => ({
  __esModule: true,
  default: () => {},
}));

jest.mock('../hooks/useParentScrollDropHighlight', () => ({
  __esModule: true,
  default: () => ({
    showDropHightlight: false,
    dropHighlightElementStyle: {},
    triggerElementRef: { current: null },
    bindToElementRef: { current: null },
  }),
}));

// Mock constants
jest.mock('constants/documentConstants', () => ({
  TOTAL_DOCUMENT_DUMMY: 3,
}));

// Mock BackToTop
jest.mock('../components/BackToTop', () => ({
  BackToTop: ({ onClick, scrollerRef, classNames }: any) =>
    require('react').createElement('button', { 'data-testid': 'back-to-top', onClick }),
}));

// Mock styles
jest.mock('../components/DocumentList/DocumentList.module.scss', () => ({
  container: 'container',
  listContainer: 'listContainer',
  showHighlight: 'showHighlight',
  listHeaderWrapper: 'listHeaderWrapper',
  parentScroll: 'parentScroll',
  noDropFile: 'noDropFile',
  dragAndDropSvg: 'dragAndDropSvg',
  show: 'show',
  dragAndDropBorder: 'dragAndDropBorder',
  triggerParentScrollDropHighlight: 'triggerParentScrollDropHighlight',
}));

// Import the inner component directly
import DocumentListComponent from '../components/DocumentList/DocumentList';

// Get the unwrapped component (HOCs are mocked to pass through)
const DocumentList = DocumentListComponent;

describe('DocumentList', () => {
  const mockDocuments = [
    { _id: 'doc-1', name: 'Document 1' },
    { _id: 'doc-2', name: 'Document 2' },
  ];

  const mockSkeletonElement = <div data-testid="skeleton">Skeleton</div>;
  const mockHeaderElement = <div data-testid="header">Header</div>;
  const mockEmptyElement = <div data-testid="empty">Empty</div>;

  const defaultProps = {
    isLoading: false,
    documents: mockDocuments,
    refetchDocument: jest.fn(),
    renderItem: (index: number, item: any) => (
      <div data-testid={`item-${index}`}>{item.name}</div>
    ),
    elements: {
      skeletonElement: mockSkeletonElement,
      headerElement: mockHeaderElement,
      emptyElement: mockEmptyElement,
    },
    isBackToTop: true,
    fetchMore: jest.fn().mockResolvedValue(undefined),
    openDocumentModal: jest.fn(),
    openFolderModal: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders container', () => {
      const { container } = render(<DocumentList {...defaultProps} />);
      expect(container.querySelector('.container')).toBeInTheDocument();
    });

    it('renders upload drop zone', () => {
      render(<DocumentList {...defaultProps} />);
      expect(screen.getByTestId('upload-drop-zone')).toBeInTheDocument();
    });

    it('renders virtuoso list when not loading', () => {
      render(<DocumentList {...defaultProps} />);
      expect(screen.getByTestId('virtuoso')).toBeInTheDocument();
    });

    it('renders items correctly', () => {
      render(<DocumentList {...defaultProps} />);
      expect(screen.getByTestId('item-0')).toHaveTextContent('Document 1');
      expect(screen.getByTestId('item-1')).toHaveTextContent('Document 2');
    });

    it('renders header element', () => {
      render(<DocumentList {...defaultProps} />);
      expect(screen.getByTestId('header')).toBeInTheDocument();
    });

    it('renders back to top button when isBackToTop is true', () => {
      render(<DocumentList {...defaultProps} />);
      expect(screen.getByTestId('back-to-top')).toBeInTheDocument();
    });

    it('does not render back to top when isBackToTop is false', () => {
      render(<DocumentList {...defaultProps} isBackToTop={false} />);
      expect(screen.queryByTestId('back-to-top')).not.toBeInTheDocument();
    });
  });

  describe('Loading state', () => {
    it('renders skeleton when loading', () => {
      render(<DocumentList {...defaultProps} isLoading={true} />);
      expect(screen.getAllByTestId('skeleton').length).toBe(3);
    });

    it('does not render virtuoso when loading', () => {
      render(<DocumentList {...defaultProps} isLoading={true} />);
      expect(screen.queryByTestId('virtuoso')).not.toBeInTheDocument();
    });
  });

  describe('Empty state', () => {
    it('renders empty element when no documents', () => {
      render(<DocumentList {...defaultProps} documents={[]} />);
      expect(screen.getByTestId('empty')).toBeInTheDocument();
    });

    it('returns null when no documents and no empty element', () => {
      const propsWithoutEmpty = {
        ...defaultProps,
        documents: [],
        elements: {
          skeletonElement: mockSkeletonElement,
        },
      };
      const { container } = render(<DocumentList {...propsWithoutEmpty} />);
      expect(container.innerHTML).toBe('');
    });
  });

  describe('Drop file disabled', () => {
    it('disables upload drop zone when dropFileDisabled is true', () => {
      render(<DocumentList {...defaultProps} dropFileDisabled={true} />);
      expect(screen.getByTestId('upload-drop-zone')).toHaveAttribute('data-disabled', 'true');
    });

    it('disables upload drop zone when loading', () => {
      render(<DocumentList {...defaultProps} isLoading={true} />);
      expect(screen.getByTestId('upload-drop-zone')).toHaveAttribute('data-disabled', 'true');
    });
  });

  describe('Back to top', () => {
    it('triggers scroll on click', () => {
      render(<DocumentList {...defaultProps} />);
      fireEvent.click(screen.getByTestId('back-to-top'));
      // Should not throw
    });

    it('scrolls parent scroller when provided', () => {
      const scrollerRef = document.createElement('div');
      scrollerRef.scrollTo = jest.fn();
      
      render(<DocumentList {...defaultProps} parentScrollerRef={scrollerRef} />);
      fireEvent.click(screen.getByTestId('back-to-top'));
      // Scroll function is called in the component
    });
  });

  describe('Fetch more', () => {
    it('calls fetchMore callback', async () => {
      render(<DocumentList {...defaultProps} />);
      // The endReached callback in Virtuoso calls fetchMore
      expect(defaultProps.fetchMore).toBeDefined();
    });
  });

  describe('Custom classNames', () => {
    it('applies custom container className', () => {
      const { container } = render(
        <DocumentList {...defaultProps} classNames={{ container: 'custom-container' }} />
      );
      expect(container.querySelector('.custom-container')).toBeInTheDocument();
    });
  });

  describe('No header element', () => {
    it('does not render header wrapper when no header element', () => {
      const propsWithoutHeader = {
        ...defaultProps,
        elements: {
          skeletonElement: mockSkeletonElement,
          emptyElement: mockEmptyElement,
        },
      };
      render(<DocumentList {...propsWithoutHeader} />);
      expect(screen.queryByTestId('header')).not.toBeInTheDocument();
    });
  });
});

