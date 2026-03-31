/* eslint-disable */
import React from 'react';
import { shallow } from 'enzyme';

import TransparencyCell from '../TransparencyCell';

function setup(props) {
  const defaultProps = {
    property: 'TextColor',
    setColor: jest.fn(),
    bg: '',
    color: {},
  };
  const mergedProps = { ...defaultProps, ...props };
  const wrapper = shallow(<TransparencyCell {...mergedProps} />);
  return { wrapper };
}

describe('<TransparencyCell />', () => {
  describe('property is TextColor or StrokeColor', () => {
    const { wrapper } = setup();
    it('snapshot render', () => {
      expect(wrapper).toMatchSnapshot();
    });
  });
  describe('property is not TextColor and StrokeColor', () => {
    it('snapshot render', () => {
      const { wrapper } = setup({ property: '' });
      expect(wrapper).toMatchSnapshot();
    });
  });
});
