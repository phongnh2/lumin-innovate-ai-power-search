import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';

jest.mock('luminComponents/ButtonMaterial', () => {
  const React = require('react');
  return React.forwardRef(({ children, ...props }: React.PropsWithChildren<object>, ref: React.Ref<HTMLButtonElement>) =>
    React.createElement('button', { ...props, ref }, children)
  );
});

jest.mock('constants/styles', () => ({
  Colors: {
    NEUTRAL_20: '#e0e0e0',
  },
}));

jest.mock('utils/styles/mediaQuery', () => ({
  mediaQuery: {
    md: (strings: TemplateStringsArray) => `@media (min-width: 768px) { ${strings.join('')} }`,
  },
}));

import * as Styled from 'luminComponents/TransferDocument/components/Footer/Footer.styled';

describe('Footer.styled', () => {
  describe('FooterContainer', () => {
    it('should render correctly', () => {
      const { container } = render(<Styled.FooterContainer>Content</Styled.FooterContainer>);
      expect(container.firstChild).toBeInTheDocument();
    });

    it('should have flex display', () => {
      const { container } = render(<Styled.FooterContainer>Content</Styled.FooterContainer>);
      expect(container.firstChild).toHaveStyle('display: flex');
    });

    it('should have justify-content flex-end', () => {
      const { container } = render(<Styled.FooterContainer>Content</Styled.FooterContainer>);
      expect(container.firstChild).toHaveStyle('justify-content: flex-end');
    });

    it('should have gap', () => {
      const { container } = render(<Styled.FooterContainer>Content</Styled.FooterContainer>);
      expect(container.firstChild).toHaveStyle('gap: 16px');
    });

    it('should have padding', () => {
      const { container } = render(<Styled.FooterContainer>Content</Styled.FooterContainer>);
      expect(container.firstChild).toHaveStyle('padding: 12px 16px');
    });
  });

  describe('FooterContainerReskin', () => {
    it('should render correctly', () => {
      const { container } = render(<Styled.FooterContainerReskin>Content</Styled.FooterContainerReskin>);
      expect(container.firstChild).toBeInTheDocument();
    });

    it('should have flex display', () => {
      const { container } = render(<Styled.FooterContainerReskin>Content</Styled.FooterContainerReskin>);
      expect(container.firstChild).toHaveStyle('display: flex');
    });

    it('should have justify-content flex-end', () => {
      const { container } = render(<Styled.FooterContainerReskin>Content</Styled.FooterContainerReskin>);
      expect(container.firstChild).toHaveStyle('justify-content: flex-end');
    });
  });

  describe('Button', () => {
    it('should render correctly', () => {
      const { container } = render(<Styled.Button>Click me</Styled.Button>);
      expect(container.querySelector('button')).toBeInTheDocument();
    });

    it('should have padding style', () => {
      const { container } = render(<Styled.Button>Click me</Styled.Button>);
      expect(container.querySelector('button')).toHaveStyle('padding: 0 61px');
    });
  });
});

