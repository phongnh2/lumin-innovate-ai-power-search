import React from 'react';
import { shallow } from 'enzyme';
import CustomRadio from '../CustomRadio';

describe('<CustomRadio />', () => {
  it('snapshot render', () => {
    window.history.pushState(
      {},
      '',
      '/',
    );
    const wrapper = shallow(<CustomRadio />);
    expect(wrapper).toMatchSnapshot();
  });

  it('snapshot render pathname is viewer light mode', () => {
    window.history.pushState(
      {},
      '',
      '/viewer/1231232',
    );
    const wrapper = shallow(<CustomRadio themeMode="light" />);
    expect(wrapper).toMatchSnapshot();
  });

  it('snapshot render pathname is viewer dark mode', () => {
    window.history.pushState(
      {},
      '',
      '/viewer/1231232',
    );
    const wrapper = shallow(<CustomRadio themeMode="dark" />);
    expect(wrapper).toMatchSnapshot();
  });
});