import React from 'react';
import { shallow } from 'enzyme';

jest.mock('../../../DocumentItem.styled', () => ({
  ButtonMore: ({ children, onClick, className, $disabled }) => (
    <button 
      data-testid="button-more" 
      onClick={onClick} 
      className={className}
      data-disabled={$disabled}
    >
      {children}
    </button>
  ),
}));

import DocumentActionButton from '../DocumentActionButton';

describe('DocumentActionButton', () => {
  const defaultProps = {
    disabled: false,
    className: 'test-class',
    children: <span>Test Button</span>,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render component with children', () => {
    const wrapper = shallow(<DocumentActionButton {...defaultProps} />);
    expect(wrapper.exists()).toBe(true);
    expect(wrapper.find('ButtonMore').exists()).toBe(true);
  });

  it('should apply custom className', () => {
    const wrapper = shallow(<DocumentActionButton {...defaultProps} className="custom-class" />);
    const button = wrapper.find('ButtonMore');
    expect(button.prop('className')).toBe('custom-class');
  });

  it('should use empty className by default', () => {
    const propsWithoutClass = { disabled: false, children: <span>Test</span> };
    const wrapper = shallow(<DocumentActionButton {...propsWithoutClass} />);
    const button = wrapper.find('ButtonMore');
    expect(button.prop('className')).toBe('');
  });

  it('should pass disabled state to styled component', () => {
    const wrapper = shallow(<DocumentActionButton {...defaultProps} disabled={true} />);
    const button = wrapper.find('ButtonMore');
    expect(button.prop('$disabled')).toBe(true);
  });

  it('should not pass disabled state when false', () => {
    const wrapper = shallow(<DocumentActionButton {...defaultProps} disabled={false} />);
    const button = wrapper.find('ButtonMore');
    expect(button.prop('$disabled')).toBe(false);
  });

  it('should stop propagation when disabled and clicked', () => {
    const wrapper = shallow(<DocumentActionButton {...defaultProps} disabled={true} />);
    const button = wrapper.find('ButtonMore');
    const mockEvent = { stopPropagation: jest.fn() };
    
    button.prop('onClick')(mockEvent);
    
    expect(mockEvent.stopPropagation).toHaveBeenCalled();
  });

  it('should not stop propagation when not disabled and clicked', () => {
    const wrapper = shallow(<DocumentActionButton {...defaultProps} disabled={false} />);
    const button = wrapper.find('ButtonMore');
    const mockEvent = { stopPropagation: jest.fn() };
    
    button.prop('onClick')(mockEvent);
    
    expect(mockEvent.stopPropagation).not.toHaveBeenCalled();
  });

  it('should handle click when event is provided', () => {
    const wrapper = shallow(<DocumentActionButton {...defaultProps} disabled={false} />);
    const button = wrapper.find('ButtonMore');
    const mockEvent = { stopPropagation: jest.fn() };
    
    button.prop('onClick')(mockEvent);
    
    expect(mockEvent.stopPropagation).not.toHaveBeenCalled();
  });

  it('should render children inside ButtonMore', () => {
    const wrapper = shallow(<DocumentActionButton {...defaultProps} />);
    const button = wrapper.find('ButtonMore');
    expect(button.children().length).toBeGreaterThan(0);
  });
});

