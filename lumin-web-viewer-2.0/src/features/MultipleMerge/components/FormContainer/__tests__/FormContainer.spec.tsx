import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

import FormContainer from '../FormContainer';

// Mock dependencies
const mockDuplicateFileToGoogleStorage = jest.fn();
const mockContextValue = {
  documents: [{ name: 'test-document.pdf' }],
  openSaveToDriveModal: false,
};

jest.mock('../../../hooks/useMultipleMergeContext', () => ({
  useMultipleMergeContext: () => mockContextValue,
}));

jest.mock('../../../hooks/useSaveDocumentToGoogleDriveHandler', () => ({
  useSaveDocumentToGoogleDriveHandler: () => ({
    duplicateFileToGoogleStorage: mockDuplicateFileToGoogleStorage,
  }),
}));

jest.mock('utils', () => ({
  file: {
    getFilenameWithoutExtension: (name: string) => (name ? name.replace(/\.[^/.]+$/, '') : undefined),
  },
}));

jest.mock('features/SaveToThirdPartyStorage/components/SaveToThirdPartyStorageForm', () => {
  return function MockSaveToThirdPartyStorageForm({
    children,
    currentDocumentName,
    destinationStorage,
    onConfirm,
    downloadType,
    action,
  }: {
    children: React.ReactNode;
    currentDocumentName: string;
    destinationStorage: string;
    onConfirm: () => void;
    downloadType: string;
    action: string;
  }) {
    return (
      <div
        data-testid="save-to-third-party-storage-form"
        data-document-name={currentDocumentName}
        data-destination-storage={destinationStorage}
        data-download-type={downloadType}
        data-action={action}
      >
        <button onClick={onConfirm} data-testid="confirm-button">
          Confirm
        </button>
        {children}
      </div>
    );
  };
});

jest.mock('constants/downloadPdf', () => ({
  DownloadType: {
    PDF: 'pdf',
  },
}));

jest.mock('constants/eventConstants', () => ({
  __esModule: true,
  default: {
    Events: {
      HeaderButtonsEvent: {
        DOWNLOAD: 'download',
      },
    },
  },
}));

jest.mock('constants/lumin-common', () => ({
  STORAGE_TYPE: {
    GOOGLE: 'google',
  },
  STORAGE_TYPE_DESC: {
    google: 'Google Drive',
  },
}));

describe('FormContainer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockContextValue.openSaveToDriveModal = false;
    mockContextValue.documents = [{ name: 'test-document.pdf' }];
  });

  describe('openSaveToDriveModal branch', () => {
    it('should render children directly when openSaveToDriveModal is false', () => {
      mockContextValue.openSaveToDriveModal = false;

      render(
        <FormContainer>
          <div data-testid="child-content">Child Content</div>
        </FormContainer>
      );

      expect(screen.getByTestId('child-content')).toBeInTheDocument();
      expect(screen.queryByTestId('save-to-third-party-storage-form')).not.toBeInTheDocument();
    });

    it('should render SaveToThirdPartyStorageForm when openSaveToDriveModal is true', () => {
      mockContextValue.openSaveToDriveModal = true;

      render(
        <FormContainer>
          <div data-testid="child-content">Child Content</div>
        </FormContainer>
      );

      expect(screen.getByTestId('save-to-third-party-storage-form')).toBeInTheDocument();
      expect(screen.getByTestId('child-content')).toBeInTheDocument();
    });

    it('should pass correct props to SaveToThirdPartyStorageForm', () => {
      mockContextValue.openSaveToDriveModal = true;
      mockContextValue.documents = [{ name: 'my-file.pdf' }];

      render(
        <FormContainer>
          <div>Content</div>
        </FormContainer>
      );

      const form = screen.getByTestId('save-to-third-party-storage-form');
      expect(form).toHaveAttribute('data-document-name', 'my-file_merged');
      expect(form).toHaveAttribute('data-destination-storage', 'Google Drive');
      expect(form).toHaveAttribute('data-download-type', 'pdf');
      expect(form).toHaveAttribute('data-action', 'download');
    });

    it('should pass duplicateFileToGoogleStorage as onConfirm handler', () => {
      mockContextValue.openSaveToDriveModal = true;

      render(
        <FormContainer>
          <div>Content</div>
        </FormContainer>
      );

      const confirmButton = screen.getByTestId('confirm-button');
      confirmButton.click();

      expect(mockDuplicateFileToGoogleStorage).toHaveBeenCalledTimes(1);
    });
  });

  describe('document name formatting', () => {
    it('should format document name with _merged suffix', () => {
      mockContextValue.openSaveToDriveModal = true;
      mockContextValue.documents = [{ name: 'document.pdf' }];

      render(
        <FormContainer>
          <div>Content</div>
        </FormContainer>
      );

      const form = screen.getByTestId('save-to-third-party-storage-form');
      expect(form).toHaveAttribute('data-document-name', 'document_merged');
    });

    it('should handle documents with multiple dots in name', () => {
      mockContextValue.openSaveToDriveModal = true;
      mockContextValue.documents = [{ name: 'my.document.file.pdf' }];

      render(
        <FormContainer>
          <div>Content</div>
        </FormContainer>
      );

      const form = screen.getByTestId('save-to-third-party-storage-form');
      expect(form).toHaveAttribute('data-document-name', 'my.document.file_merged');
    });

    it('should handle empty documents array gracefully', () => {
      mockContextValue.openSaveToDriveModal = true;
      mockContextValue.documents = [];

      render(
        <FormContainer>
          <div>Content</div>
        </FormContainer>
      );

      const form = screen.getByTestId('save-to-third-party-storage-form');
      expect(form).toHaveAttribute('data-document-name', 'undefined_merged');
    });
  });

  describe('children rendering', () => {
    it('should render multiple children when openSaveToDriveModal is false', () => {
      mockContextValue.openSaveToDriveModal = false;

      render(
        <FormContainer>
          <div data-testid="child-1">Child 1</div>
          <div data-testid="child-2">Child 2</div>
        </FormContainer>
      );

      expect(screen.getByTestId('child-1')).toBeInTheDocument();
      expect(screen.getByTestId('child-2')).toBeInTheDocument();
    });

    it('should wrap children inside SaveToThirdPartyStorageForm when modal is open', () => {
      mockContextValue.openSaveToDriveModal = true;

      render(
        <FormContainer>
          <div data-testid="wrapped-child">Wrapped Content</div>
        </FormContainer>
      );

      const form = screen.getByTestId('save-to-third-party-storage-form');
      const child = screen.getByTestId('wrapped-child');
      expect(form).toContainElement(child);
    });
  });
});

