/* eslint-disable */
import React from 'react';
import { shallow } from 'enzyme';
import Color from 'src/__mocks__/colorMock';
import ColorPaletteHeader from '../ColorPaletteHeader';

describe('<ColorPaletteHeader />', () => {
  describe('snapshot render', () => {
    it('render with pallete', () => {
      const props = {
        style: {
          TextColor: new Color(),
          FillColor: new Color()
        },
        colorPalette: 'TextColor',
        colorMapKey: 'freeText',
        setActivePalette: jest.fn(),
        isTextColorPaletteDisabled: true,
        isBorderColorPaletteDisabled: true,
        t: jest.fn()
      };
      const wrapper = shallow(<ColorPaletteHeader {...props} />);
      expect(wrapper.find('.palette')).toHaveLength(1);
      expect(wrapper).toMatchSnapshot();
    });

    it('render without pallete', () => {
      const props = {
        style: {
          TextColor: new Color(),
          FillColor: new Color()
        },
        colorPalette: 'TextColor',
        colorMapKey: 'freeHand',
        setActivePalette: jest.fn(),
        t: jest.fn()
      };
      const wrapper = shallow(<ColorPaletteHeader {...props} />);
      expect(wrapper.find('.palette')).toHaveLength(0);
      expect(wrapper).toMatchSnapshot();
    });
  });

  describe('simulate click', () => {

    it('click StrokeColor', () => {
      const props = {
        style: {
          TextColor: new Color(),
          FillColor: new Color()
        },
        colorPalette: 'StrokeColor',
        colorMapKey: 'freeText',
        setActivePalette: jest.fn(),
        t: jest.fn()
      };
      const wrapper = shallow(<ColorPaletteHeader {...props} />);
      wrapper.find('.border').first().simulate('click');
      expect(props.setActivePalette).toBeCalled();
    });
    it('click FillColor', () => {
      const props = {
        style: {
          TextColor: new Color(),
          FillColor: new Color()
        },
        colorPalette: 'FillColor',
        colorMapKey: 'freeText',
        setActivePalette: jest.fn(),
        t: jest.fn()
      };
      const wrapper = shallow(<ColorPaletteHeader {...props} />);
      wrapper.find('.fill').first().simulate('click');
      expect(props.setActivePalette).toBeCalled();
    });
  });
});
