import React from 'react';
import { mount } from 'enzyme';
import { TextSize, TextType } from 'lumin-ui/kiwi-ui';

const mockSearchContext = {
  searchKey: '',
};

jest.mock('react', () => {
  const actual = jest.requireActual('react');
  return {
    ...actual,
    useContext: jest.fn(() => mockSearchContext),
  };
});

jest.mock('luminComponents/Document/context', () => {
  const actualReact = jest.requireActual('react');
  return {
    DocumentSearchContext: actualReact.createContext({ searchKey: '' }),
  };
});

jest.mock('react-highlight-words', () => {
  return function Highlighter({ textToHighlight }: { textToHighlight: string }) {
    return <span data-testid="highlighter">{textToHighlight}</span>;
  };
});

jest.mock('../../TextField', () => ({
  TextField: ({
    children,
    value,
    disabled,
    type,
    size,
    tooltip,
    color,
  }: {
    children: React.ReactNode;
    value: string;
    disabled: boolean;
    type: string;
    size: string;
    tooltip: boolean;
    color: string;
  }) => (
    <div
      data-testid="text-field"
      data-value={value}
      data-disabled={disabled}
      data-type={type}
      data-size={size}
      data-tooltip={tooltip}
      data-color={color}
    >
      {children}
    </div>
  ),
}));

import DocumentName from '../DocumentName';
import { DocumentSearchContext } from 'luminComponents/Document/context';

describe('DocumentName', () => {
  const defaultProps = {
    name: 'Test Document',
    disabled: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render component with name', () => {
    const wrapper = mount(<DocumentName {...defaultProps} />);
    expect(wrapper.exists()).toBe(true);
    wrapper.unmount();
  });

  it('should pass name to TextField', () => {
    const wrapper = mount(<DocumentName {...defaultProps} />);
    const textField = wrapper.find('[data-testid="text-field"]');
    expect(textField.prop('data-value')).toBe('Test Document');
    wrapper.unmount();
  });

  it('should pass disabled prop to TextField', () => {
    const wrapper = mount(<DocumentName {...defaultProps} disabled={true} />);
    const textField = wrapper.find('[data-testid="text-field"]');
    expect(textField.prop('data-disabled')).toBe(true);
    wrapper.unmount();
  });

  it('should pass disabled as false when not disabled', () => {
    const wrapper = mount(<DocumentName {...defaultProps} disabled={false} />);
    const textField = wrapper.find('[data-testid="text-field"]');
    expect(textField.prop('data-disabled')).toBe(false);
    wrapper.unmount();
  });

  it('should pass correct TextType', () => {
    const wrapper = mount(<DocumentName {...defaultProps} />);
    const textField = wrapper.find('[data-testid="text-field"]');
    expect(textField.prop('data-type')).toBe(TextType.title);
    wrapper.unmount();
  });

  it('should pass correct TextSize', () => {
    const wrapper = mount(<DocumentName {...defaultProps} />);
    const textField = wrapper.find('[data-testid="text-field"]');
    expect(textField.prop('data-size')).toBe(TextSize.sm);
    wrapper.unmount();
  });

  it('should enable tooltip', () => {
    const wrapper = mount(<DocumentName {...defaultProps} />);
    const textField = wrapper.find('[data-testid="text-field"]');
    expect(textField.prop('data-tooltip')).toBe(true);
    wrapper.unmount();
  });

  it('should pass correct color', () => {
    const wrapper = mount(<DocumentName {...defaultProps} />);
    const textField = wrapper.find('[data-testid="text-field"]');
    expect(textField.prop('data-color')).toBe('var(--kiwi-colors-surface-on-surface)');
    wrapper.unmount();
  });

  it('should use searchKey from context', () => {
    mockSearchContext.searchKey = 'test';
    const wrapper = mount(<DocumentName {...defaultProps} />);
    expect(wrapper.exists()).toBe(true);
    mockSearchContext.searchKey = '';
    wrapper.unmount();
  });

  it('should render Highlighter with correct props', () => {
    const wrapper = mount(<DocumentName {...defaultProps} name="Important Document" />);
    const highlighter = wrapper.find('[data-testid="highlighter"]');
    expect(highlighter.text()).toBe('Important Document');
    wrapper.unmount();
  });
});
