import React from 'react';
import { mount } from 'enzyme';
import * as ReactRedux from 'react-redux';
import configureMockStore from 'redux-mock-store';
import core from 'core';
import ViewerContext from '../../../screens/Viewer/Context';
import BookmarksPanel from '../BookmarksPanel';

const mockContext = {};
const mockStore = configureMockStore();
const store = mockStore({});
const props = {
  bookmarks: [{
    children: [],
    name: 'a',
    parent: '',
    url: '',
    getPageNumber: jest.fn(),
  }],
  isDisabled: false,
  display: 'a',
  t: jest.fn(),
};
core.docViewer = {
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
};
describe('<BookmarksPanel />', () => {
  it('test snapshot', () => {
    const wrapper = mount(
      <ReactRedux.Provider store={store}>
        <ViewerContext.Provider value={mockContext}>
          <BookmarksPanel {...props} />
        </ViewerContext.Provider>
      </ReactRedux.Provider>,
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('test snapshot isDisabled and unmount', () => {
    const newProps = {
      ...props,
      isDisabled: true,
    };
    const wrapper = mount(
      <ReactRedux.Provider store={store}>
        <ViewerContext.Provider value={mockContext}>
          <BookmarksPanel {...newProps} />
        </ViewerContext.Provider>
      </ReactRedux.Provider>,
    );
    wrapper.unmount();
    expect(wrapper).toMatchSnapshot();
  });
});
