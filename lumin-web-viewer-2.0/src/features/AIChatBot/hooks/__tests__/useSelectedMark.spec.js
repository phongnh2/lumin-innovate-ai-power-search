import React from 'react';
import { renderHook, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { useSelectedMark } from '../useSelectedMark';

// Mock DOM APIs
Object.defineProperty(window, 'getSelection', {
  writable: true,
  value: jest.fn(),
});

Object.defineProperty(document, 'createRange', {
  writable: true,
  value: jest.fn(),
});

describe('useSelectedMark', () => {
  const mockInputRef = { current: null };
  const mockSelection = {
    removeAllRanges: jest.fn(),
    addRange: jest.fn(),
  };
  const mockRange = {
    setStart: jest.fn(),
    collapse: jest.fn(),
  };

  beforeEach(() => {
    mockInputRef.current = {
      focus: jest.fn(),
    };
    window.getSelection.mockReturnValue(mockSelection);
    document.createRange.mockReturnValue(mockRange);
  });

  afterEach(() => {
    jest.clearAllMocks();
    document.body.innerHTML = '';
  });

  describe('when initializing', () => {
    it('should provide all required methods and refs', () => {
      const { result } = renderHook(() => useSelectedMark(mockInputRef));
      
      expect(result.current.selectedMarkRef).toBeDefined();
      expect(result.current.focusSelectedMark).toBeDefined();
      expect(result.current.resetSelectedMark).toBeDefined();
      expect(result.current.removeSelectedMark).toBeDefined();
      expect(result.current.handleMarkClick).toBeDefined();
      expect(typeof result.current.focusSelectedMark).toBe('function');
      expect(typeof result.current.resetSelectedMark).toBe('function');
      expect(typeof result.current.removeSelectedMark).toBe('function');
      expect(typeof result.current.handleMarkClick).toBe('function');
    });

    it('should initialize selectedMarkRef as null', () => {
      const { result } = renderHook(() => useSelectedMark(mockInputRef));
      
      expect(result.current.selectedMarkRef.current).toBeNull();
    });
  });

  describe('when focusing selected mark', () => {
    it('should set data-selected attribute and focus input when mark exists', () => {
      const mockMark = document.createElement('mark');
      mockMark.setAttribute = jest.fn();
      const { result } = renderHook(() => useSelectedMark(mockInputRef));
      
      result.current.selectedMarkRef.current = mockMark;
      
      act(() => {
        result.current.focusSelectedMark();
      });
      
      expect(mockMark.setAttribute).toHaveBeenCalledWith('data-selected', 'true');
      expect(document.createRange).toHaveBeenCalled();
      expect(mockRange.setStart).toHaveBeenCalledWith(mockMark, 0);
      expect(mockRange.collapse).toHaveBeenCalledWith(true);
      expect(mockSelection.removeAllRanges).toHaveBeenCalled();
      expect(mockSelection.addRange).toHaveBeenCalledWith(mockRange);
      expect(mockInputRef.current.focus).toHaveBeenCalled();
    });

    it('should handle when selectedMarkRef is null', () => {
      const { result } = renderHook(() => useSelectedMark(mockInputRef));
      
      expect(() => {
        act(() => {
          result.current.focusSelectedMark();
        });
      }).not.toThrow();
      
      expect(document.createRange).not.toHaveBeenCalled();
    });

    it('should handle when getSelection returns null', () => {
      window.getSelection.mockReturnValue(null);
      const mockMark = document.createElement('mark');
      mockMark.setAttribute = jest.fn();
      const { result } = renderHook(() => useSelectedMark(mockInputRef));
      
      result.current.selectedMarkRef.current = mockMark;
      
      expect(() => {
        act(() => {
          result.current.focusSelectedMark();
        });
      }).not.toThrow();
    });
  });

  describe('when resetting selected mark', () => {
    it('should remove data-selected attribute and reset ref', () => {
      const mockMark = document.createElement('mark');
      mockMark.removeAttribute = jest.fn();
      const { result } = renderHook(() => useSelectedMark(mockInputRef));
      
      result.current.selectedMarkRef.current = mockMark;
      
      act(() => {
        result.current.resetSelectedMark();
      });
      
      expect(mockMark.removeAttribute).toHaveBeenCalledWith('data-selected');
      expect(result.current.selectedMarkRef.current).toBeNull();
    });

    it('should handle when selectedMarkRef is null', () => {
      const { result } = renderHook(() => useSelectedMark(mockInputRef));
      
      expect(() => {
        act(() => {
          result.current.resetSelectedMark();
        });
      }).not.toThrow();
    });
  });

  describe('when removing selected mark', () => {
    it('should remove mark from DOM and reset ref', () => {
      const mockMark = document.createElement('mark');
      mockMark.remove = jest.fn();
      const { result } = renderHook(() => useSelectedMark(mockInputRef));
      
      result.current.selectedMarkRef.current = mockMark;
      
      act(() => {
        result.current.removeSelectedMark();
      });
      
      expect(mockMark.remove).toHaveBeenCalled();
      expect(result.current.selectedMarkRef.current).toBeNull();
    });

    it('should handle when selectedMarkRef is null', () => {
      const { result } = renderHook(() => useSelectedMark(mockInputRef));
      
      expect(() => {
        act(() => {
          result.current.removeSelectedMark();
        });
      }).not.toThrow();
    });
  });

  describe('when handling mark click', () => {
    it('should set selectedMarkRef and focus when clicking on mark', () => {
      const mockMark = document.createElement('mark');
      mockMark.setAttribute = jest.fn();
      const mockTarget = document.createElement('span');
      mockTarget.closest = jest.fn().mockReturnValue(mockMark);
      
      const mockEvent = {
        target: mockTarget,
        stopPropagation: jest.fn(),
      };
      
      const { result } = renderHook(() => useSelectedMark(mockInputRef));
      
      act(() => {
        result.current.handleMarkClick(mockEvent);
      });
      
      expect(mockEvent.stopPropagation).toHaveBeenCalled();
      expect(mockTarget.closest).toHaveBeenCalledWith('mark');
      expect(result.current.selectedMarkRef.current).toBe(mockMark);
      expect(mockMark.setAttribute).toHaveBeenCalledWith('data-selected', 'true');
    });

    it('should reset selected mark when clicking outside mark', () => {
      const mockMark = document.createElement('mark');
      mockMark.removeAttribute = jest.fn();
      const mockTarget = document.createElement('div');
      mockTarget.closest = jest.fn().mockReturnValue(null);
      
      const mockEvent = {
        target: mockTarget,
        stopPropagation: jest.fn(),
      };
      
      const { result } = renderHook(() => useSelectedMark(mockInputRef));
      result.current.selectedMarkRef.current = mockMark;
      
      act(() => {
        result.current.handleMarkClick(mockEvent);
      });
      
      expect(mockEvent.stopPropagation).toHaveBeenCalled();
      expect(mockMark.removeAttribute).toHaveBeenCalledWith('data-selected');
      expect(result.current.selectedMarkRef.current).toBeNull();
    });

    it('should handle when target is not an HTMLElement', () => {
      const mockEvent = {
        target: 'not an element',
        stopPropagation: jest.fn(),
      };
      
      const { result } = renderHook(() => useSelectedMark(mockInputRef));
      
      expect(() => {
        act(() => {
          result.current.handleMarkClick(mockEvent);
        });
      }).not.toThrow();
      
      expect(mockEvent.stopPropagation).toHaveBeenCalled();
    });
  });

  describe('when handling complex interactions', () => {
    it('should handle multiple mark selections', () => {
      const mockMark1 = document.createElement('mark');
      const mockMark2 = document.createElement('mark');
      mockMark1.setAttribute = jest.fn();
      mockMark1.removeAttribute = jest.fn();
      mockMark2.setAttribute = jest.fn();
      
      const { result } = renderHook(() => useSelectedMark(mockInputRef));
      
      // Select first mark
      result.current.selectedMarkRef.current = mockMark1;
      act(() => {
        result.current.focusSelectedMark();
      });
      
      // Select second mark - create proper HTMLElement mock
      const mockTarget = document.createElement('span');
      mockTarget.closest = jest.fn().mockReturnValue(mockMark2);
      
      const mockEvent = {
        target: mockTarget,
        stopPropagation: jest.fn(),
      };
      
      act(() => {
        result.current.handleMarkClick(mockEvent);
      });
      
      expect(result.current.selectedMarkRef.current).toBe(mockMark2);
      expect(mockMark2.setAttribute).toHaveBeenCalledWith('data-selected', 'true');
    });

    it('should handle mark removal after selection', () => {
      const mockMark = document.createElement('mark');
      mockMark.setAttribute = jest.fn();
      mockMark.remove = jest.fn();
      
      const { result } = renderHook(() => useSelectedMark(mockInputRef));
      
      // Select mark
      result.current.selectedMarkRef.current = mockMark;
      act(() => {
        result.current.focusSelectedMark();
      });
      
      // Remove mark
      act(() => {
        result.current.removeSelectedMark();
      });
      
      expect(mockMark.remove).toHaveBeenCalled();
      expect(result.current.selectedMarkRef.current).toBeNull();
    });
  });
}); 