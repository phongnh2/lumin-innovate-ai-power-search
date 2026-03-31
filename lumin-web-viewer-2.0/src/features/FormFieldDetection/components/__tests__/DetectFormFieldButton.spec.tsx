import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { useGetCurrentUser } from 'hooks/useGetCurrentUser';
import { useFormFieldDetectionUsage } from '../../hooks/useFormFieldDetectionUsage';
import { useIsValidDocumentForFormFieldDetection } from '../../hooks/useIsValidDocumentForFormFieldDetection';
import { useProcessFormFieldDetection } from '../../hooks/useProcessFormFieldDetection';
import useShowModal from '../../hooks/useShowModal';
import DetectFormFieldButton from '../DetectFormFieldButton';

jest.mock('lumin-ui/kiwi-ui', () => ({
  MenuItem: ({ children, onClick, disabled, leftSection, ...props }: any) => (
    <button 
      onClick={onClick} 
      disabled={disabled} 
      data-testid="menu-item" 
      data-lumin-btn-name={props['data-lumin-btn-name']}
      data-lumin-btn-purpose={props['data-lumin-btn-purpose']}
    >
      {leftSection}
      {children}
    </button>
  ),
  PlainTooltip: ({ children, content }: any) => (
    <div data-testid="plain-tooltip" title={content}>
      {children}
    </div>
  ),
}));

jest.mock('@new-ui/HOCs/withValidUserCheck', () => ({
  AvailabilityToolCheckProvider: ({ render }: any) =>
    render({
      isOpen: false,
      onClose: jest.fn(),
    }),
}));

jest.mock('hooks/useGetCurrentUser', () => ({
  useGetCurrentUser: jest.fn(),
}));

jest.mock('../../hooks/useFormFieldDetectionUsage', () => ({
  useFormFieldDetectionUsage: jest.fn(),
}));

jest.mock('../../hooks/useIsValidDocumentForFormFieldDetection', () => ({
  useIsValidDocumentForFormFieldDetection: jest.fn(),
}));

jest.mock('../../hooks/useProcessFormFieldDetection', () => ({
  useProcessFormFieldDetection: jest.fn(),
}));

