import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

import MultipleMergeButton from '../MultipleMergeButton';

// Mock values
let mockEnabled = true;
let mockIsBulkActionIconButton = false;

jest.mock('hooks', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

jest.mock('../../../hooks/useEnabledMultipleMerge', () => ({
  useEnabledMultipleMerge: () => ({
    enabled: mockEnabled,
  }),
}));

jest.mock('features/WebChatBot/hooks/useBulkActionIconButton', () => ({
  useBulkActionIconButton: () => mockIsBulkActionIconButton,
}));

jest.mock('utils/Factory/EventCollection/constants/ButtonEvent', () => ({
  ButtonName: {
    MERGE: 'merge',
  },
}));

jest.mock('lumin-ui/kiwi-ui', () => ({
  PlainTooltip: ({
    children,
    content,
    disabled,
    position,
    maw,
  }: {
    children: React.ReactNode;
    content: string;
    disabled?: boolean;
    position?: string;
    maw?: number;
  }) => (
    <div data-testid="tooltip" data-content={content} data-disabled={disabled} data-position={position} data-maw={maw}>
      {children}
    </div>
  ),
  Button: ({
    children,
    variant,
    disabled,
    onClick,
    startIcon,
    className,
    'data-cy': dataCy,
    'data-lumin-btn-name': dataBtnName,
  }: {
    children: React.ReactNode;
    variant?: string;
    disabled?: boolean;
    onClick?: () => void;
    startIcon?: React.ReactNode;
    className?: string;
    'data-cy'?: string;
    'data-lumin-btn-name'?: string;
  }) => (
    <button
      data-testid="kiwi-button"
      data-variant={variant}
      disabled={disabled}
      onClick={onClick}
      className={className}
      data-cy={dataCy}
      data-lumin-btn-name={dataBtnName}
    >
      {startIcon}
      {children}
    </button>
  ),
  IconButton: ({
    disabled,
    icon,
    onClick,
    variant,
    className,
    'data-cy': dataCy,
    'data-lumin-btn-name': dataBtnName,
  }: {
    disabled?: boolean;
    icon?: React.ReactNode;
    onClick?: () => void;
    variant?: string;
    className?: string;
    'data-cy'?: string;
    'data-lumin-btn-name'?: string;
  }) => (
    <button
      data-testid="icon-button"
      data-variant={variant}
      disabled={disabled}
      onClick={onClick}
      className={className}
      data-cy={dataCy}
      data-lumin-btn-name={dataBtnName}
    >
      {icon}
    </button>
  ),
  Icomoon: ({ size, type, color }: { size: string; type: string; color: string }) => (
    <span data-testid="icomoon" data-size={size} data-type={type} data-color={color} />
  ),
}));

describe('MultipleMergeButton', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockEnabled = true;
    mockIsBulkActionIconButton = false;
  });

  describe('enabled branch', () => {
    it('should render null when enabled is false', () => {
      mockEnabled = false;

      const { container } = render(<MultipleMergeButton />);

      expect(container.firstChild).toBeNull();
    });

    it('should render button when enabled is true', () => {
      mockEnabled = true;

      render(<MultipleMergeButton />);

      expect(screen.getByTestId('tooltip')).toBeInTheDocument();
    });
  });

  describe('isBulkActionIconButton branch', () => {
    it('should render IconButton when isBulkActionIconButton is true', () => {
      mockIsBulkActionIconButton = true;

      render(<MultipleMergeButton />);

      expect(screen.getByTestId('icon-button')).toBeInTheDocument();
      expect(screen.queryByTestId('kiwi-button')).not.toBeInTheDocument();
    });

    it('should render KiwiButton when isBulkActionIconButton is false', () => {
      mockIsBulkActionIconButton = false;

      render(<MultipleMergeButton />);

      expect(screen.getByTestId('kiwi-button')).toBeInTheDocument();
      expect(screen.queryByTestId('icon-button')).not.toBeInTheDocument();
    });

    it('should render button text in KiwiButton', () => {
      mockIsBulkActionIconButton = false;

      render(<MultipleMergeButton />);

      expect(screen.getByText('action.merge')).toBeInTheDocument();
    });

    it('should not render button text in IconButton', () => {
      mockIsBulkActionIconButton = true;

      render(<MultipleMergeButton />);

      expect(screen.queryByText('action.merge')).not.toBeInTheDocument();
    });
  });

  describe('MultipleMergeIcon disabled color branch', () => {
    it('should render icon with secondary color when not disabled', () => {
      render(<MultipleMergeButton disabled={false} />);

      const icon = screen.getByTestId('icomoon');
      expect(icon).toHaveAttribute('data-color', 'var(--kiwi-colors-core-secondary)');
    });

    it('should render icon with disabled color when disabled', () => {
      render(<MultipleMergeButton disabled={true} />);

      const icon = screen.getByTestId('icomoon');
      expect(icon).toHaveAttribute('data-color', 'var(--kiwi-colors-custom-role-web-surface-var-background)');
    });

    it('should render icon with correct type and size', () => {
      render(<MultipleMergeButton />);

      const icon = screen.getByTestId('icomoon');
      expect(icon).toHaveAttribute('data-type', 'merge-md');
      expect(icon).toHaveAttribute('data-size', 'md');
    });
  });

  describe('props handling', () => {
    it('should pass tooltipContent to tooltip', () => {
      render(<MultipleMergeButton tooltipContent="Merge documents" />);

      const tooltip = screen.getByTestId('tooltip');
      expect(tooltip).toHaveAttribute('data-content', 'Merge documents');
    });

    it('should use empty string as default tooltipContent', () => {
      render(<MultipleMergeButton />);

      const tooltip = screen.getByTestId('tooltip');
      expect(tooltip).toHaveAttribute('data-content', '');
    });

    it('should pass disabled state to button', () => {
      mockIsBulkActionIconButton = false;

      render(<MultipleMergeButton disabled={true} />);

      const button = screen.getByTestId('kiwi-button');
      expect(button).toBeDisabled();
    });

    it('should pass disabled state to IconButton', () => {
      mockIsBulkActionIconButton = true;

      render(<MultipleMergeButton disabled={true} />);

      const button = screen.getByTestId('icon-button');
      expect(button).toBeDisabled();
    });

    it('should pass disableTooltipInteractive to tooltip', () => {
      render(<MultipleMergeButton disableTooltipInteractive={true} />);

      const tooltip = screen.getByTestId('tooltip');
      expect(tooltip).toHaveAttribute('data-disabled', 'true');
    });

    it('should call onMergeDocuments when button is clicked', () => {
      const mockOnMergeDocuments = jest.fn();
      mockIsBulkActionIconButton = false;

      render(<MultipleMergeButton onMergeDocuments={mockOnMergeDocuments} />);

      const button = screen.getByTestId('kiwi-button');
      fireEvent.click(button);

      expect(mockOnMergeDocuments).toHaveBeenCalledTimes(1);
    });

    it('should call onMergeDocuments when IconButton is clicked', () => {
      const mockOnMergeDocuments = jest.fn();
      mockIsBulkActionIconButton = true;

      render(<MultipleMergeButton onMergeDocuments={mockOnMergeDocuments} />);

      const button = screen.getByTestId('icon-button');
      fireEvent.click(button);

      expect(mockOnMergeDocuments).toHaveBeenCalledTimes(1);
    });
  });

  describe('button attributes', () => {
    it('should have correct data-cy attribute on KiwiButton', () => {
      mockIsBulkActionIconButton = false;

      render(<MultipleMergeButton />);

      const button = screen.getByTestId('kiwi-button');
      expect(button).toHaveAttribute('data-cy', 'merge_button');
    });

    it('should have correct data-cy attribute on IconButton', () => {
      mockIsBulkActionIconButton = true;

      render(<MultipleMergeButton />);

      const button = screen.getByTestId('icon-button');
      expect(button).toHaveAttribute('data-cy', 'merge_button');
    });

    it('should have correct data-lumin-btn-name attribute', () => {
      mockIsBulkActionIconButton = false;

      render(<MultipleMergeButton />);

      const button = screen.getByTestId('kiwi-button');
      expect(button).toHaveAttribute('data-lumin-btn-name', 'merge');
    });

    it('should have elevated variant on buttons', () => {
      mockIsBulkActionIconButton = false;

      render(<MultipleMergeButton />);

      const button = screen.getByTestId('kiwi-button');
      expect(button).toHaveAttribute('data-variant', 'elevated');
    });

    it('should have correct className on buttons', () => {
      mockIsBulkActionIconButton = false;

      render(<MultipleMergeButton />);

      const button = screen.getByTestId('kiwi-button');
      expect(button).toHaveClass('kiwi-button--elevated-without-shadow');
    });
  });

  describe('tooltip configuration', () => {
    it('should have correct tooltip position', () => {
      render(<MultipleMergeButton />);

      const tooltip = screen.getByTestId('tooltip');
      expect(tooltip).toHaveAttribute('data-position', 'top');
    });

    it('should have correct max width on tooltip', () => {
      render(<MultipleMergeButton />);

      const tooltip = screen.getByTestId('tooltip');
      expect(tooltip).toHaveAttribute('data-maw', '224');
    });
  });
});

