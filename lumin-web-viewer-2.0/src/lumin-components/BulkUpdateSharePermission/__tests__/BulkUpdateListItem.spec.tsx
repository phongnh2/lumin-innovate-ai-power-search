import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

jest.mock('lumin-ui/kiwi-ui', () => ({
  Text: ({ children }: React.PropsWithChildren<object>) => <span data-testid="text">{children}</span>,
  Checkbox: ({ checked, disabled, onChange }: { checked: boolean; disabled?: boolean; onChange: () => void }) => (
    <input type="checkbox" data-testid="checkbox" checked={checked} disabled={disabled} onChange={onChange} />
  ),
}));

jest.mock('../BulkUpdateSharePermission.module.scss', () => ({
  itemWrapper: 'itemWrapper',
}));

import BulkUpdateListItem from 'luminComponents/BulkUpdateSharePermission/components/BulkUpdateListItem';

describe('BulkUpdateListItem', () => {
  const defaultProps = {
    text: 'Test Item',
    checked: false,
    disabled: false,
    onChange: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render list item with text', () => {
    render(<BulkUpdateListItem {...defaultProps} />);
    expect(screen.getByTestId('text')).toHaveTextContent('Test Item');
  });

  it('should render checkbox', () => {
    render(<BulkUpdateListItem {...defaultProps} />);
    expect(screen.getByTestId('checkbox')).toBeInTheDocument();
  });

  it('should show checked state', () => {
    render(<BulkUpdateListItem {...defaultProps} checked />);
    expect(screen.getByTestId('checkbox')).toBeChecked();
  });

  it('should show unchecked state', () => {
    render(<BulkUpdateListItem {...defaultProps} checked={false} />);
    expect(screen.getByTestId('checkbox')).not.toBeChecked();
  });

  it('should call onChange when clicked', () => {
    render(<BulkUpdateListItem {...defaultProps} />);
    fireEvent.click(screen.getByRole('listitem'));
    expect(defaultProps.onChange).toHaveBeenCalledWith(true);
  });

  it('should not call onChange when disabled and clicked', () => {
    render(<BulkUpdateListItem {...defaultProps} disabled />);
    fireEvent.click(screen.getByRole('listitem'));
    expect(defaultProps.onChange).not.toHaveBeenCalled();
  });

  it('should toggle checked state on click', () => {
    render(<BulkUpdateListItem {...defaultProps} checked />);
    fireEvent.click(screen.getByRole('listitem'));
    expect(defaultProps.onChange).toHaveBeenCalledWith(false);
  });

  it('should disable checkbox when disabled prop is true', () => {
    render(<BulkUpdateListItem {...defaultProps} disabled />);
    expect(screen.getByTestId('checkbox')).toBeDisabled();
  });
});
