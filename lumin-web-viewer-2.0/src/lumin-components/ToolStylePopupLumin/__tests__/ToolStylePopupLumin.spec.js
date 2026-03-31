import React from 'react';
import { shallow, mount } from 'enzyme';
import ToolStylePopupLumin from '../ToolStylePopupLumin';

describe('<ToolStylePopupLumin />', () => {
  it('snapshot render', () => {
    const props = {
      toolButtonObjects: {},
      closeElement: jest.fn(),
      closeElements: jest.fn(),
      activeHeaderItems: [],
    };
    const spyQuerySelector = jest
      .spyOn(document, 'querySelector')
      .mockReturnValue(<div></div>);
    const wrapper = shallow(<ToolStylePopupLumin {...props} />);
    // trigger componentDidUpdate to render popup
    wrapper.setProps({ isOpen: true });
    let wrapperAfterDidUpdate = shallow(<ToolStylePopupLumin {...props} />);
    expect(wrapperAfterDidUpdate).toMatchSnapshot();
    spyQuerySelector.mockRestore();
  });
});