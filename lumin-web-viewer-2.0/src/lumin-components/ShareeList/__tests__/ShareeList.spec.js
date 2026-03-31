import React from 'react';
import { shallow } from 'enzyme';
import CollapsedList from 'luminComponents/CollapsedList';
import ShareeList from '../ShareeList';

function setup(props = {}) {
  const defaultProps = {};
  const mergedProps = {
    ...defaultProps,
    ...props,
  };
  const wrapper = shallow(<ShareeList {...mergedProps} />);
  return {
    wrapper,
  };
}
describe('<ShareeList />', () => {
  const props = {
    currentUserRole: 'sharer',
    currentTeam: {
      name: 'Team',
      avatarRemoteId: 'user-profiles/3e22bb0c-b957-47da-9530-001e325f55d2.jpeg',
      owner: {
        _id: '123',
      },
    },
    currentUser: {
      avatarRemoteId: '',
      email: 'tientranmac96@gmail.com',
      name: 'Tien Tran',
      _id: '5dd644a4aca9bedddb71a271',
    },
    members: [
      {
        _id: '5dd644a4aca9bedddb71a271',
        avatarRemoteId:
          'user-profiles/3e22bb0c-b957-47da-9530-001e325f55d2.jpeg',
        email: 'tientranmac96@gmail.com',
        name: 'tientran',
        role: 'owner',
        type: 'internal',
      },
    ],
    isdocumentPersonal: false,
    documentId: '',
    handleTransferFile: jest.fn(),
    reloadRequestList: jest.fn(),
  };
  describe('snapshot render', () => {
    it('should render member with isdocumentPersonal', () => {
      const newProps = {
        ...props,
        currentUserRole: 'SHARER',
        isdocumentPersonal: true,
      };
      const { wrapper } = setup(newProps);
      expect(wrapper).toMatchSnapshot();
    });
  });
});
