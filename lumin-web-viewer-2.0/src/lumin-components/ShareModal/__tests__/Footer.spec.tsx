import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock styled components
jest.mock('../ShareModal.styled', () => ({
  FooterButtonContainer: ({ 
    disabledCancel, 
    onCancel, 
    label, 
    loading, 
    disabled, 
    onSubmit, 
    isReskin 
  }) => (
    <div data-testid="footer-container">
      <button
        data-testid="cancel-button"
        disabled={disabledCancel}
        onClick={onCancel}
      >
        Cancel
      </button>
      <button
        data-testid="submit-button"
        disabled={disabled}
        data-loading={String(loading)}
        data-reskin={String(isReskin)}
        onClick={onSubmit}
      >
        {label}
      </button>
    </div>
  ),
}));

// Mock hooks
jest.mock('hooks', () => ({
  useTranslation: () => ({ t: (key) => key }),
  useEnableWebReskin: () => ({ isEnableReskin: true }),
}));

// Create mock functions at module level
const mockHandleSendClick = jest.fn();
const mockCheck3rdCookies = jest.fn((callback) => callback());

// Mock context with a wrapper component approach
jest.mock('../ShareModalContext', () => {
  const React = require('react');
  return {
    ShareModalContext: React.createContext({
      handleSendClick: jest.fn(),
      check3rdCookies: jest.fn(),
      isTransfering: false,
      userTags: [],
    }),
  };
});

import Footer from '../components/Footer';
import { ShareModalContext } from '../ShareModalContext';

describe('Footer', () => {
  let mockOnClose;
  let mockOpenInviteSharedUser;

  beforeEach(() => {
    jest.clearAllMocks();
    mockOnClose = jest.fn();
    mockOpenInviteSharedUser = jest.fn();
    mockCheck3rdCookies.mockImplementation((callback) => callback());
  });

  const renderComponent = (contextValue = {}) => {
    const defaultContext = {
      handleSendClick: mockHandleSendClick,
      check3rdCookies: mockCheck3rdCookies,
      isTransfering: false,
      userTags: [{ email: 'test@example.com' }],
      ...contextValue,
    };

    return render(
      <ShareModalContext.Provider value={defaultContext}>
        <Footer onClose={mockOnClose} openInviteSharedUser={mockOpenInviteSharedUser} />
      </ShareModalContext.Provider>
    );
  };

  describe('Rendering', () => {
    it('should render footer container', () => {
      renderComponent();
      expect(screen.getByTestId('footer-container')).toBeInTheDocument();
    });

    it('should render cancel button', () => {
      renderComponent();
      expect(screen.getByTestId('cancel-button')).toBeInTheDocument();
    });

    it('should render submit button', () => {
      renderComponent();
      expect(screen.getByTestId('submit-button')).toBeInTheDocument();
    });
  });

  describe('Button Labels', () => {
    it('should show "common.share" label', () => {
      renderComponent();
      expect(screen.getByTestId('submit-button')).toHaveTextContent('common.share');
    });
  });

  describe('Disabled State', () => {
    it('should disable submit button when no user tags', () => {
      renderComponent({ userTags: [] });
      expect(screen.getByTestId('submit-button')).toBeDisabled();
    });

    it('should disable submit button when transferring', () => {
      renderComponent({ isTransfering: true });
      expect(screen.getByTestId('submit-button')).toBeDisabled();
    });

    it('should enable submit button when user tags exist and not transferring', () => {
      renderComponent({ userTags: [{ email: 'test@example.com' }], isTransfering: false });
      expect(screen.getByTestId('submit-button')).not.toBeDisabled();
    });

    it('should disable cancel button when transferring', () => {
      renderComponent({ isTransfering: true });
      expect(screen.getByTestId('cancel-button')).toBeDisabled();
    });
  });

  describe('Loading State', () => {
    it('should show loading when transferring', () => {
      renderComponent({ isTransfering: true });
      expect(screen.getByTestId('submit-button')).toHaveAttribute('data-loading', 'true');
    });

    it('should not show loading when not transferring', () => {
      renderComponent({ isTransfering: false });
      expect(screen.getByTestId('submit-button')).toHaveAttribute('data-loading', 'false');
    });
  });

  describe('Click Handlers', () => {
    it('should call onClose when cancel button is clicked', () => {
      renderComponent();
      fireEvent.click(screen.getByTestId('cancel-button'));
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('should call check3rdCookies when submit button is clicked', () => {
      renderComponent();
      fireEvent.click(screen.getByTestId('submit-button'));
      expect(mockCheck3rdCookies).toHaveBeenCalledTimes(1);
    });

    it('should call handleSendClick with openInviteSharedUser after check3rdCookies', () => {
      renderComponent();
      fireEvent.click(screen.getByTestId('submit-button'));
      expect(mockHandleSendClick).toHaveBeenCalledWith(mockOpenInviteSharedUser);
    });
  });
});
