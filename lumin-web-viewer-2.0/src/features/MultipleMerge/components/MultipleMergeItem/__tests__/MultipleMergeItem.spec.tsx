import '@testing-library/jest-dom';
import { DraggableProvided, DraggableStateSnapshot } from '@hello-pangea/dnd';
import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';

import { MultipleMergeItem, MultipleMergeItemClone } from '../MultipleMergeItem';

import { UploadStatusType, UploadDocumentErrorType } from '../../../enum';
import { useMultipleMergeContext } from '../../../hooks/useMultipleMergeContext';
import { MergeDocumentType, MergeDocumentMetadataType } from '../../../types';

// Mock styles
jest.mock('../MultipleMergeItem.module.scss', () => ({
  container: 'container-class',
  disabled: 'disabled-class',
  dragImage: 'drag-image-class',
}));

// Mock Assets
jest.mock('assets/lumin-svgs/dndHandle.svg', () => 'mock-drag-image-url');

// Mock Context
jest.mock('../../../hooks/useMultipleMergeContext', () => ({
  useMultipleMergeContext: jest.fn(),
}));

// Mock Child Components
jest.mock('../../DocumentInfo/DocumentInfo', () =>
  jest.fn(({ name, status, errorCode }) => (
    <div data-testid="document-info">
      <span>{name}</span>
      <span>{status}</span>
      {errorCode && <span>{errorCode}</span>}
    </div>
  ))
);

jest.mock('lumin-ui/kiwi-ui', () => ({
  IconButton: jest.fn(({ onClick, disabled, icon }) => (
    <button
      data-testid="delete-button"
      onClick={onClick}
      disabled={disabled}
    >
      {icon}
    </button>
  )),
}));

// Create a dummy mock for DraggableProvided
const mockProvided: DraggableProvided = {
  innerRef: jest.fn(),
  draggableProps: {
    'data-rbd-draggable-context-id': '1',
    'data-rbd-draggable-id': '1',
  } as any,
  dragHandleProps: {
    'data-rbd-drag-handle-draggable-id': '1',
    'data-rbd-drag-handle-context-id': '1',
    'aria-labelledby': '1',
    tabIndex: 0,
    draggable: false,
    onDragStart: jest.fn(),
  } as any,
};

const mockSnapshot: DraggableStateSnapshot = {
  isDragging: false,
  isDropAnimating: false,
  dropAnimation: null,
  mode: 'FLUID',
  draggingOver: 'droppable-1',
  combineWith: null,
  combineTargetFor: null,
  isClone: false,
};

describe('MultipleMergeItem', () => {
  const mockDeleteDocument = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useMultipleMergeContext as jest.Mock).mockReturnValue({
      deleteDocument: mockDeleteDocument,
    });
  });

  describe('<MultipleMergeItem />', () => {
    const defaultProps = {
      _id: 'doc-123',
      isLoadingDocument: false,
      name: 'test-document.pdf',
      thumbnail: 'thumb-url',
      size: 1024,
      status: 'UPLOADED' as UploadStatusType, // Casting string to enum type for test
      provided: mockProvided,
      snapshot: mockSnapshot,
      metadata: { errorCode: undefined } as MergeDocumentMetadataType,
    };

    it('should render correctly with default props', () => {
      const { container } = render(<MultipleMergeItem {...defaultProps} />);

      // Check DocumentInfo rendered
      expect(screen.getByTestId('document-info')).toBeInTheDocument();
      expect(screen.getByText('test-document.pdf')).toBeInTheDocument();

      // Check Delete Button rendered
      expect(screen.getByTestId('delete-button')).toBeInTheDocument();

      // Check Drag Handle Image
      const img = screen.getByAltText('Drag Document');
      expect(img).toBeInTheDocument();
      expect(img).toHaveAttribute('src', 'mock-drag-image-url');

      // Check Container styling
      const wrapper = container.firstChild;
      expect(wrapper).toHaveClass('container-class');
      expect(wrapper).not.toHaveClass('disabled-class');
    });

    it('should apply disabled styles and disable delete button when isLoadingDocument is true', () => {
      render(<MultipleMergeItem {...defaultProps} isLoadingDocument={true} />);

      const wrapper = screen.getByTestId('delete-button').closest('div'); // Get parent container
      expect(wrapper).toHaveClass('container-class disabled-class');

      const deleteButton = screen.getByTestId('delete-button');
      expect(deleteButton).toBeDisabled();
    });

    it('should call deleteDocument with correct ID when delete button is clicked', () => {
      render(<MultipleMergeItem {...defaultProps} />);

      const deleteButton = screen.getByTestId('delete-button');
      fireEvent.click(deleteButton);

      expect(mockDeleteDocument).toHaveBeenCalledTimes(1);
      expect(mockDeleteDocument).toHaveBeenCalledWith('doc-123');
    });

    it('should correctly attach draggable props from provided', () => {
      render(<MultipleMergeItem {...defaultProps} />);

      // We need to find the element that received the ref and props.
      // Based on implementation, it's the root div.
      // Since innerRef is a mock function, we can check if it was called.
      expect(mockProvided.innerRef).toHaveBeenCalled();
    });
  });

  describe('<MultipleMergeItemClone />', () => {
    const mockDocument: MergeDocumentType = {
      _id: 'clone-doc-1',
      name: 'clone.pdf',
      mimeType: 'application/pdf',
      thumbnail: 'clone-thumb',
      size: 2048,
      status: 'FAILED' as UploadStatusType,
      source: 'LUMIN' as any, // Enum type placeholder
      metadata: { errorCode: 'FILE_INVALID_TYPE' as UploadDocumentErrorType },
    };

    it('should map document properties to MultipleMergeItem props correctly', () => {
      render(
        <MultipleMergeItemClone
          document={mockDocument}
          isLoadingDocument={false}
          provided={mockProvided}
          snapshot={mockSnapshot}
        />
      );

      // Verify name passed down
      expect(screen.getByText('clone.pdf')).toBeInTheDocument();
      
      // Verify status passed down
      expect(screen.getByText('FAILED')).toBeInTheDocument();

      // Verify metadata passed down
      expect(screen.getByText('FILE_INVALID_TYPE')).toBeInTheDocument();

      // Verify actions still work via context
      fireEvent.click(screen.getByTestId('delete-button'));
      expect(mockDeleteDocument).toHaveBeenCalledWith('clone-doc-1');
    });

    it('should pass isLoadingDocument prop correctly to the child', () => {
      render(
        <MultipleMergeItemClone
          document={mockDocument}
          isLoadingDocument={true}
          provided={mockProvided}
          snapshot={mockSnapshot}
        />
      );

      const deleteButton = screen.getByTestId('delete-button');
      expect(deleteButton).toBeDisabled();
    });
  });
});