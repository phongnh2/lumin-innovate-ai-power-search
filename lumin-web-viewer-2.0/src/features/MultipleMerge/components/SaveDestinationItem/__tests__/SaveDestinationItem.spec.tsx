import { fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';
import SaveDestinationItem from '../SaveDestinationItem';
import { SaveDestination } from '../../../enum';

// Mock Hooks
jest.mock('hooks', () => ({
  useTranslation: () => ({ t: (key: string) => `translated_${key}` }),
}));

// Mock UI Components
jest.mock('lumin-ui/kiwi-ui', () => ({
  Icomoon: jest.fn(({ type, color }) => (
    <span data-testid="icomoon" data-icon={type} style={{ color }} />
  )),
}));

// Mock Styles
jest.mock('../SaveDestinationItem.module.scss', () => ({
  saveDestinationItem: 'save-destination-item-class',
}));

// Mock Enums and Types
// We assume the structure based on previous context.
// If the actual enum is not available during test runtime, we mock the module.
jest.mock('../../../enum', () => ({
  SaveDestination: {
    COMPUTER: 'computer',
    LUMIN: 'lumin',
    GOOGLE_DRIVE: 'googleDrive',
  },
}));

describe('SaveDestinationItem', () => {
  const mockSetSaveDestination = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render an icon and translated text when icon and contentKey are provided', () => {
      render(
        <SaveDestinationItem
          type={SaveDestination.COMPUTER}
          setSaveDestination={mockSetSaveDestination}
          icon="computer-icon"
          iconColor="red"
          contentKey="destination.computer"
        />
      );

      // Check Icon
      const icon = screen.getByTestId('icomoon');
      expect(icon).toBeInTheDocument();
      expect(icon).toHaveAttribute('data-icon', 'computer-icon');
      expect(icon).toHaveStyle({ color: 'red' });

      // Check Translated Text
      // The mock returns "translated_KEY"
      expect(screen.getByText('translated_destination.computer')).toBeInTheDocument();

      // Ensure no image or static content is rendered
      expect(screen.queryByRole('img')).not.toBeInTheDocument();
    });

    it('should render an image and static content when imageSrc and content are provided', () => {
      render(
        <SaveDestinationItem
          type={SaveDestination.GOOGLE_DRIVE}
          setSaveDestination={mockSetSaveDestination}
          imageSrc="drive.png"
          content="Google Drive"
        />
      );

      // Check Image
      const image = screen.getByRole('img');
      expect(image).toBeInTheDocument();
      expect(image).toHaveAttribute('src', 'drive.png');
      expect(image).toHaveAttribute('alt', 'Google Drive');

      // Check Static Text
      expect(screen.getByText('Google Drive')).toBeInTheDocument();

      // Ensure no icon is rendered
      expect(screen.queryByTestId('icomoon')).not.toBeInTheDocument();
    });

    it('should render correctly with minimal props (robustness check)', () => {
      render(
        <SaveDestinationItem
          type={SaveDestination.COMPUTER}
          setSaveDestination={mockSetSaveDestination}
        />
      );

      // It should render the button container but empty content
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
      expect(button).toHaveClass('save-destination-item-class');
    });
  });

  describe('Interactions', () => {
    it('should call setSaveDestination with the correct type when clicked', () => {
      render(
        <SaveDestinationItem
          type={SaveDestination.GOOGLE_DRIVE}
          setSaveDestination={mockSetSaveDestination}
          content="Click Me"
        />
      );

      const button = screen.getByRole('button');
      fireEvent.click(button);

      expect(mockSetSaveDestination).toHaveBeenCalledTimes(1);
      expect(mockSetSaveDestination).toHaveBeenCalledWith(SaveDestination.GOOGLE_DRIVE);
    });
  });
});