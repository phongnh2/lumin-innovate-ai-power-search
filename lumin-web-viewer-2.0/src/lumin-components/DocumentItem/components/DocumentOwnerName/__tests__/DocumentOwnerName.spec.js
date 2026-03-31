import React from 'react';
import { shallow } from 'enzyme';

jest.mock('luminComponents/Shared/Tooltip', () => {
  return function Tooltip({ children, title, disableHoverListener }) {
    return <div data-testid="tooltip" data-title={title} data-disabled={disableHoverListener}>{children}</div>;
  };
});

import DocumentOwnerName from '../DocumentOwnerName';

describe('DocumentOwnerName', () => {
  const defaultProps = {
    ownerName: 'John Doe',
    disabled: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render component with owner name', () => {
    const wrapper = shallow(<DocumentOwnerName {...defaultProps} />);
    expect(wrapper.exists()).toBe(true);
  });

  it('should display owner name', () => {
    const wrapper = shallow(<DocumentOwnerName {...defaultProps} />);
    const tooltip = wrapper.find('Tooltip');
    expect(tooltip.dive().text()).toContain('John Doe');
  });

  it('should show tooltip title when disabled is false', () => {
    const wrapper = shallow(<DocumentOwnerName {...defaultProps} disabled={false} />);
    const tooltip = wrapper.find('Tooltip');
    expect(tooltip.prop('title')).toBe('John Doe');
  });

  it('should not show tooltip title when disabled is true', () => {
    const wrapper = shallow(<DocumentOwnerName {...defaultProps} disabled={true} />);
    const tooltip = wrapper.find('Tooltip');
    expect(tooltip.prop('title')).toBe('');
  });

  it('should disable hover listener when disabled is true', () => {
    const wrapper = shallow(<DocumentOwnerName {...defaultProps} disabled={true} />);
    const tooltip = wrapper.find('Tooltip');
    expect(tooltip.prop('disableHoverListener')).toBe(true);
  });

  it('should enable hover listener when disabled is false', () => {
    const wrapper = shallow(<DocumentOwnerName {...defaultProps} disabled={false} />);
    const tooltip = wrapper.find('Tooltip');
    expect(tooltip.prop('disableHoverListener')).toBe(false);
  });

  it('should use default props when disabled is not provided', () => {
    const propsWithoutDisabled = { ownerName: 'Jane Smith' };
    const wrapper = shallow(<DocumentOwnerName {...propsWithoutDisabled} />);
    const tooltip = wrapper.find('Tooltip');
    expect(tooltip.prop('disableHoverListener')).toBe(false);
  });

  it('should render different owner names', () => {
    const wrapper = shallow(<DocumentOwnerName ownerName="Different Owner" />);
    const tooltip = wrapper.find('Tooltip');
    expect(tooltip.dive().text()).toContain('Different Owner');
  });
});

