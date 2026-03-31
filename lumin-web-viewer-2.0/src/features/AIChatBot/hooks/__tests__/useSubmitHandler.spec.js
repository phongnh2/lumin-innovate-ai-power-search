import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { useSelector } from 'react-redux';
import { useShallow } from 'zustand/react/shallow';
import '@testing-library/jest-dom';
import { useSubmitHandler } from '../useSubmitHandler';
import { useChatbotStore } from 'features/EditorChatBot/hooks/useChatbotStore';
import { selectors } from 'features/EditorChatBot/slices';
import { hasResponseFromChatbot } from 'features/EditorChatBot/utils/checkResponseChatbot';

jest.mock('react-redux', () => ({
  useSelector: jest.fn(),
}));

jest.mock('zustand/react/shallow', () => ({
  useShallow: jest.fn(),
}));

jest.mock('features/EditorChatBot/hooks/useChatbotStore', () => ({
  useChatbotStore: jest.fn(),
}));

jest.mock('features/EditorChatBot/slices', () => ({
  selectors: {
    getMessages: jest.fn(),
  },
}));

jest.mock('features/EditorChatBot/utils/checkResponseChatbot', () => ({
  hasResponseFromChatbot: jest.fn(),
}));

describe('useSubmitHandler', () => {
  const mockOnSubmit = jest.fn();
  const mockStop = jest.fn();
  const mockStopCallback = jest.fn();
  const mockSetNeedToUpload = jest.fn();
  
  const mockMessages = [
    { id: 1, content: 'Hello' },
    { id: 2, content: 'Hi there' },
  ];

  const mockStoreState = {
    setNeedToUpload: mockSetNeedToUpload,
    hasStartChatbotSession: false,
  };

  const defaultProps = {
    onSubmit: mockOnSubmit,
    disabledSubmit: false,
    isProcessing: false,
    stop: mockStop,
    stopCallback: mockStopCallback,
  };

  beforeEach(() => {
    useSelector.mockReturnValue(mockMessages);
    useShallow.mockImplementation((selector) => selector(mockStoreState));
    useChatbotStore.mockReturnValue(mockStoreState);
    hasResponseFromChatbot.mockReturnValue(false);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('when initializing', () => {
    it('should provide all required methods', () => {
      const { result } = renderHook(() => useSubmitHandler(defaultProps));
      
      expect(result.current.handleSubmit).toBeDefined();
      expect(result.current.cancelRequest).toBeDefined();
      expect(typeof result.current.handleSubmit).toBe('function');
      expect(typeof result.current.cancelRequest).toBe('function');
    });

    it('should call useSelector with correct selector', () => {
      renderHook(() => useSubmitHandler(defaultProps));
      
      expect(useSelector).toHaveBeenCalledWith(selectors.getMessages);
    });

    it('should call useChatbotStore with useShallow', () => {
      renderHook(() => useSubmitHandler(defaultProps));
      
      expect(useChatbotStore).toHaveBeenCalledTimes(1);
      expect(useShallow).toHaveBeenCalledWith(expect.any(Function));
    });
  });

  describe('when handling submit', () => {
    it('should call onSubmit when all conditions are met', () => {
      const { result } = renderHook(() => useSubmitHandler(defaultProps));
      
      act(() => {
        result.current.handleSubmit();
      });
      
      expect(mockOnSubmit).toHaveBeenCalledTimes(1);
    });

    it('should not call onSubmit when disabledSubmit is true', () => {
      const props = { ...defaultProps, disabledSubmit: true };
      const { result } = renderHook(() => useSubmitHandler(props));
      
      act(() => {
        result.current.handleSubmit();
      });
      
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('should not call onSubmit when isProcessing is true', () => {
      const props = { ...defaultProps, isProcessing: true };
      const { result } = renderHook(() => useSubmitHandler(props));
      
      act(() => {
        result.current.handleSubmit();
      });
      
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('should not call onSubmit when onSubmit is not provided', () => {
      const props = { ...defaultProps, onSubmit: undefined };
      const { result } = renderHook(() => useSubmitHandler(props));
      
      expect(() => {
        act(() => {
          result.current.handleSubmit();
        });
      }).not.toThrow();
    });

    it('should handle all blocking conditions simultaneously', () => {
      const props = { 
        ...defaultProps, 
        onSubmit: undefined, 
        disabledSubmit: true, 
        isProcessing: true 
      };
      const { result } = renderHook(() => useSubmitHandler(props));
      
      act(() => {
        result.current.handleSubmit();
      });
      
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });
  });

  describe('when canceling request', () => {
    it('should call stop and stopCallback when isProcessing is true', () => {
      const props = { ...defaultProps, isProcessing: true };
      const { result } = renderHook(() => useSubmitHandler(props));
      
      act(() => {
        result.current.cancelRequest();
      });
      
      expect(mockStop).toHaveBeenCalledTimes(1);
      expect(mockStopCallback).toHaveBeenCalledTimes(1);
    });

    it('should not call stop functions when isProcessing is false', () => {
      const { result } = renderHook(() => useSubmitHandler(defaultProps));
      
      act(() => {
        result.current.cancelRequest();
      });
      
      expect(mockStop).not.toHaveBeenCalled();
      expect(mockStopCallback).not.toHaveBeenCalled();
    });

    it('should set needToUpload when no chatbot response and session started', () => {
      hasResponseFromChatbot.mockReturnValue(false);
      const storeState = { ...mockStoreState, hasStartChatbotSession: true };
      useShallow.mockImplementation((selector) => selector(storeState));
      useChatbotStore.mockReturnValue(storeState);
      
      const { result } = renderHook(() => useSubmitHandler(defaultProps));
      
      act(() => {
        result.current.cancelRequest();
      });
      
      expect(hasResponseFromChatbot).toHaveBeenCalledWith(mockMessages);
      expect(mockSetNeedToUpload).toHaveBeenCalledWith(true);
    });

    it('should not set needToUpload when chatbot has response', () => {
      hasResponseFromChatbot.mockReturnValue(true);
      const storeState = { ...mockStoreState, hasStartChatbotSession: true };
      useShallow.mockImplementation((selector) => selector(storeState));
      useChatbotStore.mockReturnValue(storeState);
      
      const { result } = renderHook(() => useSubmitHandler(defaultProps));
      
      act(() => {
        result.current.cancelRequest();
      });
      
      expect(mockSetNeedToUpload).not.toHaveBeenCalled();
    });

    it('should not set needToUpload when session has not started', () => {
      hasResponseFromChatbot.mockReturnValue(false);
      
      const { result } = renderHook(() => useSubmitHandler(defaultProps));
      
      act(() => {
        result.current.cancelRequest();
      });
      
      expect(mockSetNeedToUpload).not.toHaveBeenCalled();
    });

    it('should handle missing stop functions gracefully', () => {
      const props = { 
        ...defaultProps, 
        stop: undefined, 
        stopCallback: undefined, 
        isProcessing: true 
      };
      const { result } = renderHook(() => useSubmitHandler(props));
      
      expect(() => {
        act(() => {
          result.current.cancelRequest();
        });
      }).not.toThrow();
    });
  });

  describe('when handling complex scenarios', () => {
    it('should handle both submit and cancel operations', () => {
      const { result } = renderHook(() => useSubmitHandler(defaultProps));
      
      act(() => {
        result.current.handleSubmit();
      });
      
      act(() => {
        result.current.cancelRequest();
      });
      
      expect(mockOnSubmit).toHaveBeenCalledTimes(1);
      expect(hasResponseFromChatbot).toHaveBeenCalledWith(mockMessages);
    });

    it('should handle cancel with processing and session conditions', () => {
      hasResponseFromChatbot.mockReturnValue(false);
      const storeState = { ...mockStoreState, hasStartChatbotSession: true };
      useShallow.mockImplementation((selector) => selector(storeState));
      useChatbotStore.mockReturnValue(storeState);
      
      const props = { ...defaultProps, isProcessing: true };
      const { result } = renderHook(() => useSubmitHandler(props));
      
      act(() => {
        result.current.cancelRequest();
      });
      
      expect(mockSetNeedToUpload).toHaveBeenCalledWith(true);
      expect(mockStop).toHaveBeenCalledTimes(1);
      expect(mockStopCallback).toHaveBeenCalledTimes(1);
    });

    it('should handle state changes between operations', () => {
      const { result, rerender } = renderHook(
        (props) => useSubmitHandler(props),
        { initialProps: defaultProps }
      );
      
      act(() => {
        result.current.handleSubmit();
      });
      
      const newProps = { ...defaultProps, disabledSubmit: true };
      rerender(newProps);
      
      act(() => {
        result.current.handleSubmit();
      });
      
      expect(mockOnSubmit).toHaveBeenCalledTimes(1);
    });
  });
}); 