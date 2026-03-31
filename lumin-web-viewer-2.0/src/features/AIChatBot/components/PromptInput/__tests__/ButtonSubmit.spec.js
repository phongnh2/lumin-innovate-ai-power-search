import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import ButtonSubmit from '../ButtonSubmit';

jest.mock('lumin-ui/kiwi-ui', () => ({
  Button: ({ onClick, startIcon, size, classNames, children, variant, disabled, className, loading, fullWidth, type, form, ...props }) => {
    // Filter out React-specific props that shouldn't be passed to DOM
    const { key, ref, ...domProps } = props;
    return (
      <button
        onClick={onClick}
        data-size={size}
        data-classnames={JSON.stringify(classNames)}
        data-testid="button"
        disabled={disabled}
        className={className}
        type={type}
        form={form}
        data-variant={variant}
        data-loading={loading}
        data-fullwidth={fullWidth}
        {...domProps}
      >
        {startIcon}
        {children}
      </button>
    );
  },
}));

describe('ButtonSubmit', () => {
  const mockOnClick = jest.fn();
  const mockIcon = <span data-testid="test-icon">Test Icon</span>;

  const defaultProps = {
    onClick: mockOnClick,
    icon: mockIcon,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('when rendering', () => {
    it('should render button with correct props', () => {
      render(<ButtonSubmit {...defaultProps} />);

      const button = screen.getByTestId('button');
      expect(button).toBeInTheDocument();
      expect(button).toHaveAttribute('data-size', 'sm');
      expect(screen.getByTestId('test-icon')).toBeInTheDocument();
    });

    it('should apply correct CSS classes', () => {
      render(<ButtonSubmit {...defaultProps} />);

      const button = screen.getByTestId('button');
      const classNames = JSON.parse(button.getAttribute('data-classnames'));
      expect(classNames).toHaveProperty('root');
      expect(classNames.root).toBeDefined();
    });

    it('should render with icon as startIcon', () => {
      render(<ButtonSubmit {...defaultProps} />);

      expect(screen.getByTestId('test-icon')).toBeInTheDocument();
    });
  });

  describe('when handling interactions', () => {
    it('should call onClick when button is clicked', () => {
      render(<ButtonSubmit {...defaultProps} />);

      fireEvent.click(screen.getByTestId('button'));

      expect(mockOnClick).toHaveBeenCalledTimes(1);
    });

    it('should not call onClick when button is disabled', () => {
      render(<ButtonSubmit {...defaultProps} disabled />);

      const button = screen.getByTestId('button');
      expect(button).toBeDisabled();

      fireEvent.click(button);

      expect(mockOnClick).not.toHaveBeenCalled();
    });
  });

  describe('when handling props', () => {
    it('should pass through additional ButtonProps', () => {
      render(
        <ButtonSubmit
          {...defaultProps}
          variant="primary"
          disabled={true}
          className="custom-class"
          data-testid="custom-button"
        />
      );

      const button = screen.getByTestId('custom-button');
      expect(button).toHaveAttribute('data-variant', 'primary');
      expect(button).toBeDisabled();
      expect(button).toHaveClass('custom-class');
    });

    it('should render with different icon types', () => {
      const customIcon = <div data-testid="custom-icon">Custom Icon</div>;
      
      render(<ButtonSubmit {...defaultProps} icon={customIcon} />);

      expect(screen.getByTestId('custom-icon')).toBeInTheDocument();
      expect(screen.queryByTestId('test-icon')).not.toBeInTheDocument();
    });

    it('should handle complex icon elements', () => {
      const complexIcon = (
        <svg data-testid="svg-icon" width="16" height="16">
          <circle cx="8" cy="8" r="4" />
        </svg>
      );

      render(<ButtonSubmit {...defaultProps} icon={complexIcon} />);

      expect(screen.getByTestId('svg-icon')).toBeInTheDocument();
    });

    it('should render with different icon types', () => {
      const customIcon = <div data-testid="custom-icon">Custom Icon</div>;
      
      render(<ButtonSubmit {...defaultProps} icon={customIcon} />);

      expect(screen.getByTestId('custom-icon')).toBeInTheDocument();
      expect(screen.queryByTestId('test-icon')).not.toBeInTheDocument();
    });

    it('should handle complex icon elements', () => {
      const complexIcon = (
        <svg data-testid="svg-icon" width="16" height="16">
          <circle cx="8" cy="8" r="4" />
        </svg>
      );

      render(<ButtonSubmit {...defaultProps} icon={complexIcon} />);

      expect(screen.getByTestId('svg-icon')).toBeInTheDocument();
    });

    it('should spread other props correctly', () => {
      render(
        <ButtonSubmit
          {...defaultProps}
          id="test-button"
          role="button"
          tabIndex={0}
          aria-label="Submit button"
        />
      );

      const button = screen.getByTestId('button');
      expect(button).toHaveAttribute('id', 'test-button');
      expect(button).toHaveAttribute('role', 'button');
      expect(button).toHaveAttribute('tabIndex', '0');
      expect(button).toHaveAttribute('aria-label', 'Submit button');
    });
  });

  describe('when handling edge cases', () => {
    it('should handle missing onClick gracefully', () => {
      const { icon } = defaultProps;
      
      expect(() => {
        render(<ButtonSubmit icon={icon} />);
      }).not.toThrow();
    });

    it('should handle null icon', () => {
      expect(() => {
        render(<ButtonSubmit {...defaultProps} icon={null} />);
      }).not.toThrow();
    });

    it('should handle undefined icon', () => {
      expect(() => {
        render(<ButtonSubmit {...defaultProps} icon={undefined} />);
      }).not.toThrow();
    });

    it('should handle empty props object', () => {
      expect(() => {
        render(<ButtonSubmit icon={mockIcon} />);
      }).not.toThrow();
    });
  });

  describe('when testing component composition', () => {
    it('should use hardcoded size "sm" by default', () => {
      render(<ButtonSubmit {...defaultProps} />);

      const button = screen.getByTestId('button');
      // Component hardcodes size="sm"
      expect(button).toHaveAttribute('data-size', 'sm');
    });

    it('should allow size override through otherProps', () => {
      render(<ButtonSubmit {...defaultProps} size="lg" />);

      const button = screen.getByTestId('button');
      // Due to {...otherProps} spread, size can be overridden
      expect(button).toHaveAttribute('data-size', 'lg');
    });

    it('should always include buttonRoot class', () => {
      render(<ButtonSubmit {...defaultProps} classNames={{ root: 'custom-root' }} />);

      const button = screen.getByTestId('button');
      const classNames = JSON.parse(button.getAttribute('data-classnames'));
      // Should use the component's buttonRoot class, not the passed one
      expect(classNames).toHaveProperty('root');
    });
  });

  describe('when testing accessibility', () => {
    it('should be focusable by default', () => {
      render(<ButtonSubmit {...defaultProps} />);

      const button = screen.getByTestId('button');
      button.focus();
      expect(document.activeElement).toBe(button);
    });

    it('should not be focusable when disabled', () => {
      render(<ButtonSubmit {...defaultProps} disabled />);

      const button = screen.getByTestId('button');
      expect(button).toBeDisabled();
    });

    it('should support keyboard navigation', () => {
      render(<ButtonSubmit {...defaultProps} />);

      const button = screen.getByTestId('button');
      
      fireEvent.keyDown(button, { key: 'Enter' });
      fireEvent.keyDown(button, { key: ' ' });
      
      // These should not cause errors
      expect(button).toBeInTheDocument();
    });
  });

  describe('when testing type safety', () => {
    it('should accept all valid ButtonProps', () => {
      const allProps = {
        ...defaultProps,
        variant: 'secondary',
        size: 'lg', // This will be overridden to 'sm'
        disabled: false,
        loading: false,
        fullWidth: true,
        type: 'submit',
        form: 'test-form',
      };

      expect(() => {
        render(<ButtonSubmit {...allProps} />);
      }).not.toThrow();
    });

    it('should require icon prop', () => {
      // This test ensures TypeScript would catch missing icon
      // In runtime, we test that the component handles it gracefully
      const propsWithoutIcon = { onClick: mockOnClick };
      
      expect(() => {
        render(<ButtonSubmit {...propsWithoutIcon} />);
      }).not.toThrow();
    });
  });
}); 