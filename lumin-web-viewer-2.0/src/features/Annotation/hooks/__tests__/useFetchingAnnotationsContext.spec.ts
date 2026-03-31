import { renderHook } from '@testing-library/react';
import React from 'react';
import { useFetchingAnnotationsContext } from '../useFetchingAnnotationsContext';
import { FetchingAnnotationsContext } from '../../contexts';

describe('useFetchingAnnotationsContext', () => {
  it('should return context value', () => {
    const mockContextValue = { someValue: 'test' };
    
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      React.createElement(FetchingAnnotationsContext.Provider, { value: mockContextValue as any }, children)
    );

    const { result } = renderHook(() => useFetchingAnnotationsContext(), { wrapper });
    
    expect(result.current).toEqual(mockContextValue);
  });
});