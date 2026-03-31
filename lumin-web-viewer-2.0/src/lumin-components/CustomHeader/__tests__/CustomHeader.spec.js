import React from 'react';
import { shallow } from 'enzyme';
import CustomHeader from '../CustomHeader';

const props = {
  noIndex: true,
  title: 'title',
  description: 'description',
  sharable: true,
};

describe('<CustomHeader />', () => {
  it('snapshot render', () => {
    const wrapper = shallow(<CustomHeader {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});