import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock lumin-ui
jest.mock('lumin-ui/kiwi-ui', () => ({
  Paper: ({ children, shadow, radius, className }: {
    children: React.ReactNode;
    shadow?: string;
    radius?: string;
    className?: string;
  }) => (
    <div 
      data-testid="paper" 
      data-shadow={shadow} 
      data-radius={radius}
      className={className}
    >
      {children}
    </div>
  ),
}));

// Mock hooks
let mockIsEnableReskin = true;

jest.mock('hooks', () => ({
  useEnableWebReskin: () => ({ isEnableReskin: mockIsEnableReskin }),
}));

// Mock ThemeProvider
jest.mock('theme-providers', () => ({
  __esModule: true,
  default: {
    RequestAccessList: ({ children }: { children: React.ReactNode }) => (
      <div data-testid="theme-provider-request-access-list">{children}</div>
    ),
  },
}));

// Mock styled components
jest.mock('../components/FullRequestList/FullRequestList.styled', () => ({
  Container: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="styled-container">{children}</div>
  ),
  Header: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="styled-header">{children}</div>
  ),
}));

// Mock styles
jest.mock('../components/FullRequestList/FullRequestList.module.scss', () => ({
  container: 'container-class',
}));

import FullRequestList from '../components/FullRequestList/FullRequestList';

describe('FullRequestList', () => {
  const mockCloseFullList = jest.fn();
  const mockTitleComponent = <span data-testid="title-component">Title</span>;
  const mockChildren = <div data-testid="children-content">Children Content</div>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockIsEnableReskin = true;
  });

  const renderComponent = () => {
    return render(
      <FullRequestList closeFullList={mockCloseFullList} titleComponent={mockTitleComponent}>
        {mockChildren}
      </FullRequestList>
    );
  };

  describe('Reskin Version', () => {
    beforeEach(() => {
      mockIsEnableReskin = true;
    });

    it('should render Paper component', () => {
      renderComponent();
      expect(screen.getByTestId('paper')).toBeInTheDocument();
    });

    it('should render Paper with lg shadow', () => {
      renderComponent();
      expect(screen.getByTestId('paper')).toHaveAttribute('data-shadow', 'lg');
    });

    it('should render Paper with lg radius', () => {
      renderComponent();
      expect(screen.getByTestId('paper')).toHaveAttribute('data-radius', 'lg');
    });

    it('should render Paper with container class', () => {
      renderComponent();
      expect(screen.getByTestId('paper')).toHaveClass('container-class');
    });

    it('should render title component', () => {
      renderComponent();
      expect(screen.getByTestId('title-component')).toBeInTheDocument();
    });

    it('should render children', () => {
      renderComponent();
      expect(screen.getByTestId('children-content')).toBeInTheDocument();
    });

    it('should not render ThemeProvider', () => {
      renderComponent();
      expect(screen.queryByTestId('theme-provider-request-access-list')).not.toBeInTheDocument();
    });
  });

  describe('Non-Reskin Version', () => {
    beforeEach(() => {
      mockIsEnableReskin = false;
    });

    it('should render ThemeProvider.RequestAccessList', () => {
      renderComponent();
      expect(screen.getByTestId('theme-provider-request-access-list')).toBeInTheDocument();
    });

    it('should render styled Container', () => {
      renderComponent();
      expect(screen.getByTestId('styled-container')).toBeInTheDocument();
    });

    it('should render styled Header', () => {
      renderComponent();
      expect(screen.getByTestId('styled-header')).toBeInTheDocument();
    });

    it('should render title component inside Header', () => {
      renderComponent();
      const header = screen.getByTestId('styled-header');
      expect(header).toContainElement(screen.getByTestId('title-component'));
    });

    it('should render children inside Container', () => {
      renderComponent();
      const container = screen.getByTestId('styled-container');
      expect(container).toContainElement(screen.getByTestId('children-content'));
    });

    it('should not render Paper component', () => {
      renderComponent();
      expect(screen.queryByTestId('paper')).not.toBeInTheDocument();
    });
  });
});

