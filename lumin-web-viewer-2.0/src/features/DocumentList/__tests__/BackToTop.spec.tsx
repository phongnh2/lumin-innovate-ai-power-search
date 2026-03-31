import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock hooks
jest.mock('hooks', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

// Mock lumin-ui
jest.mock('lumin-ui/kiwi-ui', () => ({
  Button: ({ children, onClick, startIcon, size, classNames }: any) => 
    require('react').createElement('button', { 
      'data-testid': 'back-to-top-button',
      'data-size': size,
      onClick 
    }, startIcon, children),
  Icomoon: ({ type, size }: any) => 
    require('react').createElement('span', { 'data-testid': `icon-${type}`, 'data-size': size }),
}));

// Mock lodash/throttle
jest.mock('lodash/throttle', () => (fn: any) => fn);

// Mock styles
jest.mock('../components/BackToTop/BackToTop.module.scss', () => ({
  container: 'container',
  show: 'show',
  button: 'button',
  label: 'label',
}));

import { BackToTop } from '../components/BackToTop';

describe('BackToTop', () => {
  const defaultProps = {
    onClick: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('Rendering', () => {
    it('renders button', () => {
      render(<BackToTop {...defaultProps} />);
      expect(screen.getByTestId('back-to-top-button')).toBeInTheDocument();
    });

    it('renders with correct label', () => {
      render(<BackToTop {...defaultProps} />);
      expect(screen.getByText('common.backToTop')).toBeInTheDocument();
    });

    it('renders arrow icon', () => {
      render(<BackToTop {...defaultProps} />);
      expect(screen.getByTestId('icon-arrow-narrow-up-lg')).toBeInTheDocument();
    });

    it('uses lg size button', () => {
      render(<BackToTop {...defaultProps} />);
      expect(screen.getByTestId('back-to-top-button')).toHaveAttribute('data-size', 'lg');
    });
  });

  describe('Click handler', () => {
    it('calls onClick when button clicked', () => {
      const onClick = jest.fn();
      render(<BackToTop {...defaultProps} onClick={onClick} />);
      
      fireEvent.click(screen.getByTestId('back-to-top-button'));
      
      expect(onClick).toHaveBeenCalledTimes(1);
    });
  });

  describe('Scroll behavior', () => {
    it('attaches scroll listener to scrollerRef', () => {
      const scrollerRef = document.createElement('div');
      const addEventListenerSpy = jest.spyOn(scrollerRef, 'addEventListener');
      
      render(<BackToTop {...defaultProps} scrollerRef={scrollerRef} />);
      
      expect(addEventListenerSpy).toHaveBeenCalledWith('scroll', expect.any(Function), { passive: true });
    });

    it('removes scroll listener on unmount', () => {
      const scrollerRef = document.createElement('div');
      const removeEventListenerSpy = jest.spyOn(scrollerRef, 'removeEventListener');
      
      const { unmount } = render(<BackToTop {...defaultProps} scrollerRef={scrollerRef} />);
      unmount();
      
      expect(removeEventListenerSpy).toHaveBeenCalledWith('scroll', expect.any(Function));
    });

    it('does not attach listener when scrollerRef is undefined', () => {
      render(<BackToTop {...defaultProps} />);
      // Should not throw
      expect(screen.getByTestId('back-to-top-button')).toBeInTheDocument();
    });
  });

  describe('Custom classNames', () => {
    it('applies custom container className', () => {
      const { container } = render(
        <BackToTop {...defaultProps} classNames={{ container: 'custom-container' }} />
      );
      
      const containerElement = container.firstChild;
      expect(containerElement).toHaveClass('custom-container');
    });
  });

  describe('Visibility', () => {
    it('shows button when scrolling up', () => {
      const scrollerRef = document.createElement('div');
      Object.defineProperty(scrollerRef, 'scrollTop', { value: 100, writable: true });
      
      const { container } = render(<BackToTop {...defaultProps} scrollerRef={scrollerRef} />);
      
      // Simulate initial scroll down
      act(() => {
        Object.defineProperty(scrollerRef, 'scrollTop', { value: 200, writable: true });
        fireEvent.scroll(scrollerRef);
      });

      // Simulate scroll up
      act(() => {
        Object.defineProperty(scrollerRef, 'scrollTop', { value: 100, writable: true });
        fireEvent.scroll(scrollerRef);
      });

      const containerElement = container.firstChild;
      expect(containerElement).toHaveClass('show');
    });

    it('hides button automatically after timeout', () => {
      const scrollerRef = document.createElement('div');
      Object.defineProperty(scrollerRef, 'scrollTop', { value: 100, writable: true });
      
      const { container } = render(<BackToTop {...defaultProps} scrollerRef={scrollerRef} />);
      
      // Simulate scroll up to show button
      act(() => {
        Object.defineProperty(scrollerRef, 'scrollTop', { value: 200, writable: true });
        fireEvent.scroll(scrollerRef);
      });
      act(() => {
        Object.defineProperty(scrollerRef, 'scrollTop', { value: 100, writable: true });
        fireEvent.scroll(scrollerRef);
      });

      // Wait for auto-hide timeout
      act(() => {
        jest.advanceTimersByTime(5000);
      });

      const containerElement = container.firstChild;
      expect(containerElement).not.toHaveClass('show');
    });
  });

  describe('Memoization', () => {
    it('is wrapped in React.memo', () => {
      expect(BackToTop.$$typeof?.toString()).toContain('Symbol');
    });
  });
});

