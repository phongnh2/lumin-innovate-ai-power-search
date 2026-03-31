import React from 'react';
import { mount } from 'enzyme';
import SegmentButtons from '../SegmentButtons';

describe('<SegmentButtons />', () => {
  const props = {
    selected: 'Tab 1',
    tabs: [{
      id: 'Tab 1', labelPc: 'Add members to existing team',
    }],
    onChange: jest.fn(),
  };
  it('should match snapshot', () => {
    const wrapper = mount(<SegmentButtons {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
  it('have tab disabled', () => {
    const newprops = {
      ...props,
      tabs:
      [
        { id: 'Tab 1', labelPc: 'Add members to existing team', disabledTab: true },
        { id: 'Tab 2', labelPc: 'Add members to existing team', labelMb: 'To existing team' },
      ],
    };
    const wrapper = mount(<SegmentButtons {...newprops} />);
    expect(wrapper).toMatchSnapshot();
  });
});
