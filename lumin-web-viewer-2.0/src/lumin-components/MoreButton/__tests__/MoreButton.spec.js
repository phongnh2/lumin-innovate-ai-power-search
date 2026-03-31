/* eslint-disable */
import React from 'react';
import { shallow } from 'enzyme';
import { StoreProvider } from 'helpers/jestTesting';
import MoreButton from '../MoreButton';

afterEach(() => {
  jest.clearAllMocks();
});

describe('<MoreButton />', () => {
  const props = {};
  it('snapshot render', () => {
    const wrapper = shallow(<StoreProvider><MoreButton {...props} /></StoreProvider>);
    expect(wrapper).toMatchSnapshot();
  });
});