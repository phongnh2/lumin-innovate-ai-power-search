import React from "react";
import { shallow, mount } from "enzyme";
import ZoomOverlay from "../ZoomOverlay";

describe("<ZoomOverlay />", () => {
  it("snapshot render", () => {
    const props = {
      t: jest.fn().mockReturnValue(""),
      zoomList: [1, 2, 3],
      closeElements: jest.fn(),
      isDisabled: false,
      isOpen: false,
      zoomTo: jest.fn(),
    };

    const wrapper = mount(<ZoomOverlay {...props} />);
    const { onClick } = wrapper.find("OverlayItem").first().props();
    const stopPropagation = jest.fn();
    onClick({
      stopPropagation,
      currentTarget: {
        value: "",
      },
    });
    wrapper.setProps({
      isOpen: true,
    });
    expect(wrapper).toMatchSnapshot();
  });
  it("snapshot render - disable zoom", () => {
    const props = {
      t: jest.fn().mockReturnValue(""),
      zoomList: [1, 2, 3],
      closeElements: jest.fn(),
      isDisabled: true,
      isOpen: true,
    };
    const wrapper = shallow(<ZoomOverlay {...props} />);
    expect(wrapper).toMatchSnapshot();
  });

  it("snapshot render - should be resize", () => {
    const props = {
      t: jest.fn().mockReturnValue(""),
      zoomList: [1, 2, 3],
      closeElements: jest.fn(),
      isDisabled: false,
      isOpen: true,
      handleWindowResize: jest.fn().mockReturnValue(undefined),
    };
    const wrapper = mount(<ZoomOverlay {...props} />);
    const spy = jest.spyOn(wrapper.instance(), "handleWindowResize");

    global.addEventListener("resize", spy);
    global.dispatchEvent(new Event("resize"));

    expect(spy).toHaveBeenCalled();
  });

  it("snapshot render - component willUnmount", () => {
    const props = {
      t: jest.fn().mockReturnValue(""),
      zoomList: [1, 2, 3],
      closeElements: jest.fn(),
      isDisabled: false,
      isOpen: true,
      handleWindowResize: jest.fn().mockReturnValue(undefined),
    };
    const wrapper = shallow(<ZoomOverlay {...props} />);
    const spyRemoveEventListener = jest
      .spyOn(document, "removeEventListener")
      .mockImplementation(() => {});
    wrapper.unmount();
    expect(spyRemoveEventListener).toBeDefined();
  });

  it("snapshot render - handleCloseOverlay", () => {
    const props = {
      t: jest.fn().mockReturnValue(""),
      zoomList: [1, 2, 3],
      closeElement: jest.fn(),
      closeElements: jest.fn(),
      isDisabled: false,
      isOpen: true,
    };
    const wrapper = shallow(<ZoomOverlay {...props} />);
    wrapper.instance().handleClickOutside();
    expect(props.closeElement).toBeDefined();
  });
});