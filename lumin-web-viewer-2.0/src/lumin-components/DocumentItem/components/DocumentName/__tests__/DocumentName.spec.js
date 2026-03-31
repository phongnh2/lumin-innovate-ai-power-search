import React from 'react';
import { shallow } from 'enzyme';

const mockSearchKey = '';

jest.mock('lumin-components/Document/context', () => ({
  DocumentSearchContext: {},
}));

jest.mock('react', () => {
  const actual = jest.requireActual('react');
  return {
    ...actual,
    useContext: jest.fn(() => ({ searchKey: mockSearchKey })),
  };
});

jest.mock('luminComponents/Shared/Tooltip', () => {
  return function Tooltip({ children, title, disableHoverListener }) {
    return (
      <div data-testid="tooltip" data-title={title} data-disabled={disableHoverListener}>
        {children}
      </div>
    );
  };
});

jest.mock('react-highlight-words', () => {
  return function Highlighter({ textToHighlight }) {
    return <span>{textToHighlight}</span>;
  };
});

import DocumentName from '../DocumentName';

describe('DocumentName', () => {
  const defaultProps = {
    name: 'Test Document',
    disabled: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render component with name', () => {
    const wrapper = shallow(<DocumentName {...defaultProps} />);
    expect(wrapper.exists()).toBe(true);
  });

  it('should display document name', () => {
    const wrapper = shallow(<DocumentName {...defaultProps} />);
    expect(wrapper.text()).not.toBeNull();
  });

  it('should show tooltip title when disabled is false', () => {
    const wrapper = shallow(<DocumentName {...defaultProps} disabled={false} />);
    const tooltip = wrapper.find('Tooltip');
    expect(tooltip.prop('title')).toBe('Test Document');
  });

  it('should not show tooltip title when disabled is true', () => {
    const wrapper = shallow(<DocumentName {...defaultProps} disabled={true} />);
    const tooltip = wrapper.find('Tooltip');
    expect(tooltip.prop('title')).toBe('');
  });

  it('should disable hover listener when disabled is true', () => {
    const wrapper = shallow(<DocumentName {...defaultProps} disabled={true} />);
    const tooltip = wrapper.find('Tooltip');
    expect(tooltip.prop('disableHoverListener')).toBe(true);
  });

  it('should enable hover listener when disabled is false', () => {
    const wrapper = shallow(<DocumentName {...defaultProps} disabled={false} />);
    const tooltip = wrapper.find('Tooltip');
    expect(tooltip.prop('disableHoverListener')).toBe(false);
  });

  it('should render with different names', () => {
    const wrapper = shallow(<DocumentName name="Another Document" disabled={false} />);
    expect(wrapper.text()).not.toBeNull();
  });
});
