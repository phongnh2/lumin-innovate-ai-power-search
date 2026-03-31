import React from 'react';
import { mount } from 'enzyme';

import Tooltip from '../Tooltip';

describe('<Tooltip />', () => {
  it('snapshot render', () => {
    const props = {
      t: jest.fn(),
      children: <div></div>
    };
    const wrapper = mount(<Tooltip {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
