import React from 'react';
import { shallow } from 'enzyme';
import EditTeamModal from '../EditTeamModal';
import { StyledInput, StyledButton } from '../EditTeamModal.styled';

describe('<EditTeamModal />', () => {
  const props = {
    currentDocument: {
      _id: process.env.DOCUMENT_TOUR_ID,
    },
    team:
      {
        name: 'test',
      },
    open: true,
    client: {
      mutate: jest.fn().mockImplementation(() => Promise.resolve(true)),
    },
    onSaved: jest.fn(),
    onClose: jest.fn(),
    currentUser: {
      _id: '5ecb88e5d2ade3039213bb48',
    },
    handleUpload: jest.fn(),
    openLoading: jest.fn(),
  };
  it('snapshot render', () => {
    const wrapper = shallow(
      <EditTeamModal {...props} />,
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('snapshot render with avatarRemoteId', () => {
    const newProps = {
      ...props,
      team: {
        ...props.team,
        avatarRemoteId: 'team-profiles/3a042eaf-e4cb-4e58-84af-26b65aafb285.jpeg',
      },
    };
    const wrapper = shallow(
      <EditTeamModal {...newProps} />,
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('setTeamName', () => {
    const wrapper = shallow(
      <EditTeamModal {...props} />,
    );
    wrapper.find(StyledInput).simulate('change', { currentTarget: { value: 'DSV' } });
    expect(wrapper.find(StyledInput).props().value).toBe('DSV');
  });

  it('_onSave with name is blank', () => {
    const wrapper = shallow(
      <EditTeamModal {...props} />,
    );
    wrapper.find(StyledInput).simulate('change', { currentTarget: { value: '' } });
  });

  it('_onSave with name success', () => {
    const mockQuery = jest.fn(() => Promise.resolve({
      data: {
        editTeam: {
          statusCode: 200,
        },
      },
    }));
    const newProps = {
      ...props,
      team: {
        ...props.team,
        avatarRemoteId: 'team-profiles/3a042eaf-e4cb-4e58-84af-26b65aafb285.jpeg',
      },
      client: {
        mutate: mockQuery,
      },
    };
    const wrapper = shallow(
      <EditTeamModal {...newProps} />,
    );
    wrapper.find(StyledInput).simulate('change', { currentTarget: { value: 'DSV' } });
    expect(wrapper).toMatchSnapshot();
  });

  it('_onSave with name success with file !string', () => {
    const mockQuery = jest.fn(() => Promise.resolve({
      data: {
        editTeam: {
          statusCode: 200,
        },
      },
    }));
    const newProps = {
      ...props,
      team: {
        ...props.team,
        avatarRemoteId: null,
      },
      client: {
        mutate: mockQuery,
      },
    };
    const wrapper = shallow(
      <EditTeamModal {...newProps} />,
    );
    wrapper.find(StyledInput).simulate('change', { currentTarget: { value: 'DSV' } });
    expect(wrapper).toMatchSnapshot();
  });

  it('_onSave with name fail', () => {
    const mockQuery = jest.fn(() => Promise.resolve({
      data: {
        editTeam: {
          statusCode: 404,
        },
      },
    }));
    const newProps = {
      ...props,
      client: {
        mutate: mockQuery,
      },
    };
    const wrapper = shallow(
      <EditTeamModal {...newProps} />,
    );
    wrapper.find(StyledInput).simulate('change', { currentTarget: { value: 'DSV' } });
  });
});
