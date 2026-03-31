import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

// Must use global object for hoisted mocks
const mockStateRef = { current: { folders: [] as any[], documents: [] as any[], isLoading: false, total: 0 } };

jest.mock('lumin-ui/kiwi-ui', () => ({
  ScrollArea: ({ children }: any) => require('react').createElement('div', { 'data-testid': 'scroll-area' }, children),
  Skeleton: () => require('react').createElement('div', { 'data-testid': 'skeleton' }),
}));

jest.mock('luminComponents/DefaultSearchView', () => ({ DEFAULT_SEARCH_VIEW_TYPE: { HOME: 'home' } }));
jest.mock('luminComponents/ReskinLayout/components/DefaultSearchView', () => ({
  DefaultSearchView: () => require('react').createElement('div', { 'data-testid': 'default-search-view' }),
}));
jest.mock('luminComponents/ReskinLayout/components/EmptySearchResult', () => ({
  EmptySearchResult: () => require('react').createElement('div', { 'data-testid': 'empty-search-result' }),
}));
jest.mock('HOC/withDropDocPopup', () => ({ __esModule: true, default: { Provider: (C: any) => C } }));
jest.mock('hooks', () => ({ useTranslation: () => ({ t: (k: string) => k }) }));
jest.mock('../hooks/useGetOrganizationResources', () => ({ useGetOrganizationResources: () => ({ refetch: jest.fn(), getMore: jest.fn() }) }));
jest.mock('../hooks/useGetOrganizationResourcesSubscription', () => ({ useGetOrganizationResourcesSubscription: () => ({ handleListSubscription: jest.fn() }) }));

// Create context with getter function to use current mockStateRef
jest.mock('../contexts', () => {
  const React = require('react');
  const context = React.createContext({ state: { folders: [], documents: [], isLoading: false, total: 0 }, dispatch: jest.fn() });
  return { SearchResultContext: context };
});

jest.mock('../components/SearchResultProvider', () => ({
  __esModule: true,
  default: ({ children }: any) => {
    const React = require('react');
    const { SearchResultContext } = require('../contexts');
    // Use a ref to get current state
    const getState = () => (global as any).__mockSearchResultState || { folders: [], documents: [], isLoading: false, total: 0 };
    return React.createElement(SearchResultContext.Provider, { value: { state: getState(), dispatch: jest.fn() } }, children);
  },
}));

jest.mock('features/DocumentList/components', () => ({
  DocumentList: ({ documents, renderItem, elements }: any) => require('react').createElement('div', { 'data-testid': 'document-list' },
    documents?.map((item: any, idx: number) => require('react').createElement('div', { key: idx }, renderItem(idx, item, jest.fn(), jest.fn(), jest.fn()))),
    elements?.headerElement
  ),
}));
jest.mock('../components/DocumentItem', () => ({ DocumentItem: () => require('react').createElement('div', { 'data-testid': 'document-item' }) }));
jest.mock('../components/FolderItem', () => ({ FolderItem: () => require('react').createElement('div', { 'data-testid': 'folder-item' }) }));
jest.mock('../components/DocumentListHeader', () => ({ DocumentListHeader: () => require('react').createElement('div', { 'data-testid': 'header' }) }));
jest.mock('../components/DocumentSkeleton', () => ({ DocumentSkeleton: () => require('react').createElement('div', { 'data-testid': 'doc-skeleton' }) }));
jest.mock('../types', () => ({ ListItemKinds: { FOLDER: 'folder', DOCUMENT: 'document' } }));
jest.mock('../components/SearchResult/SearchResult.module.scss', () => ({}));

import SearchResult from '../components/SearchResult/SearchResult';

const setMockState = (state: any) => {
  (global as any).__mockSearchResultState = state;
};

describe('SearchResult', () => {
  beforeEach(() => {
    setMockState({ folders: [], documents: [], isLoading: false, total: 0 });
  });

  it('renders default search view when searchKey is empty', () => {
    render(<SearchResult searchKey="" />);
    expect(screen.getByTestId('default-search-view')).toBeInTheDocument();
  });

  it('renders empty search result when no data', () => {
    render(<SearchResult searchKey="test" />);
    expect(screen.getByTestId('empty-search-result')).toBeInTheDocument();
  });

  it('renders skeleton when loading', () => {
    setMockState({ folders: [], documents: [], isLoading: true, total: 0 });
    render(<SearchResult searchKey="test" />);
    expect(screen.getByTestId('skeleton')).toBeInTheDocument();
  });

  it('renders document list with results', () => {
    setMockState({ folders: [{ _id: 'f1', name: 'F1' }], documents: [{ _id: 'd1', name: 'D1' }], isLoading: false, total: 2 });
    render(<SearchResult searchKey="test" />);
    expect(screen.getByTestId('document-list')).toBeInTheDocument();
  });

  it('renders folder items', () => {
    setMockState({ folders: [{ _id: 'f1', name: 'F1' }], documents: [], isLoading: false, total: 1 });
    render(<SearchResult searchKey="test" />);
    expect(screen.getByTestId('folder-item')).toBeInTheDocument();
  });

  it('renders document items', () => {
    setMockState({ folders: [], documents: [{ _id: 'd1', name: 'D1' }], isLoading: false, total: 1 });
    render(<SearchResult searchKey="test" />);
    expect(screen.getByTestId('document-item')).toBeInTheDocument();
  });

  it('renders total results', () => {
    setMockState({ folders: [], documents: [{ _id: 'd1', name: 'D1' }], isLoading: false, total: 5 });
    render(<SearchResult searchKey="test" />);
    expect(screen.getByText(/5/)).toBeInTheDocument();
  });

  it('renders header', () => {
    setMockState({ folders: [], documents: [{ _id: 'd1', name: 'D1' }], isLoading: false, total: 1 });
    render(<SearchResult searchKey="test" />);
    expect(screen.getByTestId('header')).toBeInTheDocument();
  });

  it('renders scroll area', () => {
    setMockState({ folders: [], documents: [{ _id: 'd1', name: 'D1' }], isLoading: false, total: 1 });
    render(<SearchResult searchKey="test" />);
    expect(screen.getByTestId('scroll-area')).toBeInTheDocument();
  });
});

