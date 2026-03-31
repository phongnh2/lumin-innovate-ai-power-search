import React from 'react';
import { mount, shallow } from 'enzyme';
import configureMockStore from 'redux-mock-store';
import initialState from 'src/redux/initialState';
import { MemoryRouter } from 'react-router';
import thunk from 'redux-thunk';
import ToolButton from '../ToolButton';
import ViewerContext from '../../../screens/Viewer/Context';

jest.mock('helpers/getCurrentRole')

const { Provider } = jest.requireActual('react-redux');
const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);
const store = mockStore({
  ...initialState,
  auth: {
    ...initialState.auth,
    currentDocument: {roleOfDocument: '', shareSetting: {}}
  }
});


const setup = (props) => {
  const mergedProps = {
    toolName: 'AnnotationCreateFreeText',
    title: '',
    additionalClass: '',
    arrow: false,
    match: { params: { documentId: '123' } },
    ...props,
  };
  const wrapper = shallow(
    <MemoryRouter>
      <Provider store={store}>
          <ToolButton {...mergedProps} />
      </Provider>
    </MemoryRouter>,
  );
  const instance = mount(
    <MemoryRouter>
      <Provider store={store}>
          <ToolButton {...mergedProps} />
      </Provider>
    </MemoryRouter>,
  );
  return { wrapper, instance };
};

describe('<ToolButton />', () => {
  describe('Snapshots', () => {
    it('should match snapshot', () => {
      const { wrapper, instance } = setup();
      expect(wrapper).toMatchSnapshot();
      expect(instance).toMatchSnapshot();
    });
    it('should match snapshot - document tour', () => {
      const { wrapper, instance } = setup({
        match: { params: { documentId: 'tour' } },
      });
      expect(wrapper).toMatchSnapshot();
      expect(instance).toMatchSnapshot();
    });
  });
});