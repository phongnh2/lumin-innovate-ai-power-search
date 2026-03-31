import React from 'react';
import { mount, shallow } from 'enzyme';
import MenuItem from '@mui/material/MenuItem';
import { MemoryRouter } from 'react-router';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';

import initialState from 'src/redux/initialState';
import AutoMockedApollo from 'src/apollo/mockApollo';
import TeamItemGrid from '../TeamItemGrid';
import MaterialPopper from 'luminComponents/MaterialPopper';


const { Provider } = jest.requireActual('react-redux');
const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);
const store = mockStore({
  ...initialState,
});

jest.mock('hooks/useTabletMatch', () => ({
  useTabletMatch: jest.fn().mockReturnValue(true)
}));

beforeAll(() => {
  MaterialPopper.preload();
})

const setup = (props) => {
  const mergedProps = {
    team: {
      _id: '123123',
      name: 'dsv',
      owner: {
        _id: '123123',
      },
      members: [],
      name: 'dsv',
    },
    currentOrganization: {
      data: {
        _id: '123123123'
      }
    },
    refetchTeamList: jest.fn(),
    closeLoading: jest.fn(),
    containerStyle: {},
    currentUser: {},
    history: {},
    onEdited: jest.fn(),
    openModal: jest.fn(),
    client: {
      mutate: jest.fn().mockImplementation(() => Promise.resolve(true)),
    },
    ...props,
  };
  const shallowWrapper = shallow(<TeamItemGrid {...mergedProps} />);
  const mountWrapper = mount(
    <MemoryRouter>
      <AutoMockedApollo>
        <Provider store={store}>
          <TeamItemGrid {...mergedProps} />
        </Provider>
      </AutoMockedApollo>
    </MemoryRouter>,
  );
  return { shallowWrapper, mountWrapper };
};

describe('<TeamItemGrid />', () => {
  describe('Snapshots', () => {
    it('Free team', () => {
      const { shallowWrapper } = setup();
      expect(shallowWrapper).toMatchSnapshot();
    });
    it('Total Members > 5', () => {
      const props = {
        team: {
          _id: '123123',
          name: 'dsv',
          owner: {
            _id: '123123',
          },
          members: [],
          totalMembers: 6,
          roleOfUser: 'admin',
          name: 'Lumin Team',
        },
      };
      const { shallowWrapper } = setup(props);
      expect(shallowWrapper).toMatchSnapshot();
    });
    it('Total Members = 5', () => {
      const props = {
        team: {
          _id: '123123',
          name: 'dsv',
          owner: {
            _id: '123123',
          },
          members: [{ _id: '123123' }, { _id: '123122' }, { _id: '123121' }, { _id: '123125', name: 'Haha' }, { _id: '123126', name: 'Hihi' }],
          totalMembers: 5,
          roleOfUser: 'admin',
          name: 'Lumin Team',
        },
      };
      const { shallowWrapper } = setup(props);
      expect(shallowWrapper).toMatchSnapshot();
    });
  });
});