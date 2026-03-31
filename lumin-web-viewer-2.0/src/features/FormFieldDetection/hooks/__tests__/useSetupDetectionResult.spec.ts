import { renderHook, waitFor } from '@testing-library/react';
import { useDispatch } from 'react-redux';
import { useFormFieldDetectionStore } from '../useFormFieldDetectionStore';
import useShowModal from '../useShowModal';
import { socket } from '@socket';
import { applyFormFieldsDetected } from '../../manipulation/applyFormFieldsDetected';
import useSetupDetectionResult from '../useSetupDetectionResult';
import core from 'core';
import { FIELD_SESSION_ID, NEW_FORM_FIELD_IN_SESSION } from 'constants/formBuildTool';

jest.mock('react-redux', () => ({
  useDispatch: jest.fn(),
}));

jest.mock('../useFormFieldDetectionStore', () => ({
  useFormFieldDetectionStore: jest.fn(),
}));

jest.mock('../useShowModal', () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock('@socket', () => ({
  socket: {
    on: jest.fn(),
    removeListener: jest.fn(),
  },
}));

jest.mock('../../manipulation/applyFormFieldsDetected', () => ({
  applyFormFieldsDetected: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('p-limit', () => {
  return jest.fn(() => {
    return async (fn: (data: any) => Promise<any>, data: any) => {
      await fn(data);
    };
  });
});

jest.mock('core', () => ({
  getAnnotationsList: jest.fn((): any[] => []),
}));

jest.mock('zustand/react/shallow', () => ({
  useShallow: jest.fn((selector: any) => selector),
}));

jest.mock('../../slice', () => ({
  setIsApplyingFormFieldDetection: jest.fn((value: boolean) => ({
    type: 'FORM_FIELD_DETECTION/setIsApplyingFormFieldDetection',
    payload: value,
  })),
}));

describe('useSetupDetectionResult', () => {
  const mockDispatch = jest.fn();
  const mockShowLoadingModal = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useDispatch as jest.Mock).mockReturnValue(mockDispatch);
    (useFormFieldDetectionStore as unknown as jest.Mock).mockReturnValue({ currentSessionId: 'session_1', setDetectionData: jest.fn() });
    (useShowModal as jest.Mock).mockReturnValue({ showLoadingModal: mockShowLoadingModal });
    (applyFormFieldsDetected as jest.Mock).mockResolvedValue(undefined);
  });

  it('should handle detection result through socket', async () => {
    const { result } = renderHook(() => useSetupDetectionResult());
    const promise = result.current.handleSetupDetectionResult({ sessionId: 's1', socketMessage: 'msg' });

    // Wait a tick to ensure the socket.on callback is registered
    await new Promise(resolve => setTimeout(resolve, 0));

    const onMessage = (socket.on as jest.Mock).mock.calls[0][1];
    
    // Call the socket message handler - this should trigger the promise resolution
    await onMessage({ predictions: [{ type: 'text' }], status: { errorCode: 0 } });

    expect(mockDispatch).toHaveBeenCalled();
    expect(applyFormFieldsDetected).toHaveBeenCalled();
    
    // The function doesn't return the promise value, so it resolves to undefined
    const resultValue = await promise;
    expect(resultValue).toBeUndefined();
  });

  // Line 21: Test accessing currentSessionId from store (when null to trigger lines 44-49)
  it('should access currentSessionId from store when null', async () => {
    (useFormFieldDetectionStore as unknown as jest.Mock).mockReturnValue({ 
      currentSessionId: null, 
      setDetectionData: jest.fn() 
    });

    const { result } = renderHook(() => useSetupDetectionResult());
    
    // Verify hook renders without error (line 21 is executed)
    expect(result.current.handleSetupDetectionResult).toBeDefined();
  });

  // Line 39: Test error condition when status.errorCode exists
  it('should throw error when status.errorCode exists', async () => {
    const { result } = renderHook(() => useSetupDetectionResult());
    const promise = result.current.handleSetupDetectionResult({ sessionId: 's1', socketMessage: 'msg' });

    await new Promise(resolve => setTimeout(resolve, 0));

    const onMessage = (socket.on as jest.Mock).mock.calls[0][1];
    
    // Call with errorCode - the error will be caught and wrapped
    onMessage({ 
      predictions: [{ type: 'text' }], 
      status: { errorCode: 'DETECTION_ERROR' } 
    });

    await expect(promise).rejects.toThrow('Failed to apply detected form fields');
    expect(socket.removeListener).toHaveBeenCalledWith({ message: 'msg' });
  });

  // Line 39: Test error condition when predictions array is empty
  it('should throw error when predictions array is empty', async () => {
    const { result } = renderHook(() => useSetupDetectionResult());
    const promise = result.current.handleSetupDetectionResult({ sessionId: 's1', socketMessage: 'msg' });

    await new Promise(resolve => setTimeout(resolve, 0));

    const onMessage = (socket.on as jest.Mock).mock.calls[0][1];
    
    // Call with empty predictions - the error will be caught and wrapped
    onMessage({ 
      predictions: [], 
      status: {} 
    });

    await expect(promise).rejects.toThrow('Failed to apply detected form fields');
    expect(socket.removeListener).toHaveBeenCalledWith({ message: 'msg' });
  });

  // Lines 44-49: Test setting FIELD_SESSION_ID when currentSessionId is null
  it('should set FIELD_SESSION_ID on annotations when currentSessionId is null', async () => {
    const mockAnnotation1 = {
      getCustomData: jest.fn((key: string) => {
        if (key === FIELD_SESSION_ID) return null;
        if (key === NEW_FORM_FIELD_IN_SESSION) return true;
        return null;
      }),
      setCustomData: jest.fn(),
    };

    const mockAnnotation2 = {
      getCustomData: jest.fn((key: string) => {
        if (key === FIELD_SESSION_ID) return 'existing-session';
        if (key === NEW_FORM_FIELD_IN_SESSION) return true;
        return null;
      }),
      setCustomData: jest.fn(),
    };

    const mockAnnotation3 = {
      getCustomData: jest.fn((key: string) => {
        if (key === FIELD_SESSION_ID) return null;
        if (key === NEW_FORM_FIELD_IN_SESSION) return false;
        return null;
      }),
      setCustomData: jest.fn(),
    };

    (useFormFieldDetectionStore as unknown as jest.Mock).mockReturnValue({ 
      currentSessionId: null, 
      setDetectionData: jest.fn() 
    });
    (core.getAnnotationsList as jest.Mock).mockReturnValue([
      mockAnnotation1,
      mockAnnotation2,
      mockAnnotation3,
    ]);

    const { result } = renderHook(() => useSetupDetectionResult());
    const promise = result.current.handleSetupDetectionResult({ sessionId: 'new-session', socketMessage: 'msg' });

    await new Promise(resolve => setTimeout(resolve, 0));

    const onMessage = (socket.on as jest.Mock).mock.calls[0][1];
    onMessage({ 
      predictions: [{ type: 'text', fieldId: 'field1', pageNumber: 1, boundingRectangle: { x1: 0, y1: 0, x2: 10, y2: 10 } }], 
      status: {} 
    });

    await promise;

    // Only annotation1 should have FIELD_SESSION_ID set (annotation2 already has one, annotation3 doesn't have NEW_FORM_FIELD_IN_SESSION)
    expect(mockAnnotation1.setCustomData).toHaveBeenCalledWith(FIELD_SESSION_ID, 'new-session');
    expect(mockAnnotation2.setCustomData).not.toHaveBeenCalledWith(FIELD_SESSION_ID, expect.anything());
    expect(mockAnnotation3.setCustomData).not.toHaveBeenCalledWith(FIELD_SESSION_ID, expect.anything());
  });

  // Line 58: Test error rejection when applyFormFieldsDetected throws
  it('should reject with error when applyFormFieldsDetected throws', async () => {
    const mockError = new Error('Apply failed');
    (applyFormFieldsDetected as jest.Mock).mockRejectedValue(mockError);

    const { result } = renderHook(() => useSetupDetectionResult());
    const promise = result.current.handleSetupDetectionResult({ sessionId: 's1', socketMessage: 'msg' });

    await new Promise(resolve => setTimeout(resolve, 0));

    const onMessage = (socket.on as jest.Mock).mock.calls[0][1];
    
    // Call the message handler - error will be caught and wrapped
    onMessage({ 
      predictions: [{ type: 'text', fieldId: 'field1', pageNumber: 1, boundingRectangle: { x1: 0, y1: 0, x2: 10, y2: 10 } }], 
      status: {} 
    });

    await expect(promise).rejects.toThrow('Failed to apply detected form fields');
    expect(socket.removeListener).toHaveBeenCalledWith({ message: 'msg' });
  });

  // Lines 71-72: Test abort signal handler
  it('should handle abort signal and remove listener', async () => {
    const { result } = renderHook(() => useSetupDetectionResult());
    const abortController = new AbortController();
    const promise = result.current.handleSetupDetectionResult(
      { sessionId: 's1', socketMessage: 'msg' },
      { signal: abortController.signal }
    );

    await new Promise(resolve => setTimeout(resolve, 0));

    // Abort the signal before any socket message arrives
    abortController.abort();

    // Wait for abort handler to execute
    await waitFor(() => {
      expect(socket.removeListener).toHaveBeenCalledWith({ message: 'msg' });
    }, { timeout: 1000 });

    // Promise should resolve (not reject) when aborted
    const resultValue = await promise;
    expect(resultValue).toBeUndefined();
  });
});