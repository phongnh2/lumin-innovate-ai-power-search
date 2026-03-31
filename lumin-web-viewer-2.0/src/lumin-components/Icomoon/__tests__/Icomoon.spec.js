import React from 'react';
import { mount } from 'enzyme';
import Icomoon from '../Icomoon';

describe('Icon', () => {
  it('snapshot', () => {
    const wrapper = mount(<Icomoon className="" color="" />);
    expect(wrapper).toMatchSnapshot();
  });
  it('have white alpha color', () => {
    const wrapper = mount(<Icomoon className="" color="rgba(255, 255, 255, 1)" />);
    expect(wrapper).toMatchSnapshot();
  });
  it('have white color', () => {
    const wrapper = mount(<Icomoon className="" color="rgba(255, 255, 255)" />);
    expect(wrapper).toMatchSnapshot();
  });
});
