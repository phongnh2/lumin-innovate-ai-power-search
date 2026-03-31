import { shallow } from 'enzyme';
import React from 'react';
import MemberListItem from '../MemberListItem';

const props = {
  member: {
    user: {
      email: 'tientm@group.co'
    }
  },
  onClick: jest.fn(),
  rightElement: <></>,
  containerStyle: {},
  hover: true,
  disabled: false
};

describe('<MemberListItem />', () => {
  it('case 1: should render', () => {
    const wrapper = shallow(<MemberListItem {...props} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('case 2: should render with more right element', () => {
    const newProps = {...props, moreRightElement: true };
    const wrapper = shallow(<MemberListItem {...newProps} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('case 3: should render with no right element', () => {
    const newProps = {...props, rightElement: null };
    const wrapper = shallow(<MemberListItem {...newProps} />);
    expect(wrapper).toMatchSnapshot();
  })

});