jest.mock('../../hooks/useShowModal', () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock('constants/toolsName', () => ({
  __esModule: true,
  default: {
    FORM_FIELD_DETECTION: 'FORM_FIELD_DETECTION',
  },
}));

describe('DetectFormFieldButton', () => {
  const mockOnClick = jest.fn((renderParams, callback) => callback());
  const mockOnClickCallback = jest.fn();
  const mockApplyFormFieldDetection = jest.fn();
  const mockShowPreconditionNotMatchModal = jest.fn();

  const defaultProps = {
    onClose: jest.fn(),
    dataCy: 'test-cy',
    dataLuminBtnName: 'test-btn',
    dataLuminBtnPurpose: 'test-purpose',
    onClick: mockOnClick,
    onClickCallback: mockOnClickCallback,
    leftSection: <span data-testid="left-icon" />,
    children: 'Detect Fields',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    (useGetCurrentUser as jest.Mock).mockReturnValue({ id: 'user1' });
    
    (useFormFieldDetectionUsage as jest.Mock).mockReturnValue({
      isOverFFDQuota: false,
      isLoadingFFDUsage: false,
      overFFDQuotaMessage: 'Quota exceeded message',
    });

    (useIsValidDocumentForFormFieldDetection as jest.Mock).mockReturnValue({
      isValidDocumentForFormFieldDetection: true,
    });

    (useProcessFormFieldDetection as jest.Mock).mockReturnValue(mockApplyFormFieldDetection);

    (useShowModal as jest.Mock).mockReturnValue({
      showPreconditionNotMatchModal: mockShowPreconditionNotMatchModal,
    });
    
    mockApplyFormFieldDetection.mockResolvedValue(undefined);
  });

  it('should render correctly with children and left section', () => {
    render(<DetectFormFieldButton {...defaultProps} />);

    expect(screen.getByText('Detect Fields')).toBeInTheDocument();
    expect(screen.getByTestId('left-icon')).toBeInTheDocument();
    expect(screen.getByTestId('plain-tooltip')).toHaveAttribute('title', 'Quota exceeded message');
  });

  it('should call onClickCallback and apply detection when document is valid', async () => {
    render(<DetectFormFieldButton {...defaultProps} />);
    
    const button = screen.getByTestId('menu-item');
    fireEvent.click(button);

    expect(mockOnClickCallback).toHaveBeenCalled();
    expect(mockApplyFormFieldDetection).toHaveBeenCalled();
    expect(mockShowPreconditionNotMatchModal).not.toHaveBeenCalled();
  });

  it('should show precondition modal when document is invalid', () => {
    (useIsValidDocumentForFormFieldDetection as jest.Mock).mockReturnValue({
      isValidDocumentForFormFieldDetection: false,
    });

    render(<DetectFormFieldButton {...defaultProps} />);
    
    const button = screen.getByTestId('menu-item');
    fireEvent.click(button);

    expect(mockOnClickCallback).toHaveBeenCalled();
    expect(mockShowPreconditionNotMatchModal).toHaveBeenCalled();
    expect(mockApplyFormFieldDetection).not.toHaveBeenCalled();
  });

  it('should be disabled if user exists and is loading usage', () => {
    (useFormFieldDetectionUsage as jest.Mock).mockReturnValue({
      isLoadingFFDUsage: true,
      isOverFFDQuota: false,
      overFFDQuotaMessage: '',
    });

    render(<DetectFormFieldButton {...defaultProps} />);
    const button = screen.getByTestId('menu-item');
    
    expect(button).toBeDisabled();
  });

  it('should be disabled if user exists and is over quota', () => {
    (useFormFieldDetectionUsage as jest.Mock).mockReturnValue({
      isLoadingFFDUsage: false,
      isOverFFDQuota: true,
      overFFDQuotaMessage: 'Limit reached',
    });

    render(<DetectFormFieldButton {...defaultProps} />);
    const button = screen.getByTestId('menu-item');
    
    expect(button).toBeDisabled();
  });

  it('should handle detection failure gracefully', async () => {
    mockApplyFormFieldDetection.mockRejectedValue(new Error('Detection failed'));
    
    render(<DetectFormFieldButton {...defaultProps} />);
    const button = screen.getByTestId('menu-item');
    
    fireEvent.click(button);
    
    expect(mockApplyFormFieldDetection).toHaveBeenCalled();
  });

  describe('default parameter values (lines 27-32)', () => {
    it('should use default onClose when not provided', () => {
      const { onClose, ...propsWithoutOnClose } = defaultProps;
      
      render(<DetectFormFieldButton {...propsWithoutOnClose} />);
      
      // Component should render without errors when onClose uses default
      expect(screen.getByText('Detect Fields')).toBeInTheDocument();
      expect(screen.getByTestId('left-icon')).toBeInTheDocument();
    });

    it('should use default dataLuminBtnPurpose (empty string) when not provided', () => {
      const { dataLuminBtnPurpose, ...propsWithoutPurpose } = defaultProps;
      
      render(<DetectFormFieldButton {...propsWithoutPurpose} />);
      
      const button = screen.getByTestId('menu-item');
      // When dataLuminBtnPurpose is not provided, it defaults to empty string
      expect(button).toBeInTheDocument();
      expect(button).toHaveAttribute('data-lumin-btn-purpose', '');
    });

    it('should use default onClickCallback when not provided', async () => {
      const { onClickCallback, ...propsWithoutCallback } = defaultProps;
      
      render(<DetectFormFieldButton {...propsWithoutCallback} />);
      
      const button = screen.getByTestId('menu-item');
      // Should not throw error when onClickCallback uses default empty function
      fireEvent.click(button);
      
      // Should still call applyFormFieldDetection
      expect(mockApplyFormFieldDetection).toHaveBeenCalled();
      // onClickCallback should not have been called since it wasn't provided
      expect(mockOnClickCallback).not.toHaveBeenCalled();
    });

    it('should use default onClickCallback when document is invalid', async () => {
      (useIsValidDocumentForFormFieldDetection as jest.Mock).mockReturnValue({
        isValidDocumentForFormFieldDetection: false,
      });

      const { onClickCallback, ...propsWithoutCallback } = defaultProps;
      
      render(<DetectFormFieldButton {...propsWithoutCallback} />);
      
      const button = screen.getByTestId('menu-item');
      fireEvent.click(button);
      
      // Should show precondition modal
      expect(mockShowPreconditionNotMatchModal).toHaveBeenCalled();
      // onClickCallback should not have been called since it wasn't provided
      expect(mockOnClickCallback).not.toHaveBeenCalled();
    });

    it('should work correctly when all optional props use defaults', async () => {
      const minimalProps = {
        dataLuminBtnName: 'test-btn',
        onClick: mockOnClick,
        leftSection: <span data-testid="left-icon" />,
        children: 'Detect Fields',
      };
      
      render(<DetectFormFieldButton {...minimalProps} />);
      
      expect(screen.getByText('Detect Fields')).toBeInTheDocument();
      expect(screen.getByTestId('left-icon')).toBeInTheDocument();
      
      const button = screen.getByTestId('menu-item');
      expect(button).toHaveAttribute('data-lumin-btn-purpose', '');
      
      // Should work without errors when clicking
      fireEvent.click(button);
      expect(mockApplyFormFieldDetection).toHaveBeenCalled();
      expect(mockOnClickCallback).not.toHaveBeenCalled();
    });
  });
});