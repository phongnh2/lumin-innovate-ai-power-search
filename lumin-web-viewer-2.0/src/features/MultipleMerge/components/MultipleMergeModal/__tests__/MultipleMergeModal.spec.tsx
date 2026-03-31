import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';

import withDropDocPopup from 'HOC/withDropDocPopup';

import { useEnabledMultipleMerge } from 'features/MultipleMerge/hooks/useEnabledMultipleMerge';

import MultipleMergeModal from '../MultipleMergeModal';
import { MultipleMergeStep } from '../../../enum';
import { useMultipleMergeContext } from '../../../hooks/useMultipleMergeContext';
import { IDocumentBase } from 'interfaces/document/document.interface';

// Mock styles
jest.mock('../MultipleMergeModal.module.scss', () => ({
  container: 'container-class',
  header: 'header-class',
  body: 'body-class',
  footer: 'footer-class',
  saveDocumentBody: 'save-document-body-class',
  saveToDriveModalBody: 'save-to-drive-body-class',
}));

// Mock HOC
jest.mock('HOC/withDropDocPopup', () => ({
  Consumer: (Component: React.ComponentType) => (props: any) => <Component {...props} />,
}));

// Mock UI Components
jest.mock('lumin-ui/kiwi-ui', () => ({
  Dialog: jest.fn(({ children, opened }) => (
    opened ? <div data-testid="dialog">{children}</div> : null
  )),
}));

// Mock Hooks
jest.mock('features/MultipleMerge/hooks/useEnabledMultipleMerge', () => ({
  useEnabledMultipleMerge: jest.fn(),
}));

jest.mock('../../../hooks/useMultipleMergeContext', () => ({
  useMultipleMergeContext: jest.fn(),
}));

// Mock Child Components
jest.mock('../../FormContainer/FormContainer', () => jest.fn(({ children }) => <div data-testid="form-container">{children}</div>));
jest.mock('../../MultipleMergeBody/MultipleMergeBody', () => jest.fn(() => <div data-testid="merge-body" />));
jest.mock('../../MultipleMergeFooter/MultipleMergeFooter', () => jest.fn(() => <div data-testid="merge-footer" />));
jest.mock('../../MultipleMergeHeader/MultipleMergeHeader', () => jest.fn(() => <div data-testid="merge-header" />));
jest.mock('../../PremiumModal/PremiumModal', () => jest.fn(() => <div data-testid="premium-modal" />));

// Mock Provider
jest.mock('../../MultipleMergeProvider/MultipleMergeProvider', () =>
  jest.fn(({ children }) => <div data-testid="merge-provider">{children}</div>)
);

// Mock Enum
jest.mock('../../../enum', () => ({
  MultipleMergeStep: {
    SELECT_DOCUMENTS: 'SELECT_DOCUMENTS',
    SAVE_DOCUMENT: 'SAVE_DOCUMENT',
  },
}));

