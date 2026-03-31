/* eslint-disable global-require */
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import initialStateApp from '../redux/initialState';

let configureMockStore = () => {};
let shallow = () => {};
let mount = () => {};
if (process.env.NODE_ENV === 'test') {
  const enzyme = require('enzyme');
  shallow = enzyme.shallow;
  mount = enzyme.mount;
  configureMockStore = require('redux-mock-store').default;
}

const middlewares = [thunk];

export function renderWithRedux(ui, { initialState } = {}) {
  const mockStore = configureMockStore(middlewares);
  const store = mockStore({ ...initialStateApp, ...initialState });
  const utils = {
    dispatch(action) {
      return store.dispatch(action);
    },
    getDispatchedActions() {
      return store.getActions();
    },
    getState() {
      return store.getState();
    },
  };

  const wrapper = shallow(ui, {
    wrappingComponent: Provider,
    wrappingComponentProps: { store },
  });
  const instance = mount(ui, {
    wrappingComponent: Provider,
    wrappingComponentProps: { store },
  });

  return {
    wrapper,
    instance,
    ...utils,
  };
}

export function mockStore(state) {
  const mockStore = configureMockStore(middlewares);
  return mockStore({ ...initialStateApp, ...state });
}
