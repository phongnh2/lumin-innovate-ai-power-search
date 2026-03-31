import React from 'react';
import { mount } from 'enzyme';
import PopperButton from 'luminComponents/PopperButton';
import merge from 'lodash/merge';
import ZoomButton from '../ZoomButton';
import { setupMountProvider } from 'helpers/jestTesting';


const defaultProps = {
  zoomRatio: 0,
};

function setup(props) {
  const newProps = merge(defaultProps, props);
  const wrapper = setupMountProvider(<ZoomButton {...newProps} />);
  return {
    wrapper,
  };
}

describe('<ZoomButton />', () => {
  const closePopper = jest.fn();
  it('snapshot render', () => {
    const { wrapper } = setup();
    wrapper.find(PopperButton).renderProp('renderPopperContent')(closePopper);
    expect(wrapper).toMatchSnapshot();
  });

  it('snapshot render zoomRatio 150%', () => {
    const { wrapper } = setup({ zoomRatio: 1.5 });
    wrapper.find(PopperButton).renderProp('renderPopperContent')(closePopper);
    expect(wrapper).toMatchSnapshot();
  });

  it('handlePressEnter key press is not Enter', () => {
    const callback = jest.fn();
    const { wrapper } = setup();
    const instance = wrapper.instance();
    instance.handlePressEnter({ which: 14 }, callback);
  });

  it('handlePressEnter key press is Enter', () => {
    const callback = jest.fn();
    const { wrapper } = setup();
    const instance = wrapper.instance();
    instance.handlePressEnter({ which: 13 }, callback);
  });

  it('handleShowInput', () => {
    const { wrapper } = setup();
    const instance = wrapper.instance();
    instance.handleShowInput();
    expect(wrapper.state().showInput).toBeTruthy();
  });

  it('handleChangeZoomRatio value = 10%', () => {
    const callback = jest.fn();
    const { wrapper } = setup();
    const instance = wrapper.instance();
    instance.handleChangeZoomRatio('10%', callback);
    expect(wrapper.state().zoomRatio).toBe('10%');
  });

  it('handleChangeZoomRatio not include % value = 10', () => {
    const callback = jest.fn();
    const { wrapper } = setup();
    const instance = wrapper.instance();
    instance.handleChangeZoomRatio('10', callback);
    expect(wrapper.state().zoomRatio).toBe('10%');
  });

  it('handleChangeZoomRatio not include value', () => {
    const callback = jest.fn();
    const { wrapper } = setup({ zoomRatio: 1.5 });
    const instance = wrapper.instance();
    instance.handleChangeZoomRatio('', callback);
    expect(wrapper.state().zoomRatio).toBe('150%');
  });

  it('handleChangeZoomValue value = empty', () => {
    const { wrapper } = setup();
    const value = { target: { value: '' } };
    const instance = wrapper.instance();
    instance.handleChangeZoomValue(value);
    expect(instance.isInputValid(value)).toBeTruthy();
  });

  it('handleChangeZoomValue value = 1.5', () => {
    const { wrapper } = setup();
    const value = { target: { value: '1,5' } };
    const instance = wrapper.instance();
    instance.handleChangeZoomValue(value);
    expect(instance.isInputValid(value)).toBeFalsy();
  });
  it('handleBlurZoomInput ', () => {
    const callback = jest.fn();
    const event = jest.fn();
    const { wrapper } = setup();
    const instance = wrapper.instance();
    instance.handleBlurZoomInput(event, callback);
    expect(wrapper.state().showInput).toBeFalsy();
  });
});