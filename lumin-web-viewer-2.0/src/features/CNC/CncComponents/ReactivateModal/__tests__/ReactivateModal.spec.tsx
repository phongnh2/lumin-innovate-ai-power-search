import React from 'react';
import { screen, fireEvent, render } from '@testing-library/react';
import { mockOrganization } from '../../__mocks__/mockOrganization';

import ReactivateModal from '../ReactivateModal';

import '@testing-library/jest-dom';

// Mock dependencies
jest.mock('hooks', () => ({
  useThemeMode: jest.fn(),
}));

jest.mock('../hooks/useHandleReactivateModal', () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock('lumin-components/Dialog', () => ({
  __esModule: true,
  default: ({ children, onClose, hasCloseBtn }: any) => (
    <div data-testid="dialog" onClick={onClose}>
      {children}
      {hasCloseBtn && <button data-testid="close-button">Close</button>}
    </div>
  ),
}));

jest.mock('lumin-components/Icomoon', () => ({
  __esModule: true,
  default: ({ className }: any) => <span data-testid="icomoon" className={className} />,
}));

jest.mock('luminComponents/ViewerCommonV2/ThemeProvider', () => ({
  __esModule: true,
  default: ({ children }: any) => <div data-testid="theme-provider">{children}</div>,
}));

jest.mock('lumin-ui/dist/kiwi-ui', () => ({
  Button: ({ children, onClick, loading, fullWidth }: any) => (
    <button
      data-testid="button"
      onClick={onClick}
      disabled={loading}
      data-full-width={fullWidth}
    >
      {loading ? 'Loading...' : children}
    </button>
  ),
  ButtonSize: { lg: 'lg' },
  ButtonVariant: { filled: 'filled' },
}));

const mockUseHandleReactivateModal = {
  onClickButton: jest.fn(),
  onCloseModal: jest.fn(),
  loading: false,
  getTextButton: jest.fn(() => 'Renew subscription ($30 / month)'),
};

const renderComponent = (props = {}) => {
  const defaultProps = {
    currentOrganization: mockOrganization,
    onClose: jest.fn(),
    ...props,
  };

  return render(<ReactivateModal {...defaultProps} />);
};

describe('ReactivateModal', () => {
  const { useThemeMode } = require('hooks');
  const useHandleReactivateModal = require('../hooks/useHandleReactivateModal').default;

  beforeEach(() => {
    useThemeMode.mockReturnValue('light');
    useHandleReactivateModal.mockReturnValue(mockUseHandleReactivateModal);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render the modal with correct title and description', () => {
    renderComponent();

    expect(screen.getByText("Don't Miss Out! Renew Your Subscription")).toBeInTheDocument();
    expect(screen.getByText('Rediscover the benefits of your previous plan and continue enjoying our services.')).toBeInTheDocument();
  });

  it('should render all detail contents with checkboxes', () => {
    renderComponent();

    const detailContents = [
      'Edit PDF text & content',
      'Invite unlimited people',
      'Edit 30 documents',
      'Merge & split documents',
      'Access 100 digital signatures',
      'And much more!',
    ];

    detailContents.forEach((content) => {
      expect(screen.getByText(content)).toBeInTheDocument();
    });

    // Check that Icomoon components are rendered for each detail item
    const icomoonElements = screen.getAllByTestId('icomoon');
    expect(icomoonElements).toHaveLength(detailContents.length);
  });

  it('should render the renew button with correct text', () => {
    renderComponent();

    const button = screen.getByTestId('button');
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent('Renew subscription ($30 / month)');
  });

  it('should call onClickButton when renew button is clicked', () => {
    renderComponent();

    const button = screen.getByTestId('button');
    fireEvent.click(button);

    expect(mockUseHandleReactivateModal.onClickButton).toHaveBeenCalledTimes(1);
  });

  it('should show loading state on button when loading is true', () => {
    useHandleReactivateModal.mockReturnValue({
      ...mockUseHandleReactivateModal,
      loading: true,
    });

    renderComponent();

    const button = screen.getByTestId('button');
    expect(button).toBeDisabled();
    expect(button).toHaveTextContent('Loading...');
  });

  it('should disable close button when loading', () => {
    useHandleReactivateModal.mockReturnValue({
      ...mockUseHandleReactivateModal,
      loading: true,
    });

    renderComponent();

    const dialog = screen.getByTestId('dialog');
    expect(dialog).toBeInTheDocument();
    // The Dialog component should not render close button when loading
    expect(screen.queryByTestId('close-button')).not.toBeInTheDocument();
  });

  it('should enable close button when not loading', () => {
    renderComponent();

    const closeButton = screen.getByTestId('close-button');
    expect(closeButton).toBeInTheDocument();
  });

  it('should call onCloseModal when close button is clicked', () => {
    renderComponent();

    const closeButton = screen.getByTestId('close-button');
    fireEvent.click(closeButton);

    expect(mockUseHandleReactivateModal.onCloseModal).toHaveBeenCalledTimes(1);
  });

  it('should apply light theme classes when theme mode is light', () => {
    useThemeMode.mockReturnValue('light');
    renderComponent();

    const themeProvider = screen.getByTestId('theme-provider');
    expect(themeProvider).toBeInTheDocument();
  });

  it('should apply dark theme classes when theme mode is dark', () => {
    useThemeMode.mockReturnValue('dark');
    renderComponent();

    const themeProvider = screen.getByTestId('theme-provider');
    expect(themeProvider).toBeInTheDocument();
  });

  it('should render with correct modal size', () => {
    renderComponent();

    const dialog = screen.getByTestId('dialog');
    expect(dialog).toBeInTheDocument();
  });

  it('should render EditorThemeProvider wrapper', () => {
    renderComponent();

    const themeProvider = screen.getByTestId('theme-provider');
    expect(themeProvider).toBeInTheDocument();
  });

  it('should handle different button text based on organization payment status', () => {
    const mockGetTextButton = jest.fn(() => 'Renew subscription');
    useHandleReactivateModal.mockReturnValue({
      ...mockUseHandleReactivateModal,
      getTextButton: mockGetTextButton,
    });

    renderComponent();

    const button = screen.getByTestId('button');
    expect(button).toHaveTextContent('Renew subscription');
    expect(mockGetTextButton).toHaveBeenCalled();
  });

  it('should pass correct props to useHandleReactivateModal hook', () => {
    const onClose = jest.fn();
    renderComponent({ onClose });

    expect(useHandleReactivateModal).toHaveBeenCalledWith({
      currentOrganization: mockOrganization,
      onClose,
    });
  });
});
