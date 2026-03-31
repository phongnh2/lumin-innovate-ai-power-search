/* eslint-disable react/prop-types */
import React from 'react';
import thunk from 'redux-thunk';
import merge from 'lodash/merge';
import configureMockStore from 'redux-mock-store';
import { mount, shallow } from 'enzyme';
import PropTypes from 'prop-types';

import initialState from 'src/redux/initialState';
import { useThemeProvider } from 'hooks';
import { ThemeProvider } from 'styled-components';
import { MemoryRouter } from 'react-router';

const DEFAULT_SETUP_OPTIONS = {
  router: {
    initialEntries: [],
  },
};

const { Provider } = jest.requireActual('react-redux');
const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);
const store = mockStore(initialState);

export const ThemeWrapper = ({ children }) => {
  const theme = useThemeProvider();
  return (
    <ThemeProvider theme={theme}>
      {children}
    </ThemeProvider>
  );
};

export const StoreProvider = (props) => {
  const { children, customStore, router } = props;
  const { initialEntries = [] } = router;
  const routerProps = initialEntries.length ? { initialEntries } : null;
  return (
    <Provider store={customStore || store}>
      <MemoryRouter {...routerProps}>
        <ThemeWrapper>
          {children}
        </ThemeWrapper>
      </MemoryRouter>
    </Provider>
  );
};

// INTERFACE
// const options = {
//   router: {
//     initialEntries: [],
//   },
//   customStore: null,
// };

export const setupMountProvider = (children, options = {}) => mount(children, {
  wrappingComponent: StoreProvider,
  wrappingComponentProps: merge(options, DEFAULT_SETUP_OPTIONS),
});

export const setupShallowProvider = (children, options = {}) => shallow(children, {
  wrappingComponent: StoreProvider,
  wrappingComponentProps: merge(options, DEFAULT_SETUP_OPTIONS),
});

StoreProvider.propTypes = {
  children: PropTypes.oneOfType([PropTypes.element, PropTypes.arrayOf(PropTypes.element)]),
  customStore: PropTypes.any,
  router: PropTypes.object,
};

StoreProvider.defaultProps = {
  children: null,
  customStore: null,
  router: {},
};
