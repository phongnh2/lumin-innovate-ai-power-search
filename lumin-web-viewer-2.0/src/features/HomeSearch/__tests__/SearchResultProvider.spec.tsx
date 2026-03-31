import React, { useContext } from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';

import { SearchResultContext } from '../contexts';
import { ActionTypes } from '../reducers';
import SearchResultProvider from '../components/SearchResultProvider';

const TestConsumer = () => {
  const context = useContext(SearchResultContext);
  
  if (!context) {
    return <div data-testid="no-context">No context</div>;
  }

  const { state, dispatch } = context;

  const handleSetLoading = () => {
    dispatch({ type: ActionTypes.SET_LOADING, payload: { value: false } });
  };

  const handleSetSearchKey = () => {
    dispatch({ type: ActionTypes.SET_SEARCH_KEY, payload: { value: 'new search' } });
  };

  return (
    <div data-testid="context-consumer">
      <span data-testid="is-loading">{String(state.isLoading)}</span>
      <span data-testid="total">{state.total}</span>
      <span data-testid="search-key">{state.searchKey}</span>
      <span data-testid="folders-count">{state.folders.length}</span>
      <span data-testid="documents-count">{state.documents.length}</span>
      <button data-testid="set-loading" onClick={handleSetLoading}>Set Loading</button>
      <button data-testid="set-search-key" onClick={handleSetSearchKey}>Set Search Key</button>
    </div>
  );
};

describe('SearchResultProvider', () => {
  describe('Rendering', () => {
    it('renders children', () => {
      render(
        <SearchResultProvider>
          <div data-testid="child">Child content</div>
        </SearchResultProvider>
      );
      expect(screen.getByTestId('child')).toBeInTheDocument();
    });

    it('provides context to children', () => {
      render(
        <SearchResultProvider>
          <TestConsumer />
        </SearchResultProvider>
      );
      expect(screen.getByTestId('context-consumer')).toBeInTheDocument();
    });
  });

  describe('Initial state', () => {
    it('has isLoading true by default', () => {
      render(
        <SearchResultProvider>
          <TestConsumer />
        </SearchResultProvider>
      );
      expect(screen.getByTestId('is-loading')).toHaveTextContent('true');
    });

    it('has total 0 by default', () => {
      render(
        <SearchResultProvider>
          <TestConsumer />
        </SearchResultProvider>
      );
      expect(screen.getByTestId('total')).toHaveTextContent('0');
    });

    it('has empty searchKey by default', () => {
      render(
        <SearchResultProvider>
          <TestConsumer />
        </SearchResultProvider>
      );
      expect(screen.getByTestId('search-key')).toHaveTextContent('');
    });

    it('has empty folders by default', () => {
      render(
        <SearchResultProvider>
          <TestConsumer />
        </SearchResultProvider>
      );
      expect(screen.getByTestId('folders-count')).toHaveTextContent('0');
    });

    it('has empty documents by default', () => {
      render(
        <SearchResultProvider>
          <TestConsumer />
        </SearchResultProvider>
      );
      expect(screen.getByTestId('documents-count')).toHaveTextContent('0');
    });
  });

  describe('Dispatch actions', () => {
    it('can dispatch SET_LOADING action', () => {
      render(
        <SearchResultProvider>
          <TestConsumer />
        </SearchResultProvider>
      );

      expect(screen.getByTestId('is-loading')).toHaveTextContent('true');
      
      act(() => {
        fireEvent.click(screen.getByTestId('set-loading'));
      });

      expect(screen.getByTestId('is-loading')).toHaveTextContent('false');
    });

    it('can dispatch SET_SEARCH_KEY action', () => {
      render(
        <SearchResultProvider>
          <TestConsumer />
        </SearchResultProvider>
      );

      expect(screen.getByTestId('search-key')).toHaveTextContent('');
      
      act(() => {
        fireEvent.click(screen.getByTestId('set-search-key'));
      });

      expect(screen.getByTestId('search-key')).toHaveTextContent('new search');
    });
  });

  describe('Multiple consumers', () => {
    it('provides same state to multiple consumers', () => {
      render(
        <SearchResultProvider>
          <TestConsumer />
          <TestConsumer />
        </SearchResultProvider>
      );

      const loadingElements = screen.getAllByTestId('is-loading');
      expect(loadingElements).toHaveLength(2);
      expect(loadingElements[0]).toHaveTextContent('true');
      expect(loadingElements[1]).toHaveTextContent('true');
    });
  });
});

