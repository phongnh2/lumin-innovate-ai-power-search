import React from 'react';
import { mount } from 'enzyme';
import { MemoryRouter } from 'react-router';
import * as ReactRedux from 'react-redux';
import configureMockStore from 'redux-mock-store';
import initialState from 'src/redux/initialState';

import ToggleElementButton from '../ToggleElementButton';

jest.mock('helpers/getCurrentRole')

const mockStore = configureMockStore();

const store = mockStore(initialState);

describe('<ToggleElementButton />', () => {
  it('snapshot render', () => {
    const mockedProps = {
      openElement: jest.fn(),
      openElements: jest.fn(),
      closeElements: jest.fn(),
      closeElement: jest.fn(),
    };
    const wrapper = mount(
        <ReactRedux.Provider store={store}>
          <MemoryRouter>
            <ToggleElementButton {...mockedProps} />
          </MemoryRouter>
        </ReactRedux.Provider>
    );
    expect(wrapper).toMatchSnapshot();
  });
});