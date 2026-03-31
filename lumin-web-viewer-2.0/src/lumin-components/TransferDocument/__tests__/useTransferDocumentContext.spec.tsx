import React from 'react';
import { renderHook } from '@testing-library/react';
import '@testing-library/jest-dom';

// Create context mock inline to avoid hoisting issues
jest.mock('lumin-components/TransferDocument/context', () => ({
  TransferDocumentContext: require('react').createContext({
    getter: {
      selectedTarget: { _id: 'target-123', name: 'Test Target' },
      destination: { _id: 'dest-123', name: 'Test Destination' },
      isProcessing: false,
    },
    setter: {
      onClose: jest.fn(),
      setDestination: jest.fn(),
    },
    onSubmit: jest.fn(),
  }),
}));

import useTransferDocumentContext from 'luminComponents/TransferDocument/hooks/useTransferDocumentContext';
import { TransferDocumentContext } from 'luminComponents/TransferDocument/context';

describe('useTransferDocumentContext', () => {
  const mockContextValue = {
    getter: {
      selectedTarget: { _id: 'target-123', name: 'Test Target' },
      destination: { _id: 'dest-123', name: 'Test Destination' },
      isProcessing: false,
    },
    setter: {
      onClose: jest.fn(),
      setDestination: jest.fn(),
    },
    onSubmit: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return context value', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <TransferDocumentContext.Provider value={mockContextValue as any}>
        {children}
      </TransferDocumentContext.Provider>
    );

    const { result } = renderHook(() => useTransferDocumentContext(), { wrapper });

    expect(result.current).toBeDefined();
  });

  it('should return getter properties', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <TransferDocumentContext.Provider value={mockContextValue as any}>
        {children}
      </TransferDocumentContext.Provider>
    );

    const { result } = renderHook(() => useTransferDocumentContext(), { wrapper });

    expect(result.current.getter).toBeDefined();
    expect(result.current.getter.selectedTarget).toEqual({ _id: 'target-123', name: 'Test Target' });
  });

  it('should return setter properties', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <TransferDocumentContext.Provider value={mockContextValue as any}>
        {children}
      </TransferDocumentContext.Provider>
    );

    const { result } = renderHook(() => useTransferDocumentContext(), { wrapper });

    expect(result.current.setter).toBeDefined();
    expect(result.current.setter.onClose).toBeDefined();
  });

  it('should return onSubmit function', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <TransferDocumentContext.Provider value={mockContextValue as any}>
        {children}
      </TransferDocumentContext.Provider>
    );

    const { result } = renderHook(() => useTransferDocumentContext(), { wrapper });

    expect(result.current.onSubmit).toBeDefined();
    expect(typeof result.current.onSubmit).toBe('function');
  });

  it('should update when context value changes', () => {
    const updatedValue = {
      ...mockContextValue,
      getter: {
        ...mockContextValue.getter,
        selectedTarget: { _id: 'new-target', name: 'New Target' },
      },
    };

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <TransferDocumentContext.Provider value={updatedValue as any}>
        {children}
      </TransferDocumentContext.Provider>
    );

    const { result } = renderHook(() => useTransferDocumentContext(), { wrapper });

    expect(result.current.getter.selectedTarget._id).toBe('new-target');
  });
});
