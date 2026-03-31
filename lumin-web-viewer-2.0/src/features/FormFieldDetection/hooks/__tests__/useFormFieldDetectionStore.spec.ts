import { renderHook, act } from '@testing-library/react';
import { IState, useFormFieldDetectionStore } from '../useFormFieldDetectionStore';
import { IFormFieldDetectionPrediction } from 'features/FormFieldDetection/types';
import { FormFieldDetection } from 'features/FormFieldDetection/constants/detectionField.constant';
import { StateCreator } from 'zustand';

jest.mock('hooks/zustandStore/logger', () => ({
  logger: (fn: StateCreator<IState, [], []>) => fn,
}));

describe('useFormFieldDetectionStore', () => {
  const mockPredictions: IFormFieldDetectionPrediction[] = [
    {
      pageNumber: 1,
      fieldId: 'field_1',
      fieldType: FormFieldDetection.TEXT_BOX,
      boundingRectangle: { x1: 0, y1: 0, x2: 10, y2: 10 },
    },
  ];

  beforeEach(() => {
    act(() => {
      useFormFieldDetectionStore.getState().removeAllData();
    });
  });

  it('should initialize with default values', () => {
    const { result } = renderHook(() => useFormFieldDetectionStore());

    expect(result.current.currentSessionId).toBeNull();
    expect(result.current.predictionData).toEqual({});
  });

  it('should update currentSessionId via setCurrentSessionId', () => {
    const { result } = renderHook(() => useFormFieldDetectionStore());

    act(() => {
      result.current.setCurrentSessionId({ sessionId: 'test_session_123' });
    });

    expect(result.current.currentSessionId).toBe('test_session_123');
  });

  it('should set detection data and update session ID simultaneously', () => {
    const { result } = renderHook(() => useFormFieldDetectionStore());
    const sessionId = 'session_abc';

    act(() => {
      result.current.setDetectionData({
        sessionId,
        predictions: mockPredictions,
      });
    });

    expect(result.current.currentSessionId).toBe(sessionId);
    expect(result.current.predictionData[sessionId]).toEqual(mockPredictions);
  });

  it('should handle multiple sessions in predictionData', () => {
    const { result } = renderHook(() => useFormFieldDetectionStore());
    
    act(() => {
      result.current.setDetectionData({
        sessionId: 'session_1',
        predictions: mockPredictions,
      });
      result.current.setDetectionData({
        sessionId: 'session_2',
        predictions: [],
      });
    });

    expect(result.current.currentSessionId).toBe('session_2');
    expect(result.current.predictionData['session_1']).toHaveLength(1);
    expect(result.current.predictionData['session_2']).toHaveLength(0);
  });

  it('should clear all data when removeAllData is called', () => {
    const { result } = renderHook(() => useFormFieldDetectionStore());

    act(() => {
      result.current.setDetectionData({
        sessionId: 'to_be_cleared',
        predictions: mockPredictions,
      });
    });

    expect(result.current.currentSessionId).toBe('to_be_cleared');

    act(() => {
      result.current.removeAllData();
    });

    expect(result.current.currentSessionId).toBeNull();
    expect(result.current.predictionData).toEqual({});
  });
});