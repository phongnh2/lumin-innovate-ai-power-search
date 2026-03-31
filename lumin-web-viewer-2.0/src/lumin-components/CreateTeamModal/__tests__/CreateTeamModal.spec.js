import React from 'react';
import { shallow } from 'enzyme';
import AvatarUploader from 'luminComponents/AvatarUploader';
import Input from 'luminComponents/Shared/Input';
import ButtonMaterial from 'luminComponents/ButtonMaterial';
import CreateTeamModal from '../CreateTeamModal';
import fileMock from '../../../__mocks__/imageMock';

describe('<CreateTeamModal />', () => {
  const props = {
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
        type: 'PROFESSIONAL', period: 'ANNUAL', status: 'INACTIVE', currency: 'USD', __typename: 'Payment',
      },
      remainingPlan: { currency: 'usd', balance: 5984, __typename: 'RemainingPlan' },
      setting: null,
      signatures: [],
      __typename: 'User',
      _id: '5ec3e155f6176a0b492862d2',
    },
    open: true,
    openLoading: jest.fn(),
    closeLoading: jest.fn(),
    onClose: jest.fn(),
    onAfterCreated: jest.fn(),
    onError: jest.fn(),
  };

  it('snapshot render', () => {
    const wrapper = shallow(<CreateTeamModal {...props} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('PopperShow open', () => {
    const wrapper = shallow(<CreateTeamModal {...props} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('setTeamName on change event', () => {
    const wrapper = shallow(<CreateTeamModal {...props} />);
    wrapper.find(Input).simulate('change', { currentTarget: { value: 'Team A' } });
    const { targetName } = wrapper.find(AvatarUploader).props();
    expect(targetName).toBe('Team A');
  });

  it('_onCreate event', () => {
    const mockQuery = jest.fn(() => Promise.resolve({
      data: {
        createTeam: {
          _id: '123',
        },
      },
    }));
    const newProps = {
      ...props,
      client: {
        mutate: mockQuery,

      },
    };
    const wrapper = shallow(<CreateTeamModal {...newProps} />);
    wrapper.find(Input).simulate('change', { currentTarget: { value: 'Team A' } });
  });


  it('_onCreate event with team Name empty', () => {
    const mockQuery = jest.fn(() => Promise.resolve({
      data: {
        createTeam: {
          _id: '123',
        },
      },
    }));
    const newProps = {
      ...props,
      client: {
        mutate: mockQuery,
      },
    };
    const wrapper = shallow(<CreateTeamModal {...newProps} />);
    wrapper.find(Input).simulate('change', { currentTarget: { value: '' } });
  });

  it('handle AvatarUploader', () => {
    const wrapper = shallow(<CreateTeamModal {...props} />);
    const { onChange, removeAvatar } = wrapper.find(AvatarUploader).props();
    onChange(fileMock);
    removeAvatar();
  });

});