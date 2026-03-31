import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

import UploadingDocumentInfo from '../UploadingDocumentInfo';

// Mock dependencies
jest.mock('hooks', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

jest.mock('lumin-ui/kiwi-ui', () => ({
  Icomoon: ({ type, size, color }: { type: string; size: string; color: string }) => (
    <span data-testid="icomoon" data-type={type} data-size={size} data-color={color} />
  ),
}));

jest.mock('../DocumentInfo.module.scss', () => ({
  thumbnail: 'thumbnail',
  documentNameAndSize: 'documentNameAndSize',
  name: 'name',
  uploadingName: 'uploadingName',
  extraInfoContainer: 'extraInfoContainer',
  extraInfo: 'extraInfo',
  uploadingExtraInfo: 'uploadingExtraInfo',
  progressBar: 'progressBar',
  progressBarValue: 'progressBarValue',
}));

describe('UploadingDocumentInfo', () => {
  const defaultProps = {
    name: 'uploading-document.pdf',
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('thumbnail conditional rendering', () => {
    it('should render img element when thumbnail is provided', () => {
      render(<UploadingDocumentInfo {...defaultProps} thumbnail="http://example.com/thumbnail.jpg" />);

      const img = screen.getByAltText('Document Thumbnail');
      expect(img).toBeInTheDocument();
      expect(img).toHaveAttribute('src', 'http://example.com/thumbnail.jpg');
      expect(img).toHaveClass('thumbnail');
    });

    it('should render Icomoon fallback when thumbnail is undefined', () => {
      render(<UploadingDocumentInfo {...defaultProps} thumbnail={undefined} />);

      const icomoon = screen.getByTestId('icomoon');
      expect(icomoon).toBeInTheDocument();
      expect(icomoon).toHaveAttribute('data-type', 'file-filled-lg');
      expect(icomoon).toHaveAttribute('data-size', 'lg');
      expect(icomoon).toHaveAttribute('data-color', 'var(--kiwi-colors-custom-role-web-thumbnail-blue)');
    });

    it('should render Icomoon fallback when thumbnail is empty string', () => {
      render(<UploadingDocumentInfo {...defaultProps} thumbnail="" />);

      const icomoon = screen.getByTestId('icomoon');
      expect(icomoon).toBeInTheDocument();
      expect(screen.queryByAltText('Document Thumbnail')).not.toBeInTheDocument();
    });

    it('should not render Icomoon when thumbnail is provided', () => {
      render(<UploadingDocumentInfo {...defaultProps} thumbnail="http://example.com/thumbnail.jpg" />);

      expect(screen.queryByTestId('icomoon')).not.toBeInTheDocument();
    });

    it('should not render img when thumbnail is not provided', () => {
      render(<UploadingDocumentInfo {...defaultProps} />);

      expect(screen.queryByAltText('Document Thumbnail')).not.toBeInTheDocument();
    });
  });

  describe('document info rendering', () => {
    it('should render document name with uploading styles', () => {
      render(<UploadingDocumentInfo {...defaultProps} />);

      const nameElement = screen.getByText('uploading-document.pdf');
      expect(nameElement).toBeInTheDocument();
      expect(nameElement).toHaveClass('name');
      expect(nameElement).toHaveClass('uploadingName');
    });

    it('should render uploading status text', () => {
      render(<UploadingDocumentInfo {...defaultProps} />);

      const statusText = screen.getByText('multipleMerge.uploading');
      expect(statusText).toBeInTheDocument();
      expect(statusText).toHaveClass('extraInfo');
      expect(statusText).toHaveClass('uploadingExtraInfo');
    });

    it('should render progress bar', () => {
      const { container } = render(<UploadingDocumentInfo {...defaultProps} />);

      const progressBar = container.querySelector('.progressBar');
      expect(progressBar).toBeInTheDocument();
    });

    it('should render progress bar value', () => {
      const { container } = render(<UploadingDocumentInfo {...defaultProps} />);

      const progressBarValue = container.querySelector('.progressBarValue');
      expect(progressBarValue).toBeInTheDocument();
    });
  });

  describe('props handling', () => {
    it('should handle long document names', () => {
      const longName = 'this-is-a-very-long-document-name-that-might-overflow-during-upload.pdf';
      render(<UploadingDocumentInfo name={longName} />);

      expect(screen.getByText(longName)).toBeInTheDocument();
    });

    it('should handle special characters in document name', () => {
      const specialName = 'document (1) [copy].pdf';
      render(<UploadingDocumentInfo name={specialName} />);

      expect(screen.getByText(specialName)).toBeInTheDocument();
    });

    it('should handle data URLs as thumbnail', () => {
      const dataUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
      render(<UploadingDocumentInfo name="test.pdf" thumbnail={dataUrl} />);

      const img = screen.getByAltText('Document Thumbnail');
      expect(img).toHaveAttribute('src', dataUrl);
    });
  });

  describe('CSS structure', () => {
    it('should have correct container structure', () => {
      const { container } = render(<UploadingDocumentInfo {...defaultProps} />);

      const documentNameAndSize = container.querySelector('.documentNameAndSize');
      expect(documentNameAndSize).toBeInTheDocument();

      const extraInfoContainer = container.querySelector('.extraInfoContainer');
      expect(extraInfoContainer).toBeInTheDocument();
    });

    it('should render progress bar inside extra info container', () => {
      const { container } = render(<UploadingDocumentInfo {...defaultProps} />);

      const extraInfoContainer = container.querySelector('.extraInfoContainer');
      const progressBar = extraInfoContainer?.querySelector('.progressBar');
      expect(progressBar).toBeInTheDocument();
    });
  });
});

