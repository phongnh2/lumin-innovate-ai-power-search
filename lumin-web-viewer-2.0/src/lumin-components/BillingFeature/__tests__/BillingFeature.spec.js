import React from 'react';
import { shallow } from 'enzyme';
import { Plans } from 'constants/plan';

import BillingFeature from '../BillingFeature';

let wrapper;
beforeEach(() => {
  const props = {
    plan: Plans.ORG_PRO,
    className: ''
  };
  wrapper = shallow(<BillingFeature {...props} />);
});

describe('<BillingFeature />', () => {
  it('test snapshot', () => {
    expect(wrapper).toMatchSnapshot();
  });
});
