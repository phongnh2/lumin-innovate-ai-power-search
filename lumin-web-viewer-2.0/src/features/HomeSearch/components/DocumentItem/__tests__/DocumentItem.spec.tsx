import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock classnames
jest.mock('classnames', () => (...args: any[]) => args.filter(a => typeof a === 'string').join(' '));

// Mock immer
jest.mock('immer', () => ({
  __esModule: true,
  default: (data: any, producer: any) => {
    const draft = { ...data };
    producer(draft);
    return draft;
  },
}));

// Mock lumin-ui/kiwi-ui
jest.mock('lumin-ui/kiwi-ui', () => ({
  Text: ({ children, ellipsis }: any) => require('react').createElement('span', { 'data-testid': 'text' }, children),
  Chip: ({ label }: any) => require('react').createElement('span', { 'data-testid': 'chip' }, label),
  ButtonSize: { sm: 'sm' },
  PlainTooltip: ({ children, content }: any) => require('react').createElement('div', { 'data-testid': 'tooltip' }, children),
}));

// Mock react-highlight-words
jest.mock('react-highlight-words', () => ({
  __esModule: true,
  default: ({ textToHighlight }: any) => require('react').createElement('span', { 'data-testid': 'highlighter' }, textToHighlight),
}));

// Mock lumin components
jest.mock('luminComponents/ReskinLayout/components/DocumentItemStar', () => ({
  DocumentItemStar: ({ document, isStarred }: any) =>
    require('react').createElement('button', { 'data-testid': 'star-btn', 'data-starred': String(isStarred) }),
}));
jest.mock('luminComponents/ReskinLayout/components/DocumentListItem/components', () => ({
  DocumentThumbnail: ({ altText, isNewUpload }: any) =>
    require('react').createElement('img', { 'data-testid': 'thumbnail', alt: altText, 'data-new-upload': String(isNewUpload) }),
}));
jest.mock('luminComponents/ReskinLayout/components/DocumentListItem/QuickActions', () => ({
  __esModule: true,
  default: ({ actions }: any) => require('react').createElement('div', { 'data-testid': 'quick-actions' }),
}));
jest.mock('luminComponents/SvgElement', () => ({
  __esModule: true,
  default: ({ content }: any) => require('react').createElement('div', { 'data-testid': 'svg-element', 'data-content': content }),
}));

// Mock hooks
jest.mock('hooks', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

// Mock utils
jest.mock('utils', () => ({
  dateUtil: { formatMDYTime: (ts: number) => '01/01/2024' },
  getFileService: { getThumbnailUrl: (url: string) => url },
}));

// Mock SearchResultContext
jest.mock('features/HomeSearch/contexts', () => ({
  SearchResultContext: require('react').createContext({ state: { searchKey: 'test' } }),
}));

// Mock BaseDocumentItem
jest.mock('features/DocumentList/components', () => ({
  DocumentItem: ({ children, document, isActivatedMoreActions, classNames }: any) => {
    const mockActions = { copyLink: jest.fn(), share: jest.fn(), makeACopy: jest.fn() };
    return require('react').createElement('div', { 'data-testid': 'base-document-item' },
      children({ renderHiddenElement: (v: any, h: any) => require('react').createElement('div', null, v, h), renderMoreActionsElement: (e: any) => e, actions: mockActions, isStarred: true })
    );
  },
  DocumentMoreActionsButton: ({ document }: any) =>
    require('react').createElement('button', { 'data-testid': 'more-actions-btn' }),
}));

// Mock constants
jest.mock('constants/lumin-common', () => ({
  StorageLogoMapping: { s3: 'lumin-logo', google: 'google-logo' },
}));

// Mock styles
jest.mock('../DocumentItem.module.scss', () => ({
  container: 'container',
  infoContainer: 'infoContainer',
  info: 'info',
  status: 'status',
  overTimeLimit: 'overTimeLimit',
  starWrapper: 'starWrapper',
  ownerColWrapper: 'ownerColWrapper',
  ownerCol: 'ownerCol',
  storageCol: 'storageCol',
  lastUpdatedCol: 'lastUpdatedCol',
}));

import DocumentItem from '../DocumentItem';

describe('HomeSearch DocumentItem', () => {
  const mockDocument = {
    _id: 'doc-123',
    name: 'test-document.pdf',
    thumbnail: 'thumb-url',
    listUserStar: ['user-123'],
    lastAccess: Date.now().toString(),
    ownerName: 'John Doe',
    service: 's3',
    isOverTimeLimit: false,
    newUpload: false,
  };

  const defaultProps = {
    document: mockDocument as any,
    refetchDocument: jest.fn(),
    openDocumentModal: jest.fn(),
    containerScrollRef: { current: document.createElement('div') } as any,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders base document item', () => {
      render(<DocumentItem {...defaultProps} />);
      expect(screen.getByTestId('base-document-item')).toBeInTheDocument();
    });

    it('renders document thumbnail', () => {
      render(<DocumentItem {...defaultProps} />);
      expect(screen.getByTestId('thumbnail')).toBeInTheDocument();
    });

    it('renders document name with highlighter', () => {
      render(<DocumentItem {...defaultProps} />);
      expect(screen.getByTestId('highlighter')).toHaveTextContent('test-document');
    });

    it('renders star button', () => {
      render(<DocumentItem {...defaultProps} />);
      expect(screen.getByTestId('star-btn')).toBeInTheDocument();
    });

    it('renders owner name', () => {
      render(<DocumentItem {...defaultProps} />);
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    it('renders storage logo', () => {
      render(<DocumentItem {...defaultProps} />);
      expect(screen.getByTestId('svg-element')).toBeInTheDocument();
    });

    it('renders quick actions', () => {
      render(<DocumentItem {...defaultProps} />);
      expect(screen.getByTestId('quick-actions')).toBeInTheDocument();
    });

    it('renders more actions button', () => {
      render(<DocumentItem {...defaultProps} />);
      expect(screen.getByTestId('more-actions-btn')).toBeInTheDocument();
    });
  });

  describe('Expired document', () => {
    it('shows expired chip when document is over time limit', () => {
      const doc = { ...mockDocument, isOverTimeLimit: true };
      render(<DocumentItem {...defaultProps} document={doc as any} />);
      expect(screen.getByTestId('chip')).toHaveTextContent('documentPage.expired');
    });

    it('does not show expired chip when document is not over time limit', () => {
      render(<DocumentItem {...defaultProps} />);
      expect(screen.queryByTestId('chip')).not.toBeInTheDocument();
    });
  });

  describe('Document name parsing', () => {
    it('extracts name without extension', () => {
      render(<DocumentItem {...defaultProps} />);
      expect(screen.getByTestId('highlighter')).toHaveTextContent('test-document');
    });

    it('handles file without extension', () => {
      const doc = { ...mockDocument, name: 'no-extension' };
      render(<DocumentItem {...defaultProps} document={doc as any} />);
      expect(screen.getByTestId('highlighter')).toHaveTextContent('no-extension');
    });
  });

  describe('Last access formatting', () => {
    it('formats last access date', () => {
      render(<DocumentItem {...defaultProps} />);
      expect(screen.getByText('01/01/2024')).toBeInTheDocument();
    });
  });
});

