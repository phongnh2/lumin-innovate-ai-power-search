import '@testing-library/jest-dom';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { render, screen, fireEvent, act, cleanup } from '@testing-library/react';
import React from 'react';
import { useDropzone } from 'react-dropzone';

import MultipleMergeList from '../MultipleMergeList';

import { FileSource } from '../../../enum';
import { useMultipleMergeContext } from '../../../hooks/useMultipleMergeContext';
import { MultipleMergeItem, MultipleMergeItemClone } from '../../MultipleMergeItem/MultipleMergeItem';
import { MergeDocumentType } from 'features/MultipleMerge/types';
import { general } from 'constants/documentType';

// Mock Style and Assets
jest.mock('../MultipleMergeList.module.scss', () => ({
  container: 'container-class',
  dragAndDropSvg: 'dnd-svg-class',
  emptyListContainer: 'empty-container-class',
  emptyListDescription: 'empty-desc-class',
}));
jest.mock('assets/images/image_merge_light.png', () => 'mock-empty-image.png');

// Mock Hooks
jest.mock('hooks/useTranslation', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

jest.mock('../../../hooks/useMultipleMergeContext', () => ({
  useMultipleMergeContext: jest.fn(),
}));

jest.mock('../../../constants', () => ({
  SUPPORTED_FILE_TYPES: { 'application/pdf': [] as string[] },
}));

jest.mock('../../../enum', () => ({
  FileSource: { LOCAL: 'LOCAL' },
  UploadStatusType: { UPLOADED: 'UPLOADED' },
}));

// Mock UI Components
jest.mock('lumin-ui/kiwi-ui', () => ({
  ScrollArea: jest.fn(({ children, className, viewportRef }) => (
    <div className={className} ref={viewportRef} data-testid="scroll-area">
      {children}
    </div>
  )),
}));

// Mock Drag and Drop Components
// We mock them to render children directly so we can test the list content
jest.mock('@hello-pangea/dnd', () => ({
  DragDropContext: jest.fn(({ children, onDragEnd }) => (
    <div data-testid="dnd-context" onClick={() => onDragEnd({ source: {}, destination: {} })}>
      {children}
    </div>
  )),
  Droppable: jest.fn(({ children, renderClone }) => (
    <div data-testid="droppable">
      {/* Expose renderClone to tests if needed via a hidden element or just implicitly trust prop passing */}
      {children({
        innerRef: jest.fn(),
        droppableProps: { 'data-test-droppable': true },
        placeholder: <div data-testid="placeholder" />,
      })}
    </div>
  )),
  Draggable: jest.fn(({ children, draggableId }) => (
    <div data-testid={`draggable-${draggableId}`}>
      {children(
        { innerRef: jest.fn(), draggableProps: {}, dragHandleProps: {} },
        { isDragging: false }
      )}
    </div>
  )),
}));

// Mock Child Components
jest.mock('../../MultipleMergeItem/MultipleMergeItem', () => ({
  MultipleMergeItem: jest.fn(({ name }) => <div data-testid="merge-item">{name}</div>),
  MultipleMergeItemClone: jest.fn(({ document }) => (
    <div data-testid="merge-item-clone">{document.name}</div>
  )),
}));

// Mock React Dropzone
jest.mock('react-dropzone', () => ({
  useDropzone: jest.fn(),
}));

describe('MultipleMergeList', () => {
  const mockHandleSortDocuments = jest.fn();
  const mockHandleUploadDocuments = jest.fn();
  
  const defaultContext = {
    documents: [] as MergeDocumentType[],
    isLoadingDocument: false,
    handleSortDocuments: mockHandleSortDocuments,
    handleUploadDocuments: mockHandleUploadDocuments,
  };

  // Mock Dropzone return values
  let dropzoneCallbacks: any = {};
  const mockGetRootProps = jest.fn(() => ({
    onClick: jest.fn(),
    onDrop: jest.fn(), // Simulate drop handler from getRootProps
  }));

  beforeEach(() => {
    jest.clearAllMocks();
    (useMultipleMergeContext as jest.Mock).mockReturnValue(defaultContext);

    // Setup useDropzone mock to capture the onDrop callback passed by the component
    (useDropzone as jest.Mock).mockImplementation((config) => {
      dropzoneCallbacks = config; // Capture config to trigger onDrop manually
      return {
        getRootProps: mockGetRootProps,
        isDragActive: false,
      };
    });
  });

  describe('Rendering State', () => {
    it('should render the empty state when documents array is empty', () => {
      render(<MultipleMergeList />);

      expect(screen.getByText('multipleMerge.emptyListDescription')).toBeInTheDocument();
      expect(screen.getByAltText('Merge')).toHaveAttribute('src', 'mock-empty-image.png');
      expect(screen.queryByTestId('merge-item')).not.toBeInTheDocument();
    });

    it('should render the list of documents when documents exist', () => {
      const mockDocs = [
        { _id: '1', name: 'Doc A.pdf', size: 100, status: 'UPLOADED' },
        { _id: '2', name: 'Doc B.pdf', size: 200, status: 'UPLOADED' },
      ];
      (useMultipleMergeContext as jest.Mock).mockReturnValue({
        ...defaultContext,
        documents: mockDocs,
      });

      render(<MultipleMergeList />);

      expect(screen.queryByText('multipleMerge.emptyListDescription')).not.toBeInTheDocument();
      expect(screen.getAllByTestId('merge-item')).toHaveLength(2);
      expect(screen.getByText('Doc A.pdf')).toBeInTheDocument();
      expect(screen.getByText('Doc B.pdf')).toBeInTheDocument();
    });

    it('should render the drag overlay when isDragActive is true', () => {
      (useDropzone as jest.Mock).mockReturnValue({
        getRootProps: mockGetRootProps,
        isDragActive: true,
      });

      const { container } = render(<MultipleMergeList />);

      // The SVG with specific class should be present
      // Since we mocked styles, we look for the SVG or class name
      const svg = container.querySelector('.dnd-svg-class');
      expect(svg).toBeInTheDocument();
    });
  });

  describe('Interactions', () => {
    it('should call handleUploadDocuments when files are dropped', () => {
      render(<MultipleMergeList />);

      const acceptedFiles = [new File([''], 'test.pdf')];
      const fileRejections: any[] = [];

      // Trigger the captured onDrop callback from useDropzone mock
      act(() => {
        dropzoneCallbacks.onDrop(acceptedFiles, fileRejections);
      });

      expect(mockHandleUploadDocuments).toHaveBeenCalledWith({
        files: acceptedFiles,
        fileRejections,
        source: FileSource.LOCAL,
      });
    });

    it('should call handleSortDocuments when drag ends', () => {
      render(<MultipleMergeList />);

      // Our DragDropContext mock adds an onClick to trigger onDragEnd
      const dndContext = screen.getByTestId('dnd-context');
      fireEvent.click(dndContext);

      expect(mockHandleSortDocuments).toHaveBeenCalled();
    });
  });

  describe('Loading State', () => {
    it('should disable Dropzone when isLoadingDocument is true', () => {
      (useMultipleMergeContext as jest.Mock).mockReturnValue({
        ...defaultContext,
        isLoadingDocument: true,
      });

      render(<MultipleMergeList />);

      // Check if disabled: true was passed to useDropzone
      expect(useDropzone).toHaveBeenCalledWith(
        expect.objectContaining({
          disabled: true,
        })
      );
    });

    it('should pass isLoadingDocument to child items', () => {
      const mockDocs = [{ _id: '1', name: 'Doc A.pdf', size: 100 }];
      (useMultipleMergeContext as jest.Mock).mockReturnValue({
        ...defaultContext,
        documents: mockDocs,
        isLoadingDocument: true,
      });

      render(<MultipleMergeList />);

      // Verify prop passed to child mock
      expect(MultipleMergeItem).toHaveBeenCalledWith(
        expect.objectContaining({
          isLoadingDocument: true,
        }),
        expect.anything()
      );
    });
  });

  describe('Clone Rendering', () => {
    it('should use MultipleMergeItemClone for renderClone prop', () => {
      const mockDocs = [{ _id: '1', name: 'Doc A.pdf' }];
      (useMultipleMergeContext as jest.Mock).mockReturnValue({
        ...defaultContext,
        documents: mockDocs,
      });

      render(<MultipleMergeList />);

      // Access the renderClone function passed to Droppable
      // We grab the calls to Droppable mock
      const droppableCall = (Droppable as jest.Mock).mock.calls[0][0];
      const renderCloneFn = droppableCall.renderClone;

      // Execute the renderClone function manually to verify its output
      const provided: any = {};
      const snapshot: any = {};
      const rubric: any = { source: { index: 0 } };
      
      const result = renderCloneFn(provided, snapshot, rubric);
      
      // Clean up first render before rendering the clone result
      cleanup();
      
      // Render the result to inspect it
      render(result);
      
      expect(MultipleMergeItemClone).toHaveBeenCalledWith(
        expect.objectContaining({
          document: mockDocs[0],
          provided,
          snapshot,
        }),
        expect.anything()
      );
      expect(screen.getByTestId('merge-item-clone')).toHaveTextContent('Doc A.pdf');
    });
  });
});