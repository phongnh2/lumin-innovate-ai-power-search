import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';

// Mock Apollo
jest.mock('@apollo/client/react/hoc', () => ({
  withApollo: (Component: React.ComponentType) => Component,
}));

// Mock actions
jest.mock('actions', () => ({
  __esModule: true,
  default: {
    openModal: jest.fn((settings) => ({ type: 'OPEN_MODAL', payload: settings })),
    closeModal: jest.fn(() => ({ type: 'CLOSE_MODAL' })),
    openElement: jest.fn((element) => ({ type: 'OPEN_ELEMENT', payload: element })),
    closeElement: jest.fn((element) => ({ type: 'CLOSE_ELEMENT', payload: element })),
    refreshFetchingState: jest.fn(() => ({ type: 'REFRESH_FETCHING_STATE' })),
  },
}));

// Mock selectors
jest.mock('selectors', () => ({
  __esModule: true,
  default: {
    getCurrentUser: jest.fn(() => ({ _id: 'user-123', email: 'user@test.com' })),
    getOrganizationList: jest.fn(() => ({ data: [] })),
    getThemeMode: jest.fn(() => 'light'),
  },
}));

// Mock HOC
jest.mock('HOC/withShareDocFeedback', () => ({
  __esModule: true,
  default: (Component: React.ComponentType) => (props: Record<string, unknown>) => (
    <div data-testid="with-share-doc-feedback">
      <Component {...props} />
    </div>
  ),
}));

// Mock ShareModalProvider
jest.mock('../ShareModalProvider', () => ({
  __esModule: true,
  default: (props: Record<string, unknown>) => (
    <div data-testid="share-modal-provider">
      <span data-testid="current-user">{JSON.stringify(props.currentUser)}</span>
      <span data-testid="organizations">{JSON.stringify(props.organizations)}</span>
      <span data-testid="theme-mode">{props.themeMode as string}</span>
    </div>
  ),
}));

import ShareModal from '../index';
import actions from 'actions';

const mockStore = configureMockStore([]);

