import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock lumin-ui
jest.mock('lumin-ui/kiwi-ui', () => ({
  IconButton: ({ onClick, icon, size, className, ...props }: {
    onClick?: () => void;
    icon?: string;
    size?: string;
    className?: string;
  }) => (
    <button
      data-testid="icon-button"
      data-icon={icon}
      data-size={size}
      className={className}
      onClick={onClick}
      {...props}
    >
      Back
    </button>
  ),
  PlainTooltip: ({ content, children }: { content?: string; children?: React.ReactNode }) => (
    <span data-testid="tooltip" data-content={content}>
      {children}
    </span>
  ),
}));

// Mock hooks
jest.mock('hooks', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

// Mock styles
jest.mock('../ShareModal.module.scss', () => ({
  backButton: 'backButton',
}));

import BackButton from '../components/BackButton';

describe('BackButton', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render IconButton', () => {
      render(<BackButton />);
      expect(screen.getByTestId('icon-button')).toBeInTheDocument();
    });

    it('should render with PlainTooltip', () => {
      render(<BackButton />);
      expect(screen.getByTestId('tooltip')).toBeInTheDocument();
    });

    it('should have correct icon', () => {
      render(<BackButton />);
      expect(screen.getByTestId('icon-button')).toHaveAttribute('data-icon', 'ph-arrow-left');
    });

    it('should have lg size', () => {
      render(<BackButton />);
      expect(screen.getByTestId('icon-button')).toHaveAttribute('data-size', 'lg');
    });

    it('should have backButton class', () => {
      render(<BackButton />);
      expect(screen.getByTestId('icon-button')).toHaveClass('backButton');
    });
  });

  describe('Tooltip', () => {
    it('should show default tooltip when no custom tooltip provided', () => {
      render(<BackButton />);
      expect(screen.getByTestId('tooltip')).toHaveAttribute('data-content', 'modalShare.backToShareModal');
    });

    it('should show custom tooltip when provided', () => {
      render(<BackButton tooltip="Custom tooltip" />);
      expect(screen.getByTestId('tooltip')).toHaveAttribute('data-content', 'Custom tooltip');
    });
  });

  describe('Click Handler', () => {
    it('should call onClick when clicked', () => {
      const mockOnClick = jest.fn();
      render(<BackButton onClick={mockOnClick} />);
      
      fireEvent.click(screen.getByTestId('icon-button'));
      
      expect(mockOnClick).toHaveBeenCalledTimes(1);
    });
  });

  describe('Props Forwarding', () => {
    it('should forward additional props to IconButton', () => {
      render(<BackButton data-custom="test-value" />);
      expect(screen.getByTestId('icon-button')).toHaveAttribute('data-custom', 'test-value');
    });
  });
});

