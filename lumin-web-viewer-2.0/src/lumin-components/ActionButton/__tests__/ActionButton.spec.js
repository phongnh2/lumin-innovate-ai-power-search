import React from 'react';
import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import { shallow } from 'enzyme';

const mockStore = configureMockStore();
const store = mockStore({});

import ActionButton from '../ActionButton';

describe('ActionButton', () => {
  it('snapshot renders', () => {
    const wrapper = shallow(
      <Provider store={store}>
        <ActionButton />
      </Provider>
    );
    expect(wrapper).toMatchSnapshot();
  });
  it('click button', () => {
    const clickMocked = jest.fn();
    const wrapper = shallow(
      <Provider store={store}>
        <ActionButton onClick={clickMocked} />
      </Provider>
    );
    wrapper.find(ActionButton).simulate('click');

    expect(clickMocked).toBeCalled();
  });
});