describe('MultipleMergeModal', () => {
  const mockOnClose = jest.fn();
  // Note: mockOnFilesPicked is not used in the render props because the HOC handles it
  const mockInitialDocuments: IDocumentBase[] = [{ _id: '1', name: 'doc.pdf' } as IDocumentBase];

  const defaultEnabledState = { enabled: true };
  const defaultMergeContext = {
    currentStep: 'SELECT_DOCUMENTS',
    openSaveToDriveModal: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useEnabledMultipleMerge as jest.Mock).mockReturnValue(defaultEnabledState);
    (useMultipleMergeContext as jest.Mock).mockReturnValue(defaultMergeContext);
  });

  describe('Feature Flag / Enable State', () => {
    it('should return null (not render) if the feature is disabled', () => {
      (useEnabledMultipleMerge as jest.Mock).mockReturnValue({ enabled: false });

      const { container } = render(
        <MultipleMergeModal
          initialDocuments={mockInitialDocuments}
          onClose={mockOnClose}
        >
          <div />
        </MultipleMergeModal>
      );

      expect(container).toBeEmptyDOMElement();
      expect(screen.queryByTestId('dialog')).not.toBeInTheDocument();
    });

    it('should render the dialog if the feature is enabled', () => {
      render(
        <MultipleMergeModal
          initialDocuments={mockInitialDocuments}
          onClose={mockOnClose}
        >
          <div />
        </MultipleMergeModal>
      );

      expect(screen.getByTestId('dialog')).toBeInTheDocument();
      expect(screen.getByTestId('merge-provider')).toBeInTheDocument();
    });
  });

  describe('Content Layout', () => {
    it('should render all child structure components correctly', () => {
      render(
        <MultipleMergeModal
          initialDocuments={mockInitialDocuments}
          onClose={mockOnClose}
        >
          <div />
        </MultipleMergeModal>
      );

      // Provider & Container
      expect(screen.getByTestId('merge-provider')).toBeInTheDocument();
      expect(screen.getByTestId('form-container')).toBeInTheDocument();

      // Inner Content
      expect(screen.getByTestId('merge-header')).toBeInTheDocument();
      expect(screen.getByTestId('merge-body')).toBeInTheDocument();
      expect(screen.getByTestId('merge-footer')).toBeInTheDocument();
      expect(screen.getByTestId('premium-modal')).toBeInTheDocument();
    });
  });

  describe('Dynamic Styling', () => {
    it('should apply default body classes', () => {
      render(
        <MultipleMergeModal
          initialDocuments={mockInitialDocuments}
          onClose={mockOnClose}
        >
          <div />
        </MultipleMergeModal>
      );

      const bodyContainer = screen.getByTestId('merge-body').parentElement;
      expect(bodyContainer).toHaveClass('body-class');
      expect(bodyContainer).not.toHaveClass('save-document-body-class');
      expect(bodyContainer).not.toHaveClass('save-to-drive-body-class');
    });

    it('should apply saveDocument styling when step is SAVE_DOCUMENT', () => {
      (useMultipleMergeContext as jest.Mock).mockReturnValue({
        ...defaultMergeContext,
        currentStep: MultipleMergeStep.SAVE_DOCUMENT,
      });

      render(
        <MultipleMergeModal
          initialDocuments={mockInitialDocuments}
          onClose={mockOnClose}
        >
          <div />
        </MultipleMergeModal>
      );

      const bodyContainer = screen.getByTestId('merge-body').parentElement;
      expect(bodyContainer).toHaveClass('body-class');
      expect(bodyContainer).toHaveClass('save-document-body-class');
    });

    it('should apply saveToDrive styling when openSaveToDriveModal is true', () => {
      (useMultipleMergeContext as jest.Mock).mockReturnValue({
        ...defaultMergeContext,
        openSaveToDriveModal: true,
      });

      render(
        <MultipleMergeModal
          initialDocuments={mockInitialDocuments}
          onClose={mockOnClose}
        >
          <div />
        </MultipleMergeModal>
      );

      const bodyContainer = screen.getByTestId('merge-body').parentElement;
      expect(bodyContainer).toHaveClass('body-class');
      expect(bodyContainer).toHaveClass('save-to-drive-body-class');
    });

    it('should apply both classes if both conditions are met', () => {
      (useMultipleMergeContext as jest.Mock).mockReturnValue({
        currentStep: MultipleMergeStep.SAVE_DOCUMENT,
        openSaveToDriveModal: true,
      });

      render(
        <MultipleMergeModal
          initialDocuments={mockInitialDocuments}
          onClose={mockOnClose}
        >
          <div />
        </MultipleMergeModal>
      );

      const bodyContainer = screen.getByTestId('merge-body').parentElement;
      expect(bodyContainer).toHaveClass('save-document-body-class');
      expect(bodyContainer).toHaveClass('save-to-drive-body-class');
    });
  });
});