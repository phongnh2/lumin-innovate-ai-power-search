import React from 'react';
import { mount } from 'enzyme';
import { Provider } from 'react-redux'

import { renderWithRedux, mockStore } from 'utils/test-utils';

import GoogleFilePicker from '../GoogleFilePicker';

const store = mockStore({});

describe('GoogleFilePicker', () => {
  beforeAll(() => {
    jest.resetModules(); // this is important - it clears the cache
    process.env.GOOGLE_PICKER_CLIENTID = 'abc';
  });

  afterAll(() => {
    delete process.env.GOOGLE_PICKER_CLIENTID;
  });
  const props = {
    onPicked: jest.fn(),
    children: <button>OK</button>,
  };
  it('snapshot renders', () => {
    const mounted = mount(
      <Provider store={store}>
        <GoogleFilePicker {...props} />
      </Provider>
    )
    expect(mounted).toMatchSnapshot();
  });
});
