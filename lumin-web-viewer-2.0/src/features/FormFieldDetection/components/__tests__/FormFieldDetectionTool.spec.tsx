import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { useRequestPermissionChecker } from 'hooks/useRequestPermissionChecker';
import { useTranslation } from 'hooks/useTranslation';
import { ToolSwitchableChecker } from 'helpers/toolSwitchableChecker';
import FormFieldDetectionTool from '../FormFieldDetectionTool';

// Shared mock to allow dynamic behavior in tests
const mockDetectFormFieldButtonClick = jest.fn();

jest.mock('lumin-ui/kiwi-ui', () => ({
  Icomoon: () => <span data-testid="icomoon" />,
}));

jest.mock('@new-ui/components/LuminToolbar/tools-components/AITool/AIToolSection', () => ({
  __esModule: true,
  default: ({ children, sectionTitle }: any) => (
    <div data-testid="ai-section" title={sectionTitle}>
      {children}
    </div>
  ),
}));

jest.mock('../DetectFormFieldButton', () => ({
  __esModule: true,
  default: ({ children, onClick }: any) => (
    <button onClick={() => mockDetectFormFieldButtonClick(onClick)}>
      {children}
    </button>
  ),
}));

jest.mock('hooks/useRequestPermissionChecker', () => ({
  useRequestPermissionChecker: jest.fn(),
}));

jest.mock('hooks/useTranslation', () => ({
  useTranslation: jest.fn(),
}));

jest.mock('helpers/toolSwitchableChecker', () => ({
  ToolSwitchableChecker: {
    createToolSwitchableHandler: jest.fn((cb) => cb),
  },
}));

describe('FormFieldDetectionTool', () => {
  const mockWithEditPermission = jest.fn((cb) => cb);

  beforeEach(() => {
    jest.clearAllMocks();
    (useTranslation as jest.Mock).mockReturnValue({ t: (k: string) => k });
    (useRequestPermissionChecker as jest.Mock).mockReturnValue({
      withEditPermission: mockWithEditPermission,
      requestAccessModalElement: <div data-testid="request-modal" />,
    });

    // Default behavior for the button mock
    mockDetectFormFieldButtonClick.mockImplementation((onClick) => {
      onClick({ toggleCheckPopper: jest.fn(), shouldShowPremiumIcon: false }, jest.fn());
    });
  });

  it('should render section and button', () => {
    render(<FormFieldDetectionTool />);
    expect(screen.getByTestId('ai-section')).toBeInTheDocument();
    expect(screen.getByText('viewer.formFieldDetection.toolMenu.autoDetectFields')).toBeInTheDocument();
  });

  it('should check permission and call switchable handler on click', () => {
    render(<FormFieldDetectionTool />);
    fireEvent.click(screen.getByText('viewer.formFieldDetection.toolMenu.autoDetectFields'));

    expect(ToolSwitchableChecker.createToolSwitchableHandler).toHaveBeenCalled();
    expect(mockWithEditPermission).toHaveBeenCalled();
  });

  it('should toggle popper if premium icon should be shown', () => {
    const mockTogglePopper = jest.fn();
    
    // Override implementation for this specific test
    mockDetectFormFieldButtonClick.mockImplementation((onClick) => {
      onClick({ toggleCheckPopper: mockTogglePopper, shouldShowPremiumIcon: true }, jest.fn());
    });

    render(<FormFieldDetectionTool />);
    fireEvent.click(screen.getByText('viewer.formFieldDetection.toolMenu.autoDetectFields'));

    expect(mockTogglePopper).toHaveBeenCalled();
    expect(mockWithEditPermission).not.toHaveBeenCalled();
  });

  it('should render the request access modal element if present', () => {
    render(<FormFieldDetectionTool />);
    expect(screen.getByTestId('request-modal')).toBeInTheDocument();
  });
});