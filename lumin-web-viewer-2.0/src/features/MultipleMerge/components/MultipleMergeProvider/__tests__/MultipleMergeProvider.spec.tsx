import { act, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import React, { useContext } from 'react';

import MultipleMergeProvider from '../MultipleMergeProvider';

import { MultipleMergeContext } from '../../../contexts/MultipleMerge.context';
import { MultipleMergeStep, UploadStatus } from '../../../enum';
import { useDocumentsManipulation } from '../../../hooks/useDocumentsManipulation';
import { useLoadDocument } from '../../../hooks/useLoadDocument';
import { useMultipleMergeHandler } from '../../../hooks/useMultipleMergeHandler';
import { IDocumentBase } from 'interfaces/document/document.interface';

// Mock Hooks
jest.mock('../../../hooks/useDocumentsManipulation', () => ({
  useDocumentsManipulation: jest.fn(),
}));

jest.mock('../../../hooks/useLoadDocument', () => ({
  useLoadDocument: jest.fn(),
}));

jest.mock('../../../hooks/useMultipleMergeHandler', () => ({
  useMultipleMergeHandler: jest.fn(),
}));

// Mock Constants
jest.mock('../../../constants', () => ({
  MAX_DOCUMENTS_SIZE: 100, // Set small limit for testing
}));

// Mock Enum
jest.mock('../../../enum', () => ({
  MultipleMergeStep: {
    SELECT_DOCUMENTS: 'SELECT_DOCUMENTS',
    MERGING_DOCUMENTS: 'MERGING_DOCUMENTS',
  },
  UploadStatus: {
    FAILED: 'FAILED',
    UPLOADED: 'UPLOADED',
  },
}));

// Helper component to extract context values for assertions
const TestConsumer = () => {
  const context = useContext(MultipleMergeContext);
  return (
    <div data-testid="context-value">
      {JSON.stringify({
        isExceedMaxDocumentsSize: context.isExceedMaxDocumentsSize,
        disabledMergeButton: context.disabledMergeButton,
        isLoadingDocument: context.isLoadingDocument,
        // Expose method existence checks
        hasGetAbortController: !!context.getAbortController,
      })}
    </div>
  );
};

describe('MultipleMergeProvider', () => {
  const mockOnFilesPicked = jest.fn();
  const mockOnClose = jest.fn();
  const mockInitialDocuments: IDocumentBase[] = [];

  // Default Mock Returns
  const defaultDocsManipulation = {
    documents: [] as IDocumentBase[],
    setDocuments: jest.fn(),
    deleteDocument: jest.fn(),
    handleSortDocuments: jest.fn(),
    handleUploadDocuments: jest.fn(),
  };

  const defaultMergeHandler = {
    currentStep: 'SELECT_DOCUMENTS',
    mergingProgress: 0,
    setCurrentStep: jest.fn(),
    handleClickConfirm: jest.fn(),
    goToNextStep: jest.fn(),
    setMergingProgress: jest.fn(),
    saveDestination: 'COMPUTER',
    openSaveToDriveModal: false,
    setSaveDestination: jest.fn(),
    setOpenSaveToDriveModal: jest.fn(),
    premiumModalContent: null as unknown as string,
    openedPremiumModal: false,
    openedPremiumModalHandlers: {},
    getResult: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();

    (useDocumentsManipulation as jest.Mock).mockReturnValue(defaultDocsManipulation);
    (useMultipleMergeHandler as jest.Mock).mockReturnValue(defaultMergeHandler);
  });

  const renderProvider = () =>
    render(
      <MultipleMergeProvider
        initialDocuments={mockInitialDocuments}
        onFilesPicked={mockOnFilesPicked}
        onClose={mockOnClose}
      >
        <TestConsumer />
      </MultipleMergeProvider>
    );

  describe('Initialization & Hook Integration', () => {
    it('should render children and call dependent hooks', () => {
      renderProvider();

      expect(screen.getByTestId('context-value')).toBeInTheDocument();

      // Verify useDocumentsManipulation call
      expect(useDocumentsManipulation).toHaveBeenCalledWith(
        expect.objectContaining({
          initialDocuments: mockInitialDocuments,
          // setIsLoadingDocument is an internal state updater function
        })
      );

      // Verify useLoadDocument call
      expect(useLoadDocument).toHaveBeenCalledWith(
        expect.objectContaining({
          documents: defaultDocsManipulation.documents,
          setDocuments: defaultDocsManipulation.setDocuments,
          // getAbortController is an internal function
        })
      );

      // Verify useMultipleMergeHandler call
      expect(useMultipleMergeHandler).toHaveBeenCalledWith(
        expect.objectContaining({
          documents: defaultDocsManipulation.documents,
          handleUploadLumin: mockOnFilesPicked,
          onClose: mockOnClose,
          setDocuments: defaultDocsManipulation.setDocuments,
        })
      );
    });
  });

  describe('Abort Controller Logic', () => {
    it('getAbortController should return the same instance (memoized ref)', () => {
      let capturedGetAbortController: (() => AbortController) | undefined;

      // Intercept the function passed to useLoadDocument
      (useLoadDocument as jest.Mock).mockImplementation(({ getAbortController }) => {
        capturedGetAbortController = getAbortController;
      });

      renderProvider();

      expect(capturedGetAbortController).toBeDefined();
      const controller1 = capturedGetAbortController!();
      const controller2 = capturedGetAbortController!();

      expect(controller1).toBeInstanceOf(AbortController);
      expect(controller1).toBe(controller2); // Same reference
    });

    it('resetAbortController should create a new instance', () => {
      let capturedGetAbortController: (() => AbortController) | undefined;
      let capturedResetAbortController: (() => void) | undefined;

      // Intercept functions
      (useLoadDocument as jest.Mock).mockImplementation(({ getAbortController }) => {
        capturedGetAbortController = getAbortController;
      });

      (useMultipleMergeHandler as jest.Mock).mockImplementation(({ resetAbortController }) => {
        capturedResetAbortController = resetAbortController;
        return defaultMergeHandler;
      });

      renderProvider();

      expect(capturedGetAbortController).toBeDefined();
      expect(capturedResetAbortController).toBeDefined();

      const controller1 = capturedGetAbortController!();

      act(() => {
        capturedResetAbortController!();
      });

      const controller2 = capturedGetAbortController!();

      expect(controller1).not.toBe(controller2); // Different reference
    });
  });

  describe('Derived State: isExceedMaxDocumentsSize', () => {
    it('should be false when total size is within limit', () => {
      (useDocumentsManipulation as jest.Mock).mockReturnValue({
        ...defaultDocsManipulation,
        documents: [
          { size: 50, status: UploadStatus.UPLOADED },
          { size: 40, status: UploadStatus.UPLOADED },
        ], // Total 90 <= 100
      });

      renderProvider();
      const context = JSON.parse(screen.getByTestId('context-value').textContent!);
      expect(context.isExceedMaxDocumentsSize).toBe(false);
    });

    it('should be true when total size exceeds limit', () => {
      (useDocumentsManipulation as jest.Mock).mockReturnValue({
        ...defaultDocsManipulation,
        documents: [
          { size: 50, status: UploadStatus.UPLOADED },
          { size: 60, status: UploadStatus.UPLOADED },
        ], // Total 110 > 100
      });

      renderProvider();
      const context = JSON.parse(screen.getByTestId('context-value').textContent!);
      expect(context.isExceedMaxDocumentsSize).toBe(true);
    });
  });

  describe('Derived State: disabledMergeButton', () => {
    // Helper to override specific conditions
    const setupDisabledTest = (
      step: string = MultipleMergeStep.SELECT_DOCUMENTS,
      docs: Partial<IDocumentBase>[] = [
        { size: 10, status: UploadStatus.UPLOADED },
        { size: 10, status: UploadStatus.UPLOADED },
      ] // Valid default: 2 docs, valid status, small size
    ) => {
      (useMultipleMergeHandler as jest.Mock).mockReturnValue({
        ...defaultMergeHandler,
        currentStep: step,
      });
      (useDocumentsManipulation as jest.Mock).mockReturnValue({
        ...defaultDocsManipulation,
        documents: docs,
      });
    };

    it('should be ENABLED when all conditions are met', () => {
      setupDisabledTest(); // 2 docs, valid, step SELECT
      renderProvider();
      const context = JSON.parse(screen.getByTestId('context-value').textContent!);
      expect(context.disabledMergeButton).toBe(false);
    });

    it('should be DISABLED when current step is MERGING_DOCUMENTS', () => {
      setupDisabledTest(MultipleMergeStep.MERGING_DOCUMENTS);
      renderProvider();
      const context = JSON.parse(screen.getByTestId('context-value').textContent!);
      expect(context.disabledMergeButton).toBe(true);
    });

    it('should be DISABLED when documents size exceeds limit', () => {
      // 2 docs, but huge size (total 110 > 100)
      setupDisabledTest(MultipleMergeStep.SELECT_DOCUMENTS, [
        { size: 60, status: UploadStatus.UPLOADED },
        { size: 50, status: UploadStatus.UPLOADED },
      ]);
      renderProvider();
      const context = JSON.parse(screen.getByTestId('context-value').textContent!);
      expect(context.disabledMergeButton).toBe(true);
    });

    it('should be DISABLED when documents count is <= 1', () => {
      // Only 1 doc
      setupDisabledTest(MultipleMergeStep.SELECT_DOCUMENTS, [{ size: 10, status: UploadStatus.UPLOADED }]);
      renderProvider();
      const context = JSON.parse(screen.getByTestId('context-value').textContent!);
      expect(context.disabledMergeButton).toBe(true);
    });

    it('should be DISABLED when any document has FAILED status', () => {
      setupDisabledTest(MultipleMergeStep.SELECT_DOCUMENTS, [
        { size: 10, status: UploadStatus.UPLOADED },
        { size: 10, status: UploadStatus.FAILED },
      ]);
      renderProvider();
      const context = JSON.parse(screen.getByTestId('context-value').textContent!);
      expect(context.disabledMergeButton).toBe(true);
    });
  });

  describe('State: isLoadingDocument', () => {
    it('should expose isLoadingDocument state and affect disabledMergeButton', () => {
      // To test the isLoadingDocument state change, we capture the setIsLoadingDocument
      // from the hook props and call it synchronously during render
      let capturedSetIsLoadingDocument: ((loading: boolean) => void) | undefined;

      (useDocumentsManipulation as jest.Mock).mockImplementation(({ setIsLoadingDocument }) => {
        capturedSetIsLoadingDocument = setIsLoadingDocument;
        return {
          ...defaultDocsManipulation,
          documents: [
            { size: 10, status: UploadStatus.UPLOADED },
            { size: 10, status: UploadStatus.UPLOADED },
          ],
        };
      });

      renderProvider();

      // Verify initial state (not loading)
      let context = JSON.parse(screen.getByTestId('context-value').textContent!);
      expect(context.isLoadingDocument).toBe(false);
      expect(context.disabledMergeButton).toBe(false);

      // Now trigger the loading state change
      expect(capturedSetIsLoadingDocument).toBeDefined();
      act(() => {
        capturedSetIsLoadingDocument!(true);
      });

      // Verify updated state (loading)
      context = JSON.parse(screen.getByTestId('context-value').textContent!);
      expect(context.isLoadingDocument).toBe(true);
      expect(context.disabledMergeButton).toBe(true);
    });
  });
});
