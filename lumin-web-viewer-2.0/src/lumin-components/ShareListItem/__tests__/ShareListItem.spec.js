import React from 'react';
import * as ReactRedux from 'react-redux';

import configureMockStore from 'redux-mock-store';

import { setupShallowProvider, setupMountProvider } from 'helpers/jestTesting';
import CircularLoading from 'luminComponents/CircularLoading';
import { ShareModalContext } from 'lumin-components/ShareModal/ShareModalContext';
import initialState from 'src/redux/initialState';
import ShareListItem from '../ShareListItem';
import { ORG_TEXT } from 'constants/organizationConstants';


const { Provider } = jest.requireActual('react-redux');
const mockStore = configureMockStore();

const store = mockStore({
  ...initialState,
  auth: {
    currentUser: {
      _id: '5dd644a4aca9bedddb71a271',
      name: 'Tien Tran',
    },
  },
});

const spy = jest.spyOn(ReactRedux, 'useSelector')
spy.mockReturnValue('light')
jest.mock('react-router', () => ({
  ...jest.requireActual('react-router'),
  useMatch: () => ({ url: `/${ORG_TEXT}/dsv`, params: { orgName: 'dsv' } }),
}));

describe('<ShareListItem />', () => {
  const props = {
    handleChangePermission: jest.fn(),
    member: {
      _id: '5dd644a4aca9bedddb71a271',
      avatarRemoteId: 'user-profiles/3e22bb0c-b957-47da-9530-001e325f55d2.jpeg',
      email: 'tientranmac96@gmail.com',
      name: 'tientran',
      role: 'owner',
      type: 'external',
    },
    isOwned: true,
    isCurrentUser: true,
    isdocumentPersonal: false,
    handleTransferFile: jest.fn(),
    reloadRequestList: jest.fn(),
  };
  const setup = (extraProps) => {
    const mountWrapper = setupMountProvider(
      <Provider store={store}>
        <ShareModalContext.Provider
          value={{
            userRole: 'OWNER',
            handleChangePermission: jest.fn(),
            handleRemoveMember: jest.fn(),
          }}
        >
          <ShareListItem {...extraProps} />
        </ShareModalContext.Provider>
      </Provider>
    );
    const shallowWrapper = setupShallowProvider(
      <Provider store={store}>
        <ShareModalContext.Provider
          value={{
            userRole: 'OWNER',
            handleChangePermission: jest.fn(),
          }}
        >
          <ShareListItem {...extraProps} />
        </ShareModalContext.Provider>
      </Provider>
    );

    return {
      mountWrapper,
      shallowWrapper,
    };
  };

  it('snapshot render', () => {
    const { mountWrapper } = setup(props);
    expect(mountWrapper).toMatchSnapshot();
  });

  it('snapshot render with class', () => {
    const newProps = {
      ...props,
      className: 'className',
    };
    const { mountWrapper } = setup(newProps);
    expect(mountWrapper).toMatchSnapshot();
  });

  it('snapshot render with member empty', () => {
    const newProps = {
      ...props,
      member: null,
    };
    const { mountWrapper } = setup(newProps);
    expect(mountWrapper).toMatchSnapshot();
  });

  it('snapshot render with class', () => {
    const newProps = {
      ...props,
      className: 'className',
    };
    const { mountWrapper } = setup(newProps);
    expect(mountWrapper).toMatchSnapshot();
  });

  it('!isdocumentPersonal && member.type === external', () => {
    const newProps = {
      ...props,
      member: {
        ...props.member,
        role: '',
      },
    };
    const { mountWrapper } = setup(newProps);
    expect(mountWrapper).toMatchSnapshot();
  });

  it('!isdocumentPersonal && member.type !== external', () => {
    const newProps = {
      ...props,
      member: {
        ...props.member,
        type: '123',
        role: '',
      },
    };
    const { mountWrapper } = setup(newProps);
    expect(mountWrapper).toMatchSnapshot();
  });

  it('!isdocumentPersonal && member.type !== external and member.role !== team and owner', () => {
    const newProps = {
      ...props,
      member: {
        ...props.member,
        type: '123',
        role: '',
      },
    };
    const { mountWrapper } = setup(newProps);
    expect(mountWrapper).toMatchSnapshot();
  });

  it('render request_access type is Owned', () => {
    const newProps = {
      ...props,
      member: {
        ...props.member,
        name: null,
        type: 'request_access',
        role: 'viewer',
      },
      isOwned: true,
      isCurrentUser: true,
    };

    const { shallowWrapper } = setup(newProps);
    expect(shallowWrapper).toMatchSnapshot();
  });

  it('render request_access type is not Owned', () => {
    const newProps = {
      ...props,
      member: {
        ...props.member,
        name: null,
        type: 'request_access',
        role: 'team',
      },
      isOwned: false,
      isCurrentUser: false,
    };

    const { shallowWrapper } = setup(newProps);
    expect(shallowWrapper).toMatchSnapshot();
  });

  it('render request_access simulate click is loading', () => {
    const newProps = {
      ...props,
      member: {
        ...props.member,
        name: null,
        type: 'request_access',
        role: 'viewer',
      },
      isOwned: true,
      isCurrentUser: true,
    };

    const { shallowWrapper } = setup(newProps);
    shallowWrapper.setProps({ requestLoading: true });
    expect(shallowWrapper.find(CircularLoading)).toEqual({});
  });
});