import React from 'react';
import { shallow, mount } from 'enzyme';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk'
import configureMockStore from 'redux-mock-store';
import * as Redux from 'react-redux';
import { MemoryRouter } from 'react-router';
import initialState from 'src/redux/initialState';
import * as freeTrialExpire from 'constants/freeTrialExpire';
import StartTrialModal from '../StartTrialModal';
import { setupMountProvider } from 'helpers/jestTesting'

beforeEach(() => {
  jest.resetModules();
});

const setup = (props) => shallow(<StartTrialModal {...props} />);

describe('<StartTrialModal />', () => {
  const defaultProps = {
    history: { replace: jest.fn(), push: jest.fn() },
    currentUser: {},
    setCurrentUser: jest.fn(),
  };
  const middleware = [thunk]
  const mockStore = configureMockStore(middleware);
  const store = mockStore(initialState);

  const setup = (props) => {
    const mergedProps = { ...defaultProps, ...props };
    const wrapper = shallow(
      <MemoryRouter>
        <Provider store={store}>
          <StartTrialModal {...mergedProps} />
        </Provider>
      </MemoryRouter>
    );
    const instance = mount(
      <MemoryRouter>
        <Provider store={store}>
          <StartTrialModal {...mergedProps} />
        </Provider>
      </MemoryRouter>
    );
    return { wrapper, instance };
  }

  describe('render component', () => {
    jest.mock('@mui/material/useMediaQuery', () => jest.fn().mockReturnValue(false));
    it('should match snapshot', () => {
      const { wrapper } = setup();
      expect(wrapper).toMatchSnapshot();
    });

    it('should match can not use FREETRIAL', () => {
      const newProps = {
        expires: { FREE_TRIAL_30: { status: freeTrialExpire.CANNOT_USE_FREE_TRIAL } },
      };
      const wrapper = setupMountProvider(
        <MemoryRouter>
          <StartTrialModal {...newProps} />
        </MemoryRouter>
      );
      expect(wrapper).toMatchSnapshot();
    });

    it('no status', () => {
      const newProps = {
        expires: { FREE_TRIAL_30: { status: 0 } },
      };
      const wrapper = setupMountProvider(
        <MemoryRouter>
          <StartTrialModal {...newProps} />
        </MemoryRouter>
      );
      expect(wrapper).toMatchSnapshot();
    });
  });

  // describe('click button', () => {
  //   it('render click cancel', () => {
  //     const { wrapper } = setup();
  //     wrapper.find('.StartTrialModal__btn-cancel').at(0).simulate('click');
  //     expect(wrapper).toMatchSnapshot();
  //   });
  // });
});
