import { act, renderHook } from '@testing-library/react';
import { useSyncAnnotationsStore } from '../useSyncAnnotationsStore';

jest.mock('hooks/zustandStore/logger', () => ({
  logger: (fn: any) => fn,
}));

describe('useSyncAnnotationsStore', () => {
  const initialStoreState = useSyncAnnotationsStore.getState();

  beforeEach(() => {
    useSyncAnnotationsStore.setState(initialStoreState, true);
  });

  it('should set isSyncing state', () => {
    const { result } = renderHook(() => useSyncAnnotationsStore());
    
    act(() => {
      result.current.setIsSyncing(true);
    });
    
    expect(result.current.isSyncing).toBe(true);
  });

  it('should reset abort controller', () => {
    const { result } = renderHook(() => useSyncAnnotationsStore());
    
    act(() => {
      result.current.resetAbortController();
    });
    
    expect(result.current.abortController).toBeInstanceOf(AbortController);
  });
});