import React from 'react';
import { mount, shallow } from 'enzyme';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import PopperButton from '../PopperButton';

describe('PopperButton', () => {
  const props = {
    ButtonComponent: Button,
    classes: '',
    popperProps: {
      classes: '',
      placement: 'bottom',
      parentOverflow: 'scrollParent',
    },
    onClose: jest.fn(),
    onOpen: jest.fn(),
    handleShowInput: jest.fn(),
    handleChangeZoomRatio: jest.fn(),
    handleChangeZoomValue: jest.fn(),
    handlePressEnter: jest.fn(),
    showInput: true,
    disabled: false,
    useHover: true,
    useInput: true,
    zoomRatio: '0',
    renderPopperContent: jest.fn(),
    children: null,
  };

  it('render PopperButton', () => {
    const wrapper = mount(<PopperButton {...props} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('PopperButton useHover false', () => {
    const stopPropagation = jest.fn();
    const newProps = {
      ...props,
      classes: 'button',
      useHover: false,
    };
    const wrapper = shallow(<PopperButton {...newProps} />);
    wrapper.setState({ open : true });
    wrapper.find('input').simulate('keypress');
    wrapper.find('input').simulate('blur');
    wrapper.find(Grid).at(1).simulate('click');
    wrapper.find(Grid).at(2).simulate('click', { stopPropagation, currentTarget: {} });
    expect(props.handleShowInput).toBeCalled();
  });


  it('PopperButton useHover false with show input false', () => {
    const newProps = {
      ...props,
      classes: 'button',
      useHover: false,
      showInput: false,
    };
    const wrapper = shallow(<PopperButton {...newProps} />);
    wrapper.find(props.ButtonComponent).simulate('click');
    expect(wrapper).toMatchSnapshot();
  });


  it('PopperButton useHover false with useInput false with disabled', () => {
    const stopPropagation = jest.fn();
    const newProps = {
      ...props,
      useHover: false,
      useInput: false,
      disabled: true,
    };
    const wrapper = shallow(<PopperButton {...newProps} />);
    wrapper.find(props.ButtonComponent).simulate('click', { stopPropagation, currentTarget: {} });
    expect(wrapper).toMatchSnapshot();
  });

  it('PopperButton useHover false with useInput false open false', () => {
    const stopPropagation = jest.fn();
    const newProps = {
      ...props,
      useHover: false,
      useInput: false,
    };
    const wrapper = shallow(<PopperButton {...newProps} />);
    wrapper.setState({ open: false });
    wrapper.find(props.ButtonComponent).simulate('click', { stopPropagation, currentTarget: {} });
    expect(wrapper).toMatchSnapshot();
  });

  it('PopperButton useHover false with useInput false opened', () => {
    const stopPropagation = jest.fn();
    const newProps = {
      ...props,
      useHover: false,
      useInput: false,
    };
    const wrapper = shallow(<PopperButton {...newProps} />);
    wrapper.setState({ open: true });
    wrapper.find(props.ButtonComponent).simulate('click', { stopPropagation, currentTarget: {} });
    expect(wrapper).toMatchSnapshot();
  });


  it('PopperButton useHover false with useInput false with class', () => {
    const newProps = {
      ...props,
      classes: 'button',
      useHover: false,
      useInput: false,
    };
    const wrapper = shallow(<PopperButton {...newProps} />);

    expect(wrapper).toMatchSnapshot();
  });


  it('render PopperButton open', () => {
    const wrapper = shallow(<PopperButton {...props} />);
    wrapper.setState({ open: true });
    expect(wrapper).toMatchSnapshot();
  });

  it('render PopperButton not open', () => {
    const wrapper = shallow(<PopperButton {...props} />);
    wrapper.setState({ open: false });
    expect(wrapper).toMatchSnapshot();
  });

  it('render PopperButton showInput false', () => {
    const newProps = {
      ...props,
      showInput: false,
    };
    const wrapper = shallow(<PopperButton {...newProps} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('render PopperButton useHover onMouseEnter event', () => {
    const newProps = {
      ...props,
      useInput: false,
    };
    const wrapper = shallow(<PopperButton {...newProps} />);
    wrapper.find('div').first().simulate('mouseEnter', { currentTarget: {} });
    expect(wrapper.state().open).toBeTruthy();
    expect(props.onOpen).toBeCalled();
  });

  it('render PopperButton useHover onMouseLeave event', () => {
    const newProps = {
      ...props,
      useInput: false,
    };
    const wrapper = shallow(<PopperButton {...newProps} />);
    wrapper.find('div').first().simulate('mouseLeave');
    expect(wrapper.state().open).toBeFalsy();
  });

  it('MaterialPopper handle close', () => {
    const wrapper = shallow(<PopperButton {...props} />);
    const instance = wrapper.instance();
    wrapper.setState({ anchorEl: { contains: jest.fn().mockReturnValue(true) } });
    instance._handleClickAway({ target: {} });
  });

  it('MaterialPopper handle close', () => {
    const wrapper = shallow(<PopperButton {...props} />);
    const instance = wrapper.instance();
    instance._handleClickAway({ target: {} });
    expect(wrapper.state().open).toBeFalsy();
  });
});
