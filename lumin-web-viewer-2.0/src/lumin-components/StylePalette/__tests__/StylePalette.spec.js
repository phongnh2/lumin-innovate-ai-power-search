import React from 'react';
import { shallow } from 'enzyme';
import StylePalette from '../StylePalette';

describe('<StylePalette />', () => {
  it('snapshot render', () => {
    const props = {
      style: {
        TextColor: {},
      },
      onStyleChange: jest.fn(),
      isFreeText: false,
      colorMapKey: '',
      currentPalette: 'TextColor',
    };
    const wrapper = shallow(<StylePalette {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
