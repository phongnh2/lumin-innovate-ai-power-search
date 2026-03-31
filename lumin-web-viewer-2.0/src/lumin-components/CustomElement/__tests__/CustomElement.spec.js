import React from 'react';
import { mount } from 'enzyme';
import * as ReactRedux from 'react-redux';
import configureMockStore from 'redux-mock-store';
import CustomElement from '../CustomElement';

// const { Provider } = jest.requireActual('react-redux');
const mockStore = configureMockStore();
const state = {
  viewer: {
    themeMode: 'light'
  }
}
const store = mockStore(state);

// jest.mock('react-redux', () => ({ useSelector: jest.fn().mockReturnValue([]), useDispatch: jest.fn() }));

describe('<CustomElement />', () => {
  const props = {
    className: 'CustomElement',
    dataElement: '',
    display: '',
    title: 'title',
    render: jest.fn(),
    mediaQueryClassName: '',
    isDisabled: false,
  };
  const spy = jest
    .spyOn(ReactRedux, 'useSelector')
    .mockImplementation(() => '');
  it('snapshot render', () => {
    const wrapper = mount(
      <ReactRedux.Provider store={store}>
        <CustomElement {...props} />
      </ReactRedux.Provider>,
    );
    expect(wrapper).toMatchSnapshot();
    spy.mockRestore();
  });

  it('snapshot render is disabled', () => {
    const newProps = {
      ...props,
      isDisabled: true,
    };
    const wrapper = mount(
      <ReactRedux.Provider store={store}>
        <CustomElement {...newProps} />
      </ReactRedux.Provider>,
    );
    expect(wrapper).toMatchSnapshot();
    spy.mockRestore();
  });

  it('snapshot render title empty', () => {
    const newProps = {
      ...props,
      title: '',
    };
    const wrapper = mount(
      <ReactRedux.Provider store={store}>
        <CustomElement {...newProps} />
      </ReactRedux.Provider>,
    );
    expect(wrapper).toMatchSnapshot();
    spy.mockRestore();
  });
});