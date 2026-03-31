import React from 'react';
import { shallow } from 'enzyme';
import SliderMaterial from '../SliderMaterial';

describe('<SliderMaterial />', () => {
  it('snapshot render', () => {
    const wrapper = shallow(<SliderMaterial />);
    expect(wrapper).toMatchSnapshot();
  });
});
