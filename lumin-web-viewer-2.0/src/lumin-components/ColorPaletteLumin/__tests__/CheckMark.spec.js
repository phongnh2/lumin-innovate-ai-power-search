/* eslint-disable */
import React from 'react';
import { shallow } from 'enzyme';
import ColorMocked from 'src/__mocks__/colorMock';
import CheckMark from '../CheckMark';

function setup(props) {
  const defaultProps = {
    color: new ColorMocked(),
    bg: '',
  };
  const mergedProps = {
    ...defaultProps,
    ...props,
  };
  const wrapper = shallow(<CheckMark {...mergedProps} />);
  return {
    wrapper,
  };
}

describe('<CheckMark />', () => {
  describe('default render', () => {
    it('should match snapshot', () => {
      const { wrapper } = setup();
      expect(wrapper).toMatchSnapshot();
    });
  });
  describe('bg is transparency', () => {
    const Color = new ColorMocked();
    const spyColor = jest.spyOn(Color, 'toHexString').mockReturnValue(null);
    const { wrapper } = setup({
      bg: 'transparency',
      color: Color,
    });
    afterAll(() => {
      spyColor.mockClear();
    });
    it('should match snapshot', () => {
      expect(wrapper).toMatchSnapshot();
    });
    it('should have Icon', () => {
      expect(wrapper.find('.check-mark').exists()).toBeTruthy();
    });
  });
});
