import { renderHook } from '@testing-library/react';
import React from 'react';

import { MultipleMergeContext } from '../../contexts/MultipleMerge.context';
import { MultipleMergeStep, SaveDestination, UploadStatus, FileSource } from '../../enum';
import { MergeDocumentType } from '../../types';
import { useMultipleMergeContext } from '../useMultipleMergeContext';

describe('useMultipleMergeContext', () => {
  const mockDocument: MergeDocumentType = {
    _id: 'doc-1',
    name: 'test-document.pdf',
    mimeType: 'application/pdf',
    size: 1000,
    status: UploadStatus.UPLOADED,
    source: FileSource.LOCAL,
  };

  const createMockContextValue = (overrides = {}) => ({
    isLoadingDocument: false,
    getAbortController: jest.fn(() => new AbortController()),
    onClose: jest.fn(),
    disabledMergeButton: false,
    isExceedMaxDocumentsSize: false,
    documents: [mockDocument],
    setDocuments: jest.fn(),
    deleteDocument: jest.fn(),
    handleSortDocuments: jest.fn(),
    handleUploadDocuments: jest.fn(),
    currentStep: MultipleMergeStep.SELECT_DOCUMENTS,
    mergingProgress: 0,
    saveDestination: SaveDestination.COMPUTER,
    openSaveToDriveModal: false,
    setCurrentStep: jest.fn(),
    setSaveDestination: jest.fn(),
    setOpenSaveToDriveModal: jest.fn(),
    handleClickConfirm: jest.fn(),
    goToNextStep: jest.fn(),
    setMergingProgress: jest.fn(),
    premiumModalContent: null as unknown as string,
    openedPremiumModal: false,
    openedPremiumModalHandlers: {
      open: jest.fn(),
      close: jest.fn(),
      toggle: jest.fn(),
    },
    getResult: jest.fn(),
    ...overrides,
  });

  const createWrapper = (contextValue: ReturnType<typeof createMockContextValue>) => {
    return ({ children }: { children: React.ReactNode }) =>
      React.createElement(MultipleMergeContext.Provider, { value: contextValue as never }, children);
  };

  describe('context value access', () => {
    it('should return the context value', () => {
      const mockContextValue = createMockContextValue();
      const wrapper = createWrapper(mockContextValue);

      const { result } = renderHook(() => useMultipleMergeContext(), { wrapper });

      expect(result.current).toBe(mockContextValue);
    });

    it('should return isLoadingDocument from context', () => {
      const mockContextValue = createMockContextValue({ isLoadingDocument: true });
      const wrapper = createWrapper(mockContextValue);

      const { result } = renderHook(() => useMultipleMergeContext(), { wrapper });

      expect(result.current.isLoadingDocument).toBe(true);
    });

    it('should return documents from context', () => {
      const documents = [mockDocument, { ...mockDocument, _id: 'doc-2', name: 'another.pdf' }];
      const mockContextValue = createMockContextValue({ documents });
      const wrapper = createWrapper(mockContextValue);

      const { result } = renderHook(() => useMultipleMergeContext(), { wrapper });

      expect(result.current.documents).toHaveLength(2);
      expect(result.current.documents).toBe(documents);
    });

    it('should return currentStep from context', () => {
      const mockContextValue = createMockContextValue({ currentStep: MultipleMergeStep.MERGING_DOCUMENTS });
      const wrapper = createWrapper(mockContextValue);

      const { result } = renderHook(() => useMultipleMergeContext(), { wrapper });

      expect(result.current.currentStep).toBe(MultipleMergeStep.MERGING_DOCUMENTS);
    });

    it('should return saveDestination from context', () => {
      const mockContextValue = createMockContextValue({ saveDestination: SaveDestination.LUMIN });
      const wrapper = createWrapper(mockContextValue);

      const { result } = renderHook(() => useMultipleMergeContext(), { wrapper });

      expect(result.current.saveDestination).toBe(SaveDestination.LUMIN);
    });

    it('should return mergingProgress from context', () => {
      const mockContextValue = createMockContextValue({ mergingProgress: 5 });
      const wrapper = createWrapper(mockContextValue);

      const { result } = renderHook(() => useMultipleMergeContext(), { wrapper });

      expect(result.current.mergingProgress).toBe(5);
    });

    it('should return disabledMergeButton from context', () => {
      const mockContextValue = createMockContextValue({ disabledMergeButton: true });
      const wrapper = createWrapper(mockContextValue);

      const { result } = renderHook(() => useMultipleMergeContext(), { wrapper });

      expect(result.current.disabledMergeButton).toBe(true);
    });

    it('should return isExceedMaxDocumentsSize from context', () => {
      const mockContextValue = createMockContextValue({ isExceedMaxDocumentsSize: true });
      const wrapper = createWrapper(mockContextValue);

      const { result } = renderHook(() => useMultipleMergeContext(), { wrapper });

      expect(result.current.isExceedMaxDocumentsSize).toBe(true);
    });

    it('should return openSaveToDriveModal from context', () => {
      const mockContextValue = createMockContextValue({ openSaveToDriveModal: true });
      const wrapper = createWrapper(mockContextValue);

      const { result } = renderHook(() => useMultipleMergeContext(), { wrapper });

      expect(result.current.openSaveToDriveModal).toBe(true);
    });
  });

  describe('context methods', () => {
    it('should provide callable onClose function', () => {
      const mockOnClose = jest.fn();
      const mockContextValue = createMockContextValue({ onClose: mockOnClose });
      const wrapper = createWrapper(mockContextValue);

      const { result } = renderHook(() => useMultipleMergeContext(), { wrapper });
      result.current.onClose();

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('should provide callable deleteDocument function', () => {
      const mockDeleteDocument = jest.fn();
      const mockContextValue = createMockContextValue({ deleteDocument: mockDeleteDocument });
      const wrapper = createWrapper(mockContextValue);

      const { result } = renderHook(() => useMultipleMergeContext(), { wrapper });
      result.current.deleteDocument('doc-1');

      expect(mockDeleteDocument).toHaveBeenCalledWith('doc-1');
    });

    it('should provide callable handleClickConfirm function', () => {
      const mockHandleClickConfirm = jest.fn();
      const mockContextValue = createMockContextValue({ handleClickConfirm: mockHandleClickConfirm });
      const wrapper = createWrapper(mockContextValue);

      const { result } = renderHook(() => useMultipleMergeContext(), { wrapper });
      result.current.handleClickConfirm();

      expect(mockHandleClickConfirm).toHaveBeenCalledTimes(1);
    });

    it('should provide callable goToNextStep function', () => {
      const mockGoToNextStep = jest.fn();
      const mockContextValue = createMockContextValue({ goToNextStep: mockGoToNextStep });
      const wrapper = createWrapper(mockContextValue);

      const { result } = renderHook(() => useMultipleMergeContext(), { wrapper });
      result.current.goToNextStep(MultipleMergeStep.SELECT_DOCUMENTS);

      expect(mockGoToNextStep).toHaveBeenCalledWith(MultipleMergeStep.SELECT_DOCUMENTS);
    });

    it('should provide callable setDocuments function', () => {
      const mockSetDocuments = jest.fn();
      const mockContextValue = createMockContextValue({ setDocuments: mockSetDocuments });
      const wrapper = createWrapper(mockContextValue);

      const { result } = renderHook(() => useMultipleMergeContext(), { wrapper });
      result.current.setDocuments([mockDocument]);

      expect(mockSetDocuments).toHaveBeenCalledWith([mockDocument]);
    });

    it('should provide callable setSaveDestination function', () => {
      const mockSetSaveDestination = jest.fn();
      const mockContextValue = createMockContextValue({ setSaveDestination: mockSetSaveDestination });
      const wrapper = createWrapper(mockContextValue);

      const { result } = renderHook(() => useMultipleMergeContext(), { wrapper });
      result.current.setSaveDestination(SaveDestination.GOOGLE_DRIVE);

      expect(mockSetSaveDestination).toHaveBeenCalledWith(SaveDestination.GOOGLE_DRIVE);
    });

    it('should provide callable getAbortController function', () => {
      const mockAbortController = new AbortController();
      const mockGetAbortController = jest.fn(() => mockAbortController);
      const mockContextValue = createMockContextValue({ getAbortController: mockGetAbortController });
      const wrapper = createWrapper(mockContextValue);

      const { result } = renderHook(() => useMultipleMergeContext(), { wrapper });
      const controller = result.current.getAbortController();

      expect(mockGetAbortController).toHaveBeenCalled();
      expect(controller).toBe(mockAbortController);
    });
  });

  describe('edge cases', () => {
    it('should return empty object when used outside provider', () => {
      const { result } = renderHook(() => useMultipleMergeContext());

      expect(result.current).toEqual({});
    });
  });
});

