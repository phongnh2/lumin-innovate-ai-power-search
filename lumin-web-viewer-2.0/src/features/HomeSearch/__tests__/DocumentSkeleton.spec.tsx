import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock lumin-ui
jest.mock('lumin-ui/kiwi-ui', () => ({
  Skeleton: ({ radius, width, height, className }: any) =>
    require('react').createElement('div', { 
      'data-testid': 'skeleton',
      'data-radius': radius,
      'data-width': width,
      'data-height': height,
      className,
    }),
}));

// Mock styles
jest.mock('../components/DocumentSkeleton/DocumentSkeleton.module.scss', () => ({
  container: 'container',
  infoContainer: 'infoContainer',
  info: 'info',
  status: 'status',
  storageCol: 'storageCol',
}));

// Import after mocks
import { DocumentSkeleton } from '../components/DocumentSkeleton';

describe('DocumentSkeleton', () => {
  describe('Rendering', () => {
    it('renders container', () => {
      const { container } = render(<DocumentSkeleton />);
      expect(container.firstChild).toHaveClass('container');
    });

    it('renders multiple skeletons', () => {
      render(<DocumentSkeleton />);
      const skeletons = screen.getAllByTestId('skeleton');
      expect(skeletons.length).toBeGreaterThan(0);
    });

    it('renders info container', () => {
      const { container } = render(<DocumentSkeleton />);
      expect(container.querySelector('.infoContainer')).toBeInTheDocument();
    });

    it('renders status section', () => {
      const { container } = render(<DocumentSkeleton />);
      expect(container.querySelector('.status')).toBeInTheDocument();
    });

    it('renders storage column skeleton', () => {
      const { container } = render(<DocumentSkeleton />);
      expect(container.querySelector('.storageCol')).toBeInTheDocument();
    });
  });

  describe('Skeleton props', () => {
    it('uses sm radius for skeletons', () => {
      render(<DocumentSkeleton />);
      const skeletons = screen.getAllByTestId('skeleton');
      skeletons.forEach(skeleton => {
        expect(skeleton).toHaveAttribute('data-radius', 'sm');
      });
    });
  });
});

