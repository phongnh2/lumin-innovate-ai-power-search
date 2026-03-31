import React from 'react';
import { mount, shallow } from 'enzyme';
import { act } from 'react-dom/test-utils';
import MaterialPopper from '../MaterialPopper';

describe('<MaterialPopper />', () => {
  const props = {
    classes: '',
    open: true,
    parentOverflow: 'scrollParent',
    flip: true,
    preventOverflow: true,
    children: <></>,
    handleClose: jest.fn(),
    anchorEl: {
      getBoundingClientRect: jest.fn().mockReturnValue({ // simulate fake anchorEl
        bottom: 0,
        height: 0,
        left: 0,
        right: 0,
        top: 0,
        width: 0,
        x: 0,
        y: 0,
      }),
      clientWidth: 0,
      clientHeight: 0,
    },
    placement: '',
  };

  it('MaterialPopper render', () => {
    const wrapper = shallow(<MaterialPopper {...props} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('MaterialPopper popper click', () => {
    jest.useFakeTimers();
    const newProps = {
      ...props,
      flip: false,
      preventOverflow: false,
      placement: 'top',
    };
    const wrapper = mount(
      <MaterialPopper {...newProps} />,
    );
    act(() => {
      wrapper.find('.Popper').at(0).simulate('click', { stopPropagation: jest.fn() });
      jest.runAllTimers();
    });
    wrapper.update();
    expect(wrapper).toMatchSnapshot();
  });

  it('MaterialPopper popper click with new props', () => {
    jest.useFakeTimers();
    const newProps = {
      ...props,
      flip: false,
      preventOverflow: false,
      placement: 'bottom-end',
    };
    const wrapper = mount(
      <MaterialPopper {...newProps} />,
    );
    act(() => {
      wrapper.find('.Popper').at(0).simulate('click', { stopPropagation: jest.fn() });
      jest.runAllTimers();
    });
    wrapper.update();
    expect(wrapper).toMatchSnapshot();
  });
});