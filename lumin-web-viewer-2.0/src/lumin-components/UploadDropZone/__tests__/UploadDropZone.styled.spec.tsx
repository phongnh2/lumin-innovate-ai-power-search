import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

import * as Styled from '../UploadDropZone.styled';

// Mock dependencies
jest.mock('constants/styles', () => ({
  Colors: {
    NEUTRAL_10: '#f5f5f5',
    PRIMARY: '#1976d2',
  },
}));

jest.mock('utils/styled', () => ({
  stretchChildren: '',
  stretchParent: '',
}));

describe('UploadDropZone.styled', () => {
  describe('Container', () => {
    it('is defined', () => {
      expect(Styled.Container).toBeDefined();
    });

    it('renders correctly', () => {
      render(<Styled.Container data-testid="container">Content</Styled.Container>);
      expect(screen.getByTestId('container')).toBeInTheDocument();
    });
  });

  describe('ContainerReskin', () => {
    it('is defined', () => {
      expect(Styled.ContainerReskin).toBeDefined();
    });

    it('renders correctly', () => {
      render(<Styled.ContainerReskin data-testid="container-reskin">Content</Styled.ContainerReskin>);
      expect(screen.getByTestId('container-reskin')).toBeInTheDocument();
    });
  });

  describe('PopperContainer', () => {
    it('is defined', () => {
      expect(Styled.PopperContainer).toBeDefined();
    });

    it('renders correctly', () => {
      render(<Styled.PopperContainer data-testid="popper-container">Content</Styled.PopperContainer>);
      expect(screen.getByTestId('popper-container')).toBeInTheDocument();
    });
  });

  describe('PopperItem', () => {
    it('is defined', () => {
      expect(Styled.PopperItem).toBeDefined();
    });

    it('renders correctly', () => {
      render(<Styled.PopperItem data-testid="popper-item">Content</Styled.PopperItem>);
      expect(screen.getByTestId('popper-item')).toBeInTheDocument();
    });

    it('renders with disablePadding', () => {
      render(<Styled.PopperItem data-testid="popper-item-no-padding" $disablePadding>Content</Styled.PopperItem>);
      expect(screen.getByTestId('popper-item-no-padding')).toBeInTheDocument();
    });

    it('renders with isDisabled', () => {
      render(<Styled.PopperItem data-testid="popper-item-disabled" $isDisabled>Content</Styled.PopperItem>);
      expect(screen.getByTestId('popper-item-disabled')).toBeInTheDocument();
    });

    it('renders without isDisabled', () => {
      render(<Styled.PopperItem data-testid="popper-item-enabled" $isDisabled={false}>Content</Styled.PopperItem>);
      expect(screen.getByTestId('popper-item-enabled')).toBeInTheDocument();
    });
  });

  describe('PopperText', () => {
    it('is defined', () => {
      expect(Styled.PopperText).toBeDefined();
    });

    it('renders correctly', () => {
      render(<Styled.PopperText data-testid="popper-text">Content</Styled.PopperText>);
      expect(screen.getByTestId('popper-text')).toBeInTheDocument();
    });
  });

  describe('PopperIcon', () => {
    it('is defined', () => {
      expect(Styled.PopperIcon).toBeDefined();
    });

    it('renders correctly', () => {
      render(<Styled.PopperIcon data-testid="popper-icon" src="test.svg" alt="test" />);
      expect(screen.getByTestId('popper-icon')).toBeInTheDocument();
    });
  });

  describe('MenuItemContainer', () => {
    it('is defined', () => {
      expect(Styled.MenuItemContainer).toBeDefined();
    });

    it('renders correctly', () => {
      render(<Styled.MenuItemContainer data-testid="menu-item-container">Content</Styled.MenuItemContainer>);
      expect(screen.getByTestId('menu-item-container')).toBeInTheDocument();
    });

    it('renders with isDisabled', () => {
      render(<Styled.MenuItemContainer data-testid="menu-container-disabled" $isDisabled>Content</Styled.MenuItemContainer>);
      expect(screen.getByTestId('menu-container-disabled')).toBeInTheDocument();
    });

    it('renders without isDisabled', () => {
      render(<Styled.MenuItemContainer data-testid="menu-container-enabled" $isDisabled={false}>Content</Styled.MenuItemContainer>);
      expect(screen.getByTestId('menu-container-enabled')).toBeInTheDocument();
    });
  });

  describe('IconWrapper', () => {
    it('is defined', () => {
      expect(Styled.IconWrapper).toBeDefined();
    });

    it('renders correctly', () => {
      render(<Styled.IconWrapper data-testid="icon-wrapper">Content</Styled.IconWrapper>);
      expect(screen.getByTestId('icon-wrapper')).toBeInTheDocument();
    });
  });

  describe('LeftLogoWrapper', () => {
    it('is defined', () => {
      expect(Styled.LeftLogoWrapper).toBeDefined();
    });

    it('renders correctly', () => {
      render(<Styled.LeftLogoWrapper data-testid="left-logo-wrapper">Content</Styled.LeftLogoWrapper>);
      expect(screen.getByTestId('left-logo-wrapper')).toBeInTheDocument();
    });
  });
});

