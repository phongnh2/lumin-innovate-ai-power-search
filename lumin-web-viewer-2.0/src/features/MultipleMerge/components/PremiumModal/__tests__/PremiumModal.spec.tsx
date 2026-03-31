import { fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';

import { useTrackingModalEvent } from 'hooks';
import { useGetRemoveButtonProStartTrial } from 'hooks/growthBook/useGetRemoveButtonProStartTrial';

import PremiumModal from '../PremiumModal';
import { useMultipleMergeContext } from '../../../hooks/useMultipleMergeContext';

// Mock Hooks
jest.mock('hooks', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
  useTrackingModalEvent: jest.fn(),
}));

jest.mock('hooks/growthBook/useGetRemoveButtonProStartTrial', () => ({
  useGetRemoveButtonProStartTrial: jest.fn(),
}));

jest.mock('../../../hooks/useMultipleMergeContext', () => ({
  useMultipleMergeContext: jest.fn(),
}));

// Mock Assets
jest.mock('assets/lumin-svgs/icon-three-stars.svg', () => 'mock-icon-url');

// Mock UI Components
jest.mock('lumin-ui/kiwi-ui', () => ({
  Modal: jest.fn(({ children, opened, onClose }) =>
    opened ? (
      <div data-testid="modal">
        <button data-testid="modal-close-btn" onClick={onClose}>
          Close
        </button>
        {children}
      </div>
    ) : null
  ),
  Button: jest.fn(({ children, onClick, to }) => (
    <a href={to} onClick={onClick} data-testid="mock-button">
      {children}
    </a>
  )),
}));

// Mock React Router
jest.mock('react-router-dom', () => ({
  Link: jest.fn(({ children, to, onClick }) => (
    <a href={to} onClick={onClick} data-testid="mock-link">
      {children}
    </a>
  )),
}));

// Mock Styles
jest.mock('../PremiumModal.module.scss', () => ({
  premiumModal: 'premium-modal-class',
  premiumImage: 'premium-image-class',
  premiumTitle: 'premium-title-class',
  premiumMessage: 'premium-message-class',
  premiumFooter: 'premium-footer-class',
  premiumButtonRoot: 'premium-button-root-class',
  premiumButtonLabel: 'premium-button-label-class',
}));

describe('PremiumModal', () => {
  // Event Tracking Mocks
  const mockTrackModalViewed = jest.fn().mockResolvedValue(undefined);
  const mockTrackModalDismiss = jest.fn();
  const mockTrackModalConfirmation = jest.fn();

  // Context Mocks
  const mockOpenedPremiumModalHandlers = {
    close: jest.fn(),
    open: jest.fn(),
    toggle: jest.fn(),
  };

  const defaultContent = {
    title: 'premium.title',
    message: 'premium.message',
    startTrialButton: {
      label: 'button.startTrial',
      link: '/start-trial',
    },
    upgradeButton: {
      label: 'button.upgrade',
      link: '/upgrade',
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup Hooks
    (useTrackingModalEvent as jest.Mock).mockReturnValue({
      trackModalViewed: mockTrackModalViewed,
      trackModalDismiss: mockTrackModalDismiss,
      trackModalConfirmation: mockTrackModalConfirmation,
    });

    (useGetRemoveButtonProStartTrial as jest.Mock).mockReturnValue({
      isRemoveButtonProStartTrial: false,
    });

    (useMultipleMergeContext as jest.Mock).mockReturnValue({
      premiumModalContent: defaultContent,
      openedPremiumModal: true,
      openedPremiumModalHandlers: mockOpenedPremiumModalHandlers,
    });
  });

  describe('Rendering', () => {
    it('should return null and not render if premiumModalContent is missing', () => {
      (useMultipleMergeContext as jest.Mock).mockReturnValue({
        premiumModalContent: null,
        openedPremiumModal: true,
      });

      const { container } = render(<PremiumModal />);
      expect(container).toBeEmptyDOMElement();
      expect(screen.queryByTestId('modal')).not.toBeInTheDocument();
    });

    it('should return null if openedPremiumModal is false (handled by UI lib, but verified here)', () => {
      // Even if content exists, if opened is false, our mock Modal returns null
      (useMultipleMergeContext as jest.Mock).mockReturnValue({
        premiumModalContent: defaultContent,
        openedPremiumModal: false,
        openedPremiumModalHandlers: mockOpenedPremiumModalHandlers,
      });

      render(<PremiumModal />);
      expect(screen.queryByTestId('modal')).not.toBeInTheDocument();
    });

    it('should render content correctly when open and content exists', () => {
      render(<PremiumModal />);

      expect(screen.getByTestId('modal')).toBeInTheDocument();
      expect(screen.getByAltText('upgrade to access')).toHaveAttribute('src', 'mock-icon-url');
      expect(screen.getByText('premium.title')).toBeInTheDocument();
      expect(screen.getByText('premium.message')).toBeInTheDocument();
    });
  });

  describe('Event Tracking', () => {
    it('should call trackModalViewed on mount', () => {
      render(<PremiumModal />);
      expect(mockTrackModalViewed).toHaveBeenCalledTimes(1);
    });

    it('should initialize useTrackingModalEvent with correct params', () => {
      render(<PremiumModal />);
      expect(useTrackingModalEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          modalName: expect.stringContaining('PopOver'),
          modalPurpose: 'Premium tool pop-over',
        })
      );
    });
  });

  describe('Buttons Logic', () => {
    it('should render the Start Trial button if configured', () => {
      render(<PremiumModal />);
      
      const trialBtn = screen.getByText('button.startTrial');
      expect(trialBtn).toBeInTheDocument();
      expect(trialBtn.closest('a')).toHaveAttribute('href', '/start-trial');
    });

    it('should call trackModalDismiss when Start Trial button is clicked', () => {
      render(<PremiumModal />);

      const trialBtn = screen.getByText('button.startTrial');
      fireEvent.click(trialBtn);

      expect(mockTrackModalDismiss).toHaveBeenCalledTimes(1);
    });

    it('should render the Upgrade button by default (when isRemoveButtonProStartTrial is false)', () => {
      render(<PremiumModal />);

      const upgradeBtn = screen.getByText('button.upgrade');
      expect(upgradeBtn).toBeInTheDocument();
      expect(upgradeBtn.closest('a')).toHaveAttribute('href', '/upgrade');
    });

    it('should NOT render the Upgrade button when isRemoveButtonProStartTrial is true', () => {
      (useGetRemoveButtonProStartTrial as jest.Mock).mockReturnValue({
        isRemoveButtonProStartTrial: true,
      });

      render(<PremiumModal />);

      expect(screen.queryByText('button.upgrade')).not.toBeInTheDocument();
      // Start trial should still be there if content provided
      expect(screen.getByText('button.startTrial')).toBeInTheDocument();
    });

    it('should call trackModalConfirmation when Upgrade button is clicked', () => {
      render(<PremiumModal />);

      const upgradeBtn = screen.getByText('button.upgrade');
      fireEvent.click(upgradeBtn);

      expect(mockTrackModalConfirmation).toHaveBeenCalledTimes(1);
    });
  });

  describe('Close Interaction', () => {
    it('should call the close handler when modal close is triggered', () => {
      render(<PremiumModal />);

      const closeBtn = screen.getByTestId('modal-close-btn');
      fireEvent.click(closeBtn);

      expect(mockOpenedPremiumModalHandlers.close).toHaveBeenCalledTimes(1);
    });
  });
});