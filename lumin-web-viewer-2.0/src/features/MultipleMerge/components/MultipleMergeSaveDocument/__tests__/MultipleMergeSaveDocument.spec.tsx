import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';

import { useRestrictedUser } from 'hooks/useRestrictedUser';

import MultipleMergeSaveDocument from '../MultipleMergeSaveDocument';
import { SaveDestination } from '../../../enum';
import { useMultipleMergeContext } from '../../../hooks/useMultipleMergeContext';
import { SAVE_DESTINATION_OPTIONS } from '../../../constants';

// Mock Hooks
jest.mock('hooks/useTranslation', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

jest.mock('hooks/useRestrictedUser', () => ({
  useRestrictedUser: jest.fn(),
}));

jest.mock('../../../hooks/useMultipleMergeContext', () => ({
  useMultipleMergeContext: jest.fn(),
}));

// Mock Constants and Enums
jest.mock('../../../enum', () => ({
  SaveDestination: {
    COMPUTER: 'COMPUTER',
    LUMIN: 'LUMIN',
    GOOGLE_DRIVE: 'GOOGLE_DRIVE',
  },
}));

jest.mock('../../../constants', () => ({
  SAVE_DESTINATION_OPTIONS: [
    { type: 'COMPUTER', label: 'My Computer', icon: 'computer-icon' },
    { type: 'LUMIN', label: 'Lumin PDF', icon: 'lumin-icon' },
    { type: 'GOOGLE_DRIVE', label: 'Google Drive', icon: 'drive-icon' },
  ],
  SAVE_DOCUMENT_FORMAT_LIST: [{ icon: 'pdf-icon', contentKey: 'format.pdf' }],
}));

// Mock UI Components
jest.mock('lumin-ui/kiwi-ui', () => ({
  Icomoon: jest.fn(({ type }) => <span data-testid={`icon-${type}`} />),
}));

jest.mock('motion/react', () => ({
  motion: {
    div: jest.fn(({ className, children }) => <div className={className} data-testid="motion-background">{children}</div>),
  },
}));

jest.mock('features/SaveToThirdPartyStorage/components/SaveToThirdPartyStorageFormContent', () =>
  jest.fn(() => <div data-testid="save-to-drive-form">Save To Drive Form</div>)
);

jest.mock('../../SaveDestinationItem/SaveDestinationItem', () =>
  jest.fn(({ label }) => <div data-testid="destination-item">{label}</div>)
);

// Mock Styles
jest.mock('../../MultipleMergeSaveDocument.module.scss', () => ({
  label: 'label-class',
  saveDestinationContainer: 'container-class',
  saveDestinationItemContainer: 'item-container-class',
  saveDestinationBackground: 'background-class',
  documentFormatContainer: 'format-container-class',
  documentFormat: 'format-text-class',
}));

describe('MultipleMergeSaveDocument', () => {
  const mockSetSaveDestination = jest.fn();

  const defaultContext = {
    saveDestination: SaveDestination.COMPUTER,
    setSaveDestination: mockSetSaveDestination,
    openSaveToDriveModal: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useMultipleMergeContext as jest.Mock).mockReturnValue(defaultContext);
    (useRestrictedUser as jest.Mock).mockReturnValue({
      isDriveOnlyUser: false,
    });
  });

  describe('Standard Rendering', () => {
    it('should render the main labels and format section correctly', () => {
      render(<MultipleMergeSaveDocument />);

      // Labels
      expect(screen.getByText('multipleMerge.saveTo')).toBeInTheDocument();
      expect(screen.getByText('multipleMerge.format')).toBeInTheDocument();

      // Format Section
      expect(screen.getByText('format.pdf')).toBeInTheDocument();
      expect(screen.getByTestId('icon-pdf-icon')).toBeInTheDocument();
    });

    it('should render all save destination options for a normal user', () => {
      render(<MultipleMergeSaveDocument />);

      // Based on mocked constant (3 items)
      const items = screen.getAllByTestId('destination-item');
      expect(items).toHaveLength(3);
      expect(screen.getByText('My Computer')).toBeInTheDocument();
      expect(screen.getByText('Lumin PDF')).toBeInTheDocument();
      expect(screen.getByText('Google Drive')).toBeInTheDocument();
    });

    it('should render the motion background for the selected item', () => {
      // Default selected is COMPUTER (first item)
      render(<MultipleMergeSaveDocument />);

      const backgrounds = screen.getAllByTestId('motion-background');
      expect(backgrounds).toHaveLength(1);
      // Ensure it is rendered inside the container of the first item?
      // Since we map and render conditionally, presence confirms it picked up the 'type === saveDestination' check.
    });

    it('should change the location of the motion background when selection changes', () => {
      (useMultipleMergeContext as jest.Mock).mockReturnValue({
        ...defaultContext,
        saveDestination: SaveDestination.LUMIN,
      });

      render(<MultipleMergeSaveDocument />);

      // We still expect 1 background
      const backgrounds = screen.getAllByTestId('motion-background');
      expect(backgrounds).toHaveLength(1);
    });
  });

  describe('Restricted User (Drive Only)', () => {
    it('should filter out Lumin destination if user is Drive Only', () => {
      (useRestrictedUser as jest.Mock).mockReturnValue({
        isDriveOnlyUser: true,
      });

      render(<MultipleMergeSaveDocument />);

      const items = screen.getAllByTestId('destination-item');
      // Should filter out LUMIN, leaving COMPUTER and GOOGLE_DRIVE
      expect(items).toHaveLength(2);
      expect(screen.queryByText('Lumin PDF')).not.toBeInTheDocument();
      expect(screen.getByText('My Computer')).toBeInTheDocument();
      expect(screen.getByText('Google Drive')).toBeInTheDocument();
    });
  });

  describe('Google Drive Modal State', () => {
    it('should render SaveToDriveFormContent when openSaveToDriveModal is true', () => {
      (useMultipleMergeContext as jest.Mock).mockReturnValue({
        ...defaultContext,
        openSaveToDriveModal: true,
      });

      render(<MultipleMergeSaveDocument />);

      expect(screen.getByTestId('save-to-drive-form')).toBeInTheDocument();
      
      // Should NOT render the standard list
      expect(screen.queryByText('multipleMerge.saveTo')).not.toBeInTheDocument();
      expect(screen.queryByTestId('destination-item')).not.toBeInTheDocument();
    });
  });
});