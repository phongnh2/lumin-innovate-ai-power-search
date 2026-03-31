import React from 'react';
import configureMockStore from 'redux-mock-store';
import { setupMountProvider } from 'helpers/jestTesting';
import initialState from 'src/redux/initialState';

import TimeLimit from '../TimeLimit';

const { Provider } = jest.requireActual('react-redux');
const mockStore = configureMockStore();

const store = mockStore({ ...initialState, auth: { ...initialState.auth, currentDocument: { ...initialState.auth.currentDocument, documentReference: {
  documentReferenceData: '',
  accountableBy: '',
} } } });

describe('<TimeLimit />', () => {
  const props = {
    currentDocument: {
      createdTime: '1583338430185',
      name: 'PDF test',
      belongsTo: { 
        location: '',
        type: '',
        workspaceId: '',
      },
      documentReference: {
        documentReferenceData: '',
        accountableBy: '',
      }
    },
    isOffline: false,
  }

  const setup = (extraProps) => {
    const mountWrapper = setupMountProvider(
      <Provider store={store}>
        <TimeLimit {...extraProps} />
      </Provider>
    );

    return {
      mountWrapper,
    };
  };

  it('snapshot render', () => {
    const { mountWrapper } = setup(props);
    expect(mountWrapper).toMatchSnapshot();
  });
});
