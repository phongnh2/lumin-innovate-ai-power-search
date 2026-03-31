import React from 'react';
import { shallow } from 'enzyme';
import InvitedMemberItem from '../InvitedMemberItem';

describe('<InvitedMemberItem />', () => {
  const props = {
    email: 'huydt@dgroup.co',
    rightElement: <div />,
  };

  it('case 1: should render', () => {
    const wrapper = shallow(<InvitedMemberItem {...props} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('case 2: should render with more right element', () => {
    const newProps = { ...props, moreRightElement: true };
    const wrapper = shallow(<InvitedMemberItem {...newProps} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('case 3: should render with no right element', () => {
    const newProps = { ...props, rightElement: null };
    const wrapper = shallow(<InvitedMemberItem {...newProps} />);
    expect(wrapper).toMatchSnapshot();
  });

});
