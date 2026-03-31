import { renderHook, act } from '@testing-library/react';
import React from 'react';

import { PremiumModalContentType } from 'interfaces/organization/organization.interface';

import { MultipleMergeContext } from '../../contexts/MultipleMerge.context';
import { MergeDocumentType } from '../../types';
import { useSaveDocumentToGoogleDriveHandler } from '../useSaveDocumentToGoogleDriveHandler';

jest.mock('@libs/snackbar', () => ({
  enqueueSnackbar: jest.fn(),
}));

jest.mock('utils', () => ({
  file: {
    getExtension: jest.fn(() => 'pdf'),
  },
}));

jest.mock('utils/Factory/EventCollection/DocumentEventCollection', () => ({
  __esModule: true,
  default: {
    downloadDocumentSuccess: jest.fn().mockResolvedValue(undefined),
  },
}));

jest.mock('features/DocumentUploadExternal/useSyncFileToExternalStorage', () => ({
  __esModule: true,
  default: jest.fn(),
}));

describe('useSaveDocumentToGoogleDriveHandler', () => {
  const mockSetOpenSaveToDriveModal = jest.fn();
  const mockOnClose = jest.fn();
  const mockGetResult = jest.fn();
  const mockHandleSyncFile = jest.fn();

  const createMockContextValue = (overrides = {}) => ({
    setOpenSaveToDriveModal: mockSetOpenSaveToDriveModal,
    getResult: mockGetResult,
    onClose: mockOnClose,
    // Other required context values (not used by this hook)
    isLoadingDocument: false,
    getAbortController: jest.fn(),
    disabledMergeButton: false,
    isExceedMaxDocumentsSize: false,
    documents: [] as MergeDocumentType[],
    setDocuments: jest.fn(),
    deleteDocument: jest.fn(),
    handleSortDocuments: jest.fn(),
    handleUploadDocuments: jest.fn(),
    currentStep: 'selectDocuments',
    mergingProgress: 0,
    saveDestination: 'computer',
    openSaveToDriveModal: false,
    setCurrentStep: jest.fn(),
    setSaveDestination: jest.fn(),
    handleClickConfirm: jest.fn(),
    goToNextStep: jest.fn(),
    setMergingProgress: jest.fn(),
    premiumModalContent: null as PremiumModalContentType | null,
    openedPremiumModal: false,
    openedPremiumModalHandlers: { open: jest.fn(), close: jest.fn(), toggle: jest.fn() },
    ...overrides,
  });

  const createWrapper = (contextValue: ReturnType<typeof createMockContextValue>) => {
    return ({ children }: { children: React.ReactNode }) =>
      React.createElement(MultipleMergeContext.Provider, { value: contextValue as never }, children);
  };

  beforeEach(() => {
    jest.clearAllMocks();

    const useSyncFileToExternalStorage = require('features/DocumentUploadExternal/useSyncFileToExternalStorage').default;
    useSyncFileToExternalStorage.mockReturnValue(mockHandleSyncFile);

    mockGetResult.mockResolvedValue({
      file: new File(['content'], 'merged.pdf', { type: 'application/pdf' }),
      name: 'merged.pdf',
    });
  });

  describe('duplicateFileToGoogleStorage', () => {
    it('should call getResult and handleSyncFile with correct params', async () => {
      mockHandleSyncFile.mockResolvedValue({
        destinationStorage: 'Google Drive',
        documentLocation: 'https://drive.google.com/file/123',
        successMsg: 'File saved successfully',
      });

      const contextValue = createMockContextValue();
      const wrapper = createWrapper(contextValue);

      const { result } = renderHook(() => useSaveDocumentToGoogleDriveHandler(), { wrapper });

      await act(async () => {
        await result.current.duplicateFileToGoogleStorage('new-document-name');
      });

      expect(mockGetResult).toHaveBeenCalled();
      expect(mockHandleSyncFile).toHaveBeenCalledWith({
        file: expect.any(File),
        currentDocument: { name: 'merged.pdf' },
        downloadType: expect.anything(),
        isOverride: false,
        newDocumentName: 'new-document-name',
        shouldShowRatingModal: false,
      });
    });

    it('should show success snackbar when successMsg is returned', async () => {
      const { enqueueSnackbar } = require('@libs/snackbar');
      mockHandleSyncFile.mockResolvedValue({
        destinationStorage: 'Google Drive',
        documentLocation: 'https://drive.google.com/file/123',
        successMsg: 'File saved!',
      });

      const contextValue = createMockContextValue();
      const wrapper = createWrapper(contextValue);

      const { result } = renderHook(() => useSaveDocumentToGoogleDriveHandler(), { wrapper });

      await act(async () => {
        await result.current.duplicateFileToGoogleStorage('doc-name');
      });

      expect(enqueueSnackbar).toHaveBeenCalledWith(
        expect.objectContaining({
          preventDuplicate: true,
          variant: 'success',
        })
      );
    });

    it('should call setOpenSaveToDriveModal(false) and onClose on success', async () => {
      mockHandleSyncFile.mockResolvedValue({
        destinationStorage: 'Google Drive',
        documentLocation: 'https://drive.google.com/file/123',
        successMsg: 'Success!',
      });

      const contextValue = createMockContextValue();
      const wrapper = createWrapper(contextValue);

      const { result } = renderHook(() => useSaveDocumentToGoogleDriveHandler(), { wrapper });

      await act(async () => {
        await result.current.duplicateFileToGoogleStorage('doc-name');
      });

      expect(mockSetOpenSaveToDriveModal).toHaveBeenCalledWith(false);
      expect(mockOnClose).toHaveBeenCalled();
    });

    it('should track download success event', async () => {
      const documentEvent = require('utils/Factory/EventCollection/DocumentEventCollection').default;
      mockHandleSyncFile.mockResolvedValue({
        destinationStorage: 'Google Drive',
        documentLocation: '',
        successMsg: 'Done',
      });

      const contextValue = createMockContextValue();
      const wrapper = createWrapper(contextValue);

      const { result } = renderHook(() => useSaveDocumentToGoogleDriveHandler(), { wrapper });

      await act(async () => {
        await result.current.duplicateFileToGoogleStorage('doc-name');
      });

      expect(documentEvent.downloadDocumentSuccess).toHaveBeenCalledWith({
        fileType: 'pdf',
        savedLocation: 'googleDrive', // camelCase of 'Google Drive'
      });
    });

    it('should not close modal or call onClose when successMsg is empty', async () => {
      mockHandleSyncFile.mockResolvedValue({
        destinationStorage: 'Google Drive',
        documentLocation: '',
        successMsg: '', // Empty success message
      });

      const contextValue = createMockContextValue();
      const wrapper = createWrapper(contextValue);

      const { result } = renderHook(() => useSaveDocumentToGoogleDriveHandler(), { wrapper });

      await act(async () => {
        await result.current.duplicateFileToGoogleStorage('doc-name');
      });

      expect(mockSetOpenSaveToDriveModal).not.toHaveBeenCalled();
      expect(mockOnClose).not.toHaveBeenCalled();
    });
  });

  describe('getDestination helper', () => {
    it('should render link when documentLocation is provided', async () => {
      const { enqueueSnackbar } = require('@libs/snackbar');
      mockHandleSyncFile.mockResolvedValue({
        destinationStorage: 'Google Drive',
        documentLocation: 'https://drive.google.com/file/123',
        successMsg: 'Saved!',
      });

      const contextValue = createMockContextValue();
      const wrapper = createWrapper(contextValue);

      const { result } = renderHook(() => useSaveDocumentToGoogleDriveHandler(), { wrapper });

      await act(async () => {
        await result.current.duplicateFileToGoogleStorage('doc');
      });

      // The message should contain JSX with the link
      const snackbarCall = enqueueSnackbar.mock.calls[0][0];
      expect(snackbarCall.message).toBeDefined();
    });

    it('should return just destinationStorage when documentLocation is empty', async () => {
      const { enqueueSnackbar } = require('@libs/snackbar');
      mockHandleSyncFile.mockResolvedValue({
        destinationStorage: 'Google Drive',
        documentLocation: '', // No location
        successMsg: 'Saved!',
      });

      const contextValue = createMockContextValue();
      const wrapper = createWrapper(contextValue);

      const { result } = renderHook(() => useSaveDocumentToGoogleDriveHandler(), { wrapper });

      await act(async () => {
        await result.current.duplicateFileToGoogleStorage('doc');
      });

      expect(enqueueSnackbar).toHaveBeenCalled();
    });
  });
});

