import React from 'react';
import { renderHook, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { useInputHandler } from '../useInputHandler';

describe('useInputHandler', () => {
  const mockInputRef = { current: null };
  const mockSetValueState = jest.fn();
  const mockOnSubmit = jest.fn();
  const mockRemoveSelectedMark = jest.fn();

  const defaultProps = {
    inputRef: mockInputRef,
    setValueState: mockSetValueState,
    onSubmit: mockOnSubmit,
    disabledSubmit: false,
    isProcessing: false,
    removeSelectedMark: mockRemoveSelectedMark,
  };

  beforeEach(() => {
    mockInputRef.current = {
      innerText: '',
      innerHTML: '',
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('when initializing', () => {
    it('should provide all required methods', () => {
      const { result } = renderHook(() => useInputHandler(defaultProps));
      
      expect(result.current.handleInput).toBeDefined();
      expect(result.current.handleKeyDown).toBeDefined();
      expect(typeof result.current.handleInput).toBe('function');
      expect(typeof result.current.handleKeyDown).toBe('function');
    });
  });

  describe('when handling input', () => {
    it('should call setValueState with trimmed text content', () => {
      mockInputRef.current.innerText = '  hello world  ';
      const { result } = renderHook(() => useInputHandler(defaultProps));
      
      act(() => {
        result.current.handleInput();
      });
      
      expect(mockSetValueState).toHaveBeenCalledWith('hello world');
    });

    it('should clear innerHTML when text content is empty', () => {
      mockInputRef.current.innerText = '   ';
      const { result } = renderHook(() => useInputHandler(defaultProps));
      
      act(() => {
        result.current.handleInput();
      });
      
      expect(mockSetValueState).toHaveBeenCalledWith('');
      expect(mockInputRef.current.innerHTML).toBe('');
    });

    it('should handle when inputRef.current is null', () => {
      mockInputRef.current = null;
      const { result } = renderHook(() => useInputHandler(defaultProps));
      
      expect(() => {
        act(() => {
          result.current.handleInput();
        });
      }).not.toThrow();
      
      expect(mockSetValueState).not.toHaveBeenCalled();
    });

    it('should handle empty innerText', () => {
      mockInputRef.current.innerText = '';
      const { result } = renderHook(() => useInputHandler(defaultProps));
      
      act(() => {
        result.current.handleInput();
      });
      
      expect(mockSetValueState).toHaveBeenCalledWith('');
    });
  });

  describe('when handling key down events', () => {
    it('should call removeSelectedMark on any key press', () => {
      const { result } = renderHook(() => useInputHandler(defaultProps));
      const mockEvent = { key: 'a', shiftKey: false, preventDefault: jest.fn() };
      
      act(() => {
        result.current.handleKeyDown(mockEvent);
      });
      
      expect(mockRemoveSelectedMark).toHaveBeenCalledTimes(1);
    });

    it('should allow Enter + Shift to pass through', () => {
      const { result } = renderHook(() => useInputHandler(defaultProps));
      const mockEvent = { key: 'Enter', shiftKey: true, preventDefault: jest.fn() };
      
      act(() => {
        result.current.handleKeyDown(mockEvent);
      });
      
      expect(mockEvent.preventDefault).not.toHaveBeenCalled();
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('should prevent default and call onSubmit on Enter without Shift', () => {
      const { result } = renderHook(() => useInputHandler(defaultProps));
      const mockEvent = { key: 'Enter', shiftKey: false, preventDefault: jest.fn() };
      
      act(() => {
        result.current.handleKeyDown(mockEvent);
      });
      
      expect(mockEvent.preventDefault).toHaveBeenCalled();
      expect(mockOnSubmit).toHaveBeenCalledTimes(1);
    });

    it('should not call onSubmit when disabledSubmit is true', () => {
      const props = { ...defaultProps, disabledSubmit: true };
      const { result } = renderHook(() => useInputHandler(props));
      const mockEvent = { key: 'Enter', shiftKey: false, preventDefault: jest.fn() };
      
      act(() => {
        result.current.handleKeyDown(mockEvent);
      });
      
      expect(mockEvent.preventDefault).toHaveBeenCalled();
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('should not call onSubmit when isProcessing is true', () => {
      const props = { ...defaultProps, isProcessing: true };
      const { result } = renderHook(() => useInputHandler(props));
      const mockEvent = { key: 'Enter', shiftKey: false, preventDefault: jest.fn() };
      
      act(() => {
        result.current.handleKeyDown(mockEvent);
      });
      
      expect(mockEvent.preventDefault).toHaveBeenCalled();
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('should not call onSubmit when onSubmit is not provided', () => {
      const props = { ...defaultProps, onSubmit: undefined };
      const { result } = renderHook(() => useInputHandler(props));
      const mockEvent = { key: 'Enter', shiftKey: false, preventDefault: jest.fn() };
      
      expect(() => {
        act(() => {
          result.current.handleKeyDown(mockEvent);
        });
      }).not.toThrow();
      
      expect(mockEvent.preventDefault).toHaveBeenCalled();
    });

    it('should handle non-Enter keys without preventing default', () => {
      const { result } = renderHook(() => useInputHandler(defaultProps));
      const mockEvent = { key: 'a', shiftKey: false, preventDefault: jest.fn() };
      
      act(() => {
        result.current.handleKeyDown(mockEvent);
      });
      
      expect(mockEvent.preventDefault).not.toHaveBeenCalled();
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });
  });

  describe('when handling edge cases', () => {
    it('should handle multiple consecutive inputs', () => {
      const { result } = renderHook(() => useInputHandler(defaultProps));
      
      mockInputRef.current.innerText = 'first input';
      act(() => {
        result.current.handleInput();
      });
      
      mockInputRef.current.innerText = 'second input';
      act(() => {
        result.current.handleInput();
      });
      
      expect(mockSetValueState).toHaveBeenCalledTimes(2);
      expect(mockSetValueState).toHaveBeenNthCalledWith(1, 'first input');
      expect(mockSetValueState).toHaveBeenNthCalledWith(2, 'second input');
    });

    it('should handle Enter key with all conditions preventing submission', () => {
      const props = { 
        ...defaultProps, 
        onSubmit: undefined, 
        disabledSubmit: true, 
        isProcessing: true 
      };
      const { result } = renderHook(() => useInputHandler(props));
      const mockEvent = { key: 'Enter', shiftKey: false, preventDefault: jest.fn() };
      
      act(() => {
        result.current.handleKeyDown(mockEvent);
      });
      
      expect(mockEvent.preventDefault).toHaveBeenCalled();
      expect(mockRemoveSelectedMark).toHaveBeenCalled();
    });
  });
}); 