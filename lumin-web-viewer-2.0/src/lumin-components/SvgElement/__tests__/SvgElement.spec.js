import React from 'react';
import { shallow } from 'enzyme';
import SvgElement from '../SvgElement';

describe('<SvgElement />', () => {
  it('snapshot render', () => {
    const props = {
      content: 'example.svg',
    };
    const wrapper = shallow(<SvgElement {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
