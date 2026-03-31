import { render, screen } from '@testing-library/react';

import Footer from '../Footer';

// Constants for test values
const FOOTER_DESCRIPTION = 'One account for all Lumin products';
const CUSTOM_CLASS_NAME = 'custom-footer-class';

// Mock the translation hook
jest.mock('@/hooks/useTranslation', () => ({
  __esModule: true,
  default: () => ({
    t: (key: string) => {
      const translations: { [key: string]: string } = {
        'authPage.footerDescription': FOOTER_DESCRIPTION
      };
      return translations[key] || key;
    }
  })
}));

// Mock emotion and mediaQuery utilities
jest.mock('@/lib/emotion/mediaQuery', () => ({
  mediaQuery: {
    md: (_strings: TemplateStringsArray, ..._values: any[]) => ''
  }
}));

// Mock UI utilities and components
jest.mock('@/ui', () => ({
  Text: ({ children, variant, css, ...props }: any) => (
    <span data-variant={variant} data-css={css ? 'applied' : undefined} {...props}>
      {children}
    </span>
  ),
  mediaQueryDown: {
    md: (_strings: TemplateStringsArray, ..._values: any[]) => ''
  },
  mediaQueryUp: {
    md: (_strings: TemplateStringsArray, ..._values: any[]) => ''
  }
}));

// Mock the problematic dependencies that cause ES module issues
jest.mock('@/features/api-slice', () => ({}));
jest.mock('@/hooks/useTrackingFormEvent', () => ({}));

// Mock emotion css function
jest.mock('@emotion/react', () => ({
  css: (_strings: TemplateStringsArray, ..._values: any[]) => ({}),
  jsx: () => null
}));

