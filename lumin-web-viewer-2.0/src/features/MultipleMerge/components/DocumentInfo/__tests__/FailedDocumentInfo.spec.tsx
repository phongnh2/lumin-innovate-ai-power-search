import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

import FailedDocumentInfo from '../FailedDocumentInfo';
import { UploadDocumentError } from '../../../enum';

// Mock dependencies
jest.mock('hooks', () => ({
  useTranslation: () => ({
    t: (key: string, params?: Record<string, string | undefined>) => {
      if (params?.reason !== undefined) {
        return `${key}:${params.reason}`;
      }
      return key;
    },
  }),
}));

jest.mock('lumin-ui/kiwi-ui', () => ({
  PlainTooltip: ({ content, children }: { content: string; children: React.ReactNode }) => (
    <div data-testid="plain-tooltip" data-content={content}>
      {children}
    </div>
  ),
}));

jest.mock('assets/lumin-svgs/file-error.svg', () => 'mocked-file-error.svg');

jest.mock('../DocumentInfo.module.scss', () => ({
  failedThumbnail: 'failedThumbnail',
  documentNameAndSize: 'documentNameAndSize',
  name: 'name',
  uploadFailedName: 'uploadFailedName',
  extraInfoContainer: 'extraInfoContainer',
  extraInfo: 'extraInfo',
  uploadFailedExtraInfo: 'uploadFailedExtraInfo',
}));

describe('FailedDocumentInfo', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('error code handling', () => {
    it('should render with FAILED_TO_UPLOAD error code', () => {
      render(<FailedDocumentInfo name="test.pdf" errorCode={UploadDocumentError.FAILED_TO_UPLOAD} />);

      expect(screen.getByText('test.pdf')).toBeInTheDocument();
      expect(screen.getByAltText('Upload file error')).toBeInTheDocument();
    });

    it('should render with FILE_INVALID_TYPE error code', () => {
      render(<FailedDocumentInfo name="document.xyz" errorCode={UploadDocumentError.FILE_INVALID_TYPE} />);

      expect(screen.getByText('document.xyz')).toBeInTheDocument();
    });

    it('should render with FILE_ENCRYPTED error code', () => {
      render(<FailedDocumentInfo name="encrypted.pdf" errorCode={UploadDocumentError.FILE_ENCRYPTED} />);

      expect(screen.getByText('encrypted.pdf')).toBeInTheDocument();
    });

    it('should render with DOCUMENT_PERMISSION_DENIED error code', () => {
      render(<FailedDocumentInfo name="restricted.pdf" errorCode={UploadDocumentError.DOCUMENT_PERMISSION_DENIED} />);

      expect(screen.getByText('restricted.pdf')).toBeInTheDocument();
    });

    it('should fallback to FAILED_TO_UPLOAD when errorCode is undefined', () => {
      render(<FailedDocumentInfo name="test.pdf" errorCode={undefined} />);

      const tooltip = screen.getByTestId('plain-tooltip');
      // The fallback should use FAILED_TO_UPLOAD error mapping
      expect(tooltip).toHaveAttribute(
        'data-content',
        'multipleMerge.fileError:multipleMerge.failedToUpload'
      );
    });

    it('should use empty object fallback when error code is not in mapper', () => {
      // @ts-expect-error - Testing invalid error code
      render(<FailedDocumentInfo name="test.pdf" errorCode="unknown-error" />);

      // Should still render without crashing
      expect(screen.getByText('test.pdf')).toBeInTheDocument();
    });
  });

  describe('rendering', () => {
    it('should render error image with correct src and alt', () => {
      render(<FailedDocumentInfo name="test.pdf" errorCode={UploadDocumentError.FAILED_TO_UPLOAD} />);

      const img = screen.getByAltText('Upload file error');
      expect(img).toHaveAttribute('src', 'mocked-file-error.svg');
      expect(img).toHaveClass('failedThumbnail');
    });

    it('should render document name with failed styles', () => {
      render(<FailedDocumentInfo name="my-document.pdf" errorCode={UploadDocumentError.FAILED_TO_UPLOAD} />);

      const nameElement = screen.getByText('my-document.pdf');
      expect(nameElement).toHaveClass('name');
      expect(nameElement).toHaveClass('uploadFailedName');
    });

    it('should render tooltip with translated error message', () => {
      render(<FailedDocumentInfo name="test.pdf" errorCode={UploadDocumentError.FAILED_TO_UPLOAD} />);

      const tooltip = screen.getByTestId('plain-tooltip');
      expect(tooltip).toHaveAttribute(
        'data-content',
        'multipleMerge.fileError:multipleMerge.failedToUpload'
      );
    });

    it('should render error text inside tooltip', () => {
      render(<FailedDocumentInfo name="test.pdf" errorCode={UploadDocumentError.FAILED_TO_UPLOAD} />);

      const errorTexts = screen.getAllByText('multipleMerge.fileError:multipleMerge.failedToUpload');
      // One in tooltip content and one in the paragraph
      expect(errorTexts.length).toBeGreaterThanOrEqual(1);
    });

    it('should apply correct CSS classes to error text', () => {
      render(<FailedDocumentInfo name="test.pdf" errorCode={UploadDocumentError.FAILED_TO_UPLOAD} />);

      const tooltip = screen.getByTestId('plain-tooltip');
      const errorText = tooltip.querySelector('p');
      expect(errorText).toHaveClass('extraInfo');
      expect(errorText).toHaveClass('uploadFailedExtraInfo');
    });
  });

  describe('different error messages', () => {
    it('should show file encrypted error message', () => {
      render(<FailedDocumentInfo name="test.pdf" errorCode={UploadDocumentError.FILE_ENCRYPTED} />);

      const tooltip = screen.getByTestId('plain-tooltip');
      expect(tooltip).toHaveAttribute(
        'data-content',
        'multipleMerge.fileEncryptedError:multipleMerge.failedToUpload'
      );
    });

    it('should show permission denied error message', () => {
      render(<FailedDocumentInfo name="test.pdf" errorCode={UploadDocumentError.DOCUMENT_PERMISSION_DENIED} />);

      const tooltip = screen.getByTestId('plain-tooltip');
      // DOCUMENT_PERMISSION_DENIED has no reason in the mapper
      expect(tooltip).toHaveAttribute('data-content', 'multipleMerge.permissionDenied');
    });

    it('should show invalid file type error message', () => {
      render(<FailedDocumentInfo name="test.pdf" errorCode={UploadDocumentError.FILE_INVALID_TYPE} />);

      const tooltip = screen.getByTestId('plain-tooltip');
      expect(tooltip).toHaveAttribute(
        'data-content',
        'multipleMerge.fileError:multipleMerge.unsupportedFileType'
      );
    });
  });
});

