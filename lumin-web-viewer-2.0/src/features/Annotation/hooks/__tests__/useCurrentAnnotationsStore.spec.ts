import { act, renderHook } from '@testing-library/react';
import { annotationStreamService } from 'services/annotationStreamService';
import { useCurrentAnnotationsStore } from '../useCurrentAnnotationsStore';

jest.mock('hooks/zustandStore/logger', () => ({
  logger: (fn: any) => fn,
}));

jest.mock('services/annotationStreamService', () => ({
  annotationStreamService: {
    fetchAnnotations: jest.fn(),
    reset: jest.fn(),
  },
}));

describe('useCurrentAnnotationsStore', () => {
  const initialStoreState = useCurrentAnnotationsStore.getState();

  beforeEach(() => {
    jest.clearAllMocks();
    useCurrentAnnotationsStore.setState(initialStoreState, true);
  });

  it('should set annotations correctly', () => {
    const { result } = renderHook(() => useCurrentAnnotationsStore());
    const mockAnnotations = [{ Id: '1' }] as any[];

    act(() => {
      result.current.setAnnotations(mockAnnotations);
    });

    expect(result.current.annotations).toEqual(mockAnnotations);
  });

  it('should clear current document state', () => {
    const { result } = renderHook(() => useCurrentAnnotationsStore());
    
    act(() => {
      // Set some state first
      useCurrentAnnotationsStore.setState({ documentId: 'doc1', isLoading: true });
      result.current.clearCurrentDocument();
    });

    expect(result.current.documentId).toBeNull();
    expect(result.current.annotations).toEqual([]);
    expect(result.current.isLoading).toBe(false);
  });

  it('should abort previous controller when clearing', () => {
    const { result } = renderHook(() => useCurrentAnnotationsStore());
    const mockAbort = jest.fn();
    
    act(() => {
      useCurrentAnnotationsStore.setState({ abortController: { abort: mockAbort } as any });
      result.current.clearCurrentDocument();
    });

    expect(mockAbort).toHaveBeenCalled();
  });

  it('should reset store and service', () => {
    const { result } = renderHook(() => useCurrentAnnotationsStore());
    const mockAbort = jest.fn();

    act(() => {
      useCurrentAnnotationsStore.setState({ abortController: { abort: mockAbort } as any, documentId: 'doc1' });
      result.current.reset();
    });

    expect(mockAbort).toHaveBeenCalled();
    expect(annotationStreamService.reset).toHaveBeenCalled();
    expect(result.current.documentId).toBeNull();
  });

  it('should reset store and service when no abortController exists', () => {
    const { result } = renderHook(() => useCurrentAnnotationsStore());

    act(() => {
      useCurrentAnnotationsStore.setState({ documentId: 'doc1', abortController: undefined });
      result.current.reset();
    });

    expect(annotationStreamService.reset).toHaveBeenCalled();
    expect(result.current.documentId).toBeNull();
  });

  describe('fetchAnnotations', () => {
    it('should not fetch if already loading same document', async () => {
      const { result } = renderHook(() => useCurrentAnnotationsStore());
      
      act(() => {
        useCurrentAnnotationsStore.setState({ documentId: 'doc1', isLoading: true });
        result.current.fetchAnnotations('doc1');
      });

      expect(annotationStreamService.fetchAnnotations).not.toHaveBeenCalled();
    });

    it('should fetch annotations successfully', async () => {
      const { result } = renderHook(() => useCurrentAnnotationsStore());
      const mockAnnotations = [{ Id: '1' }];
      
      (annotationStreamService.fetchAnnotations as jest.Mock).mockResolvedValue({
        annotations: mockAnnotations,
        isFromStream: true,
        error: null,
      });

      await act(async () => {
        await result.current.fetchAnnotations('doc1');
      });

      expect(result.current.documentId).toBe('doc1');
      expect(result.current.isLoading).toBe(false);
      expect(result.current.annotations).toEqual(mockAnnotations);
      expect(result.current.isFromStream).toBe(true);
    });

    it('should handle error in result object', async () => {
      const { result } = renderHook(() => useCurrentAnnotationsStore());
      const resultError = new Error('Result error');

      (annotationStreamService.fetchAnnotations as jest.Mock).mockResolvedValue({
        annotations: [],
        isFromStream: false,
        error: resultError,
      });

      await act(async () => {
        await result.current.fetchAnnotations('doc1');
      });

      expect(result.current.error).toEqual(resultError);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.documentId).toBe('doc1');
    });

    it('should handle fetch errors', async () => {
      const { result } = renderHook(() => useCurrentAnnotationsStore());
      const error = new Error('Fetch failed');
      
      (annotationStreamService.fetchAnnotations as jest.Mock).mockRejectedValue(error);

      await act(async () => {
        await result.current.fetchAnnotations('doc1');
      });

      expect(result.current.error).toEqual(error);
      expect(result.current.isLoading).toBe(false);
    });

    it('should handle stream updates via onMessage callback', async () => {
      const { result } = renderHook(() => useCurrentAnnotationsStore());
      let onMessageCallback: (annots: any[]) => void;

      (annotationStreamService.fetchAnnotations as jest.Mock).mockImplementation(({ onMessage }) => {
        onMessageCallback = onMessage;
        return Promise.resolve({ annotations: [], isFromStream: true });
      });

      await act(async () => {
        result.current.fetchAnnotations('doc1');
      });

      act(() => {
        // Simulate stream update
        onMessageCallback([{ Id: 'stream-1' }]);
      });

      expect(result.current.annotations).toEqual([{ Id: 'stream-1' }]);
    });

    it('should handle stream errors via onError callback', async () => {
      const { result } = renderHook(() => useCurrentAnnotationsStore());
      let onErrorCallback: (err: Error) => void;

      (annotationStreamService.fetchAnnotations as jest.Mock).mockImplementation(({ onError }) => {
        onErrorCallback = onError;
        return Promise.resolve({ annotations: [], isFromStream: true });
      });

      await act(async () => {
        result.current.fetchAnnotations('doc1');
      });

      const streamError = new Error('Stream error');
      act(() => {
        onErrorCallback(streamError);
      });

      expect(result.current.error).toEqual(streamError);
    });

    it('should not update error in onError callback when documentId has changed', async () => {
      const { result } = renderHook(() => useCurrentAnnotationsStore());
      let onErrorCallback: (err: Error) => void;
      let resolvePromise: (value: any) => void;

      const promise = new Promise((resolve) => {
        resolvePromise = resolve;
      });

      (annotationStreamService.fetchAnnotations as jest.Mock).mockImplementation(({ onError }) => {
        onErrorCallback = onError;
        return promise;
      });

      // Start fetch (don't await so we can change documentId before it completes)
      void act(async () => {
        await result.current.fetchAnnotations('doc1');
      });

      // Change documentId before calling onError
      act(() => {
        useCurrentAnnotationsStore.setState({ documentId: 'doc2', error: null });
      });

      const streamError = new Error('Stream error');
      act(() => {
        onErrorCallback(streamError);
      });

      // Resolve the promise
      await act(async () => {
        resolvePromise({ annotations: [], isFromStream: true });
        await promise;
      });

      // Error should not be updated because documentId changed
      expect(result.current.error).toBeNull();
    });

    it('should reset state if fetching a new document ID', async () => {
      const { result } = renderHook(() => useCurrentAnnotationsStore());
      const mockAbort = jest.fn();

      act(() => {
        useCurrentAnnotationsStore.setState({ 
          documentId: 'old-doc', 
          annotations: [{ Id: 'old' } as any],
          abortController: { abort: mockAbort } as any
        });
      });

      (annotationStreamService.fetchAnnotations as jest.Mock).mockResolvedValue({ annotations: [] });

      await act(async () => {
        await useCurrentAnnotationsStore.getState().fetchAnnotations('new-doc');
      });

      expect(mockAbort).toHaveBeenCalled(); // Abort old
      expect(useCurrentAnnotationsStore.getState().documentId).toBe('new-doc');
    });

    it('should ignore AbortError', async () => {
      const { result } = renderHook(() => useCurrentAnnotationsStore());
      const abortError = new Error('Aborted');
      abortError.name = 'AbortError';
      
      (annotationStreamService.fetchAnnotations as jest.Mock).mockRejectedValue(abortError);

      await act(async () => {
        await useCurrentAnnotationsStore.getState().fetchAnnotations('doc1');
      });

      // Should remain loading or not set error
      expect(useCurrentAnnotationsStore.getState().error).toBeNull();
    });

    it('should not update annotations in onMessage callback when documentId has changed', async () => {
      const { result } = renderHook(() => useCurrentAnnotationsStore());
      let onMessageCallback: (annots: any[]) => void;
      let resolvePromise: (value: any) => void;

      const promise = new Promise((resolve) => {
        resolvePromise = resolve;
      });

      (annotationStreamService.fetchAnnotations as jest.Mock).mockImplementation(({ onMessage }) => {
        onMessageCallback = onMessage;
        return promise;
      });

      // Start fetch
      const fetchPromise = useCurrentAnnotationsStore.getState().fetchAnnotations('doc1');
      
      // Wait a tick to ensure mock is called and callback is captured
      await new Promise((resolve) => setTimeout(resolve, 0));
      
      // Change documentId before calling onMessage
      act(() => {
        useCurrentAnnotationsStore.setState({ documentId: 'doc2' });
      });
      
      act(() => {
        // Simulate stream update
        // The onMessage callback checks: draft.documentId === documentId (where documentId='doc1' from closure)
        // Since draft.documentId is now 'doc2', the check fails and annotations are NOT updated
        // This demonstrates that the race condition protection works correctly
        onMessageCallback([{ Id: 'stream-1' }]);
      });
      
      // Resolve the promise
      await act(async () => {
        resolvePromise({ annotations: [], isFromStream: true });
        await fetchPromise;
      });

      // Annotations should not be updated because documentId changed
      // Protection: The callback's closure captured documentId='doc1', but draft.documentId='doc2'
      // The check draft.documentId === documentId prevents stale updates
      expect(useCurrentAnnotationsStore.getState().annotations).toEqual([]);
    });

    it('should not update state in final set when documentId has changed', async () => {
      const { result } = renderHook(() => useCurrentAnnotationsStore());
      const mockAnnotations = [{ Id: '1' }];
      let resolvePromise: (value: any) => void;

      const promise = new Promise((resolve) => {
        resolvePromise = resolve;
      });

      (annotationStreamService.fetchAnnotations as jest.Mock).mockImplementation(() => promise);

      // Start fetch
      const fetchPromise = useCurrentAnnotationsStore.getState().fetchAnnotations('doc1');
      
      // Wait a tick to ensure mock is called
      await new Promise((resolve) => setTimeout(resolve, 0));
      
      // Change documentId before promise resolves (preserve isLoading)
      act(() => {
        const currentState = useCurrentAnnotationsStore.getState();
        useCurrentAnnotationsStore.setState({ documentId: 'doc2', isLoading: currentState.isLoading });
      });
      
      // Resolve the promise
      await act(async () => {
        resolvePromise({
          annotations: mockAnnotations,
          isFromStream: true,
          error: null,
        });
        await fetchPromise;
      });

      // State should not be updated because documentId changed
      // isLoading remains true because the final set doesn't execute when documentId doesn't match
      const state = useCurrentAnnotationsStore.getState();
      expect(state.documentId).toBe('doc2');
      expect(state.annotations).toEqual([]);
      expect(state.isLoading).toBe(true);
    });

    it('should not update error in catch block when documentId has changed', async () => {
      const { result } = renderHook(() => useCurrentAnnotationsStore());
      const error = new Error('Fetch failed');
      let rejectPromise: (error: Error) => void;

      const promise = new Promise((_, reject) => {
        rejectPromise = reject;
      });

      (annotationStreamService.fetchAnnotations as jest.Mock).mockImplementation(() => promise);

      // Start fetch
      const fetchPromise = useCurrentAnnotationsStore.getState().fetchAnnotations('doc1');
      
      // Wait a tick to ensure mock is called
      await new Promise((resolve) => setTimeout(resolve, 0));
      
      // Change documentId before promise rejects
      act(() => {
        useCurrentAnnotationsStore.setState({ documentId: 'doc2', error: null });
      });
      
      // Reject the promise
      await act(async () => {
        rejectPromise(error);
        try {
          await fetchPromise;
        } catch {
          // Expected to throw
        }
      });

      // Error should not be updated because documentId changed
      const state = useCurrentAnnotationsStore.getState();
      expect(state.documentId).toBe('doc2');
      expect(state.error).toBeNull();
    });
  });
});