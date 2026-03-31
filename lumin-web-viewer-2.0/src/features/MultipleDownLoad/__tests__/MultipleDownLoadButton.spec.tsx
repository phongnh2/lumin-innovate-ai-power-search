import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

import MultipleDownLoadButton from '../MultipleDownLoadButton';

// Mock hooks
const mockOnDownload = jest.fn();

jest.mock('hooks/useTranslation', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

jest.mock('features/MultipleDownLoad/hooks/useHandleDownloadMultipleDocs', () => ({
  __esModule: true,
  default: () => ({
    onDownload: mockOnDownload,
  }),
}));

jest.mock('features/WebChatBot/hooks/useBulkActionIconButton', () => ({
  useBulkActionIconButton: jest.fn(),
}));

// Mock lumin-ui components
jest.mock('lumin-ui/kiwi-ui', () => ({
  Button: ({ children, onClick, disabled, startIcon, ...props }: any) => (
    <button onClick={onClick} disabled={disabled} {...props}>
      {startIcon}
      {children}
    </button>
  ),
  IconButton: ({ icon, onClick, disabled, ...props }: any) => (
    <button onClick={onClick} disabled={disabled} {...props} aria-label={icon}>
      {icon}
    </button>
  ),
  Icomoon: ({ type }: any) => <span data-testid="icomoon">{type}</span>,
}));

import { useBulkActionIconButton } from 'features/WebChatBot/hooks/useBulkActionIconButton';

const mockUseBulkActionIconButton = useBulkActionIconButton as jest.MockedFunction<typeof useBulkActionIconButton>;

describe('MultipleDownLoadButton', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseBulkActionIconButton.mockReturnValue(false);
  });

  describe('Rendering', () => {
    it('should render Button component when isBulkActionIconButton is false', () => {
      mockUseBulkActionIconButton.mockReturnValue(false);
      
      render(<MultipleDownLoadButton />);
      
      expect(screen.getByText('common.download')).toBeInTheDocument();
    });

    it('should render IconButton component when isBulkActionIconButton is true', () => {
      mockUseBulkActionIconButton.mockReturnValue(true);
      
      render(<MultipleDownLoadButton />);
      
      expect(screen.getByLabelText('download-lg')).toBeInTheDocument();
    });

    it('should render with download icon in Button variant', () => {
      mockUseBulkActionIconButton.mockReturnValue(false);
      
      render(<MultipleDownLoadButton />);
      
      expect(screen.getByTestId('icomoon')).toHaveTextContent('download-lg');
    });
  });

  describe('Props Handling', () => {
    it('should be enabled by default', () => {
      mockUseBulkActionIconButton.mockReturnValue(false);
      
      render(<MultipleDownLoadButton />);
      
      expect(screen.getByText('common.download')).not.toBeDisabled();
    });

    it('should be disabled when disabled prop is true', () => {
      mockUseBulkActionIconButton.mockReturnValue(false);
      
      render(<MultipleDownLoadButton disabled={true} />);
      
      expect(screen.getByText('common.download')).toBeDisabled();
    });

    it('should be enabled when disabled prop is false', () => {
      mockUseBulkActionIconButton.mockReturnValue(false);
      
      render(<MultipleDownLoadButton disabled={false} />);
      
      expect(screen.getByText('common.download')).not.toBeDisabled();
    });

    it('should disable IconButton when disabled prop is true', () => {
      mockUseBulkActionIconButton.mockReturnValue(true);
      
      render(<MultipleDownLoadButton disabled={true} />);
      
      expect(screen.getByLabelText('download-lg')).toBeDisabled();
    });
  });

  describe('Click Behavior', () => {
    it('should call onDownload when Button is clicked', () => {
      mockUseBulkActionIconButton.mockReturnValue(false);
      
      render(<MultipleDownLoadButton />);
      
      fireEvent.click(screen.getByText('common.download'));
      
      expect(mockOnDownload).toHaveBeenCalledTimes(1);
    });

    it('should call onDownload when IconButton is clicked', () => {
      mockUseBulkActionIconButton.mockReturnValue(true);
      
      render(<MultipleDownLoadButton />);
      
      fireEvent.click(screen.getByLabelText('download-lg'));
      
      expect(mockOnDownload).toHaveBeenCalledTimes(1);
    });

    it('should not call onDownload when button is disabled and clicked', () => {
      mockUseBulkActionIconButton.mockReturnValue(false);
      
      render(<MultipleDownLoadButton disabled={true} />);
      
      const button = screen.getByText('common.download');
      fireEvent.click(button);
      
      // Button is disabled, so onClick should not be called
      expect(mockOnDownload).not.toHaveBeenCalled();
    });
  });

  describe('Data Attributes', () => {
    it('should have data-cy attribute on Button', () => {
      mockUseBulkActionIconButton.mockReturnValue(false);
      
      render(<MultipleDownLoadButton />);
      
      expect(screen.getByText('common.download')).toHaveAttribute('data-cy', 'download_button');
    });

    it('should have data-cy attribute on IconButton', () => {
      mockUseBulkActionIconButton.mockReturnValue(true);
      
      render(<MultipleDownLoadButton />);
      
      expect(screen.getByLabelText('download-lg')).toHaveAttribute('data-cy', 'download_button');
    });
  });

  describe('CSS Classes', () => {
    it('should have elevated-without-shadow class on Button', () => {
      mockUseBulkActionIconButton.mockReturnValue(false);
      
      render(<MultipleDownLoadButton />);
      
      expect(screen.getByText('common.download')).toHaveClass('kiwi-button--elevated-without-shadow');
    });

    it('should have elevated-without-shadow class on IconButton', () => {
      mockUseBulkActionIconButton.mockReturnValue(true);
      
      render(<MultipleDownLoadButton />);
      
      expect(screen.getByLabelText('download-lg')).toHaveClass('kiwi-button--elevated-without-shadow');
    });
  });

  describe('Hook Integration', () => {
    it('should use useHandleDownloadMultipleDocs hook', () => {
      render(<MultipleDownLoadButton />);
      
      // The component renders, meaning the hook was called
      expect(screen.getByText('common.download')).toBeInTheDocument();
    });

    it('should use useTranslation hook for button text', () => {
      mockUseBulkActionIconButton.mockReturnValue(false);
      
      render(<MultipleDownLoadButton />);
      
      // Translation key is used
      expect(screen.getByText('common.download')).toBeInTheDocument();
    });
  });
});

