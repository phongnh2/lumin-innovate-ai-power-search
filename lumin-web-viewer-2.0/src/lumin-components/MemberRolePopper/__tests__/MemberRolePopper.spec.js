import React from 'react';
import { shallow, mount } from 'enzyme';
import MemberRolePopper from '../MemberRolePopper';

describe('<MemberRolePopper />', () => {
  const props = {
    open: false,
    anchorEl: null,
    handleClose: jest.fn(),
    currentRole: '',
    onSelected: jest.fn(),
    isOwner: false,
  };

  it('MemberRolePopper render', () => {
    const wrapper = mount(<MemberRolePopper {...props} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('MemberRolePopper currentRole', () => {
    const newProps = {
      ...props,
      currentRole: 'admin',
      isOwner: true,
    };
    const wrapper = mount(<MemberRolePopper {...newProps} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('on Click item was triggered', () => {
    const wrapper = shallow(<MemberRolePopper {...props} />);
    wrapper.find('#remove-member').simulate('click');
    expect(props.onSelected).toBeCalled();
  });
});