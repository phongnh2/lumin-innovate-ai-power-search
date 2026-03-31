import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

import MultipleMergeBody from '../MultipleMergeBody';
import { MultipleMergeStep, MultipleMergeStepType } from '../../../enum';

// Mock context
const mockContextValue: { currentStep: MultipleMergeStepType | string } = {
  currentStep: MultipleMergeStep.SELECT_DOCUMENTS,
};

jest.mock('../../../hooks/useMultipleMergeContext', () => ({
  useMultipleMergeContext: () => mockContextValue,
}));

// Mock child components
jest.mock('../../MultipleMergeDocumentsManipulation/MultipleMergeDocumentsManipulation', () => {
  return function MockMultipleMergeDocumentsManipulation() {
    return <div data-testid="documents-manipulation">Documents Manipulation</div>;
  };
});

jest.mock('../../MultipleMergeDocumentsProgress/MultipleMergeDocumentsProgress', () => {
  return function MockMultipleMergeDocumentsProgress() {
    return <div data-testid="documents-progress">Documents Progress</div>;
  };
});

jest.mock('../../MultipleMergeSaveDocument/MultipleMergeSaveDocument', () => {
  return function MockMultipleMergeSaveDocument() {
    return <div data-testid="save-document">Save Document</div>;
  };
});

describe('MultipleMergeBody', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockContextValue.currentStep = MultipleMergeStep.SELECT_DOCUMENTS;
  });

  describe('currentStep switch statement', () => {
    it('should render MultipleMergeDocumentsManipulation when step is SELECT_DOCUMENTS', () => {
      mockContextValue.currentStep = MultipleMergeStep.SELECT_DOCUMENTS;

      render(<MultipleMergeBody />);

      expect(screen.getByTestId('documents-manipulation')).toBeInTheDocument();
      expect(screen.queryByTestId('documents-progress')).not.toBeInTheDocument();
      expect(screen.queryByTestId('save-document')).not.toBeInTheDocument();
    });

    it('should render MultipleMergeDocumentsProgress when step is MERGING_DOCUMENTS', () => {
      mockContextValue.currentStep = MultipleMergeStep.MERGING_DOCUMENTS;

      render(<MultipleMergeBody />);

      expect(screen.getByTestId('documents-progress')).toBeInTheDocument();
      expect(screen.queryByTestId('documents-manipulation')).not.toBeInTheDocument();
      expect(screen.queryByTestId('save-document')).not.toBeInTheDocument();
    });

    it('should render MultipleMergeSaveDocument when step is SAVE_DOCUMENT', () => {
      mockContextValue.currentStep = MultipleMergeStep.SAVE_DOCUMENT;

      render(<MultipleMergeBody />);

      expect(screen.getByTestId('save-document')).toBeInTheDocument();
      expect(screen.queryByTestId('documents-manipulation')).not.toBeInTheDocument();
      expect(screen.queryByTestId('documents-progress')).not.toBeInTheDocument();
    });

    it('should render null when step is unknown/default', () => {
      mockContextValue.currentStep = 'unknown-step';

      const { container } = render(<MultipleMergeBody />);

      expect(container.firstChild).toBeNull();
      expect(screen.queryByTestId('documents-manipulation')).not.toBeInTheDocument();
      expect(screen.queryByTestId('documents-progress')).not.toBeInTheDocument();
      expect(screen.queryByTestId('save-document')).not.toBeInTheDocument();
    });

    it('should render null when step is empty string', () => {
      mockContextValue.currentStep = '';

      const { container } = render(<MultipleMergeBody />);

      expect(container.firstChild).toBeNull();
    });
  });

  describe('step transitions', () => {
    it('should correctly transition through all steps', () => {
      const steps = [
        { step: MultipleMergeStep.SELECT_DOCUMENTS, expectedTestId: 'documents-manipulation' },
        { step: MultipleMergeStep.MERGING_DOCUMENTS, expectedTestId: 'documents-progress' },
        { step: MultipleMergeStep.SAVE_DOCUMENT, expectedTestId: 'save-document' },
      ];

      steps.forEach(({ step, expectedTestId }) => {
        mockContextValue.currentStep = step;
        const { unmount } = render(<MultipleMergeBody />);
        expect(screen.getByTestId(expectedTestId)).toBeInTheDocument();
        unmount();
      });
    });
  });
});

