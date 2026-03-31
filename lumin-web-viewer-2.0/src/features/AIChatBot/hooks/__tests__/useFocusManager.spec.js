import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { useDispatch } from 'react-redux';
import '@testing-library/jest-dom';
import { useFocusManager } from '../useFocusManager';
import { setIsFocusInput } from 'features/EditorChatBot/slices';

jest.mock('react-redux', () => ({
  useDispatch: jest.fn(),
}));

jest.mock('features/EditorChatBot/slices', () => ({
  setIsFocusInput: jest.fn(),
}));

describe('useFocusManager', () => {
  const mockDispatch = jest.fn();
  const mockResetSelectedMark = jest.fn();

  beforeEach(() => {
    useDispatch.mockReturnValue(mockDispatch);
    setIsFocusInput.mockImplementation((value) => ({ type: 'SET_IS_FOCUS_INPUT', payload: value }));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('when initializing', () => {
    it('should initialize with focusInput as false', () => {
      const { result } = renderHook(() => useFocusManager(mockResetSelectedMark));
      
      expect(result.current.focusInput).toBe(false);
    });

    it('should provide all required methods', () => {
      const { result } = renderHook(() => useFocusManager(mockResetSelectedMark));
      
      expect(result.current.handleWrapperBlur).toBeDefined();
      expect(result.current.handleWrapperFocus).toBeDefined();
      expect(result.current.handleInputFocus).toBeDefined();
      expect(typeof result.current.handleWrapperBlur).toBe('function');
      expect(typeof result.current.handleWrapperFocus).toBe('function');
      expect(typeof result.current.handleInputFocus).toBe('function');
    });
  });

  describe('when handling wrapper blur', () => {
    it('should set focusInput to false', () => {
      const { result } = renderHook(() => useFocusManager(mockResetSelectedMark));
      
      act(() => {
        result.current.handleWrapperFocus();
      });
      
      expect(result.current.focusInput).toBe(true);
      
      act(() => {
        result.current.handleWrapperBlur();
      });
      
      expect(result.current.focusInput).toBe(false);
    });

    it('should call resetSelectedMark callback', () => {
      const { result } = renderHook(() => useFocusManager(mockResetSelectedMark));
      
      act(() => {
        result.current.handleWrapperBlur();
      });
      
      expect(mockResetSelectedMark).toHaveBeenCalledTimes(1);
    });
  });

  describe('when handling wrapper focus', () => {
    it('should set focusInput to true', () => {
      const { result } = renderHook(() => useFocusManager(mockResetSelectedMark));
      
      act(() => {
        result.current.handleWrapperFocus();
      });
      
      expect(result.current.focusInput).toBe(true);
    });
  });

  describe('when handling input focus', () => {
    it('should set focusInput to true', () => {
      const { result } = renderHook(() => useFocusManager(mockResetSelectedMark));
      
      act(() => {
        result.current.handleInputFocus();
      });
      
      expect(result.current.focusInput).toBe(true);
    });

    it('should not dispatch Redux action', () => {
      const { result } = renderHook(() => useFocusManager(mockResetSelectedMark));
      
      mockDispatch.mockClear();
      
      act(() => {
        result.current.handleInputFocus();
      });
      
      expect(mockDispatch).not.toHaveBeenCalled();
    });
  });

  describe('when handling multiple focus events', () => {
    it('should maintain correct state across multiple events', () => {
      const { result } = renderHook(() => useFocusManager(mockResetSelectedMark));
      
      act(() => {
        result.current.handleWrapperFocus();
      });
      expect(result.current.focusInput).toBe(true);
      
      act(() => {
        result.current.handleInputFocus();
      });
      expect(result.current.focusInput).toBe(true);
      
      act(() => {
        result.current.handleWrapperBlur();
      });
      expect(result.current.focusInput).toBe(false);
    });

    it('should call resetSelectedMark only on blur events', () => {
      const { result } = renderHook(() => useFocusManager(mockResetSelectedMark));
      
      act(() => {
        result.current.handleWrapperFocus();
      });
      
      act(() => {
        result.current.handleInputFocus();
      });
      
      expect(mockResetSelectedMark).not.toHaveBeenCalled();
      
      act(() => {
        result.current.handleWrapperBlur();
      });
      
      expect(mockResetSelectedMark).toHaveBeenCalledTimes(1);
    });
  });
}); 