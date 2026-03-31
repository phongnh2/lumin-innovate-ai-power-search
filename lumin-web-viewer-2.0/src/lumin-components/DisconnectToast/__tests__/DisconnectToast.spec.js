import React from 'react';
import { shallow } from 'enzyme';
import configureMockStore from 'redux-mock-store';
import * as ReactRedux from 'react-redux';
import DisconnectToast from '../DisconnectToast';

const mockStore = configureMockStore();
const store = mockStore({});

describe('<DisconnectToast />', () => {
  const props = {};
  it('snapshot render', () => {
    const spy = jest
    .spyOn(ReactRedux, 'useSelector')
    .mockImplementation(() => '');
    const wrapper = shallow(
      <ReactRedux.Provider store={store}>
        <DisconnectToast {...props} />
      </ReactRedux.Provider>,
    );
    expect(wrapper).toMatchSnapshot();
    spy.mockRestore();
  })
});
