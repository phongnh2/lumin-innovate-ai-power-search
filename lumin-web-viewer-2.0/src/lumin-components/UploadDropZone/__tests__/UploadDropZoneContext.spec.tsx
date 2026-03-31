import React, { useContext } from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

import { UploadDropZoneContext } from '../UploadDropZoneContext';

// Test component to consume context
const ContextConsumer = () => {
  const context = useContext(UploadDropZoneContext);
  return (
    <div data-testid="context-consumer">
      <span data-testid="show-highlight">{String(context.showHighlight)}</span>
      <span data-testid="highlight">{String(context.highlight)}</span>
      <span data-testid="is-dragging">{String(context.isDragging)}</span>
      <span data-testid="is-drop-on-folder">{String(context.isDropOnFolder)}</span>
    </div>
  );
};

describe('UploadDropZoneContext', () => {
  describe('Default values', () => {
    it('has default showHighlight as false', () => {
      render(<ContextConsumer />);
      expect(screen.getByTestId('show-highlight')).toHaveTextContent('false');
    });

    it('has default highlight as false', () => {
      render(<ContextConsumer />);
      expect(screen.getByTestId('highlight')).toHaveTextContent('false');
    });

    it('has default isDragging as false', () => {
      render(<ContextConsumer />);
      expect(screen.getByTestId('is-dragging')).toHaveTextContent('false');
    });

    it('has default isDropOnFolder as false', () => {
      render(<ContextConsumer />);
      expect(screen.getByTestId('is-drop-on-folder')).toHaveTextContent('false');
    });
  });

  describe('Provider', () => {
    it('allows custom showHighlight value', () => {
      render(
        <UploadDropZoneContext.Provider value={{ showHighlight: true, highlight: false, isDragging: false, isDropOnFolder: false }}>
          <ContextConsumer />
        </UploadDropZoneContext.Provider>
      );
      expect(screen.getByTestId('show-highlight')).toHaveTextContent('true');
    });

    it('allows custom highlight value', () => {
      render(
        <UploadDropZoneContext.Provider value={{ showHighlight: false, highlight: true, isDragging: false, isDropOnFolder: false }}>
          <ContextConsumer />
        </UploadDropZoneContext.Provider>
      );
      expect(screen.getByTestId('highlight')).toHaveTextContent('true');
    });

    it('allows custom isDragging value', () => {
      render(
        <UploadDropZoneContext.Provider value={{ showHighlight: false, highlight: false, isDragging: true, isDropOnFolder: false }}>
          <ContextConsumer />
        </UploadDropZoneContext.Provider>
      );
      expect(screen.getByTestId('is-dragging')).toHaveTextContent('true');
    });

    it('allows custom isDropOnFolder value', () => {
      render(
        <UploadDropZoneContext.Provider value={{ showHighlight: false, highlight: false, isDragging: false, isDropOnFolder: true }}>
          <ContextConsumer />
        </UploadDropZoneContext.Provider>
      );
      expect(screen.getByTestId('is-drop-on-folder')).toHaveTextContent('true');
    });

    it('allows all values to be true', () => {
      render(
        <UploadDropZoneContext.Provider value={{ showHighlight: true, highlight: true, isDragging: true, isDropOnFolder: true }}>
          <ContextConsumer />
        </UploadDropZoneContext.Provider>
      );
      expect(screen.getByTestId('show-highlight')).toHaveTextContent('true');
      expect(screen.getByTestId('highlight')).toHaveTextContent('true');
      expect(screen.getByTestId('is-dragging')).toHaveTextContent('true');
      expect(screen.getByTestId('is-drop-on-folder')).toHaveTextContent('true');
    });
  });

  describe('Export', () => {
    it('exports UploadDropZoneContext', () => {
      expect(UploadDropZoneContext).toBeDefined();
    });

    it('is a valid React context', () => {
      expect(UploadDropZoneContext.Provider).toBeDefined();
      expect(UploadDropZoneContext.Consumer).toBeDefined();
    });
  });
});

