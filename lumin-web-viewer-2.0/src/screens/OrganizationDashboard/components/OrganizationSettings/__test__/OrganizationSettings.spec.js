import React from 'react';
import { mount } from 'enzyme';
import { Provider } from 'react-redux';
import { merge } from 'lodash';
import { Router } from 'react-router-dom';

import { mockStore } from 'utils/test-utils';
import initialState from 'src/redux/initialState';
import OrganizationSettings from '../OrganizationSettings';
import { createMemoryHistory } from 'history';
import { StoreProvider } from 'helpers/jestTesting';

describe('<OrganizationSettings />', () => {
  const updateCurrentOrganization = jest.fn();
  const setup = () => {
    const history = createMemoryHistory();

    return {
      instance: mount(
        <StoreProvider>
          <Provider
            store={mockStore(merge(
              initialState,
              {
                organization: {
                  currentOrganization: {
                    data: {
                      name: 'mock',
                      url: 'mock domain',
                      avatarRemoteId: 'abc.jpg',
                      associateDomains: [],
                      settings: {
                        templateWorkspace: 'personal',
                      }
                    },
                  },
                  organizations: {
                    data: [],
                  }
                },
              },
            ))}
          >
            <Router history={history}>
              <OrganizationSettings updateCurrentOrganization={updateCurrentOrganization} />
            </Router>
          </Provider>
        </StoreProvider>
      ),
    };
  };
  it('case 1: render page', () => {
    const { instance } = setup();
    expect(instance).toMatchSnapshot();
  });
});