import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

import UploadedDocumentInfo from '../UploadedDocumentInfo';

// Mock dependencies
jest.mock('lumin-ui/kiwi-ui', () => ({
  Icomoon: ({ type, size, color }: { type: string; size: string; color: string }) => (
    <span data-testid="icomoon" data-type={type} data-size={size} data-color={color} />
  ),
}));

jest.mock('../../../utils/documentFormatter', () => ({
  formatDocumentSizeInMB: (size: number) => `${(size / 1000000).toFixed(2)}MB`,
}));

jest.mock('../DocumentInfo.module.scss', () => ({
  thumbnail: 'thumbnail',
  documentNameAndSize: 'documentNameAndSize',
  name: 'name',
  extraInfoContainer: 'extraInfoContainer',
  extraInfo: 'extraInfo',
}));

describe('UploadedDocumentInfo', () => {
  const defaultProps = {
    name: 'test-document.pdf',
    size: 1024000,
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('thumbnail conditional rendering', () => {
    it('should render img element when thumbnail is provided', () => {
      render(<UploadedDocumentInfo {...defaultProps} thumbnail="http://example.com/thumbnail.jpg" />);

      const img = screen.getByAltText('Document Thumbnail');
      expect(img).toBeInTheDocument();
      expect(img).toHaveAttribute('src', 'http://example.com/thumbnail.jpg');
      expect(img).toHaveClass('thumbnail');
    });

    it('should render Icomoon fallback when thumbnail is undefined', () => {
      render(<UploadedDocumentInfo {...defaultProps} thumbnail={undefined} />);

      const icomoon = screen.getByTestId('icomoon');
      expect(icomoon).toBeInTheDocument();
      expect(icomoon).toHaveAttribute('data-type', 'file-filled-lg');
      expect(icomoon).toHaveAttribute('data-size', 'lg');
      expect(icomoon).toHaveAttribute('data-color', 'var(--kiwi-colors-custom-role-web-thumbnail-blue)');
    });

    it('should render Icomoon fallback when thumbnail is empty string', () => {
      render(<UploadedDocumentInfo {...defaultProps} thumbnail="" />);

      const icomoon = screen.getByTestId('icomoon');
      expect(icomoon).toBeInTheDocument();
      expect(screen.queryByAltText('Document Thumbnail')).not.toBeInTheDocument();
    });

    it('should not render Icomoon when thumbnail is provided', () => {
      render(<UploadedDocumentInfo {...defaultProps} thumbnail="http://example.com/thumbnail.jpg" />);

      expect(screen.queryByTestId('icomoon')).not.toBeInTheDocument();
    });

    it('should not render img when thumbnail is not provided', () => {
      render(<UploadedDocumentInfo {...defaultProps} />);

      expect(screen.queryByAltText('Document Thumbnail')).not.toBeInTheDocument();
    });
  });

  describe('document info rendering', () => {
    it('should render document name', () => {
      render(<UploadedDocumentInfo {...defaultProps} />);

      const nameElement = screen.getByText('test-document.pdf');
      expect(nameElement).toBeInTheDocument();
      expect(nameElement).toHaveClass('name');
    });

    it('should render formatted document size', () => {
      render(<UploadedDocumentInfo {...defaultProps} size={1024000} />);

      expect(screen.getByText('1.02MB')).toBeInTheDocument();
    });

    it('should render size with correct formatting for small files', () => {
      render(<UploadedDocumentInfo {...defaultProps} size={500000} />);

      expect(screen.getByText('0.50MB')).toBeInTheDocument();
    });

    it('should render size with correct formatting for large files', () => {
      render(<UploadedDocumentInfo {...defaultProps} size={50000000} />);

      expect(screen.getByText('50.00MB')).toBeInTheDocument();
    });

    it('should apply correct CSS class to size element', () => {
      render(<UploadedDocumentInfo {...defaultProps} />);

      const sizeElement = screen.getByText('1.02MB');
      expect(sizeElement).toHaveClass('extraInfo');
    });
  });

  describe('props handling', () => {
    it('should handle long document names', () => {
      const longName = 'this-is-a-very-long-document-name-that-might-overflow.pdf';
      render(<UploadedDocumentInfo name={longName} size={1000000} />);

      expect(screen.getByText(longName)).toBeInTheDocument();
    });

    it('should handle zero size', () => {
      render(<UploadedDocumentInfo name="empty.pdf" size={0} />);

      expect(screen.getByText('0.00MB')).toBeInTheDocument();
    });

    it('should handle data URLs as thumbnail', () => {
      const dataUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
      render(<UploadedDocumentInfo {...defaultProps} thumbnail={dataUrl} />);

      const img = screen.getByAltText('Document Thumbnail');
      expect(img).toHaveAttribute('src', dataUrl);
    });
  });
});

