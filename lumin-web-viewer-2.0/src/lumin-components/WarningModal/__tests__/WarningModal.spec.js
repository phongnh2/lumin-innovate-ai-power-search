import React from "react";
import { shallow } from "enzyme";
import Button from "luminComponents/Button";

import WarningModal from "../WarningModal";

describe("<WarningModal />", () => {
  describe("snapshot render", () => {
    it("should render modal", () => {
      const props = {
        closeElement: jest.fn(),
        closeElements: jest.fn(),
        confirmBtnText: "confirmBtnText",
      };
      const wrapper = shallow(<WarningModal {...props} />);
      expect(wrapper).toMatchSnapshot();
    });

    it("should return null", () => {
      const props = {
        closeElement: jest.fn(),
        closeElements: jest.fn(),
        isDisabled: true,
      };
      const wrapper = shallow(<WarningModal {...props} />);
      expect(wrapper.isEmptyRender()).toBe(true);
      expect(wrapper).toMatchSnapshot();
    });
  });
  describe("simulate event", () => {
    it("click on Confirm button", () => {
      const props = {
        closeElement: jest.fn(),
        closeElements: jest.fn(),
        onConfirm: jest.fn().mockImplementation(() => Promise.resolve()),
        onCancel: jest.fn().mockImplementation(() => Promise.resolve()),
        isDisabled: false,
        confirmBtnText: "",
      };
      const wrapper = shallow(<WarningModal {...props} />);
      wrapper.find(".warningMessageConfirm").simulate("click");
      expect(props.onConfirm).toBeCalled();
    });
    describe("click on Cancel button", () => {
      it("has onCancel prop", () => {
        const props = {
          closeElement: jest.fn(),
          closeElements: jest.fn(),
          onConfirm: jest.fn().mockImplementation(() => Promise.resolve()),
          onCancel: jest.fn().mockImplementation(() => Promise.resolve()),
        };
        const wrapper = shallow(<WarningModal {...props} />);
        wrapper.find(Button).first().simulate("click");
        expect(props.onCancel).toBeCalled();
      });
      it("hasn't onCancel prop", () => {
        const props = {
          closeElement: jest.fn(),
          closeElements: jest.fn(),
          onConfirm: jest.fn().mockImplementation(() => Promise.resolve()),
          onCancel: null,
          isOpen: true,
        };
        const wrapper = shallow(<WarningModal {...props} />);
        wrapper.setProps({
          isOpen: false,
        });
        wrapper.find(Button).first().simulate("click");
        expect(props.closeElement).toBeCalled();
      });
    });
    describe("componentDidUpdate life cycle", () => {
      it("getPopupElements should be called", () => {
        const props = {
          closeElement: jest.fn(),
          closeElements: jest.fn(),
        };
        const wrapper = shallow(<WarningModal {...props} />);
        wrapper.setProps({ isOpen: true });
        expect(props.closeElements).toBeCalled();
      });
    });

    it("component will unmount", () => {
      const props = {
        closeElement: jest.fn(),
        closeElements: jest.fn(),
        onConfirm: jest.fn().mockImplementation(() => Promise.resolve()),
        onCancel: jest.fn().mockImplementation(() => Promise.resolve()),
      };
      const wrapper = shallow(<WarningModal {...props} />);
      const spyRemoveEventListener = jest
        .spyOn(document, "removeEventListener")
        .mockImplementation(() => {});
      wrapper.unmount();
      expect(spyRemoveEventListener).toBeDefined();
    });
  });
});
