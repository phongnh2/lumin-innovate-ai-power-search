import React from 'react';
import { mount, shallow } from 'enzyme';
import thunk from 'redux-thunk';
import { MemoryRouter } from 'react-router';
import configureMockStore from 'redux-mock-store';
import initialState from 'src/redux/initialState';
import PasswordModal from '../PasswordModal';
import { passwordHandlers } from '../../../helpers/passwordHandlers';

const { Provider } = jest.requireActual('react-redux');
const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);
const store = mockStore({
  ...initialState,
});

const setup = (props) => {
  const mergedProps = {
    ...props,
  };
  const shallowWrapper = shallow(
    <MemoryRouter>
      <Provider store={store}>
        <PasswordModal {...mergedProps} />
      </Provider>
    </MemoryRouter>,
  );
  const mountWrapper = mount(
    <MemoryRouter>
      <Provider store={store}>
        <PasswordModal {...mergedProps} />
      </Provider>
    </MemoryRouter>,
  );
  return { shallowWrapper, mountWrapper };
};

describe('<PasswordModal />', () => {
  describe('snapshots', () => {
    it('should match snapshot', () => {
      const { shallowWrapper, mountWrapper } = setup();
      expect(shallowWrapper).toMatchSnapshot();
      expect(mountWrapper).toMatchSnapshot();
    });
    it('have cancel button', () => {
      passwordHandlers.setCheckFn(jest.fn());
      passwordHandlers.setCancelFn(jest.fn());
      const { shallowWrapper, mountWrapper } = setup();
      expect(shallowWrapper).toMatchSnapshot();
      expect(mountWrapper).toMatchSnapshot();
    });
  });
});