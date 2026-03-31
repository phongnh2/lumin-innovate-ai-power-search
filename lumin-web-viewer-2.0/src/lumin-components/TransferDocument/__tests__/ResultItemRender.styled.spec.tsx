import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

// Import styled components directly
import * as Styled from 'luminComponents/TransferDocument/components/ResultItemRender/ResultItemRender.styled';

// Mock dependencies
jest.mock('lumin-components/Shared/Tabs', () => ({
  __esModule: true,
  default: ({ children }: any) => require('react').createElement('div', { 'data-testid': 'tabs' }, children),
}));

jest.mock('constants/styles', () => ({
  Colors: {
    NEUTRAL_20: '#e0e0e0',
    NEUTRAL_60: '#666',
    NEUTRAL_100: '#000',
    PRIMARY_20: '#e3f2fd',
  },
  Fonts: {
    PRIMARY: 'Roboto, sans-serif',
  },
  Shadows: {
    SHADOW_XS: '0 1px 2px rgba(0,0,0,0.1)',
  },
}));

describe('ResultItemRender.styled', () => {
  describe('Container', () => {
    it('is a styled component', () => {
      expect(Styled.Container).toBeDefined();
    });

    it('renders', () => {
      render(<Styled.Container data-testid="container">Content</Styled.Container>);
      expect(screen.getByTestId('container')).toBeInTheDocument();
    });
  });

  describe('HeaderContainer', () => {
    it('is a styled component', () => {
      expect(Styled.HeaderContainer).toBeDefined();
    });

    it('renders', () => {
      render(<Styled.HeaderContainer data-testid="header-container">Content</Styled.HeaderContainer>);
      expect(screen.getByTestId('header-container')).toBeInTheDocument();
    });
  });

  describe('Tabs', () => {
    it('is a styled component', () => {
      expect(Styled.Tabs).toBeDefined();
    });
  });

  describe('Divider', () => {
    it('is a styled component', () => {
      expect(Styled.Divider).toBeDefined();
    });

    it('renders', () => {
      render(<Styled.Divider data-testid="divider" />);
      expect(screen.getByTestId('divider')).toBeInTheDocument();
    });

    it('renders with $empty=true', () => {
      render(<Styled.Divider data-testid="divider-empty" $empty={true} />);
      expect(screen.getByTestId('divider-empty')).toBeInTheDocument();
    });

    it('renders with $empty=false', () => {
      render(<Styled.Divider data-testid="divider-not-empty" $empty={false} />);
      expect(screen.getByTestId('divider-not-empty')).toBeInTheDocument();
    });
  });

  describe('ResultList', () => {
    it('is a styled component', () => {
      expect(Styled.ResultList).toBeDefined();
    });

    it('renders', () => {
      render(<Styled.ResultList data-testid="result-list">Content</Styled.ResultList>);
      expect(screen.getByTestId('result-list')).toBeInTheDocument();
    });
  });

  describe('ResultItem', () => {
    it('is a styled component', () => {
      expect(Styled.ResultItem).toBeDefined();
    });

    it('renders', () => {
      render(<Styled.ResultItem data-testid="result-item">Content</Styled.ResultItem>);
      expect(screen.getByTestId('result-item')).toBeInTheDocument();
    });

    it('renders with isActive=true', () => {
      render(<Styled.ResultItem data-testid="result-item-active" isActive={true}>Content</Styled.ResultItem>);
      expect(screen.getByTestId('result-item-active')).toBeInTheDocument();
    });

    it('renders with isActive=false', () => {
      render(<Styled.ResultItem data-testid="result-item-inactive" isActive={false}>Content</Styled.ResultItem>);
      expect(screen.getByTestId('result-item-inactive')).toBeInTheDocument();
    });
  });

  describe('Text', () => {
    it('is a styled component', () => {
      expect(Styled.Text).toBeDefined();
    });

    it('renders', () => {
      render(<Styled.Text data-testid="text">Content</Styled.Text>);
      expect(screen.getByTestId('text')).toBeInTheDocument();
    });
  });

  describe('Title', () => {
    it('is a styled component', () => {
      expect(Styled.Title).toBeDefined();
    });

    it('renders', () => {
      render(<Styled.Title data-testid="title">Content</Styled.Title>);
      expect(screen.getByTestId('title')).toBeInTheDocument();
    });

    it('renders with hasPadding=true', () => {
      render(<Styled.Title data-testid="title-padding" hasPadding={true}>Content</Styled.Title>);
      expect(screen.getByTestId('title-padding')).toBeInTheDocument();
    });

    it('renders with hasPadding=false', () => {
      render(<Styled.Title data-testid="title-no-padding" hasPadding={false}>Content</Styled.Title>);
      expect(screen.getByTestId('title-no-padding')).toBeInTheDocument();
    });
  });

  describe('IconContainer', () => {
    it('is a styled component', () => {
      expect(Styled.IconContainer).toBeDefined();
    });

    it('renders', () => {
      render(<Styled.IconContainer data-testid="icon-container">Content</Styled.IconContainer>);
      expect(screen.getByTestId('icon-container')).toBeInTheDocument();
    });
  });

  describe('IconFolder', () => {
    it('is a styled component', () => {
      expect(Styled.IconFolder).toBeDefined();
    });

    it('renders', () => {
      render(<Styled.IconFolder data-testid="icon-folder" src="test.svg" alt="folder" />);
      expect(screen.getByTestId('icon-folder')).toBeInTheDocument();
    });
  });
});

