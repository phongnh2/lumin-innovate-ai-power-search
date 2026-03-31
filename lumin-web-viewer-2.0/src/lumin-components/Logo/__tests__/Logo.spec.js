import React from 'react';
import { mount } from 'enzyme';
import Logo from '../Logo';

describe('<Logo />', () => {
  it('snapshot render', () => {
    const wrapper = mount(<Logo />);
    expect(wrapper).toMatchSnapshot();
  });
});
