import { act, renderHook, waitFor } from '@testing-library/react';
import core from 'core';
import { AnnotationChangedAction } from 'interfaces/annotation/annotation.interface';
import { hasFormFields } from '../../utils/detectionValidator';
import { useCheckFormFieldsInDocument } from '../useCheckFormFieldsInDocument';

jest.mock('core', () => ({
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
}));

// Mock useLatestRef - we'll use React's actual useRef and useEffect
// but simplified to update synchronously for testing
jest.mock('hooks/useLatestRef', () => {
  const React = require('react');
  return {
    useLatestRef: (val: any) => {
      const ref = React.useRef(val);
      // Update ref synchronously when value changes (for testing)
      React.useEffect(() => {
        ref.current = val;
      }, [val]);
      return ref;
    },
  };
});

jest.mock('../../utils/detectionValidator', () => ({
  hasFormFields: jest.fn(),
}));

describe('useCheckFormFieldsInDocument', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should add listener on mount and remove on unmount', () => {
    const { unmount } = renderHook(() => useCheckFormFieldsInDocument());
    expect(core.addEventListener).toHaveBeenCalledWith('annotationChanged', expect.any(Function));
    
    unmount();
    expect(core.removeEventListener).toHaveBeenCalledWith('annotationChanged', expect.any(Function));
  });

  it('should trigger check when annotation is deleted', () => {
    (hasFormFields as jest.Mock).mockReturnValue(true);
    renderHook(() => useCheckFormFieldsInDocument());
    
    const handler = (core.addEventListener as jest.Mock).mock.calls[0][1];
    act(() => {
      handler([], AnnotationChangedAction.DELETE);
    });

    expect(hasFormFields).toHaveBeenCalled();
  });

  it('should trigger check when hasFormFieldsInDocumentRef.current is false and action is ADD', () => {
    (hasFormFields as jest.Mock).mockReturnValue(false);
    renderHook(() => useCheckFormFieldsInDocument());
    
    const handler = (core.addEventListener as jest.Mock).mock.calls[0][1];
    act(() => {
      handler([], AnnotationChangedAction.ADD);
    });

    expect(hasFormFields).toHaveBeenCalled();
  });

  it('should trigger check when hasFormFieldsInDocumentRef.current is false and action is MODIFY', () => {
    (hasFormFields as jest.Mock).mockReturnValue(false);
    renderHook(() => useCheckFormFieldsInDocument());
    
    const handler = (core.addEventListener as jest.Mock).mock.calls[0][1];
    act(() => {
      handler([], AnnotationChangedAction.MODIFY);
    });

    expect(hasFormFields).toHaveBeenCalled();
  });

  it('should trigger check when hasFormFieldsInDocumentRef.current is true and action is DELETE', async () => {
    (hasFormFields as jest.Mock).mockReturnValue(true);
    const { result } = renderHook(() => useCheckFormFieldsInDocument());
    
    const handler = (core.addEventListener as jest.Mock).mock.calls[0][1];
    
    // First trigger DELETE to set hasFormFieldsInDocument to true
    act(() => {
      handler([], AnnotationChangedAction.DELETE);
    });
    
    // Wait for state update and ref to be updated
    await waitFor(() => {
      expect(result.current.hasFormFieldsInDocument).toBe(true);
    });
    
    // Clear the mock to track subsequent calls
    (hasFormFields as jest.Mock).mockClear();
    
    // Now trigger DELETE again when hasFormFieldsInDocumentRef.current is true
    act(() => {
      handler([], AnnotationChangedAction.DELETE);
    });

    expect(hasFormFields).toHaveBeenCalled();
  });

  it('should NOT trigger check when hasFormFieldsInDocumentRef.current is true and action is ADD', async () => {
    (hasFormFields as jest.Mock).mockReturnValue(true);
    const { result } = renderHook(() => useCheckFormFieldsInDocument());
    
    const handler = (core.addEventListener as jest.Mock).mock.calls[0][1];
    
    // First trigger DELETE to set hasFormFieldsInDocument to true
    act(() => {
      handler([], AnnotationChangedAction.DELETE);
    });
    
    // Wait for state update and ref to be updated
    await waitFor(() => {
      expect(result.current.hasFormFieldsInDocument).toBe(true);
    });
    
    // Clear the mock to track subsequent calls
    (hasFormFields as jest.Mock).mockClear();
    
    // Now trigger ADD when hasFormFieldsInDocumentRef.current is true
    act(() => {
      handler([], AnnotationChangedAction.ADD);
    });

    expect(hasFormFields).not.toHaveBeenCalled();
  });

  it('should NOT trigger check when hasFormFieldsInDocumentRef.current is true and action is MODIFY', async () => {
    (hasFormFields as jest.Mock).mockReturnValue(true);
    const { result } = renderHook(() => useCheckFormFieldsInDocument());
    
    const handler = (core.addEventListener as jest.Mock).mock.calls[0][1];
    
    // First trigger DELETE to set hasFormFieldsInDocument to true
    act(() => {
      handler([], AnnotationChangedAction.DELETE);
    });
    
    // Wait for state update and ref to be updated
    await waitFor(() => {
      expect(result.current.hasFormFieldsInDocument).toBe(true);
    });
    
    // Clear the mock to track subsequent calls
    (hasFormFields as jest.Mock).mockClear();
    
    // Now trigger MODIFY when hasFormFieldsInDocumentRef.current is true
    act(() => {
      handler([], AnnotationChangedAction.MODIFY);
    });

    expect(hasFormFields).not.toHaveBeenCalled();
  });
});