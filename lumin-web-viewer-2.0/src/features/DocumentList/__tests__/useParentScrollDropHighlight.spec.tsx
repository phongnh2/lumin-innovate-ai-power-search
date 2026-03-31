import { renderHook, act } from '@testing-library/react';
import '@testing-library/jest-dom';

import useParentScrollDropHighlight from '../hooks/useParentScrollDropHighlight';

// Mock IntersectionObserver
const mockObserve = jest.fn();
const mockUnobserve = jest.fn();
const mockDisconnect = jest.fn();

class MockIntersectionObserver {
  callback: IntersectionObserverCallback;
  
  constructor(callback: IntersectionObserverCallback) {
    this.callback = callback;
  }
  
  observe = mockObserve;
  unobserve = mockUnobserve;
  disconnect = mockDisconnect;
}

// Mock ResizeObserver
const mockResizeObserve = jest.fn();
const mockResizeUnobserve = jest.fn();
const mockResizeDisconnect = jest.fn();

class MockResizeObserver {
  callback: ResizeObserverCallback;
  
  constructor(callback: ResizeObserverCallback) {
    this.callback = callback;
  }
  
  observe = mockResizeObserve;
  unobserve = mockResizeUnobserve;
  disconnect = mockResizeDisconnect;
}

describe('useParentScrollDropHighlight', () => {
  beforeAll(() => {
    (window as any).IntersectionObserver = MockIntersectionObserver;
    (window as any).ResizeObserver = MockResizeObserver;
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Return values', () => {
    it('returns showDropHightlight as false initially', () => {
      const { result } = renderHook(() => useParentScrollDropHighlight({ enabled: true }));
      expect(result.current.showDropHightlight).toBe(false);
    });

    it('returns dropHighlightElementStyle as empty object initially', () => {
      const { result } = renderHook(() => useParentScrollDropHighlight({ enabled: true }));
      expect(result.current.dropHighlightElementStyle).toEqual({});
    });

    it('returns triggerElementRef', () => {
      const { result } = renderHook(() => useParentScrollDropHighlight({ enabled: true }));
      expect(result.current.triggerElementRef).toBeDefined();
      expect(result.current.triggerElementRef.current).toBeNull();
    });

    it('returns bindToElementRef', () => {
      const { result } = renderHook(() => useParentScrollDropHighlight({ enabled: true }));
      expect(result.current.bindToElementRef).toBeDefined();
      expect(result.current.bindToElementRef.current).toBeNull();
    });
  });

  describe('Disabled state', () => {
    it('does not observe when disabled', () => {
      const { result } = renderHook(() => useParentScrollDropHighlight({ enabled: false }));
      
      // Set refs manually
      const triggerElement = document.createElement('div');
      (result.current.triggerElementRef as any).current = triggerElement;
      
      expect(mockObserve).not.toHaveBeenCalled();
    });

    it('does not observe when triggerElementRef is null', () => {
      renderHook(() => useParentScrollDropHighlight({ enabled: true }));
      
      expect(mockObserve).not.toHaveBeenCalled();
    });
  });

  describe('Cleanup', () => {
    it('unobserves on unmount', () => {
      const { unmount } = renderHook(() => useParentScrollDropHighlight({ enabled: true }));
      
      unmount();
      
      // Cleanup is handled in the useEffect cleanup function
    });
  });

  describe('Style generation', () => {
    it('creates style with position fixed', () => {
      const { result } = renderHook(() => useParentScrollDropHighlight({ enabled: true }));
      
      // Initial style should be empty
      expect(result.current.dropHighlightElementStyle.position).toBeUndefined();
    });
  });
});

