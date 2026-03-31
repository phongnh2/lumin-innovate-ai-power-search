/* eslint-disable */
import React from 'react';
import { shallow } from 'enzyme';
import MenuItem from '@mui/material/MenuItem';
import PageModeButton from '../PageModeButton';

afterEach(() => {
  jest.clearAllMocks();
});


describe('<PageModeButton />', () => {
  it('snapshot render', () => {
    const wrapper = shallow(<PageModeButton />);
    expect(wrapper).toMatchSnapshot();
  });

  it('PageModeButton__btn click', () => {
      const wrapper = shallow(<PageModeButton />);
      wrapper.find('.PageModeButton__btn').simulate('click');
  });

  it('_handleChangePageMode 0 click', () => {
    const wrapper = shallow(<PageModeButton />);
    wrapper.find(MenuItem).first().simulate('click');
    expect(wrapper.state('pageMode')).toEqual(0)
  });

  it('_handleChangePageMode 1 click', () => {
    const wrapper = shallow(<PageModeButton />);
    wrapper.find(MenuItem).at(1).simulate('click');
    expect(wrapper.state('pageMode')).toEqual(1)
  });

  it('_handleChangePageMode 2 click', () => {
    const wrapper = shallow(<PageModeButton />);
    wrapper.find(MenuItem).at(2).simulate('click');
    expect(wrapper.state('pageMode')).toEqual(2)
  });
});