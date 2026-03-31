import React from 'react';
import { shallow } from 'enzyme';
import TeamMembersRow from '../TeamMembersRow';

describe('<TeamMembersRow />', () => {
  it('snapshot render', () => {
    const props = {
      member: {
        user: {
          avatarRemoteId: 'avatar_remote_id',
        },
        isOwner: false,
        role: 'member'
      },
      currentUser: {
        _id: '123123',
      },
      team: {
        owner: {
          _id: 123123,
        },
      },
      client: {},
      onChanged: jest.fn(),
      openModal: jest.fn(),
    };
    const wrapper = shallow(<TeamMembersRow {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
