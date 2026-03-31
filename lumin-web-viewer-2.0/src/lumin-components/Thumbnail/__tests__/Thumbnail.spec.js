/* eslint-disable */
import React from 'react';
import { shallow } from 'enzyme';
import Thumbnail from '../Thumbnail';

describe('<Thumbnail />', () => {
  it('snapshot render', () => {
    const props = {
      pageLabels: [],
      index: 1,
      canLoad: true,
      onLoad: jest.fn(),
      onCancel: jest.fn(),
      onRemove: jest.fn(),
      closeElement: jest.fn(),
      currentPage: 0,
      onFinishLoading: jest.fn(),
    };
    const wrapper = shallow(<Thumbnail {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});