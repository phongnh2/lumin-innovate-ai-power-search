import React from 'react';
import { mount } from 'enzyme';
import configureMockStore from 'redux-mock-store';
import ErrorModal from '../ErrorModal';

const { Provider } = jest.requireActual('react-redux');
const mockStore = configureMockStore();
const store = mockStore({});

jest.mock('react-redux', () => ({ useSelector: jest.fn().mockReturnValue([]), useDispatch: jest.fn() }));

let wrapper;
const remover = jest
  .spyOn(global, 'removeEventListener')
  .mockImplementation(() => {});

describe('<ErrorModal />', () => {
  const props = {
    isDisabled: false,
    message: '',
    isOpen: true,
    showErrorMessage: jest.fn(),
    closeElements: jest.fn(),
  };
  it('mount component', () => {
    wrapper = mount(
      <Provider store={store}>
        <ErrorModal {...props} />
      </Provider>,
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('unmount component', () => {
    const wrapper = mount(
      <Provider store={store}>
        <ErrorModal {...props} />
      </Provider>,
    );
    wrapper.unmount();
    expect(remover).toBeCalled();
  });

  it('component if isDisabled true', () => {
    const newProps = {
      ...props,
      isDisabled: true,
    };
    const wrapper = mount(
      <Provider store={store}>
        <ErrorModal {...newProps} />
      </Provider>,
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('component if isOpen false', () => {
    const newProps = {
      ...props,
      isOpen: false,
    };
    const wrapper = mount(
      <Provider store={store}>
        <ErrorModal {...newProps} />
      </Provider>,
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('shouldTranslate', () => {
    const newProps = {
      ...props,
      message: 'message.',
    };
    const wrapper = mount(
      <Provider store={store}>
        <ErrorModal {...newProps} />
      </Provider>,
    );
    expect(wrapper).toMatchSnapshot();
  });
});
