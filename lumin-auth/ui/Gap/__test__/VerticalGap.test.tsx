import { render, screen } from '@testing-library/react';
import React from 'react';

import VerticalGap from '../VerticalGap';

describe('VerticalGap', () => {
  describe('Basic Rendering', () => {
    it('should render children correctly', () => {
      render(
        <VerticalGap>
          <div>Child 1</div>
          <div>Child 2</div>
        </VerticalGap>
      );

      expect(screen.getByText('Child 1')).toBeInTheDocument();
      expect(screen.getByText('Child 2')).toBeInTheDocument();
    });

    it('should render with default props', () => {
      const { container } = render(
        <VerticalGap>
          <div>Test child</div>
        </VerticalGap>
      );

      const gapDiv = container.firstChild as HTMLElement;
      expect(gapDiv).toHaveStyle({
        gap: '4px', // default level 1 * BASE_GAP_SIZE(4)
        display: 'grid',
        width: 'initial'
      });
    });
  });

  describe('Level Prop', () => {
    it('should apply correct gap size based on level prop', () => {
      const { container } = render(
        <VerticalGap level={3}>
          <div>Test child</div>
        </VerticalGap>
      );

      const gapDiv = container.firstChild as HTMLElement;
      expect(gapDiv).toHaveStyle({
        gap: '12px' // level 3 * BASE_GAP_SIZE(4) = 12px
      });
    });

    it('should handle large level values', () => {
      const { container } = render(
        <VerticalGap level={10}>
          <div>Test child</div>
        </VerticalGap>
      );

      const gapDiv = container.firstChild as HTMLElement;
      expect(gapDiv).toHaveStyle({
        gap: '40px' // level 10 * BASE_GAP_SIZE(4) = 40px
      });
    });
  });

  describe('FullWidth Prop', () => {
    it('should apply full width when fullWidth is true', () => {
      const { container } = render(
        <VerticalGap fullWidth>
          <div>Test child</div>
        </VerticalGap>
      );

      const gapDiv = container.firstChild as HTMLElement;
      expect(gapDiv).toHaveStyle({
        width: '100%'
      });
    });

    it('should not apply full width when fullWidth is false', () => {
      const { container } = render(
        <VerticalGap fullWidth={false}>
          <div>Test child</div>
        </VerticalGap>
      );

      const gapDiv = container.firstChild as HTMLElement;
      expect(gapDiv).toHaveStyle({
        width: 'initial'
      });
    });

    it('should default to initial width when fullWidth is not provided', () => {
      const { container } = render(
        <VerticalGap>
          <div>Test child</div>
        </VerticalGap>
      );

      const gapDiv = container.firstChild as HTMLElement;
      expect(gapDiv).toHaveStyle({
        width: 'initial'
      });
    });
  });

  describe('Other Props', () => {
    it('should pass through other HTML attributes', () => {
      const { container } = render(
        <VerticalGap data-testid='custom-gap' className='custom-class'>
          <div>Test child</div>
        </VerticalGap>
      );

      const gapDiv = container.firstChild as HTMLElement;
      expect(gapDiv).toHaveAttribute('data-testid', 'custom-gap');
      expect(gapDiv).toHaveClass('custom-class');
    });
  });

  describe('Combined Props', () => {
    it('should handle multiple props together', () => {
      const { container } = render(
        <VerticalGap level={5} fullWidth data-testid='combined-gap' className='combined-class'>
          <div>Child 1</div>
          <div>Child 2</div>
          <div>Child 3</div>
        </VerticalGap>
      );

      const gapDiv = container.firstChild as HTMLElement;
      expect(gapDiv).toHaveStyle({
        gap: '20px', // level 5 * BASE_GAP_SIZE(4) = 20px
        display: 'grid',
        width: '100%'
      });
      expect(gapDiv).toHaveAttribute('data-testid', 'combined-gap');
      expect(gapDiv).toHaveClass('combined-class');

      // Verify all children are rendered
      expect(screen.getByText('Child 1')).toBeInTheDocument();
      expect(screen.getByText('Child 2')).toBeInTheDocument();
      expect(screen.getByText('Child 3')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle no children', () => {
      const { container } = render(<VerticalGap>{}</VerticalGap>);

      const gapDiv = container.firstChild as HTMLElement;
      expect(gapDiv).toHaveStyle({
        gap: '4px',
        display: 'grid',
        width: 'initial'
      });
      expect(gapDiv).toBeEmptyDOMElement();
    });

    it('should handle single child', () => {
      render(
        <VerticalGap>
          <div>Single child</div>
        </VerticalGap>
      );

      expect(screen.getByText('Single child')).toBeInTheDocument();
    });

    it('should handle negative level values', () => {
      const { container } = render(
        <VerticalGap level={-2}>
          <div>Test child</div>
        </VerticalGap>
      );

      const gapDiv = container.firstChild as HTMLElement;
      expect(gapDiv).toHaveStyle({
        gap: '-8px' // level -2 * BASE_GAP_SIZE(4) = -8px
      });
    });
  });
});
