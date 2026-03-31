/* eslint-disable */
import React from 'react';
import { mount } from 'enzyme';
import { act } from 'react-dom/test-utils';
import { MemoryRouter } from 'react-router';

import ButtonMaterial from 'luminComponents/ButtonMaterial';
import authService from 'services/authServices';
import { kratosService } from 'services/oryServices';
import documentServices from 'services/documentServices';

import RequestAccess from '../RequestAccess';
import { setupMountProvider } from 'helpers/jestTesting';

jest.mock("react-notifications-component", () => {
  const lib = jest.requireActual("react-notifications-component");

  return {
      ...lib,
      Store: {
        ...lib.Store,
        addNotification: (params) => {},
      }, 
  };
});

jest.mock('broadcast-channel', () => {
  return {
    BroadcastChannel: () => ({
      postMessage: (data) => {}
    }),
  }
})

const defaultProps = {
  currentUser: {},
  location: {
    search: '?docId=123456',
  },
  history: {
    push: jest.fn(),
  },
};

const renderWithRouter = (propParams) => {
  const newProps = {...defaultProps, ...propParams}
  return setupMountProvider(
    <MemoryRouter>
      <RequestAccess {...newProps}  />
    </MemoryRouter>
  );
}

describe('<RequestAccess />', () => {
  
  it('RequestAccess', () => {
    const wrapper = renderWithRouter();
    expect(wrapper).toMatchSnapshot();
  });

  it('RequestAccess not have docId', () => {
    const newProps = {
      ...defaultProps,
      location: {
        search: '',
      },
    };
    const wrapper = renderWithRouter(newProps);
    expect(wrapper).toMatchSnapshot();
  });

  it('RequestAccess simulate sign in with another account button', async () => {
    const props = {
      currentUser: {},
      location: {
        search: '?docId=123456',
      },
      history: {
        push: jest.fn(),
      },
    };
    const auth = jest.spyOn(kratosService, 'signOut').mockImplementation(() => {});
    const wrapper = renderWithRouter(props);
    await act(async () => {
      wrapper.find('button#request-cancelled').simulate('click');
    });
    expect(auth).toBeCalled();
  });

  // it('RequestAccess simulate request button', async () => {
  //   const wrapper = renderWithRouter();
  //   const documentSpy = jest
  //     .spyOn(documentServices, 'requestAccessDocument')
  //     .mockResolvedValue();
  //   await act(async () => {
  //     wrapper.find('button#request-submitted').simulate('click');
  //   });
  //   expect(documentSpy).toBeCalled();
  //   expect(defaultProps.history.push).toBeCalled();
  //   documentSpy.mockRestore();
  // });
});
