import React from 'react';
import { shallow } from 'enzyme';
import TabContainer from '../TabContainer';

describe('<TabContainer />', () => {
  it('snapshot render', () => {
    const wrapper = shallow(<TabContainer />);
    expect(wrapper).toMatchSnapshot();
  });
});
