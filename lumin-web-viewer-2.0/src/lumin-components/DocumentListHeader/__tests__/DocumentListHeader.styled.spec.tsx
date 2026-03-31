import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';

import * as Styled from '../DocumentListHeader.styled';

// Mock media query
jest.mock('utils/styles/mediaQuery', () => ({
  mediaQuery: {
    md: (strings: any) => strings[0] || '',
    xl: (strings: any) => strings[0] || '',
  },
}));

// Mock constants
jest.mock('constants/styles', () => ({
  Colors: {
    NEUTRAL_80: '#333',
    SECONDARY_50: '#007bff',
  },
}));

// Mock lumin-components imports
jest.mock('lumin-components/DocumentItem/components/DocumentListItem/DocumentListItem.styled', () => ({
  LAST_OPENED_CELL_WIDTH: '120px',
  STORAGE_CELL_WIDTH: '100px',
}));

describe('DocumentListHeader.styled', () => {
  describe('Container', () => {
    it('renders with default props', () => {
      const { container } = render(<Styled.Container>Content</Styled.Container>);
      expect(container.firstChild).toBeInTheDocument();
    });

    it('renders with isEmpty true', () => {
      const { container } = render(<Styled.Container $isEmpty={true}>Content</Styled.Container>);
      expect(container.firstChild).toBeInTheDocument();
    });

    it('renders with isEmpty false', () => {
      const { container } = render(<Styled.Container $isEmpty={false}>Content</Styled.Container>);
      expect(container.firstChild).toBeInTheDocument();
    });

    it('renders with isSelecting', () => {
      const { container } = render(<Styled.Container $isSelecting={true}>Content</Styled.Container>);
      expect(container.firstChild).toBeInTheDocument();
    });

    it('renders with isGridLayout', () => {
      const { container } = render(<Styled.Container $isGridLayout={true}>Content</Styled.Container>);
      expect(container.firstChild).toBeInTheDocument();
    });
  });

  describe('ContainerReskin', () => {
    it('renders with default props', () => {
      const { container } = render(<Styled.ContainerReskin>Content</Styled.ContainerReskin>);
      expect(container.firstChild).toBeInTheDocument();
    });

    it('renders with isEmpty true', () => {
      const { container } = render(<Styled.ContainerReskin $isEmpty={true}>Content</Styled.ContainerReskin>);
      expect(container.firstChild).toBeInTheDocument();
    });

    it('renders with isSelecting', () => {
      const { container } = render(<Styled.ContainerReskin $isSelecting={true}>Content</Styled.ContainerReskin>);
      expect(container.firstChild).toBeInTheDocument();
    });

    it('renders with isPersonalDocumentsRoute', () => {
      const { container } = render(<Styled.ContainerReskin $isPersonalDocumentsRoute={true}>Content</Styled.ContainerReskin>);
      expect(container.firstChild).toBeInTheDocument();
    });
  });

  describe('Title', () => {
    it('renders correctly', () => {
      const { container } = render(<Styled.Title>Title</Styled.Title>);
      expect(container.firstChild).toBeInTheDocument();
      expect(container.firstChild).toHaveTextContent('Title');
    });
  });

  describe('TitleReskin', () => {
    it('renders correctly', () => {
      const { container } = render(<Styled.TitleReskin>Title</Styled.TitleReskin>);
      expect(container.firstChild).toBeInTheDocument();
    });
  });

  describe('TitleTablet', () => {
    it('renders correctly', () => {
      const { container } = render(<Styled.TitleTablet>Tablet Title</Styled.TitleTablet>);
      expect(container.firstChild).toBeInTheDocument();
    });

    it('renders with display prop true', () => {
      const { container } = render(<Styled.TitleTablet $display={true}>Tablet</Styled.TitleTablet>);
      expect(container.firstChild).toBeInTheDocument();
    });

    it('renders with display prop false', () => {
      const { container } = render(<Styled.TitleTablet $display={false}>Tablet</Styled.TitleTablet>);
      expect(container.firstChild).toBeInTheDocument();
    });
  });

  describe('TitleTabletReskin', () => {
    it('renders correctly', () => {
      const { container } = render(<Styled.TitleTabletReskin>Tablet Title</Styled.TitleTabletReskin>);
      expect(container.firstChild).toBeInTheDocument();
    });

    it('renders with display prop', () => {
      const { container } = render(<Styled.TitleTabletReskin $display={true}>Tablet</Styled.TitleTabletReskin>);
      expect(container.firstChild).toBeInTheDocument();
    });
  });

  describe('UploadedTitle', () => {
    it('renders correctly', () => {
      const { container } = render(<Styled.UploadedTitle>Uploaded</Styled.UploadedTitle>);
      expect(container.firstChild).toBeInTheDocument();
    });
  });

  describe('UploadedTitleReskin', () => {
    it('renders correctly', () => {
      const { container } = render(<Styled.UploadedTitleReskin>Uploaded</Styled.UploadedTitleReskin>);
      expect(container.firstChild).toBeInTheDocument();
    });
  });

  describe('DisplayTablet', () => {
    it('renders correctly', () => {
      const { container } = render(<Styled.DisplayTablet>Display</Styled.DisplayTablet>);
      expect(container.firstChild).toBeInTheDocument();
    });
  });

  describe('OwnerTitle', () => {
    it('renders correctly', () => {
      const { container } = render(<Styled.OwnerTitle>Owner</Styled.OwnerTitle>);
      expect(container.firstChild).toBeInTheDocument();
    });

    it('renders with filterable prop', () => {
      const { container } = render(<Styled.OwnerTitle $filterable={true}>Owner</Styled.OwnerTitle>);
      expect(container.firstChild).toBeInTheDocument();
    });
  });

  describe('OwnerTitleReskin', () => {
    it('renders correctly', () => {
      const { container } = render(<Styled.OwnerTitleReskin>Owner</Styled.OwnerTitleReskin>);
      expect(container.firstChild).toBeInTheDocument();
    });

    it('renders with filterable prop', () => {
      const { container } = render(<Styled.OwnerTitleReskin $filterable={true}>Owner</Styled.OwnerTitleReskin>);
      expect(container.firstChild).toBeInTheDocument();
    });
  });

  describe('SelectDocument', () => {
    it('renders correctly', () => {
      const { container } = render(<Styled.SelectDocument>Select</Styled.SelectDocument>);
      expect(container.firstChild).toBeInTheDocument();
    });
  });

  describe('SelectDocumentReskin', () => {
    it('renders correctly', () => {
      const { container } = render(<Styled.SelectDocumentReskin>Select</Styled.SelectDocumentReskin>);
      expect(container.firstChild).toBeInTheDocument();
    });
  });

  describe('MobileDisplay', () => {
    it('renders correctly', () => {
      const { container } = render(<Styled.MobileDisplay>Mobile</Styled.MobileDisplay>);
      expect(container.firstChild).toBeInTheDocument();
    });
  });
});

