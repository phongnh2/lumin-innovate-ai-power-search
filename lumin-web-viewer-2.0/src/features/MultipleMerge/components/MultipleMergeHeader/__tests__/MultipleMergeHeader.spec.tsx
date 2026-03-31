import { fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';

import { useSaveToThirdPartyStorageContext } from 'features/SaveToThirdPartyStorage/hooks/useSaveToThirdPartyStorageContext';

import MultipleMergeHeader from '../MultipleMergeHeader';
import { MultipleMergeStep } from '../../../enum';
import { useMultipleMergeContext } from '../../../hooks/useMultipleMergeContext';

// Mock styles to avoid CSS import issues
jest.mock('../MultipleMergeHeader.module.scss', () => ({
  title: 'title-class',
  titleWithBackButton: 'title-with-back-button-class',
  backButton: 'back-button-class',
}));

// Mock classnames to check if classes are combined correctly
jest.mock('classnames', () => ({
  __esModule: true,
  default: jest.fn((...args) => args.flat().filter(Boolean).join(' ')),
}));

// Mock UI components
jest.mock('lumin-ui/kiwi-ui', () => ({
  IconButton: jest.fn(({ onClick, disabled, className, icon }) => (
    <button
      data-testid="back-button"
      onClick={onClick}
      disabled={disabled}
      className={className}
    >
      {icon}
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
    MERGING_DOCUMENTS: 'MERGING_DOCUMENTS',
  },
}));

describe('MultipleMergeHeader', () => {
  const mockSetOpenSaveToDriveModal = jest.fn();

  const defaultMergeContext = {
    currentStep: MultipleMergeStep.SELECT_DOCUMENTS,
    openSaveToDriveModal: false,
    setOpenSaveToDriveModal: mockSetOpenSaveToDriveModal,
  };

  const defaultStorageContext = {
    isSubmitting: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useMultipleMergeContext as jest.Mock).mockReturnValue(defaultMergeContext);
    (useSaveToThirdPartyStorageContext as jest.Mock).mockReturnValue(defaultStorageContext);
  });

  describe('Header Title Logic', () => {
    it('should display "saveToDriveTitle" when openSaveToDriveModal is true', () => {
      (useMultipleMergeContext as jest.Mock).mockReturnValue({
        ...defaultMergeContext,
        openSaveToDriveModal: true,
      });

      render(<MultipleMergeHeader />);

      expect(screen.getByText('multipleMerge.saveToDriveTitle')).toBeInTheDocument();
    });

    it('should display "saveTitle" when currentStep is SAVE_DOCUMENT (and modal closed)', () => {
      (useMultipleMergeContext as jest.Mock).mockReturnValue({
        ...defaultMergeContext,
        openSaveToDriveModal: false,
        currentStep: MultipleMergeStep.SAVE_DOCUMENT,
      });

      render(<MultipleMergeHeader />);

      expect(screen.getByText('multipleMerge.saveTitle')).toBeInTheDocument();
    });

    it('should display "mergeTitle" for other steps (e.g., SELECT_DOCUMENTS)', () => {
      (useMultipleMergeContext as jest.Mock).mockReturnValue({
        ...defaultMergeContext,
        openSaveToDriveModal: false,
        currentStep: MultipleMergeStep.SELECT_DOCUMENTS,
      });

      render(<MultipleMergeHeader />);

      expect(screen.getByText('multipleMerge.mergeTitle')).toBeInTheDocument();
    });

    it('should display "mergeTitle" for MERGING_DOCUMENTS step', () => {
      (useMultipleMergeContext as jest.Mock).mockReturnValue({
        ...defaultMergeContext,
        openSaveToDriveModal: false,
        currentStep: MultipleMergeStep.MERGING_DOCUMENTS,
      });

      render(<MultipleMergeHeader />);

      expect(screen.getByText('multipleMerge.mergeTitle')).toBeInTheDocument();
    });
  });

  describe('Back Button Logic', () => {
    it('should NOT render the back button when openSaveToDriveModal is false', () => {
      (useMultipleMergeContext as jest.Mock).mockReturnValue({
        ...defaultMergeContext,
        openSaveToDriveModal: false,
      });

      render(<MultipleMergeHeader />);

      expect(screen.queryByTestId('back-button')).not.toBeInTheDocument();
    });

    it('should render the back button when openSaveToDriveModal is true', () => {
      (useMultipleMergeContext as jest.Mock).mockReturnValue({
        ...defaultMergeContext,
        openSaveToDriveModal: true,
      });

      render(<MultipleMergeHeader />);

      expect(screen.getByTestId('back-button')).toBeInTheDocument();
    });

    it('should call setOpenSaveToDriveModal(false) when back button is clicked', () => {
      (useMultipleMergeContext as jest.Mock).mockReturnValue({
        ...defaultMergeContext,
        openSaveToDriveModal: true,
      });

      render(<MultipleMergeHeader />);

      fireEvent.click(screen.getByTestId('back-button'));

      expect(mockSetOpenSaveToDriveModal).toHaveBeenCalledTimes(1);
      expect(mockSetOpenSaveToDriveModal).toHaveBeenCalledWith(false);
    });

    it('should disable the back button when isSubmitting is true', () => {
      (useMultipleMergeContext as jest.Mock).mockReturnValue({
        ...defaultMergeContext,
        openSaveToDriveModal: true,
      });
      (useSaveToThirdPartyStorageContext as jest.Mock).mockReturnValue({
        isSubmitting: true,
      });

      render(<MultipleMergeHeader />);

      const button = screen.getByTestId('back-button');
      expect(button).toBeDisabled();
    });
  });

  describe('Styling Logic', () => {
    it('should apply extra padding/styling class when back button is visible', () => {
      (useMultipleMergeContext as jest.Mock).mockReturnValue({
        ...defaultMergeContext,
        openSaveToDriveModal: true,
      });

      const { container } = render(<MultipleMergeHeader />);
      const titleElement = container.querySelector('h2');

      // Based on our mock of classnames returning "class1 class2"
      expect(titleElement).toHaveClass('title-class title-with-back-button-class');
    });

    it('should NOT apply extra padding/styling class when back button is hidden', () => {
      (useMultipleMergeContext as jest.Mock).mockReturnValue({
        ...defaultMergeContext,
        openSaveToDriveModal: false,
      });

      const { container } = render(<MultipleMergeHeader />);
      const titleElement = container.querySelector('h2');

      expect(titleElement).toHaveClass('title-class');
      expect(titleElement).not.toHaveClass('title-with-back-button-class');
    });
  });
});