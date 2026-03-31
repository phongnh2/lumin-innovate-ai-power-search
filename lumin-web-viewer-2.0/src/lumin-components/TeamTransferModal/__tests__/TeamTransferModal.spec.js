import React from 'react';
import { shallow } from 'enzyme';
import TeamTransferModal from '../TeamTransferModal';

describe('<TeamTransferModal />', () => {
  it('snapshot render', () => {
    const props = {
      currentUser: {
        _id: '123123'
      },
      users: [
        {
          _id: '123123'
        }
      ],
      team: { name: 'test', _id: '122222' },
      client: {
        query: jest.fn().mockImplementation(() =>
          Promise.resolve({
            data: {
              team: {
                members: [],
                membersCount: 0
              }
            }
          })
        )
      }
    };
    const wrapper = shallow(<TeamTransferModal {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
