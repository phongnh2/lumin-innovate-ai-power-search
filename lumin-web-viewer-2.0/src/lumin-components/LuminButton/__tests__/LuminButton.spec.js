import React from 'react';
import { shallow } from 'enzyme';
import LuminButton from '../LuminButton';

describe('<LuminButton />', () => {
  const props = {
    children: {},
    className: '',
    disabled: false,
    onClick: jest.fn(),
    onMouseDown: jest.fn(),
    label: 'Title',
    icon: 'search',
    iconSize: 16,
    iconColor: '#000',
    full: true,
    small: true,
    type: 'primary',
    fontSecondary: true,
    square: true,
    isIconButton: true,
  };

  it('LuminButton render', () => {
    const wrapper = shallow(<LuminButton {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
