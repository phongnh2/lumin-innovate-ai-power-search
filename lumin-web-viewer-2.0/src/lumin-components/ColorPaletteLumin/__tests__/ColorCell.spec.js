/* eslint-disable */
import React from 'react';
import { shallow } from 'enzyme';
import ColorMocked from 'src/__mocks__/colorMock';
import ColorCell from '../ColorCell';
import Button from '@mui/material/Button';

describe('<ColorCell />', () => {
  describe('test snapshot', () => {
    describe('default snapshot', () => {
      it('should match snapshot', () => {
        const props = {
          onClick: jest.fn(),
          color: new ColorMocked(),
        };
        const wrapper = shallow(<ColorCell {...props} />);
        expect(wrapper).toMatchSnapshot();
      });
    });
    describe('current color is transparency', () => {
      it('should match snapshot', () => {
        const props = {
          onClick: jest.fn(),
          color: null,
        };
        const wrapper = shallow(<ColorCell {...props} />);
        expect(wrapper).toMatchSnapshot();
      });
    });
    describe('bg is black color', () => {
      it('cell should have border', () => {
        const props = {
          onClick: jest.fn(),
          color: null,
          bg: 'rgb(255, 255, 255)',
      };
        const wrapper = shallow(<ColorCell {...props} />);
        expect(wrapper).toMatchSnapshot();
        expect(wrapper.find('.bordered').exists()).toBeTruthy();
      });
    });
    it('btn on Click event', () => {
      const props = {
        onClick: jest.fn(),
        color: null,
        bg: 'rgb(255, 255, 255)',
      };
      const wrapper = shallow(<ColorCell {...props} />);
      wrapper.find(Button).simulate('click', {})
      expect(props.onClick).toBeCalled()
    });
  });
});
