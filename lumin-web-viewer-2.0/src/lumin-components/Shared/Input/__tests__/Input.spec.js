import React from 'react';
import { mount } from 'enzyme';
import * as ReactRedux from 'react-redux';
import configureMockStore from 'redux-mock-store';

import initialState from 'src/redux/initialState';
import Input from '../Input';

const mockStore = configureMockStore();

const store = mockStore(initialState);

function setup(props) {
  const defaultProps = { value: '', onChange: jest.fn() };
  const mergedProps = { ...defaultProps, ...props };
  const wrapper = mount(
    <ReactRedux.Provider store={store}>
      <Input {...mergedProps} />
    </ReactRedux.Provider>
  );
  return { wrapper };
}

describe('<Input/>', () => {
  it('render snapshot', () => {
    const { wrapper } = setup();
    expect(wrapper).toMatchSnapshot();
  });

  describe('input with label', () => {
    it('should show label', () => {
      const props = {
        label: 'Username',
      };
      const { wrapper } = setup(props);
      const label = wrapper.find('.LuminInput__label').text();
      expect(label).toBe('Username');
      expect(wrapper).toMatchSnapshot();
    });
  });

  describe('input with error state', () => {
    const { wrapper } = setup({
      errorMessage: 'Unknown error',
      hideValidationIcon: false,
    });

    it('should have classname LuminInput__input-error', () => {
      const inputWrapper = wrapper.find('.LuminInput__wrapper').at(0);
      expect(inputWrapper.hasClass('LuminInput__wrapper--error')).toBe(true);
      expect(wrapper).toMatchSnapshot();
    });

    it('should have error message', () => {
      const errorMessage = wrapper
        .find('.LuminInput__error-message')
        .at(0)
        .text();
      expect(errorMessage).toBe('Unknown error');
      expect(wrapper).toMatchSnapshot();
    });

    it('should show error icon', () => {
      expect(wrapper.exists('.LuminInput__icon')).toBe(true);
      expect(wrapper).toMatchSnapshot();
    });

    it('should hide error when focusing input', () => {
      const input = wrapper.find('.LuminInput__input').at(0);
      input.simulate('focus', { target: {} });
      expect(
        wrapper
          .find('.LuminInput__input')
          .at(0)
          .hasClass('LuminInput__input--error')
      ).toBe(false);
      expect(wrapper).toMatchSnapshot();
    });
  });

  describe('on blur event', () => {
    const onBlur = jest.fn();
    const { wrapper } = setup({
      onBlur,
    });
    it('should trigger onBlur event', () => {
      // Mock timestamp to ensure consistent snapshots
      const mockTimestamp = 1234567890;
      const originalNow = Date.now;
      Date.now = jest.fn(() => mockTimestamp);
      
      // Create a synthetic event with fixed timestamp
      const mockEvent = {
        target: {},
        timeStamp: mockTimestamp,
        type: 'blur',
      };
      
      wrapper.find('.LuminInput__input').at(0).simulate('blur', mockEvent);
      expect(onBlur).toBeCalled();
      
      // Restore Date.now
      Date.now = originalNow;
      
      expect(wrapper).toMatchSnapshot();
    });
  });
});
