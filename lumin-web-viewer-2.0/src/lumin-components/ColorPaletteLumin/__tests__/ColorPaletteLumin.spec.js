/* eslint-disable */
import React from 'react';
import { shallow, mount } from 'enzyme';
import ColorPaletteLumin from '../ColorPaletteLumin';
import ColorMocked from 'src/__mocks__/colorMock';
import ColorCell from '../ColorCell';

jest.mock('core', () => ({
  getSelectedAnnotations: jest.fn().mockReturnValue([]),
  getToolMode: jest.fn().mockReturnValue({}),
}));

global.Core= {
  Annotations: {
    Color: ColorMocked,
  }
};

function EmptyColor(r, b, g, a) {
  this.toHexString = () => {
    const mockFn = jest.fn();
    mockFn.mockReturnValue();
    return mockFn();
  };
  return {
    R: r,
    G: g,
    B: b,
    A: a,
    toHexString: this.toHexString,
  };
}
const color = new ColorMocked();
const emptyColor = new EmptyColor()
describe('<ColorPaletteLumin />', () => {
  describe('Test snapshot', () => {
    it('should render snapshot', () => {
      const component = shallow(
        <ColorPaletteLumin
          colorMapKey='highlight'
          color={color}
          property="StrokeColor"
          onStyleChange={() => {}}
          overridePalette={null}
        />
      );
      expect(component).toMatchSnapshot();
    });
    describe('should render transparency', () => {
      it('should render snapshot', () => {
        const component = shallow(
          <ColorPaletteLumin
            colorMapKey='highlight'
            color={color}
            property="StrokeColor"
            onStyleChange={() => {}}
            overridePalette={null}

          />
        );
        expect(component).toMatchSnapshot();
      });
    });
    describe('should render transparency without color prop', () => {
      it('should render snapshot', () => {
        const component = shallow(
          <ColorPaletteLumin
            colorMapKey='highlight'
            color={color}
            property="StrokeColor"
            onStyleChange={() => {}}
            overridePalette={null}
          />
        );
        expect(component).toMatchSnapshot();
      });
    });
  });

  describe('click on color cell', () => {
    describe('bg is empty', () => {
      it('should call setColor function when user select color', () => {
        const onStyleChange = jest.fn();
        const wrapper = shallow(
          <ColorPaletteLumin
            color={emptyColor}
            colorMapKey='highlight'
            property="StrokeColor"
            onStyleChange={onStyleChange}
            overridePalette={null}
          />
        );
        const { onClick } = wrapper.find(ColorCell).first().props();
        const stopPropagation = jest.fn();
        onClick({
          stopPropagation,
          currentTarget: {
            value: '',
          },
        });
        expect(onStyleChange).toBeCalled();
      });
    });
    describe('bg is not empty', () => {
      it('should call setColor function when user select color', () => {
        const onStyleChange = jest.fn();
        const wrapper = shallow(
          <ColorPaletteLumin
            color={color}
            colorMapKey='highlight'
            property="StrokeColor"
            onStyleChange={onStyleChange}
            overridePalette={null}
          />
        );
        const { onClick } = wrapper.find(ColorCell).first().props();
        const stopPropagation = jest.fn();
        onClick({
          stopPropagation,
          currentTarget: {
            value: '(255, 255, 255)',
          },
        });
        expect(onStyleChange).toBeCalled();
      });
    });
  });
});