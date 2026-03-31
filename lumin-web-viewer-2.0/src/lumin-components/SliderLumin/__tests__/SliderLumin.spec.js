import React from 'react';
import { mount } from 'enzyme';
import configureMockStore from 'redux-mock-store';

import initialState from 'src/redux/initialState';
import SliderLumin from '../SliderLumin';

const { Provider } = jest.requireActual('react-redux');
const mockStore = configureMockStore();
// const state = {
//   viewer: {
//     themeMode: 'light'
//   }
// };
const store = mockStore(initialState);

describe('<SliderLumin />', () => {
  it('snapshot render', () => {
    const props = {
      property: '',
      displayProperty: '',
      getCirclePosition: jest.fn(),
      convertRelativeCirclePositionToValue: jest.fn(),
      onStyleChange: jest.fn(),
      t: jest.fn(),
      convertValue: jest.fn(),
      annotation: {},
      dataElement: 'dataElement',
      limitValue: {
        min: 0,
        max: 100,
      }
    };
    const wrapper = mount(
      <Provider store={store}>
        <SliderLumin {...props} />
      </Provider>
    );
    expect(wrapper).toMatchSnapshot();
  });
});
