import React from 'react';
import { renderHook, act, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import {
  SyncedQueueProvider,
  useSyncedQueueContext,
  SyncedQueueContext,
} from '../useSyncedQueue';

describe('useSyncedQueue', () => {
  describe('SyncedQueueProvider', () => {
    it('should render children correctly', () => {
      const TestComponent = () => <div>Test Child</div>;

      render(
        <SyncedQueueProvider>
          <TestComponent />
        </SyncedQueueProvider>
      );

      expect(screen.getByText('Test Child')).toBeInTheDocument();
    });

    it('should provide initial empty array in context', () => {
      const TestComponent = () => {
        const { changedQueue } = useSyncedQueueContext();
        return <div>{JSON.stringify(changedQueue)}</div>;
      };

      render(
        <SyncedQueueProvider>
          <TestComponent />
        </SyncedQueueProvider>
      );

      expect(screen.getByText('[]')).toBeInTheDocument();
    });

    it('should provide setQueue function that updates the queue', () => {
      const TestComponent = () => {
        const { changedQueue, setQueue } = useSyncedQueueContext();
        return (
          <div>
            <div data-testid="queue">{JSON.stringify(changedQueue)}</div>
            <button
              onClick={() => setQueue(['file1', 'file2'])}
              data-testid="update-button"
            >
              Update Queue
            </button>
          </div>
        );
      };

      render(
        <SyncedQueueProvider>
          <TestComponent />
        </SyncedQueueProvider>
      );

      expect(screen.getByTestId('queue')).toHaveTextContent('[]');

      act(() => {
        screen.getByTestId('update-button').click();
      });

      expect(screen.getByTestId('queue')).toHaveTextContent('["file1","file2"]');
    });

    it('should update context when setQueue is called with function updater', () => {
      const TestComponent = () => {
        const { changedQueue, setQueue } = useSyncedQueueContext();
        return (
          <div>
            <div data-testid="queue">{JSON.stringify(changedQueue)}</div>
            <button
              onClick={() => setQueue((prev) => [...prev, 'file1'])}
              data-testid="add-button"
            >
              Add File
            </button>
          </div>
        );
      };

      render(
        <SyncedQueueProvider>
          <TestComponent />
        </SyncedQueueProvider>
      );

      expect(screen.getByTestId('queue')).toHaveTextContent('[]');

      act(() => {
        screen.getByTestId('add-button').click();
      });

      expect(screen.getByTestId('queue')).toHaveTextContent('["file1"]');
    });

    it('should memoize context value and update when changedQueue changes', () => {
      let renderCount = 0;
      const TestComponent = () => {
        const { changedQueue, setQueue } = useSyncedQueueContext();
        renderCount++;
        return (
          <div>
            <div data-testid="queue">{JSON.stringify(changedQueue)}</div>
            <button
              onClick={() => setQueue(['file1'])}
              data-testid="update-button"
            >
              Update
            </button>
          </div>
        );
      };

      const { rerender } = render(
        <SyncedQueueProvider>
          <TestComponent />
        </SyncedQueueProvider>
      );

      const initialRenderCount = renderCount;

      // Rerender without changing state should not cause re-render
      rerender(
        <SyncedQueueProvider>
          <TestComponent />
        </SyncedQueueProvider>
      );

      // Update state
      act(() => {
        screen.getByTestId('update-button').click();
      });

      // Component should re-render when state changes
      expect(screen.getByTestId('queue')).toHaveTextContent('["file1"]');
    });
  });

  describe('useSyncedQueueContext', () => {
    it('should return context when used within SyncedQueueProvider', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <SyncedQueueProvider>{children}</SyncedQueueProvider>
      );

      const { result } = renderHook(() => useSyncedQueueContext(), { wrapper });

      expect(result.current).toBeDefined();
      expect(result.current.changedQueue).toEqual([]);
      expect(typeof result.current.setQueue).toBe('function');
    });

    it('should return updated context value when queue changes', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <SyncedQueueProvider>{children}</SyncedQueueProvider>
      );

      const { result } = renderHook(() => useSyncedQueueContext(), { wrapper });

      expect(result.current.changedQueue).toEqual([]);

      act(() => {
        result.current.setQueue(['file1', 'file2']);
      });

      expect(result.current.changedQueue).toEqual(['file1', 'file2']);
    });

    it('should throw error when used outside SyncedQueueProvider', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
      expect(() => {
        renderHook(() => useSyncedQueueContext());
      }).toThrow('useSyncedQueueContext must be used within a SyncedQueueProvider');
    
      consoleSpy.mockRestore();
    });

    it('should throw error when context is null (edge case)', () => {
      // Create a mock context provider that provides null
      const NullProvider = ({ children }: { children: React.ReactNode }) => (
        <SyncedQueueContext.Provider value={null as any}>
          {children}
        </SyncedQueueContext.Provider>
      );

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <NullProvider>{children}</NullProvider>
      );

      expect(() => {
        renderHook(() => useSyncedQueueContext(), { wrapper });
      }).toThrow('useSyncedQueueContext must be used within a SyncedQueueProvider');

      consoleSpy.mockRestore();
    });

    it('should handle multiple queue updates correctly', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <SyncedQueueProvider>{children}</SyncedQueueProvider>
      );

      const { result } = renderHook(() => useSyncedQueueContext(), { wrapper });

      act(() => {
        result.current.setQueue(['file1']);
      });
      expect(result.current.changedQueue).toEqual(['file1']);

      act(() => {
        result.current.setQueue((prev) => [...prev, 'file2']);
      });
      expect(result.current.changedQueue).toEqual(['file1', 'file2']);

      act(() => {
        result.current.setQueue([]);
      });
      expect(result.current.changedQueue).toEqual([]);
    });

    it('should maintain separate state for different provider instances', () => {
      const TestComponent1 = () => {
        const { changedQueue, setQueue } = useSyncedQueueContext();
        return (
          <div>
            <div data-testid="queue1">{JSON.stringify(changedQueue)}</div>
            <button
              onClick={() => setQueue(['file1'])}
              data-testid="update1"
            >
              Update 1
            </button>
          </div>
        );
      };

      const TestComponent2 = () => {
        const { changedQueue, setQueue } = useSyncedQueueContext();
        return (
          <div>
            <div data-testid="queue2">{JSON.stringify(changedQueue)}</div>
            <button
              onClick={() => setQueue(['file2'])}
              data-testid="update2"
            >
              Update 2
            </button>
          </div>
        );
      };

      render(
        <>
          <SyncedQueueProvider>
            <TestComponent1 />
          </SyncedQueueProvider>
          <SyncedQueueProvider>
            <TestComponent2 />
          </SyncedQueueProvider>
        </>
      );

      expect(screen.getByTestId('queue1')).toHaveTextContent('[]');
      expect(screen.getByTestId('queue2')).toHaveTextContent('[]');

      act(() => {
        screen.getByTestId('update1').click();
      });

      expect(screen.getByTestId('queue1')).toHaveTextContent('["file1"]');
      expect(screen.getByTestId('queue2')).toHaveTextContent('[]');

      act(() => {
        screen.getByTestId('update2').click();
      });

      expect(screen.getByTestId('queue1')).toHaveTextContent('["file1"]');
      expect(screen.getByTestId('queue2')).toHaveTextContent('["file2"]');
    });
  });
});

