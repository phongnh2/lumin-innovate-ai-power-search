/* eslint-disable */
import React from 'react';
import { act } from 'react-dom/test-utils';
import { MemoryRouter } from 'react-router';
import { Plans } from 'constants/plan';
import { teamServices } from 'services';
import { mergeDeep } from 'utils/objectUtils';
import TeamInfoModal from '../TeamInfoModal';
import { setupMountProvider } from 'helpers/jestTesting'

const mockTeam = {
  totalMembers: 3,
  owner: {
    name: 'tientran',
  },
  payment: {
    type: Plans.FREE,
  },
  members: [
    { _id: '123123', name: 'test', avatarRemoteId: 'avatar_remote_id' },
  ],
  _id: 'teamId',
};

const setup = (props = {}) => {
  const defaultProps = {
    currentOrganization: {
      data: null
    },
    team: mockTeam,
    open: true
  }
  const mergedProps = mergeDeep(defaultProps, props);
  const wrapper = setupMountProvider(<MemoryRouter><TeamInfoModal {...mergedProps} /></MemoryRouter>)
  return wrapper;
}

describe('<TeamInfoModal />', () => {
  it('snapshot render', async () => {
    let wrapper;
    await act(async() => {
      jest.spyOn(teamServices, 'getTeamInfo').mockResolvedValueOnce({
        data: { team: mockTeam }
      });
      wrapper = setup();
    })
    expect(wrapper).toMatchSnapshot();
  });

  it('case: totalMembers = 4', async () => {
    let wrapper;
    await act(async() => {
      jest.spyOn(teamServices, 'getTeamInfo').mockResolvedValueOnce({
        data: { team: { ...mockTeam, totalMembers: 4, members: [{_id: 1}, {_id: 2}, {_id: 3}, {_id: 4, name: 'dsv' }] } }
      });
      wrapper = setup();
    })
    expect(wrapper).toMatchSnapshot();
  });

  it('case: totalMembers = 4, has pending member', async () => {
    let wrapper;
    await act(async() => {
      jest.spyOn(teamServices, 'getTeamInfo').mockResolvedValueOnce({
        data: { team: { ...mockTeam, totalMembers: 4, members: [{_id: 1}, {_id: 2}, {_id: 3}, {_id: 4, name: '' }] } }
      });
      wrapper = setup();
    })
    expect(wrapper).toMatchSnapshot();
  });

  it('case: totalMembers rather than 4', async () => {
    let wrapper;
    await act(async() => {
      jest.spyOn(teamServices, 'getTeamInfo').mockResolvedValueOnce({
        data: { team: { ...mockTeam, totalMembers: 5, payment: { type: Plans.FREE_TRIAL } } }
      });
      wrapper = setup();
    })
    expect(wrapper).toMatchSnapshot();
  });

  it('case: totalMembers rather than 4, and free trial 30', async () => {
    let wrapper;
    await act(async() => {
      jest.spyOn(teamServices, 'getTeamInfo').mockResolvedValueOnce({
        data: { team: { ...mockTeam, totalMembers: 1, payment: { type: Plans.FREE_TRIAL_30 } } }
      });
      wrapper = setup({ currentOrganization: { data: { _id: '1' }}});
    })
    expect(wrapper).toMatchSnapshot();
  });
});
