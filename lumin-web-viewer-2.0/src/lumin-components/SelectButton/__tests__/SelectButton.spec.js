import React from 'react';
import * as ReactRedux from 'react-redux';
import core from 'core';

import { shallow } from 'enzyme';
import configureMockStore from 'redux-mock-store';
import Button from 'lumin-components/ViewerCommon/ButtonLumin';
import SelectButton from '../SelectButton';

const { Provider } = jest.requireActual('react-redux');
const mockStore = configureMockStore();
const store = mockStore({});

jest.mock('core', () => ({
  setToolMode: jest.fn(),
}));

core.getFormFieldCreationManager = jest.fn(() => ({
  isInFormFieldCreationMode: jest.fn().mockReturnValue(false)
}))

core.getToolMode = jest.fn(() => ({
  name: ''
}));

describe('SelectButton', () => {
  const props = {
    isActive: true,
    icon: '',
    title: '',
    toolName: '',
  };
  const spy = jest
    .spyOn(ReactRedux, 'useSelector')
    .mockImplementation(() => '');

  it('render SelectButton', () => {
    const wrapper = shallow(
      <Provider store={store}>
        <SelectButton {...props} />
      </Provider>,
    );
    expect(wrapper).toMatchSnapshot();
    spy.mockRestore();
  });

  it('render SelectButton on click simulate', () => {
    const wrapper = shallow(
      <SelectButton {...props} />,
    );
    wrapper.find(Button).simulate('click');
    expect(wrapper).toMatchSnapshot();
  });
});
