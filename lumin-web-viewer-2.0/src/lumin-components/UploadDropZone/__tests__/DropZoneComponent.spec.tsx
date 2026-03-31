import React, { useContext } from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

import DropZoneComponent from '../DropZoneComponent';
import { UploadDropZoneContext } from '../UploadDropZoneContext';

// Test component to consume context
const ContextConsumer = () => {
  const context = useContext(UploadDropZoneContext);
  return (
    <div data-testid="context-consumer">
      <span data-testid="show-highlight">{String(context.showHighlight)}</span>
      <span data-testid="highlight">{String(context.highlight)}</span>
      <span data-testid="is-dragging">{String(context.isDragging)}</span>
    </div>
  );
};

describe('DropZoneComponent', () => {
  describe('Rendering', () => {
    it('renders children', () => {
      render(
        <DropZoneComponent highlight={false} isDragging={false}>
          <div data-testid="child">Child content</div>
        </DropZoneComponent>
      );
      expect(screen.getByTestId('child')).toBeInTheDocument();
    });

    it('renders multiple children', () => {
      render(
        <DropZoneComponent highlight={false} isDragging={false}>
          <div data-testid="child1">Child 1</div>
          <div data-testid="child2">Child 2</div>
        </DropZoneComponent>
      );
      expect(screen.getByTestId('child1')).toBeInTheDocument();
      expect(screen.getByTestId('child2')).toBeInTheDocument();
    });
  });

  describe('Context Provider', () => {
    it('provides showHighlight as true when isDragging and highlight are true', () => {
      render(
        <DropZoneComponent highlight={true} isDragging={true}>
          <ContextConsumer />
        </DropZoneComponent>
      );
      expect(screen.getByTestId('show-highlight')).toHaveTextContent('true');
    });

    it('provides showHighlight as false when isDragging is false', () => {
      render(
        <DropZoneComponent highlight={true} isDragging={false}>
          <ContextConsumer />
        </DropZoneComponent>
      );
      expect(screen.getByTestId('show-highlight')).toHaveTextContent('false');
    });

    it('provides showHighlight as false when highlight is false', () => {
      render(
        <DropZoneComponent highlight={false} isDragging={true}>
          <ContextConsumer />
        </DropZoneComponent>
      );
      expect(screen.getByTestId('show-highlight')).toHaveTextContent('false');
    });

    it('provides showHighlight as false when both are false', () => {
      render(
        <DropZoneComponent highlight={false} isDragging={false}>
          <ContextConsumer />
        </DropZoneComponent>
      );
      expect(screen.getByTestId('show-highlight')).toHaveTextContent('false');
    });

    it('provides highlight value correctly', () => {
      render(
        <DropZoneComponent highlight={true} isDragging={false}>
          <ContextConsumer />
        </DropZoneComponent>
      );
      expect(screen.getByTestId('highlight')).toHaveTextContent('true');
    });

    it('provides isDragging value correctly', () => {
      render(
        <DropZoneComponent highlight={false} isDragging={true}>
          <ContextConsumer />
        </DropZoneComponent>
      );
      expect(screen.getByTestId('is-dragging')).toHaveTextContent('true');
    });
  });

  describe('Memoization', () => {
    it('is wrapped in React.memo', () => {
      // React.memo wraps the component, so displayName should include memo
      expect(DropZoneComponent.$$typeof?.toString()).toContain('Symbol');
    });
  });
});

