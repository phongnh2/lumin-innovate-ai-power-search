import React from 'react';
import { shallow } from 'enzyme';

import ContactHelp from '../ContactHelp';
describe('<ContactHelp/>', () => {
  it('snapshot render', () => {
    const wrapper = shallow(<ContactHelp />);
    expect(wrapper).toMatchSnapshot();
  });
});
