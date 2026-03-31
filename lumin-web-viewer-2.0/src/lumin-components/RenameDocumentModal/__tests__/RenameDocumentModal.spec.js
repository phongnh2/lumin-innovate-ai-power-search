import React from 'react';
import { MemoryRouter } from 'react-router';
import { setupMountProvider } from 'helpers/jestTesting';
import ButtonMaterial from 'luminComponents/ButtonMaterial';
import { renderWithRedux } from 'utils/test-utils';
import RenameDocumentModal from '../RenameDocumentModal';

describe('PopperButton', () => {
  const defaultProps = {
    document: {
      createdAt: '1589945367442',
      isOverTimeLimit: false,
      isPersonal: true,
      lastAccess: '1589945367442',
      listUserStar: [],
      mimeType: 'application/pdf',
      name: 'f8b614f04c36bf88a40be5b6ccbad0f0--pikachu-dragon.jpg',
      ownerAvatarRemoteId: '',
      ownerId: '5ec3e155f6176a0b492862d2',
      ownerName: 'Tuan Nguyen',
      remoteEmail: null,
      remoteId: 'd71ef6a3-ec0b-4729-a756-dc6fee9667d6.pdf',
      roleOfDocument: 'OWNER',
      service: 's3',
      shareSetting: {
        link: null, permission: 'VIEWER', linkType: 'INVITED', __typename: 'ShareSetting',
      },
      size: 12579,
      thumbnail: 'thumbnails/ab93767a-2cac-4cad-9f59-ce052925a561.jpeg',
      __typename: 'Document',
      _id: '5ec4a4175d5d73087ca61dfa',
    },
    currentUser: {
      avatarRemoteId: '',
      billingEmail: 'tuananhnguyenhoang0410@gmail.com',
      clientId: '5ec3e155f6176a0b492862d2',
      createdAt: '2020-05-19T13:38:29.202Z',
      email: 'tuananhnguyenhoang0410@gmail.com',
      endTrial: null,
      isNotify: false,
      isUsingPassword: false,
      lastLogin: '2020-05-19T13:38:29.202Z',
      name: 'Tuan Nguyen',
      payment: {
        type: 'FREE', period: null, status: null, currency: null, __typename: 'Payment',
      },
      remainingPlan: { currency: null, balance: null, __typename: 'RemainingPlan' },
      setting: null,
      signatures: [],
      __typename: 'User',
      _id: '5ec3e155f6176a0b492862d2',
    },
    currentFolderType: 'individual',
    currentTeam: {
      avatarRemoteId: '',
      billingEmail: 'tuananhnguyenhoang0410@gmail.com',
      endTrial: null,
      members: [],
      roleOfUser: 'admin',
      name: 'a',
      owner: { _id: '5ec3e155f6176a0b492862d2', __typename: 'User' },
      payment: {
        type: 'FREE', period: null, status: null, quantity: null, currency: null,
      },
      remainingPlan: { currency: null, balance: null, __typename: 'RemainingPlan' },
      totalMembers: 1,
      __typename: 'Team',
      _id: '5ec4a2d45d5d73087ca61df5',
    },
    client: {
      mutate: jest.fn().mockImplementation(() => Promise.resolve(true)),
    },
    onCancel: jest.fn(),
    open: true,
  };

  it('render PopperButton', () => {
    const wrapper = setupMountProvider(<MemoryRouter><RenameDocumentModal {...defaultProps} /></MemoryRouter>)
    expect(wrapper).toMatchSnapshot();
  });

  it('render PopperButton roleOfDocument !== owner', () => {
    const newProps = {
      document: {
        ...defaultProps.document,
        roleOfDocument: '',

      },
      currentFolderType: 'individual',
    };
    const wrapper = setupMountProvider(<MemoryRouter><RenameDocumentModal {...newProps} /></MemoryRouter>)
    expect(wrapper).toMatchSnapshot();
  });

  // it('_handleCancel on click', () => {
  //   const wrapper = mount(<RenameDocumentModal {...props} />);
  //   wrapper.find(ButtonMaterial).first().simulate('click');
  //   expect(wrapper.find('.RenameModal__error').text()).toBe('');
  // });

  // it('_handleChangeName with value empty', () => {
  //   const wrapper = mount(<RenameDocumentModal {...props} />);
  //   wrapper.find('.RenameModal__input').simulate('change', { target: { value: '' } });
  //   expect(wrapper.find('.RenameModal__error').text()).toBe('Name should not be blank');
  // });

  // it('_handleChangeName with value < 255 char ', () => {
  //   const wrapper = mount(<RenameDocumentModal {...props} />);
  //   wrapper.find('.RenameModal__input').simulate('change', { target: { value: 'title' } });
  //   expect(wrapper.find('.RenameModal__error').text()).toBe('');
  // });

  // it('_handleChangeName with value > 255 char', () => {
  //   const wrapper = mount(<RenameDocumentModal {...props} />);
  //   wrapper.find('.RenameModal__input').simulate('change', { target: { value: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry\'s standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting,' } });
  //   expect(wrapper.find('.RenameModal__error').text()).toBe('Name should smaller than 255 characters');
  // });

  // it('_handleChangeDocumentName on click with not change name', () => {
  //   const wrapper = mount(<RenameDocumentModal {...props} />);
  //   wrapper.find(ButtonMaterial).at(1).simulate('click');
  //   expect(props.onCancel).toBeCalled();
  // });

  // it('_handleChangeDocumentName on click', () => {
  //   const wrapper = mount(<RenameDocumentModal {...props} />);
  //   wrapper.find('.RenameModal__input').simulate('change', { target: { value: 'title' } });
  //   wrapper.find(ButtonMaterial).at(1).simulate('click');
  // });

  // it('_handleChangeDocumentName on click roleOfDocument !== owner', () => {
  //   const newProps = {
  //     ...props,
  //     document: {
  //       ...props.document,
  //       roleOfDocument: '',

  //     },
  //     currentFolderType: 'individual',
  //   };
  //   const wrapper = mount(<RenameDocumentModal {...newProps} />);
  //   wrapper.find('.RenameModal__input').simulate('change', { target: { value: 'title' } });
  //   wrapper.find(ButtonMaterial).at(1).simulate('click');
  // });
});