// ✅ Mocks at the top
jest.mock('core', () => ({
  __esModule: true,
  default: {
    getAnnotationManager: jest.fn().mockReturnValue({
      getFieldManager: jest.fn().mockReturnValue({
        getField: jest.fn(),
      }),
    }),
  },
}));

import { renderHook } from '@testing-library/react';
import core from 'core';
import { useOnFocusTextField } from '../useOnFocusTextField';

describe('useOnFocusTextField', () => {
  let addEventListenerSpy: jest.SpyInstance;
  let removeEventListenerSpy: jest.SpyInstance;

  const props = {
    fieldRef: { current: null } as any,
    setInputEl: jest.fn(),
    setSearchResult: jest.fn(),
    setHighlightedIndex: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    props.fieldRef.current = null;
    
    // Setup WebViewer Core globals needed by the hook
    window.Core = {
      Annotations: {
        WidgetFlags: {
          MULTILINE: 'multiline_flag'
        }
      }
    } as any;

    // ✅ Setup spies in beforeEach so they are available in every 'it' block
    addEventListenerSpy = jest.spyOn(window, 'addEventListener');
    removeEventListenerSpy = jest.spyOn(window, 'removeEventListener');
  });

  afterEach(() => {
    // Restore original browser methods
    addEventListenerSpy.mockRestore();
    removeEventListenerSpy.mockRestore();
  });

  it('should add focusin event listener on mount and remove on unmount', () => {
    const { unmount } = renderHook(() => useOnFocusTextField(props));
    
    expect(addEventListenerSpy).toHaveBeenCalledWith('focusin', expect.any(Function));
    
    unmount();
    expect(removeEventListenerSpy).toHaveBeenCalledWith('focusin', expect.any(Function));
  });

  describe('handleFocusIn Logic Branches', () => {
    const triggerFocusIn = (target: any) => {
      // Helper to find and call the handler from the window spy
      const call = addEventListenerSpy.mock.calls.find(c => c[0] === 'focusin');
      const handler = call[1];
      handler({ target } as unknown as FocusEvent);
    };

    it('should ignore focus events on non-input elements', () => {
      renderHook(() => useOnFocusTextField(props));
      const div = document.createElement('div');
      
      triggerFocusIn(div);

      expect(props.setInputEl).not.toHaveBeenCalled();
    });

    it('should update state when a valid text field is focused', () => {
      renderHook(() => useOnFocusTextField(props));
      
      const mockElement = document.createElement('input');
      const mockField = { 
        flags: { get: jest.fn().mockReturnValue(false) } // Not multiline
      };
      
      // Mock offsetParent.id for the FieldManager lookup
      Object.defineProperty(mockElement, 'offsetParent', { value: { id: 'field_123' } });
      (core.getAnnotationManager().getFieldManager().getField as jest.Mock).mockReturnValue(mockField);

      triggerFocusIn(mockElement);

      expect(props.setSearchResult).toHaveBeenCalledWith([]);
      expect(props.setHighlightedIndex).toHaveBeenCalledWith(null);
      expect(props.setInputEl).toHaveBeenCalledWith(mockElement);
      expect(props.fieldRef.current).toBe(mockField);
    });

    it('should reset state if field is not found (null field branch)', () => {
      renderHook(() => useOnFocusTextField(props));
      
      const mockElement = document.createElement('input');
      Object.defineProperty(mockElement, 'offsetParent', { value: { id: 'missing_id' } });
      
      // Branch: !field
      (core.getAnnotationManager().getFieldManager().getField as jest.Mock).mockReturnValue(null);

      triggerFocusIn(mockElement);

      expect(props.fieldRef.current).toBeNull();
      expect(props.setInputEl).toHaveBeenCalledWith(null);
    });

    it('should reset state if field is multiline', () => {
      renderHook(() => useOnFocusTextField(props));
      
      const mockElement = document.createElement('input');
      const mockField = { 
        flags: { get: jest.fn().mockReturnValue(true) } // Is Multiline
      };
      
      Object.defineProperty(mockElement, 'offsetParent', { value: { id: 'multiline_id' } });
      (core.getAnnotationManager().getFieldManager().getField as jest.Mock).mockReturnValue(mockField);

      triggerFocusIn(mockElement);

      expect(props.fieldRef.current).toBeNull();
      expect(props.setInputEl).toHaveBeenCalledWith(null);
    });
  });
});