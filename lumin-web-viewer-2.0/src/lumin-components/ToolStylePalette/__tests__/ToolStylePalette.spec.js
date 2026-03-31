import React from 'react';
import { shallow } from 'enzyme';
import core from 'core';

import ToolStylePalette from '../ToolStylePalette';

let wrapper;
const props = {
  closeElement: jest.fn()
};
beforeEach(() => {
  wrapper = shallow(<ToolStylePalette {...props} />);
});

describe('<ToolStylePalette />', () => {
  it('snapshot render', () => {
    expect(wrapper).toMatchSnapshot();
  });
  describe('unmount test', () => {
    it('removeEventListener should be called', () => {
      const spyRemoveEventListener = jest
        .spyOn(window, 'removeEventListener')
        .mockImplementation(() => {});

      wrapper.unmount();
      expect(spyRemoveEventListener).toBeCalled();
      expect(spyRemoveEventListener).toBeCalledWith(
        'resize',
        expect.any(Function)
      );
      spyRemoveEventListener.mockRestore();
    });
  });
  describe('handleStyleChange', () => {
    it('core.getTool should be called', () => {
      const spyGetTool = jest.spyOn(core, 'getTool').mockImplementation(() => ({
        setStyles: jest.fn(),
      }));
      wrapper.instance().handleStyleChange();
      expect(spyGetTool).toBeCalled();
      spyGetTool.mockRestore();
    });
  });
  describe('simulate window resize', () => {
    it('closeElement should be called', () => {
      // simulate window resize
      global.dispatchEvent(new Event('resize'));
      expect(props.closeElement).toBeCalled();
    });
  });
});