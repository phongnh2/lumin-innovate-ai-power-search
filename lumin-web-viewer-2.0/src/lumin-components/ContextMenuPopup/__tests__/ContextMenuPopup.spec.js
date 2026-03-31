import React from 'react';
import { shallow } from 'enzyme';
import ActionButton from 'luminComponents/ActionButton';
import * as setToolModeAndGroup from 'helpers/setToolModeAndGroup';
import core from 'core';
import ContextMenuPopup from '../ContextMenuPopup';

core.getToolMode = jest.fn(() => ({
  name: ''
}));

jest.mock('../../../helpers/promptUserChangeToolMode');
describe('<ContextMenuPopup />', () => {
  describe('snapshot render', () => {
    it('isDisabled is false', () => {
      const props = {
        dispatch: jest.fn(),
        openElement: jest.fn(),
        closeElement: jest.fn(),
        closeElements: jest.fn(),
        isAnnotationToolsEnabled: true,
      };
      const wrapper = shallow(<ContextMenuPopup {...props} />);
      expect(wrapper).toMatchSnapshot();
    });
    it('isDisabled is true', () => {
      const props = {
        isDisabled: true,
        dispatch: jest.fn(),
        openElement: jest.fn(),
        closeElement: jest.fn(),
        closeElements: jest.fn(),
        isAnnotationToolsEnabled: true,
      };
      const wrapper = shallow(<ContextMenuPopup {...props} />);
      expect(wrapper).toMatchSnapshot();
    });
  });
  describe('simulate click', () => {
    it('click on panToolButton', () => {
      const props = {
        dispatch: jest.fn(),
        openElement: jest.fn(),
        closeElement: jest.fn(),
        closeElements: jest.fn(),
        currentDocument: {
          documentStatus: {
            isPremium: true
          }
        },
      };

      setToolModeAndGroup.default = jest.fn();

      const wrapper = shallow(<ContextMenuPopup {...props} />);
      wrapper
        .find(ActionButton)
        .first()
        .simulate('click');
      expect(setToolModeAndGroup.default).toBeCalled();
      expect(props.closeElement).toBeCalledWith('contextMenuPopup');
    });

    it('click on stickyToolButton', () => {
      const props = {
        dispatch: jest.fn(),
        openElement: jest.fn(),
        closeElement: jest.fn(),
        closeElements: jest.fn(),
        currentDocument: {
          documentStatus: {
            isPremium: true
          }
        },
      };

      setToolModeAndGroup.default = jest.fn();

      const wrapper = shallow(<ContextMenuPopup {...props} />);
      wrapper
        .find(ActionButton)
        .at(1)
        .simulate('click');
      expect(setToolModeAndGroup.default).toBeCalled();
      expect(props.closeElement).toBeCalledWith('contextMenuPopup');
    });

    it('click on AnnotationCreateTextHighlight', () => {
      const props = {
        dispatch: jest.fn(),
        openElement: jest.fn(),
        closeElement: jest.fn(),
        closeElements: jest.fn(),
        currentDocument: {
          documentStatus: {
            isPremium: true
          }
        },
        
      };

      setToolModeAndGroup.default = jest.fn();

      const wrapper = shallow(<ContextMenuPopup {...props} />);
      wrapper
        .find(ActionButton)
        .at(2)
        .simulate('click');
      expect(setToolModeAndGroup.default).toBeCalled();
      expect(props.closeElement).toBeCalledWith('contextMenuPopup');
    });

    it('click on AnnotationCreateFreeHand', () => {
      const props = {
        dispatch: jest.fn(),
        openElement: jest.fn(),
        closeElement: jest.fn(),
        closeElements: jest.fn(),
        currentDocument: {
          documentStatus: {
            isPremium: true
          }
        },
      };

      setToolModeAndGroup.default = jest.fn();

      const wrapper = shallow(<ContextMenuPopup {...props} />);
      wrapper
        .find(ActionButton)
        .at(3)
        .simulate('click');
      expect(setToolModeAndGroup.default).toBeCalled();
      expect(props.closeElement).toBeCalledWith('contextMenuPopup');
    });

    it('click on AnnotationCreateFreeText', () => {
      const props = {
        dispatch: jest.fn(),
        openElement: jest.fn(),
        closeElement: jest.fn(),
        closeElements: jest.fn(),
        currentDocument: {
          documentStatus: {
            isPremium: true
          }
        },
      };

      setToolModeAndGroup.default = jest.fn();

      const wrapper = shallow(<ContextMenuPopup {...props} />);
      wrapper
        .find(ActionButton)
        .at(3)
        .simulate('click');
      expect(setToolModeAndGroup.default).toBeCalled();
      expect(props.closeElement).toBeCalledWith('contextMenuPopup');
    });
  });
  it('click outside', () => {
    const props = {
      dispatch: jest.fn(),
      openElement: jest.fn(),
      closeElement: jest.fn(),
      closeElements: jest.fn(),
      isAnnotationToolsEnabled: true,
    };
    const wrapper = shallow(<ContextMenuPopup {...props} />);
    wrapper.instance().handleClickOutside();
    expect(props.closeElement).toBeCalledWith('contextMenuPopup');
  });
  it('unmount component', () => {
    const props = {
      dispatch: jest.fn(),
      openElement: jest.fn(),
      closeElement: jest.fn(),
      closeElements: jest.fn(),
      isAnnotationToolsEnabled: true,
    };
    const wrapper = shallow(<ContextMenuPopup {...props} />);
    const spyRemoveEventListener = jest
      .spyOn(document, 'removeEventListener')
      .mockImplementation(() => {});
    wrapper.unmount();
    expect(spyRemoveEventListener).toBeCalled();
    spyRemoveEventListener.mockRestore();
  });

  it('componentDidUpdate life cycle', () => {
    const props = {
      dispatch: jest.fn(),
      openElement: jest.fn(),
      closeElement: jest.fn(),
      closeElements: jest.fn(),
      isAnnotationToolsEnabled: true,
    };
    const wrapper = shallow(<ContextMenuPopup {...props} />);
    wrapper.setProps({ isOpen: true });
    expect(props.closeElements).toBeCalledWith([
      'annotationPopup',
      'textPopup',
    ]);
  });

  describe('onContextMenu called', () => {
    it('does not click on documentContainer', () => {
      const props = {
        dispatch: jest.fn(),
        openElement: jest.fn(),
        closeElement: jest.fn(),
        closeElements: jest.fn(),
        isAnnotationToolsEnabled: true,
      };
      const spyQuerySelector = jest
        .spyOn(document, 'querySelector')
        .mockImplementation(() => ({
          contains: jest.fn().mockReturnValue(true),
        }));
      const event = {
        target: { tagName: 'INPUT' },
        preventDefault: jest.fn(),
      };
      const wrapper = shallow(<ContextMenuPopup {...props} />);
      wrapper.instance().onContextMenu(event);
      expect(props.closeElement).toBeCalledWith('contextMenuPopup');
      spyQuerySelector.mockRestore();
    });

    it('click on documentContainer', () => {
      const props = {
        dispatch: jest.fn(),
        openElement: jest.fn(),
        closeElement: jest.fn(),
        closeElements: jest.fn(),
        isAnnotationToolsEnabled: true,
        popupItems: ['yes'],
        isLoadingDocument: false,
      };
      const spyQuerySelector = jest.spyOn(document, 'querySelector');

      spyQuerySelector.mockReturnValue({
        contains: jest.fn().mockImplementation(() => true),
      });
      const event = {
        target: { tagName: '' },
        preventDefault: jest.fn(),
      };
      const wrapper = shallow(<ContextMenuPopup {...props} />);
      wrapper.instance().onContextMenu(event);
      expect(props.openElement).toBeCalledWith('contextMenuPopup');
      spyQuerySelector.mockRestore();
    });

    it('click on documentContainer popupItems < 0', () => {
      const props = {
        dispatch: jest.fn(),
        openElement: jest.fn(),
        closeElement: jest.fn(),
        closeElements: jest.fn(),
        isAnnotationToolsEnabled: true,
        popupItems: [],
      };
      const spyQuerySelector = jest.spyOn(document, 'querySelector');

      spyQuerySelector.mockReturnValue({
        contains: jest.fn().mockImplementation(() => true),
      });
      const event = {
        target: { tagName: '' },
        preventDefault: jest.fn(),
      };
      const wrapper = shallow(<ContextMenuPopup {...props} />);
      wrapper.instance().onContextMenu(event);
      expect(props.openElement).not.toBeCalled();
      spyQuerySelector.mockRestore();
    });
  });
  describe('getPopupPosition', () => {
    const props = {
      dispatch: jest.fn(),
      openElement: jest.fn(),
      closeElement: jest.fn(),
      closeElements: jest.fn(),
      isAnnotationToolsEnabled: true,
    };

    let spyGetElementsByClassName;
    beforeEach(() => {
      spyGetElementsByClassName = jest.spyOn(
        document,
        'getElementsByClassName',
      );
    });
    afterEach(() => {
      spyGetElementsByClassName.mockRestore();
    });

    it('left popup is less than document container left', () => {
      const wrapper = shallow(<ContextMenuPopup {...props} />);
      const param = {
        pageX: 10,
        pageY: 20,
      };
      wrapper.instance().popup = {
        current: {
          value: '',
          getBoundingClientRect: jest
            .fn()
            .mockReturnValue({ width: 100, height: 200 }),
        },
      };

      spyGetElementsByClassName.mockReturnValue([
        {
          getBoundingClientRect: jest.fn().mockReturnValue({
            left: 12,
            top: 12,
            right: 104,
            bottom: 230,
          }),
        },
      ]);
      const output = wrapper.instance().getPopupPosition(param);
      expect(output.left).toBe(2);
      expect(output.top).toBe(20);
    });

    it('left popup is more than document container left', () => {
      const wrapper = shallow(<ContextMenuPopup {...props} />);
      const param = {
        pageX: 20,
        pageY: 20,
      };
      wrapper.instance().popup = {
        current: {
          value: '',
          getBoundingClientRect: jest
            .fn()
            .mockReturnValue({ width: 100, height: 200 }),
        },
      };

      spyGetElementsByClassName.mockReturnValue([
        {
          getBoundingClientRect: jest.fn().mockReturnValue({
            left: 12,
            top: 12,
            right: 104,
            bottom: 230,
          }),
        },
      ]);
      const output = wrapper.instance().getPopupPosition(param);
      expect(output.left).toBe(2);
      expect(output.top).toBe(20);
    });

    it('left + width is less than document container left', () => {
      const wrapper = shallow(<ContextMenuPopup {...props} />);
      const param = {
        pageX: 20,
        pageY: 20,
      };
      wrapper.instance().popup = {
        current: {
          value: '',
          getBoundingClientRect: jest
            .fn()
            .mockReturnValue({ width: 50, height: 200 }),
        },
      };

      spyGetElementsByClassName.mockReturnValue([
        {
          getBoundingClientRect: jest.fn().mockReturnValue({
            left: 12,
            top: 12,
            right: 104,
            bottom: 230,
          }),
        },
      ]);
      const output = wrapper.instance().getPopupPosition(param);
      expect(output.left).toBe(20);
      expect(output.top).toBe(20);
    });

    it('top popup is less than document container top', () => {
      const wrapper = shallow(<ContextMenuPopup {...props} />);
      const param = {
        pageX: 10,
        pageY: 20,
      };
      wrapper.instance().popup = {
        current: {
          value: '',
          getBoundingClientRect: jest
            .fn()
            .mockReturnValue({ width: 100, height: 200 }),
        },
      };

      spyGetElementsByClassName.mockReturnValue([
        {
          getBoundingClientRect: jest.fn().mockReturnValue({
            left: 12,
            top: 25,
            right: 104,
            bottom: 215,
          }),
        },
      ]);
      const output = wrapper.instance().getPopupPosition(param);
      expect(output.left).toBe(2);
      expect(output.top).toBe(13);
    });
  });
});