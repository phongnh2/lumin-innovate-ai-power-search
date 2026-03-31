import { fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';

import { useSaveToThirdPartyStorageContext } from 'features/SaveToThirdPartyStorage/hooks/useSaveToThirdPartyStorageContext';

import MultipleMergeFooter from '../MultipleMergeFooter';
import { MultipleMergeStep } from '../../../enum';
import { useMultipleMergeContext } from '../../../hooks/useMultipleMergeContext';

// Mock the UI components
jest.mock('lumin-ui/kiwi-ui', () => ({
  Button: jest.fn(({ children, onClick, disabled, loading, type }) => (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      type={type}
      data-testid="mock-button"
    >
      {loading ? 'Loading...' : children}
    </button>
  )),
}));

// Mock hooks
jest.mock('hooks', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

jest.mock('features/SaveToThirdPartyStorage/hooks/useSaveToThirdPartyStorageContext', () => ({
  useSaveToThirdPartyStorageContext: jest.fn(),
}));

jest.mock('../../../hooks/useMultipleMergeContext', () => ({
  useMultipleMergeContext: jest.fn(),
}));

// Mock Enum
jest.mock('../../../enum', () => ({
  MultipleMergeStep: {
    SELECT_DOCUMENTS: 'SELECT_DOCUMENTS',
    SAVE_DOCUMENT: 'SAVE_DOCUMENT',
  },
}));

describe('MultipleMergeFooter', () => {
  const mockOnClose = jest.fn();
  const mockAbort = jest.fn();
  const mockHandleClickConfirm = jest.fn();
  const mockGetAbortController = jest.fn().mockReturnValue({ abort: mockAbort });

  const defaultMergeContext = {
    getAbortController: mockGetAbortController,
    currentStep: MultipleMergeStep.SELECT_DOCUMENTS,
    handleClickConfirm: mockHandleClickConfirm,
    disabledMergeButton: false,
    openSaveToDriveModal: false,
  };

  const defaultStorageContext = {
    errors: {},
    isSubmitting: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useMultipleMergeContext as jest.Mock).mockReturnValue(defaultMergeContext);
    (useSaveToThirdPartyStorageContext as jest.Mock).mockReturnValue(defaultStorageContext);
  });

  describe('Rendering', () => {
    it('should render Cancel and Merge buttons by default', () => {
      render(<MultipleMergeFooter onClose={mockOnClose} />);

      expect(screen.getByText('common.cancel')).toBeInTheDocument();
      expect(screen.getByText('action.merge')).toBeInTheDocument();
    });

    it('should display "action.save" when current step is SAVE_DOCUMENT', () => {
      (useMultipleMergeContext as jest.Mock).mockReturnValue({
        ...defaultMergeContext,
        currentStep: MultipleMergeStep.SAVE_DOCUMENT,
      });

      render(<MultipleMergeFooter onClose={mockOnClose} />);

      expect(screen.getByText('action.save')).toBeInTheDocument();
      expect(screen.queryByText('action.merge')).not.toBeInTheDocument();
    });
  });

  describe('Button State (Disabled/Loading)', () => {
    it('should disable the action button when disabledMergeButton is true', () => {
      (useMultipleMergeContext as jest.Mock).mockReturnValue({
        ...defaultMergeContext,
        disabledMergeButton: true,
      });

      render(<MultipleMergeFooter onClose={mockOnClose} />);

      const actionButton = screen.getByText('action.merge').closest('button');
      expect(actionButton).toBeDisabled();
    });

    it('should disable the action button when there are storage errors', () => {
      (useSaveToThirdPartyStorageContext as jest.Mock).mockReturnValue({
        ...defaultStorageContext,
        errors: { name: 'Invalid name' },
      });

      render(<MultipleMergeFooter onClose={mockOnClose} />);

      const actionButton = screen.getByText('action.merge').closest('button');
      expect(actionButton).toBeDisabled();
    });

    it('should show loading state and disable button when isSubmitting is true', () => {
      (useSaveToThirdPartyStorageContext as jest.Mock).mockReturnValue({
        ...defaultStorageContext,
        isSubmitting: true,
      });

      render(<MultipleMergeFooter onClose={mockOnClose} />);

      // Our mock button renders "Loading..." when loading prop is true
      expect(screen.getByText('Loading...')).toBeInTheDocument();
      expect(screen.getByText('Loading...').closest('button')).toBeDisabled();
    });
  });

  describe('Interactions', () => {
    it('should abort controller and close modal when Cancel is clicked', () => {
      render(<MultipleMergeFooter onClose={mockOnClose} />);

      fireEvent.click(screen.getByText('common.cancel'));

      expect(mockGetAbortController).toHaveBeenCalled();
      expect(mockAbort).toHaveBeenCalledWith('User cancel multiple merge');
      expect(mockOnClose).toHaveBeenCalled();
    });

    it('should call handleClickConfirm when Action button is clicked', async () => {
      render(<MultipleMergeFooter onClose={mockOnClose} />);

      const actionButton = screen.getByText('action.merge');
      fireEvent.click(actionButton);

      expect(mockHandleClickConfirm).toHaveBeenCalledTimes(1);
    });

    it('should NOT call handleClickConfirm if openSaveToDriveModal is true', async () => {
      // Logic branch: if (openSaveToDriveModal) { return; }
      (useMultipleMergeContext as jest.Mock).mockReturnValue({
        ...defaultMergeContext,
        openSaveToDriveModal: true,
      });

      render(<MultipleMergeFooter onClose={mockOnClose} />);

      const actionButton = screen.getByText('action.merge');
      fireEvent.click(actionButton);

      expect(mockHandleClickConfirm).not.toHaveBeenCalled();
    });

    it('should set button type to "submit" if openSaveToDriveModal is true', () => {
      (useMultipleMergeContext as jest.Mock).mockReturnValue({
        ...defaultMergeContext,
        openSaveToDriveModal: true,
      });

      render(<MultipleMergeFooter onClose={mockOnClose} />);

      const actionButton = screen.getByText('action.merge').closest('button');
      expect(actionButton).toHaveAttribute('type', 'submit');
    });

    it('should set button type to "button" if openSaveToDriveModal is false', () => {
      (useMultipleMergeContext as jest.Mock).mockReturnValue({
        ...defaultMergeContext,
        openSaveToDriveModal: false,
      });

      render(<MultipleMergeFooter onClose={mockOnClose} />);

      const actionButton = screen.getByText('action.merge').closest('button');
      expect(actionButton).toHaveAttribute('type', 'button');
    });
  });
});