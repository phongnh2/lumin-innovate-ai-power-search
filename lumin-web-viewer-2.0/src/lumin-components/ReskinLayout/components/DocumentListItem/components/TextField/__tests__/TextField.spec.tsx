import React from 'react';
import { mount } from 'enzyme';

jest.mock('lumin-ui/kiwi-ui', () => ({
  PlainTooltip: ({
    children,
    content,
    disableInteractive,
  }: {
    children: React.ReactNode;
    content: string;
    disableInteractive: boolean;
  }) => (
    <div data-testid="tooltip" data-content={content} data-disabled={disableInteractive}>
      {children}
    </div>
  ),
  Text: ({
    children,
    type,
    size,
    color,
    className,
    component,
  }: {
    children: React.ReactNode;
    type: string;
    size: string;
    color: string;
    className: string;
    component: string;
  }) => (
    <div
      data-testid="text"
      data-type={type}
      data-size={size}
      data-color={color}
      className={className}
      data-component={component}
    >
      {children}
    </div>
  ),
  TextSize: {
    md: 'md',
    sm: 'sm',
  },
  TextType: {
    body: 'body',
    title: 'title',
  },
}));

import TextField from '../TextField';
import { TextSize, TextType } from 'lumin-ui/kiwi-ui';

describe('TextField', () => {
  const defaultProps = {
    value: 'Test Value',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render component with value', () => {
    const wrapper = mount(<TextField {...defaultProps} />);
    expect(wrapper.exists()).toBe(true);
    wrapper.unmount();
  });

  it('should display value in text', () => {
    const wrapper = mount(<TextField {...defaultProps} />);
    const text = wrapper.find('[data-testid="text"]');
    expect(text.text()).toBe('Test Value');
    wrapper.unmount();
  });

  it('should show tooltip when not disabled and tooltip is true', () => {
    const wrapper = mount(<TextField {...defaultProps} tooltip={true} disabled={false} />);
    const tooltip = wrapper.find('[data-testid="tooltip"]');
    expect(tooltip.prop('data-content')).toBe('Test Value');
    wrapper.unmount();
  });

  it('should not show tooltip when disabled', () => {
    const wrapper = mount(<TextField {...defaultProps} tooltip={true} disabled={true} />);
    const tooltip = wrapper.find('[data-testid="tooltip"]');
    expect(tooltip.prop('data-content')).toBe('');
    wrapper.unmount();
  });

  it('should not show tooltip when tooltip prop is false', () => {
    const wrapper = mount(<TextField {...defaultProps} tooltip={false} disabled={false} />);
    const tooltip = wrapper.find('[data-testid="tooltip"]');
    expect(tooltip.prop('data-content')).toBe('');
    wrapper.unmount();
  });

  it('should use custom tooltip content when provided', () => {
    const wrapper = mount(
      <TextField {...defaultProps} tooltip={true} tooltipContent="Custom Tooltip" disabled={false} />
    );
    const tooltip = wrapper.find('[data-testid="tooltip"]');
    expect(tooltip.prop('data-content')).toBe('Custom Tooltip');
    wrapper.unmount();
  });

  it('should apply custom color', () => {
    const wrapper = mount(<TextField {...defaultProps} color="red" />);
    const text = wrapper.find('[data-testid="text"]');
    expect(text.prop('data-color')).toBe('red');
    wrapper.unmount();
  });

  it('should apply TextType', () => {
    const wrapper = mount(<TextField {...defaultProps} type={TextType.body} />);
    const text = wrapper.find('[data-testid="text"]');
    expect(text.prop('data-type')).toBe('body');
    wrapper.unmount();
  });

  it('should apply TextSize', () => {
    const wrapper = mount(<TextField {...defaultProps} size={TextSize.md} />);
    const text = wrapper.find('[data-testid="text"]');
    expect(text.prop('data-size')).toBe('md');
    wrapper.unmount();
  });

  it('should render children instead of value when provided', () => {
    const wrapper = mount(
      <TextField {...defaultProps} value="Original Value">
        <span>Custom Children</span>
      </TextField>
    );
    const text = wrapper.find('[data-testid="text"]');
    expect(text.text()).toContain('Custom Children');
    wrapper.unmount();
  });

  it('should apply custom component', () => {
    const wrapper = mount(<TextField {...defaultProps} component="span" />);
    const text = wrapper.find('[data-testid="text"]');
    expect(text.prop('data-component')).toBe('span');
    wrapper.unmount();
  });

  it('should disable interactive tooltip when tooltip is disabled', () => {
    const wrapper = mount(<TextField {...defaultProps} disabled={true} tooltip={true} />);
    const tooltip = wrapper.find('[data-testid="tooltip"]');
    expect(tooltip.prop('data-disabled')).toBe(true);
    wrapper.unmount();
  });

  it('should enable interactive tooltip when not disabled and tooltip enabled', () => {
    const wrapper = mount(<TextField {...defaultProps} disabled={false} tooltip={true} />);
    const tooltip = wrapper.find('[data-testid="tooltip"]');
    expect(tooltip.prop('data-disabled')).toBe(false);
    wrapper.unmount();
  });

  it('should use default disabled value as false', () => {
    const wrapper = mount(<TextField value="Test" tooltip={true} />);
    const tooltip = wrapper.find('[data-testid="tooltip"]');
    expect(tooltip.prop('data-content')).toBe('Test');
    wrapper.unmount();
  });
});
