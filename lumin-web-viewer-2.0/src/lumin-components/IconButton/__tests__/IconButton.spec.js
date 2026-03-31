import React from 'react';
import { shallow } from 'enzyme';
import IconButton from '../IconButton';

describe('IconButton', () => {
  const props = {
    disabled: false,
    onClick: jest.fn(),
    label: '',
    icon: '',
    iconSize: 16,
    iconColor: '',
    title: '',
    location: 'bottom',
    hidden: [],
  };
  it('snapshot renders', () => {
    const wrapper = shallow(
      <IconButton {...props} />,
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('snapshot hidden item', () => {
    const newProps = {
      ...props,
      hidden: ['mobile', 'tablet'],
      title: 'title',
    };
    const wrapper = shallow(
      <IconButton {...newProps} />,
    );
    expect(wrapper).toMatchSnapshot();
  });
});
