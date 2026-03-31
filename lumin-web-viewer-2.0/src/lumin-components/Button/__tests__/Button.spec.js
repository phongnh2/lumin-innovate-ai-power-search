import React from 'react';
import * as ReactRedux from 'react-redux';
import configureMockStore from 'redux-mock-store';
import { mount } from 'enzyme';
import Button from '../Button';


const mockStore = configureMockStore();
const state = {
  viewer: {
    themeMode: 'light'
  }
};
const store = mockStore(state);
const mockOnClick = jest.fn();

describe('Button', () => {
  const props = {
    children: [{}],
    isDisabled: false,
    isActive: true,
    onClick: mockOnClick,
    mediaQueryClassName: 'hide-in-mobile',
    img: 'test.png',
    label: 'label',
    color: '#000',
    dataElement: 'dataElement',
    className: 'classname',
    title: '',
    isElementDisabled: false,
  };
  it('snapshot renders', () => {
    const wrapper = mount(
      <ReactRedux.Provider store={store}>
        <Button {...props} />
      </ReactRedux.Provider>,
    );
    expect(wrapper).toMatchSnapshot();
  });
  it('snapshot render with label', () => {
    const newProps = {
      ...props,
      title: 'title',
      img: undefined,
    };

    const wrapper = mount(
      <ReactRedux.Provider store={store}>
        <Button {...newProps} />
      </ReactRedux.Provider>,
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('snapshot render without label', () => {
    const newProps = {
      ...props,
      img: undefined,
      label: '',
    };

    const wrapper = mount(
      <ReactRedux.Provider store={store}>
        <Button {...newProps} />
      </ReactRedux.Provider>,
    );
    expect(wrapper).toMatchSnapshot();
  });


  it('snapshot render with svg', () => {
    const newProps = {
      ...props,
      img: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M0 0h24v24H0z" fill="none"/><path d="M17 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V7l-4-4zm-5 16c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm3-10H5V5h10v4z"/></svg>',
    };

    const wrapper = mount(
      <ReactRedux.Provider store={store}>
        <Button {...newProps} />
      </ReactRedux.Provider>,
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('isElementDisabled', () => {
    const newProps = {
      ...props,
      isElementDisabled: true,
    };

    const wrapper = mount(
      <ReactRedux.Provider store={store}>
        <Button {...newProps} />
      </ReactRedux.Provider>,
    );
    expect(wrapper).toMatchSnapshot();
  });
});
