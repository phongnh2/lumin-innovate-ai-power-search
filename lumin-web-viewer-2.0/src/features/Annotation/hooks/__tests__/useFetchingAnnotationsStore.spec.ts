import { useParams, useMatch } from 'react-router';
import { renderHook } from '@testing-library/react';
import { useIsSystemFile } from 'hooks/useIsSystemFile';
import { useIsTempEditMode } from 'features/OpenForm/hooks/useIsTempEditMode';
import { useCurrentAnnotationsStore } from '../useCurrentAnnotationsStore';
import { useFetchingAnnotationsStore } from '../useFetchingAnnotationsStore';

jest.mock('react-router', () => ({
  useParams: jest.fn(),
  useMatch: jest.fn(),
}));

jest.mock('hooks/useCleanup', () => ({
  useCleanup: jest.fn((cb) => cb && cb()),
}));

jest.mock('hooks/useIsSystemFile', () => ({
  useIsSystemFile: jest.fn(),
}));

jest.mock('features/OpenForm/hooks/useIsTempEditMode', () => ({
  useIsTempEditMode: jest.fn(),
}));

jest.mock('../useCurrentAnnotationsStore', () => ({
  useCurrentAnnotationsStore: jest.fn(),
}));

describe('useFetchingAnnotationsStore', () => {
  const mockFetchAnnotations = jest.fn();
  const mockSetAnnotations = jest.fn();
  const mockClearCurrentDocument = jest.fn();
  const mockReset = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    
    (useCurrentAnnotationsStore as unknown as jest.Mock).mockReturnValue({
      storeDocumentId: 'current-doc',
      annotations: ['annot1'],
      isLoading: false,
      error: null,
      isFromStream: false,
      fetchAnnotations: mockFetchAnnotations,
      setAnnotations: mockSetAnnotations,
      clearCurrentDocument: mockClearCurrentDocument,
      reset: mockReset,
    });
    
    (useParams as jest.Mock).mockReturnValue({ documentId: 'new-doc' });
    (useMatch as jest.Mock).mockReturnValue(null);
    (useIsSystemFile as jest.Mock).mockReturnValue({ isSystemFile: false });
    (useIsTempEditMode as jest.Mock).mockReturnValue({ isTempEditMode: false });
  });

  it('should fetch annotations when documentId changes and conditions are met', () => {
    renderHook(() => useFetchingAnnotationsStore());
    
    expect(mockFetchAnnotations).toHaveBeenCalledWith('new-doc');
  });

  it('should NOT fetch annotations if isSystemFile is true', () => {
    (useIsSystemFile as jest.Mock).mockReturnValue({ isSystemFile: true });
    renderHook(() => useFetchingAnnotationsStore());
    
    expect(mockFetchAnnotations).not.toHaveBeenCalled();
  });

  it('should NOT fetch annotations if in Guest Path', () => {
    (useMatch as jest.Mock).mockReturnValue(true); // Matches guest path
    renderHook(() => useFetchingAnnotationsStore());
    
    expect(mockFetchAnnotations).not.toHaveBeenCalled();
  });

  it('should clear current document on cleanup if in Guest Path', () => {
    (useMatch as jest.Mock).mockReturnValue(true);
    renderHook(() => useFetchingAnnotationsStore());
    
    // useCleanup is mocked to run immediately
    expect(mockClearCurrentDocument).toHaveBeenCalled();
  });

  it('should return empty data if storeDocumentId does not match URL documentId', () => {
    (useCurrentAnnotationsStore as unknown as jest.Mock).mockReturnValue({
      storeDocumentId: 'old-doc',
      annotations: ['annot1'],
      isLoading: false,
      error: null,
      isFromStream: false,
      fetchAnnotations: mockFetchAnnotations,
      setAnnotations: mockSetAnnotations,
      clearCurrentDocument: mockClearCurrentDocument,
      reset: mockReset,
    });

    const { result } = renderHook(() => useFetchingAnnotationsStore());

    expect(result.current.annotations).toEqual([]);
    expect(result.current.isFromStream).toBeNull();
  });

  it('should return actual data if storeDocumentId matches URL documentId', () => {
    (useCurrentAnnotationsStore as unknown as jest.Mock).mockReturnValue({
      storeDocumentId: 'new-doc',
      annotations: ['annot1'],
      isLoading: false,
      error: null,
      isFromStream: false,
      fetchAnnotations: mockFetchAnnotations,
      setAnnotations: mockSetAnnotations,
      clearCurrentDocument: mockClearCurrentDocument,
      reset: mockReset,
    });

    const { result } = renderHook(() => useFetchingAnnotationsStore());

    expect(result.current.annotations).toEqual(['annot1']);
  });

  it('should refetch annotations correctly', () => {
    const { result } = renderHook(() => useFetchingAnnotationsStore());
    
    result.current.refetch();
    
    expect(mockReset).toHaveBeenCalled();
    expect(mockFetchAnnotations).toHaveBeenCalledWith('new-doc');
  });

  it('should not refetch if no documentId', () => {
    (useParams as jest.Mock).mockReturnValue({ documentId: undefined });
    const { result } = renderHook(() => useFetchingAnnotationsStore());
    
    result.current.refetch();
    
    expect(mockFetchAnnotations).not.toHaveBeenCalled();
  });
});