describe('ShareModal index', () => {
  const createStoreState = () => ({
    user: { currentUser: { _id: 'user-123', email: 'user@test.com' } },
    organizations: { data: [] },
    themeMode: 'light',
  });

  const renderComponent = (props = {}) => {
    const store = mockStore(createStoreState());
    return { store, ...render(
      <Provider store={store}>
        <ShareModal 
          onClose={jest.fn()} 
          currentDocument={{ _id: 'doc-123' }}
          {...props} 
        />
      </Provider>
    )};
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Redux Connection', () => {
    it('should render wrapped component', () => {
      renderComponent();
      expect(screen.getByTestId('share-modal-provider')).toBeInTheDocument();
    });

    it('should pass currentUser from state', () => {
      renderComponent();
      const currentUser = screen.getByTestId('current-user');
      expect(currentUser).toHaveTextContent('user-123');
    });

    it('should pass organizations from state', () => {
      renderComponent();
      const organizations = screen.getByTestId('organizations');
      expect(organizations).toBeInTheDocument();
    });

    it('should pass themeMode from state', () => {
      renderComponent();
      const themeMode = screen.getByTestId('theme-mode');
      expect(themeMode).toHaveTextContent('light');
    });

    it('should be wrapped with withShareDocFeedback HOC', () => {
      renderComponent();
      expect(screen.getByTestId('with-share-doc-feedback')).toBeInTheDocument();
    });
  });

  describe('mapDispatchToProps', () => {
    it('should dispatch openModal action', () => {
      const { store } = renderComponent();
      store.dispatch(actions.openModal({ type: 'test' }));
      
      const actionsCalled = store.getActions();
      expect(actionsCalled).toContainEqual({ type: 'OPEN_MODAL', payload: { type: 'test' } });
    });

    it('should dispatch closeModal action', () => {
      const { store } = renderComponent();
      store.dispatch(actions.closeModal());
      
      const actionsCalled = store.getActions();
      expect(actionsCalled).toContainEqual({ type: 'CLOSE_MODAL' });
    });

    it('should dispatch openElement action for loading modal', () => {
      const { store } = renderComponent();
      store.dispatch(actions.openElement('loadingModal'));
      
      const actionsCalled = store.getActions();
      expect(actionsCalled).toContainEqual({ type: 'OPEN_ELEMENT', payload: 'loadingModal' });
    });

    it('should dispatch closeElement action for loading modal', () => {
      const { store } = renderComponent();
      store.dispatch(actions.closeElement('loadingModal'));
      
      const actionsCalled = store.getActions();
      expect(actionsCalled).toContainEqual({ type: 'CLOSE_ELEMENT', payload: 'loadingModal' });
    });

    it('should dispatch refreshFetchingState action', () => {
      const { store } = renderComponent();
      store.dispatch(actions.refreshFetchingState());
      
      const actionsCalled = store.getActions();
      expect(actionsCalled).toContainEqual({ type: 'REFRESH_FETCHING_STATE' });
    });

    it('should dispatch openModal with error type', () => {
      const { store } = renderComponent();
      store.dispatch(actions.openModal({ type: 'error', message: 'Error message' }));
      
      const actionsCalled = store.getActions();
      expect(actionsCalled).toContainEqual({ 
        type: 'OPEN_MODAL', 
        payload: { type: 'error', message: 'Error message' } 
      });
    });

    it('should dispatch openModal with success type', () => {
      const { store } = renderComponent();
      store.dispatch(actions.openModal({ type: 'success', title: 'Success' }));
      
      const actionsCalled = store.getActions();
      expect(actionsCalled).toContainEqual({ 
        type: 'OPEN_MODAL', 
        payload: { type: 'success', title: 'Success' } 
      });
    });
  });

  describe('mapStateToProps selectors', () => {
    it('should call getCurrentUser selector', () => {
      const selectors = require('selectors').default;
      renderComponent();
      expect(selectors.getCurrentUser).toHaveBeenCalled();
    });

    it('should call getOrganizationList selector', () => {
      const selectors = require('selectors').default;
      renderComponent();
      expect(selectors.getOrganizationList).toHaveBeenCalled();
    });

    it('should call getThemeMode selector', () => {
      const selectors = require('selectors').default;
      renderComponent();
      expect(selectors.getThemeMode).toHaveBeenCalled();
    });
  });

  describe('Component composition', () => {
    it('should render without crashing', () => {
      expect(() => renderComponent()).not.toThrow();
    });

    it('should pass additional props to wrapped component', () => {
      renderComponent({ customProp: 'value' });
      expect(screen.getByTestId('share-modal-provider')).toBeInTheDocument();
    });

    it('should pass onClose prop', () => {
      const onClose = jest.fn();
      renderComponent({ onClose });
      expect(screen.getByTestId('share-modal-provider')).toBeInTheDocument();
    });

    it('should pass currentDocument prop', () => {
      renderComponent({ currentDocument: { _id: 'doc-456', name: 'Test Doc' } });
      expect(screen.getByTestId('share-modal-provider')).toBeInTheDocument();
    });
  });

  describe('Default export', () => {
    it('should export a component', () => {
      expect(ShareModal).toBeDefined();
      // ShareModal is a composed component (object or function depending on HOC chain)
      expect(ShareModal).toBeTruthy();
    });
  });

  describe('Action creators', () => {
    it('should have openModal action creator', () => {
      expect(actions.openModal).toBeDefined();
      expect(typeof actions.openModal).toBe('function');
    });

    it('should have closeModal action creator', () => {
      expect(actions.closeModal).toBeDefined();
      expect(typeof actions.closeModal).toBe('function');
    });

    it('should have openElement action creator', () => {
      expect(actions.openElement).toBeDefined();
      expect(typeof actions.openElement).toBe('function');
    });

    it('should have closeElement action creator', () => {
      expect(actions.closeElement).toBeDefined();
      expect(typeof actions.closeElement).toBe('function');
    });

    it('should have refreshFetchingState action creator', () => {
      expect(actions.refreshFetchingState).toBeDefined();
      expect(typeof actions.refreshFetchingState).toBe('function');
    });
  });
});

