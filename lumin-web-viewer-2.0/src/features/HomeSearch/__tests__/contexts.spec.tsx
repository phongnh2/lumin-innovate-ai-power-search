import React, { useContext } from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

import { SearchResultContext } from '../contexts';
import { initialState, ActionTypes } from '../reducers';

const TestConsumer = () => {
  const context = useContext(SearchResultContext);
  
  if (!context) {
    return <div data-testid="no-context">No context</div>;
  }

  return (
    <div data-testid="context-consumer">
      <span data-testid="is-loading">{String(context.state.isLoading)}</span>
      <span data-testid="total">{context.state.total}</span>
      <span data-testid="has-dispatch">{String(typeof context.dispatch === 'function')}</span>
    </div>
  );
};

describe('SearchResultContext', () => {
  describe('Default value', () => {
    it('is undefined by default', () => {
      render(<TestConsumer />);
      expect(screen.getByTestId('no-context')).toBeInTheDocument();
    });
  });

  describe('Provider', () => {
    it('provides state and dispatch', () => {
      const mockDispatch = jest.fn();
      
      render(
        <SearchResultContext.Provider value={{ state: initialState, dispatch: mockDispatch }}>
          <TestConsumer />
        </SearchResultContext.Provider>
      );

      expect(screen.getByTestId('context-consumer')).toBeInTheDocument();
      expect(screen.getByTestId('is-loading')).toHaveTextContent('true');
      expect(screen.getByTestId('total')).toHaveTextContent('0');
      expect(screen.getByTestId('has-dispatch')).toHaveTextContent('true');
    });

    it('provides custom state values', () => {
      const customState = {
        ...initialState,
        isLoading: false,
        total: 42,
        searchKey: 'test query',
      };
      const mockDispatch = jest.fn();
      
      render(
        <SearchResultContext.Provider value={{ state: customState, dispatch: mockDispatch }}>
          <TestConsumer />
        </SearchResultContext.Provider>
      );

      expect(screen.getByTestId('is-loading')).toHaveTextContent('false');
      expect(screen.getByTestId('total')).toHaveTextContent('42');
    });
  });

  describe('Export', () => {
    it('exports SearchResultContext', () => {
      expect(SearchResultContext).toBeDefined();
    });

    it('has Provider', () => {
      expect(SearchResultContext.Provider).toBeDefined();
    });

    it('has Consumer', () => {
      expect(SearchResultContext.Consumer).toBeDefined();
    });
  });
});