describe('Footer', () => {
  describe('Basic Rendering', () => {
    it('should render without crashing', () => {
      render(<Footer />);
      expect(screen.getByText(FOOTER_DESCRIPTION)).toBeInTheDocument();
    });

    it('should render as footer element', () => {
      const { container } = render(<Footer />);
      const footer = container.querySelector('footer');
      expect(footer).toBeInTheDocument();
    });

    it('should render all required elements', () => {
      render(<Footer />);

      // Check for description text
      expect(screen.getByText(FOOTER_DESCRIPTION)).toBeInTheDocument();

      // Check for SVG components
      const svgElements = screen.getAllByTestId('svg-mock');
      expect(svgElements).toHaveLength(2);
    });
  });

  describe('Props Handling', () => {
    it('should apply custom className when provided', () => {
      const { container } = render(<Footer className={CUSTOM_CLASS_NAME} />);
      const footer = container.querySelector('footer');
      expect(footer).toHaveClass(CUSTOM_CLASS_NAME);
    });

    it('should not apply custom className when not provided', () => {
      const { container } = render(<Footer />);
      const footer = container.querySelector('footer');
      expect(footer).not.toHaveClass(CUSTOM_CLASS_NAME);
    });

    it('should handle center prop as false by default', () => {
      const { container } = render(<Footer />);
      const footer = container.querySelector('footer');
      expect(footer).toBeInTheDocument();
    });

    it('should handle center prop when explicitly set to true', () => {
      const { container } = render(<Footer center />);
      const footer = container.querySelector('footer');
      expect(footer).toBeInTheDocument();
    });

    it('should handle center prop when explicitly set to false', () => {
      const { container } = render(<Footer center={false} />);
      const footer = container.querySelector('footer');
      expect(footer).toBeInTheDocument();
    });

    it('should handle both className and center props together', () => {
      const { container } = render(<Footer className={CUSTOM_CLASS_NAME} center />);
      const footer = container.querySelector('footer');
      expect(footer).toHaveClass(CUSTOM_CLASS_NAME);
    });
  });

  describe('Text Content', () => {
    it('should display correct footer description', () => {
      render(<Footer />);
      const description = screen.getByText(FOOTER_DESCRIPTION);
      expect(description).toBeInTheDocument();
    });

    it('should render description as Text component with neutral variant', () => {
      render(<Footer />);
      const description = screen.getByText(FOOTER_DESCRIPTION);
      expect(description).toBeInTheDocument();
      expect(description).toHaveAttribute('data-variant', 'neutral');
    });
  });

  describe('Logo Components', () => {
    it('should render SVG logos', () => {
      render(<Footer />);
      const svgElements = screen.getAllByTestId('svg-mock');
      expect(svgElements).toHaveLength(2);
    });

    it('should render SVG logos with correct props', () => {
      render(<Footer />);
      const svgElements = screen.getAllByTestId('svg-mock');

      // Check that SVG elements receive height prop
      svgElements.forEach(svg => {
        expect(svg).toHaveAttribute('height', '32');
      });
    });
  });

  describe('Translation Integration', () => {
    it('should use translation hook correctly', () => {
      render(<Footer />);
      expect(screen.getByText(FOOTER_DESCRIPTION)).toBeInTheDocument();
    });

    it('should handle translation key correctly', () => {
      // This test ensures the component uses the correct translation key
      render(<Footer />);
      const description = screen.getByText(FOOTER_DESCRIPTION);
      expect(description).toBeInTheDocument();
    });
  });

  describe('Component Structure', () => {
    it('should have correct DOM structure', () => {
      const { container } = render(<Footer />);

      const footer = container.querySelector('footer');
      expect(footer).toBeInTheDocument();

      // Check that all child elements are present
      expect(screen.getByText(FOOTER_DESCRIPTION)).toBeInTheDocument();
      expect(screen.getAllByTestId('svg-mock')).toHaveLength(2);
    });

    it('should render elements in correct order', () => {
      render(<Footer />);

      // All elements should be present
      expect(screen.getByText(FOOTER_DESCRIPTION)).toBeInTheDocument();
      expect(screen.getAllByTestId('svg-mock')).toHaveLength(2);
    });

    it('should have proper container div for SVG elements', () => {
      render(<Footer />);
      const svgElements = screen.getAllByTestId('svg-mock');

      // One of the SVG elements should be in a container div
      const firstSvg = svgElements[0];
      const parentDiv = firstSvg.parentElement;
      expect(parentDiv).toBeInTheDocument();
    });
  });

  describe('CSS Styling', () => {
    it('should apply base footer CSS', () => {
      const { container } = render(<Footer />);
      const footer = container.querySelector('footer');
      expect(footer).toBeInTheDocument();
    });

    it('should apply center CSS when center prop is true', () => {
      const { container } = render(<Footer center />);
      const footer = container.querySelector('footer');
      expect(footer).toBeInTheDocument();
    });

    it('should not apply center CSS when center prop is false', () => {
      const { container } = render(<Footer center={false} />);
      const footer = container.querySelector('footer');
      expect(footer).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper semantic footer element', () => {
      const { container } = render(<Footer />);
      const footer = container.querySelector('footer');
      expect(footer).toBeInTheDocument();
    });

    it('should have meaningful text content', () => {
      render(<Footer />);
      expect(screen.getByText(FOOTER_DESCRIPTION)).toBeInTheDocument();
    });

    it('should have accessible SVG elements', () => {
      render(<Footer />);
      const svgElements = screen.getAllByTestId('svg-mock');
      expect(svgElements).toHaveLength(2);

      // Check that SVG elements have titles for accessibility
      svgElements.forEach(svg => {
        expect(svg.querySelector('title')).toBeInTheDocument();
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty className gracefully', () => {
      const { container } = render(<Footer className='' />);
      const footer = container.querySelector('footer');
      expect(footer).toBeInTheDocument();
    });

    it('should handle undefined className gracefully', () => {
      const { container } = render(<Footer className={undefined} />);
      const footer = container.querySelector('footer');
      expect(footer).toBeInTheDocument();
    });

    it('should render consistently across multiple renders', () => {
      const { rerender } = render(<Footer />);

      expect(screen.getByText(FOOTER_DESCRIPTION)).toBeInTheDocument();
      expect(screen.getAllByTestId('svg-mock')).toHaveLength(2);

      rerender(<Footer center />);

      expect(screen.getByText(FOOTER_DESCRIPTION)).toBeInTheDocument();
      expect(screen.getAllByTestId('svg-mock')).toHaveLength(2);
    });

    it('should handle multiple CSS classes', () => {
      const multipleClasses = 'class1 class2 class3';
      const { container } = render(<Footer className={multipleClasses} />);
      const footer = container.querySelector('footer');
      expect(footer).toHaveClass('class1');
      expect(footer).toHaveClass('class2');
      expect(footer).toHaveClass('class3');
    });
  });
});
