import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

import MultipleMergeDocumentsProgress from '../MultipleMergeDocumentsProgress';

// Mock values
let mockMergingProgress = 0;
let mockDocuments: { _id: string; name: string }[] = [];

jest.mock('hooks', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

jest.mock('../../../hooks/useMultipleMergeContext', () => ({
  useMultipleMergeContext: () => ({
    mergingProgress: mockMergingProgress,
    documents: mockDocuments,
  }),
}));

jest.mock('lumin-ui/kiwi-ui', () => ({
  CircularProgress: ({ size, className }: { size: string; className: string }) => (
    <div data-testid="circular-progress" data-size={size} className={className} />
  ),
}));

describe('MultipleMergeDocumentsProgress', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockMergingProgress = 0;
    mockDocuments = [];
  });

  describe('rendering', () => {
    it('should render the component correctly', () => {
      mockDocuments = [{ _id: '1', name: 'doc1.pdf' }];

      render(<MultipleMergeDocumentsProgress />);

      expect(screen.getByTestId('circular-progress')).toBeInTheDocument();
      expect(screen.getByText('multipleMerge.mergingFiles')).toBeInTheDocument();
    });

    it('should render CircularProgress with correct size prop', () => {
      mockDocuments = [{ _id: '1', name: 'doc1.pdf' }];

      render(<MultipleMergeDocumentsProgress />);

      const circularProgress = screen.getByTestId('circular-progress');
      expect(circularProgress).toHaveAttribute('data-size', 'xs');
    });
  });

  describe('progress display variations', () => {
    it('should display 0/1 when mergingProgress is 0 and there is 1 document', () => {
      mockMergingProgress = 0;
      mockDocuments = [{ _id: '1', name: 'doc1.pdf' }];

      render(<MultipleMergeDocumentsProgress />);

      expect(screen.getByText('0/1')).toBeInTheDocument();
    });

    it('should display 1/2 when mergingProgress is 1 and there are 2 documents', () => {
      mockMergingProgress = 1;
      mockDocuments = [
        { _id: '1', name: 'doc1.pdf' },
        { _id: '2', name: 'doc2.pdf' },
      ];

      render(<MultipleMergeDocumentsProgress />);

      expect(screen.getByText('1/2')).toBeInTheDocument();
    });

    it('should display 3/5 when mergingProgress is 3 and there are 5 documents', () => {
      mockMergingProgress = 3;
      mockDocuments = [
        { _id: '1', name: 'doc1.pdf' },
        { _id: '2', name: 'doc2.pdf' },
        { _id: '3', name: 'doc3.pdf' },
        { _id: '4', name: 'doc4.pdf' },
        { _id: '5', name: 'doc5.pdf' },
      ];

      render(<MultipleMergeDocumentsProgress />);

      expect(screen.getByText('3/5')).toBeInTheDocument();
    });

    it('should display 5/5 when merge is complete', () => {
      mockMergingProgress = 5;
      mockDocuments = [
        { _id: '1', name: 'doc1.pdf' },
        { _id: '2', name: 'doc2.pdf' },
        { _id: '3', name: 'doc3.pdf' },
        { _id: '4', name: 'doc4.pdf' },
        { _id: '5', name: 'doc5.pdf' },
      ];

      render(<MultipleMergeDocumentsProgress />);

      expect(screen.getByText('5/5')).toBeInTheDocument();
    });

    it('should display 0/0 when there are no documents', () => {
      mockMergingProgress = 0;
      mockDocuments = [];

      render(<MultipleMergeDocumentsProgress />);

      expect(screen.getByText('0/0')).toBeInTheDocument();
    });

    it('should display correct progress for large document count', () => {
      mockMergingProgress = 50;
      mockDocuments = Array.from({ length: 100 }, (_, i) => ({
        _id: `${i + 1}`,
        name: `doc${i + 1}.pdf`,
      }));

      render(<MultipleMergeDocumentsProgress />);

      expect(screen.getByText('50/100')).toBeInTheDocument();
    });
  });

  describe('translation', () => {
    it('should render the merging files translation key', () => {
      mockDocuments = [{ _id: '1', name: 'doc1.pdf' }];

      render(<MultipleMergeDocumentsProgress />);

      expect(screen.getByText('multipleMerge.mergingFiles')).toBeInTheDocument();
    });
  });

  describe('structure', () => {
    it('should render container with progress container and description', () => {
      mockDocuments = [
        { _id: '1', name: 'doc1.pdf' },
        { _id: '2', name: 'doc2.pdf' },
      ];
      mockMergingProgress = 1;

      const { container } = render(<MultipleMergeDocumentsProgress />);

      // Check that all main elements are present
      expect(screen.getByTestId('circular-progress')).toBeInTheDocument();
      expect(screen.getByText('1/2')).toBeInTheDocument();
      expect(screen.getByText('multipleMerge.mergingFiles')).toBeInTheDocument();

      // Verify the component renders with expected structure (2 paragraph elements)
      const paragraphs = container.querySelectorAll('p');
      expect(paragraphs).toHaveLength(2);
    });

    it('should render progress description inside progressDescriptionContainer', () => {
      mockDocuments = [{ _id: '1', name: 'doc1.pdf' }];
      mockMergingProgress = 0;

      const { container } = render(<MultipleMergeDocumentsProgress />);

      // Find the progress text
      const progressText = screen.getByText('0/1');
      expect(progressText.tagName).toBe('P');

      // Ensure description text is separate
      const descriptionText = screen.getByText('multipleMerge.mergingFiles');
      expect(descriptionText.tagName).toBe('P');
      expect(progressText).not.toBe(descriptionText);
    });
  });
});

