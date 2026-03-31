import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { useTranslation } from 'react-i18next';
import FormFieldDetectionGuideline from '../FormFieldDetectionGuideline';

jest.mock('react-i18next', () => ({
  useTranslation: jest.fn(),
  Trans: ({ i18nKey }: { i18nKey: string }) => <div data-testid="trans-component">{i18nKey}</div>,
}));

jest.mock('@new-ui/general-components/IconButton', () => ({
  __esModule: true,
  default: ({ onClick, icon }: any) => (
    <button onClick={onClick} data-testid="icon-button">
      {icon}
    </button>
  ),
}));

describe('FormFieldDetectionGuideline', () => {
  const mockOnClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useTranslation as jest.Mock).mockReturnValue({
      t: (key: string) => key,
    });
  });

  it('should render title and guideline items', () => {
    render(<FormFieldDetectionGuideline onClose={mockOnClose} />);

    expect(screen.getByText('viewer.formFieldDetection.guideline.title')).toBeInTheDocument();
    expect(screen.getByText('viewer.formFieldDetection.guideline.selecting')).toBeInTheDocument();
    expect(screen.getByTestId('trans-component')).toHaveTextContent('viewer.formFieldDetection.guideline.applying');
  });

  it('should call onClose when close button is clicked', () => {
    render(<FormFieldDetectionGuideline onClose={mockOnClose} />);
    
    fireEvent.click(screen.getByTestId('icon-button'));
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });
});