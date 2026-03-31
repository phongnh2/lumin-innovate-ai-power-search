import { renderHook, act } from '@testing-library/react';
import { IState, useAutoDetectionStore } from '../useAutoDetectionStore';
import { StateCreator } from 'zustand';

jest.mock('hooks/zustandStore/logger', () => ({
  logger: (fn: StateCreator<IState, [], []>) => fn,
}));

describe('useAutoDetectionStore', () => {
  it('should update and remove annotation ID', () => {
    const { result } = renderHook(() => useAutoDetectionStore());

    act(() => {
      result.current.setAutoDetectAnnotationId({ annotationId: 'test-id' });
    });
    expect(result.current.autoDetectAnnotationId).toBe('test-id');

    act(() => {
      result.current.removeAutoDetectAnnotationId();
    });
    expect(result.current.autoDetectAnnotationId).toBe(null);
  });
});