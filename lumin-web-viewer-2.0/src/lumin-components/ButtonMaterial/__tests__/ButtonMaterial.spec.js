/* eslint-disable */
import React from 'react';
import { mount } from 'enzyme';
import * as ReactRedux from 'react-redux';
import configureMockStore from 'redux-mock-store';
import { setupMountProvider } from 'helpers/jestTesting';

import ButtonMaterial from '../ButtonMaterial';

describe('<ButtonMaterial />', () => {
  let wrapper;
  const mockOnClick = jest.fn();
  const mockmouseDown = jest.fn();
  beforeEach(() => {
    const props = {
      onClick: mockOnClick,
      children: null,
      disabled: false,
      onMouseDown: mockmouseDown,
    };
    wrapper = setupMountProvider(
      <ButtonMaterial {...props} />
    );
  });

  it('test snapshot', () => {
    expect(wrapper).toMatchSnapshot();
  });

  it('should call onClick', () => {

    wrapper.simulate('click');

    expect(mockOnClick).toBeCalled();
  })

  it('should call onMouseDown', () => {

    wrapper.simulate('mouseDown');

    expect(mockOnClick).toBeCalled();
  })
});