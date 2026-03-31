import React from 'react';
import { shallow } from 'enzyme';

import CircularLoading from '../CircularLoading';

let wrapper;
beforeEach(() => {
  const props = {
    color: 'secondary',
    size: 12,
    style: {}
  };
  wrapper = shallow(<CircularLoading {...props} />);
});

describe('<CircularLoading />', () => {
  it('test snapshot', () => {
    expect(wrapper).toMatchSnapshot();
  });
});
