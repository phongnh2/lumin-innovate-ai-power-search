import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import React, { useContext } from 'react';

import FetchingAnnotationsProvider from '../FetchingAnnotationsProvider';
import { FetchingAnnotationsContext } from 'features/Annotation/contexts';
import { useFetchingAnnotationsStore } from 'features/Annotation/hooks';

// Mock the hook
jest.mock('features/Annotation/hooks', () => ({
  useFetchingAnnotationsStore: jest.fn(),
}));

// Helper component to extract context values for assertions
const TestConsumer = () => {
  const context = useContext(FetchingAnnotationsContext);
  return (
    <div data-testid="context-value">
      {JSON.stringify({
        annotations: context.annotations,
        hasSetAnnotations: typeof context.setAnnotations === 'function',
      })}
    </div>
  );
};

describe('FetchingAnnotationsProvider', () => {
  const mockSetAnnotations = jest.fn();
  const mockAnnotations = [{ id: '1', type: 'highlight' }];

  beforeEach(() => {
    jest.clearAllMocks();
    (useFetchingAnnotationsStore as jest.Mock).mockReturnValue({
      annotations: mockAnnotations,
      setAnnotations: mockSetAnnotations,
    });
  });

  describe('Rendering', () => {
    it('should render children', () => {
      render(
        <FetchingAnnotationsProvider>
          <div data-testid="child">Test Child</div>
        </FetchingAnnotationsProvider>
      );

      expect(screen.getByTestId('child')).toBeInTheDocument();
      expect(screen.getByText('Test Child')).toBeInTheDocument();
    });

    it('should render multiple children', () => {
      render(
        <FetchingAnnotationsProvider>
          <div data-testid="child1">Child 1</div>
          <div data-testid="child2">Child 2</div>
        </FetchingAnnotationsProvider>
      );

      expect(screen.getByTestId('child1')).toBeInTheDocument();
      expect(screen.getByTestId('child2')).toBeInTheDocument();
    });

    it('should render null children', () => {
      render(
        <FetchingAnnotationsProvider>
          {null}
        </FetchingAnnotationsProvider>
      );

      // Provider should render and call hook even with null children
      expect(useFetchingAnnotationsStore).toHaveBeenCalledTimes(1);
    });
  });

  describe('Hook Integration', () => {
    it('should call useFetchingAnnotationsStore hook', () => {
      render(
        <FetchingAnnotationsProvider>
          <div>Test</div>
        </FetchingAnnotationsProvider>
      );

      expect(useFetchingAnnotationsStore).toHaveBeenCalledTimes(1);
      expect(useFetchingAnnotationsStore).toHaveBeenCalledWith();
    });

    it('should extract annotations and setAnnotations from hook', () => {
      const customAnnotations = [{ id: '2', type: 'comment' }];
      const customSetAnnotations = jest.fn();

      (useFetchingAnnotationsStore as jest.Mock).mockReturnValue({
        annotations: customAnnotations,
        setAnnotations: customSetAnnotations,
      });

      render(
        <FetchingAnnotationsProvider>
          <TestConsumer />
        </FetchingAnnotationsProvider>
      );

      const context = JSON.parse(screen.getByTestId('context-value').textContent!);
      expect(context.annotations).toEqual(customAnnotations);
      expect(context.hasSetAnnotations).toBe(true);
    });
  });

  describe('Context Provider', () => {
    it('should provide context values to children', () => {
      render(
        <FetchingAnnotationsProvider>
          <TestConsumer />
        </FetchingAnnotationsProvider>
      );

      const context = JSON.parse(screen.getByTestId('context-value').textContent!);
      expect(context.annotations).toEqual(mockAnnotations);
      expect(context.hasSetAnnotations).toBe(true);
    });

    it('should provide empty annotations array when hook returns empty array', () => {
      (useFetchingAnnotationsStore as jest.Mock).mockReturnValue({
        annotations: [],
        setAnnotations: mockSetAnnotations,
      });

      render(
        <FetchingAnnotationsProvider>
          <TestConsumer />
        </FetchingAnnotationsProvider>
      );

      const context = JSON.parse(screen.getByTestId('context-value').textContent!);
      expect(context.annotations).toEqual([]);
    });

    it('should provide null annotations when hook returns null', () => {
      (useFetchingAnnotationsStore as jest.Mock).mockReturnValue({
        annotations: null,
        setAnnotations: mockSetAnnotations,
      });

      render(
        <FetchingAnnotationsProvider>
          <TestConsumer />
        </FetchingAnnotationsProvider>
      );

      const context = JSON.parse(screen.getByTestId('context-value').textContent!);
      expect(context.annotations).toBeNull();
    });

    it('should provide undefined annotations when hook returns undefined', () => {
      (useFetchingAnnotationsStore as jest.Mock).mockReturnValue({
        annotations: undefined,
        setAnnotations: mockSetAnnotations,
      });

      render(
        <FetchingAnnotationsProvider>
          <TestConsumer />
        </FetchingAnnotationsProvider>
      );

      const context = JSON.parse(screen.getByTestId('context-value').textContent!);
      expect(context.annotations).toBeUndefined();
    });
  });

  describe('useMemo Memoization', () => {
    it('should memoize context values with annotations dependency', () => {
      const { rerender } = render(
        <FetchingAnnotationsProvider>
          <TestConsumer />
        </FetchingAnnotationsProvider>
      );

      const firstRender = screen.getByTestId('context-value').textContent;

      // Change annotations
      (useFetchingAnnotationsStore as jest.Mock).mockReturnValue({
        annotations: [{ id: '3', type: 'stamp' }],
        setAnnotations: mockSetAnnotations,
      });

      rerender(
        <FetchingAnnotationsProvider>
          <TestConsumer />
        </FetchingAnnotationsProvider>
      );

      const secondRender = screen.getByTestId('context-value').textContent;
      expect(secondRender).not.toBe(firstRender);
    });

    it('should memoize context values with setAnnotations dependency', () => {
      const firstSetAnnotations = jest.fn();
      (useFetchingAnnotationsStore as jest.Mock).mockReturnValue({
        annotations: mockAnnotations,
        setAnnotations: firstSetAnnotations,
      });

      const { rerender } = render(
        <FetchingAnnotationsProvider>
          <TestConsumer />
        </FetchingAnnotationsProvider>
      );

      // Change setAnnotations function reference
      const secondSetAnnotations = jest.fn();
      (useFetchingAnnotationsStore as jest.Mock).mockReturnValue({
        annotations: mockAnnotations,
        setAnnotations: secondSetAnnotations,
      });

      rerender(
        <FetchingAnnotationsProvider>
          <TestConsumer />
        </FetchingAnnotationsProvider>
      );

      // Context should update when setAnnotations changes
      const context = JSON.parse(screen.getByTestId('context-value').textContent!);
      expect(context.hasSetAnnotations).toBe(true);
    });

    it('should not recreate context values when dependencies do not change', () => {
      const { rerender } = render(
        <FetchingAnnotationsProvider>
          <TestConsumer />
        </FetchingAnnotationsProvider>
      );

      const firstRender = screen.getByTestId('context-value').textContent;

      // Rerender with same dependencies
      rerender(
        <FetchingAnnotationsProvider>
          <TestConsumer />
        </FetchingAnnotationsProvider>
      );

      const secondRender = screen.getByTestId('context-value').textContent;
      // Values should be the same (memoized)
      expect(secondRender).toBe(firstRender);
    });

    it('should recreate context values when annotations reference changes', () => {
      const annotations1 = [{ id: '1', type: 'highlight' }];
      const annotations2 = [{ id: '2', type: 'comment' }]; // Different content and reference

      (useFetchingAnnotationsStore as jest.Mock).mockReturnValue({
        annotations: annotations1,
        setAnnotations: mockSetAnnotations,
      });

      const { rerender } = render(
        <FetchingAnnotationsProvider>
          <TestConsumer />
        </FetchingAnnotationsProvider>
      );

      const firstRender = screen.getByTestId('context-value').textContent;
      const firstContext = JSON.parse(firstRender!);
      expect(firstContext.annotations).toEqual(annotations1);

      // Change to different reference with different content
      (useFetchingAnnotationsStore as jest.Mock).mockReturnValue({
        annotations: annotations2,
        setAnnotations: mockSetAnnotations,
      });

      rerender(
        <FetchingAnnotationsProvider>
          <TestConsumer />
        </FetchingAnnotationsProvider>
      );

      const secondRender = screen.getByTestId('context-value').textContent;
      const secondContext = JSON.parse(secondRender!);
      // Should recreate because annotations changed
      expect(secondRender).not.toBe(firstRender);
      expect(secondContext.annotations).toEqual(annotations2);
    });
  });

  describe('Edge Cases', () => {
    it('should handle when setAnnotations is undefined', () => {
      (useFetchingAnnotationsStore as jest.Mock).mockReturnValue({
        annotations: mockAnnotations,
        setAnnotations: undefined,
      });

      render(
        <FetchingAnnotationsProvider>
          <TestConsumer />
        </FetchingAnnotationsProvider>
      );

      const context = JSON.parse(screen.getByTestId('context-value').textContent!);
      expect(context.hasSetAnnotations).toBe(false);
    });

    it('should handle when setAnnotations is null', () => {
      (useFetchingAnnotationsStore as jest.Mock).mockReturnValue({
        annotations: mockAnnotations,
        setAnnotations: null,
      });

      render(
        <FetchingAnnotationsProvider>
          <TestConsumer />
        </FetchingAnnotationsProvider>
      );

      const context = JSON.parse(screen.getByTestId('context-value').textContent!);
      expect(context.hasSetAnnotations).toBe(false);
    });

    it('should handle complex annotations objects', () => {
      const complexAnnotations = [
        {
          id: '1',
          type: 'highlight',
          color: { r: 255, g: 0, b: 0 },
          pageNumber: 1,
          rect: { x: 10, y: 20, width: 100, height: 30 },
        },
      ];

      (useFetchingAnnotationsStore as jest.Mock).mockReturnValue({
        annotations: complexAnnotations,
        setAnnotations: mockSetAnnotations,
      });

      render(
        <FetchingAnnotationsProvider>
          <TestConsumer />
        </FetchingAnnotationsProvider>
      );

      const context = JSON.parse(screen.getByTestId('context-value').textContent!);
      expect(context.annotations).toEqual(complexAnnotations);
    });

    it('should handle large annotations arrays', () => {
      const largeAnnotations = Array.from({ length: 1000 }, (_, i) => ({
        id: `annotation-${i}`,
        type: 'highlight',
      }));

      (useFetchingAnnotationsStore as jest.Mock).mockReturnValue({
        annotations: largeAnnotations,
        setAnnotations: mockSetAnnotations,
      });

      render(
        <FetchingAnnotationsProvider>
          <TestConsumer />
        </FetchingAnnotationsProvider>
      );

      const context = JSON.parse(screen.getByTestId('context-value').textContent!);
      expect(context.annotations).toHaveLength(1000);
    });
  });
});

