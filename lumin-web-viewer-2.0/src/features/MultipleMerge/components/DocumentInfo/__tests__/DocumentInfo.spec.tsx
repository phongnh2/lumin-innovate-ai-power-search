import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

import DocumentInfo from '../DocumentInfo';
import { UploadStatus, UploadDocumentError } from '../../../enum';

// Mock child components
jest.mock('../FailedDocumentInfo', () => {
  return function MockFailedDocumentInfo({ errorCode, name }: { errorCode?: string; name: string }) {
    return <div data-testid="failed-document-info" data-error-code={errorCode} data-name={name} />;
  };
});

jest.mock('../UploadedDocumentInfo', () => {
  return function MockUploadedDocumentInfo({
    thumbnail,
    name,
    size,
  }: {
    thumbnail?: string;
    name: string;
    size: number;
  }) {
    return <div data-testid="uploaded-document-info" data-thumbnail={thumbnail} data-name={name} data-size={size} />;
  };
});

jest.mock('../UploadingDocumentInfo', () => {
  return function MockUploadingDocumentInfo({ thumbnail, name }: { thumbnail?: string; name: string }) {
    return <div data-testid="uploading-document-info" data-thumbnail={thumbnail} data-name={name} />;
  };
});

describe('DocumentInfo', () => {
  const defaultProps = {
    name: 'test-document.pdf',
    size: 1024000,
    status: UploadStatus.UPLOADED,
    thumbnail: 'http://example.com/thumbnail.jpg',
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('status branching', () => {
    it('should render FailedDocumentInfo when status is FAILED', () => {
      render(
        <DocumentInfo
          {...defaultProps}
          status={UploadStatus.FAILED}
          errorCode={UploadDocumentError.FILE_ENCRYPTED}
        />
      );

      const failedInfo = screen.getByTestId('failed-document-info');
      expect(failedInfo).toBeInTheDocument();
      expect(failedInfo).toHaveAttribute('data-error-code', UploadDocumentError.FILE_ENCRYPTED);
      expect(failedInfo).toHaveAttribute('data-name', 'test-document.pdf');
    });

    it('should render FailedDocumentInfo with undefined errorCode when not provided', () => {
      render(<DocumentInfo {...defaultProps} status={UploadStatus.FAILED} />);

      const failedInfo = screen.getByTestId('failed-document-info');
      expect(failedInfo).toBeInTheDocument();
      expect(failedInfo).not.toHaveAttribute('data-error-code');
    });

    it('should render UploadingDocumentInfo when status is UPLOADING', () => {
      render(<DocumentInfo {...defaultProps} status={UploadStatus.UPLOADING} />);

      const uploadingInfo = screen.getByTestId('uploading-document-info');
      expect(uploadingInfo).toBeInTheDocument();
      expect(uploadingInfo).toHaveAttribute('data-thumbnail', 'http://example.com/thumbnail.jpg');
      expect(uploadingInfo).toHaveAttribute('data-name', 'test-document.pdf');
    });

    it('should render UploadingDocumentInfo without thumbnail when not provided', () => {
      render(<DocumentInfo {...defaultProps} status={UploadStatus.UPLOADING} thumbnail={undefined} />);

      const uploadingInfo = screen.getByTestId('uploading-document-info');
      expect(uploadingInfo).toBeInTheDocument();
      expect(uploadingInfo).not.toHaveAttribute('data-thumbnail');
    });

    it('should render UploadedDocumentInfo when status is UPLOADED', () => {
      render(<DocumentInfo {...defaultProps} status={UploadStatus.UPLOADED} />);

      const uploadedInfo = screen.getByTestId('uploaded-document-info');
      expect(uploadedInfo).toBeInTheDocument();
      expect(uploadedInfo).toHaveAttribute('data-thumbnail', 'http://example.com/thumbnail.jpg');
      expect(uploadedInfo).toHaveAttribute('data-name', 'test-document.pdf');
      expect(uploadedInfo).toHaveAttribute('data-size', '1024000');
    });

    it('should render null when status is unknown/default', () => {
      const { container } = render(<DocumentInfo {...defaultProps} status="unknown-status" />);

      expect(container.firstChild).toBeNull();
    });

    it('should render null when status is empty string', () => {
      const { container } = render(<DocumentInfo {...defaultProps} status="" />);

      expect(container.firstChild).toBeNull();
    });
  });

  describe('props passing', () => {
    it('should pass all props correctly to UploadedDocumentInfo', () => {
      const props = {
        name: 'my-file.pdf',
        size: 2048000,
        status: UploadStatus.UPLOADED,
        thumbnail: 'http://example.com/my-thumbnail.jpg',
      };

      render(<DocumentInfo {...props} />);

      const uploadedInfo = screen.getByTestId('uploaded-document-info');
      expect(uploadedInfo).toHaveAttribute('data-name', 'my-file.pdf');
      expect(uploadedInfo).toHaveAttribute('data-size', '2048000');
      expect(uploadedInfo).toHaveAttribute('data-thumbnail', 'http://example.com/my-thumbnail.jpg');
    });

    it('should pass errorCode to FailedDocumentInfo for different error types', () => {
      const errorTypes = [
        UploadDocumentError.FAILED_TO_UPLOAD,
        UploadDocumentError.FILE_INVALID_TYPE,
        UploadDocumentError.FILE_ENCRYPTED,
        UploadDocumentError.DOCUMENT_PERMISSION_DENIED,
      ];

      errorTypes.forEach((errorCode) => {
        const { unmount } = render(
          <DocumentInfo {...defaultProps} status={UploadStatus.FAILED} errorCode={errorCode} />
        );

        const failedInfo = screen.getByTestId('failed-document-info');
        expect(failedInfo).toHaveAttribute('data-error-code', errorCode);
        unmount();
      });
    });
  });
});

