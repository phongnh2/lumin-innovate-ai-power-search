import { renderHook, act } from '@testing-library/react';
import { BroadcastChannel } from 'broadcast-channel';
import { useBroadcastChannel } from '../useBroadcastChannel';

jest.mock('broadcast-channel', () => ({
  BroadcastChannel: jest.fn().mockImplementation(() => ({
    onmessage: null,
    close: jest.fn(),
  })),
}));

describe('useBroadcastChannel', () => {
  let mockFuse: any;
  let fuseSearchRef: any;
  let setIsEnabled: jest.Mock;
  let initTrieSearch: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockFuse = {
      add: jest.fn(),
      remove: jest.fn(),
      _docs: [],
    };
    fuseSearchRef = { current: mockFuse };
    setIsEnabled = jest.fn();
    initTrieSearch = jest.fn().mockResolvedValue(undefined);
  });

  const getProps = () => ({
    fuseSearchRef,
    setIsEnabled,
    initTrieSearch,
  });

  describe('onUpdateSuggestion Branches', () => {
    it('should add suggestion when action is "add" and suggestion is new', () => {
      renderHook(() => useBroadcastChannel(getProps()));
      const updateChannel = (BroadcastChannel as jest.Mock).mock.results[0].value;
      
      const newSuggestion = { content: 'new-item' };
      mockFuse._docs = []; // Empty, so it's new

      act(() => {
        updateChannel.onmessage({ suggestion: newSuggestion, action: 'add' });
      });

      expect(mockFuse.add).toHaveBeenCalledWith(newSuggestion);
    });

    it('should NOT add suggestion if it already exists in fuse docs', () => {
      renderHook(() => useBroadcastChannel(getProps()));
      const updateChannel = (BroadcastChannel as jest.Mock).mock.results[0].value;
      
      const existingItem = { content: 'existing', count: 1, dateStamp: 123456 };
      mockFuse._docs = [existingItem]; 

      act(() => {
        updateChannel.onmessage({ 
          suggestion: existingItem,
          action: 'add' 
        });
      });

      expect(mockFuse.add).not.toHaveBeenCalled();
    });

    it('should remove suggestion when action is "delete"', () => {
      renderHook(() => useBroadcastChannel(getProps()));
      const updateChannel = (BroadcastChannel as jest.Mock).mock.results[0].value;

      const target = { content: 'delete-me' };
      act(() => {
        updateChannel.onmessage({ suggestion: target, action: 'delete' });
      });

      expect(mockFuse.remove).toHaveBeenCalled();
      // Test the internal filter logic (item.content === suggestion.content)
      const predicate = (mockFuse.remove as jest.Mock).mock.calls[0][0];
      expect(predicate({ content: 'delete-me' })).toBe(true);
      expect(predicate({ content: 'different' })).toBe(false);
    });

    it('should do nothing for unknown actions', () => {
      renderHook(() => useBroadcastChannel(getProps()));
      const updateChannel = (BroadcastChannel as jest.Mock).mock.results[0].value;

      act(() => {
        updateChannel.onmessage({ suggestion: { content: 'test' }, action: 'unknown' });
      });

      expect(mockFuse.add).not.toHaveBeenCalled();
      expect(mockFuse.remove).not.toHaveBeenCalled();
    });

    it('should do nothing if fuseSearchRef.current is null', () => {
      fuseSearchRef.current = null;
      renderHook(() => useBroadcastChannel(getProps()));
      const updateChannel = (BroadcastChannel as jest.Mock).mock.results[0].value;

      act(() => {
        updateChannel.onmessage({ suggestion: { content: 'test' }, action: 'add' });
      });

      expect(mockFuse.add).not.toHaveBeenCalled();
    });
  });

  describe('onToggleAutoComplete Branches', () => {
    it('should enable and trigger initTrieSearch only if enabled is true and fuse is null', async () => {
      fuseSearchRef.current = null;
      renderHook(() => useBroadcastChannel(getProps()));
      const toggleChannel = (BroadcastChannel as jest.Mock).mock.results[1].value;

      await act(async () => {
        await toggleChannel.onmessage(true);
      });

      expect(setIsEnabled).toHaveBeenCalledWith(true);
      expect(initTrieSearch).toHaveBeenCalled();
    });

    it('should NOT trigger search if fuse already exists', async () => {
      renderHook(() => useBroadcastChannel(getProps()));
      const toggleChannel = (BroadcastChannel as jest.Mock).mock.results[1].value;

      await act(async () => {
        await toggleChannel.onmessage(true);
      });

      expect(setIsEnabled).toHaveBeenCalledWith(true);
      expect(initTrieSearch).not.toHaveBeenCalled();
    });

    it('should disable when message is false', async () => {
      renderHook(() => useBroadcastChannel(getProps()));
      const toggleChannel = (BroadcastChannel as jest.Mock).mock.results[1].value;

      await act(async () => {
        await toggleChannel.onmessage(false);
      });

      expect(setIsEnabled).toHaveBeenCalledWith(false);
    });
  });

  it('should clean up by closing channels on unmount', () => {
    const { unmount } = renderHook(() => useBroadcastChannel(getProps()));
    const instances = (BroadcastChannel as jest.Mock).mock.results.map(r => r.value);
    
    unmount();
    
    expect(instances[0].close).toHaveBeenCalled();
    expect(instances[1].close).toHaveBeenCalled();
  });
});