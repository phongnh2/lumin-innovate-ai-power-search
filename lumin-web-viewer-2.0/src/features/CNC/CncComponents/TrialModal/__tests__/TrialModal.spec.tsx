import React from 'react';

import { render, screen } from 'features/CNC/utils/testUtil';
import { useEnableWebReskin } from 'hooks';
import { useEnableNewPricing } from 'features/Pricing/hooks/useEnableNewPricing';

import TrialModal from '../TrialModal';

import '@testing-library/jest-dom';

// Mock the hooks
jest.mock('hooks', () => ({
  useEnableWebReskin: jest.fn(),
}));

jest.mock('features/Pricing/hooks/useEnableNewPricing', () => ({
  useEnableNewPricing: jest.fn(),
}));

// Mock the child components
jest.mock('features/Pricing/components/PricingModal', () => ({
  __esModule: true,
  default: ({ onClose, trackModalConfirmation, onClickStartTrial }: any) => (
    <div data-testid="pricing-modal">
      <button data-testid="pricing-modal-close" onClick={() => onClose({ skip: false })} />
      <button data-testid="pricing-modal-start-trial" onClick={() => onClickStartTrial({ skip: false, isPricingModal: true, plan: 'premium' })} />
      <button data-testid="pricing-modal-track-confirmation" onClick={trackModalConfirmation} />
    </div>
  ),
}));

jest.mock('features/CNC/CncComponents/StartTrialModalWrapper', () => ({
  __esModule: true,
  default: ({ openTrialModal, onClose, onClickStartTrial }: any) => (
    <div data-testid="start-trial-modal-wrapper">
      {openTrialModal && (
        <>
          <button data-testid="start-trial-modal-close" onClick={() => onClose({ skip: true })} />
          <button data-testid="start-trial-modal-start-trial" onClick={() => onClickStartTrial({ skip: true })} />
        </>
      )}
    </div>
  ),
}));

describe('TrialModal', () => {
  const mockOnClose = jest.fn();
  const mockOnClickStartTrial = jest.fn();
  const mockTrackModalConfirmation = jest.fn();

  const defaultProps = {
    openTrialModal: true,
    onClose: mockOnClose,
    onClickStartTrial: mockOnClickStartTrial,
    trackModalConfirmation: mockTrackModalConfirmation,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('when both pricing modal and reskin are enabled', () => {
    beforeEach(() => {
      (useEnableNewPricing as jest.Mock).mockReturnValue({
        enabled: true,
        loading: false,
      });
      (useEnableWebReskin as jest.Mock).mockReturnValue({
        isEnableReskin: true,
        loading: false,
      });
    });

    it('should render PricingModal', () => {
      render(<TrialModal {...defaultProps} />);

      expect(screen.getByTestId('pricing-modal')).toBeInTheDocument();
      expect(screen.queryByTestId('start-trial-modal-wrapper')).not.toBeInTheDocument();
    });

    it('should pass correct props to PricingModal', () => {
      render(<TrialModal {...defaultProps} />);

      const pricingModal = screen.getByTestId('pricing-modal');
      expect(pricingModal).toBeInTheDocument();

      // Test that the PricingModal receives the correct props by checking if buttons work
      const closeButton = screen.getByTestId('pricing-modal-close');
      const startTrialButton = screen.getByTestId('pricing-modal-start-trial');
      const trackConfirmationButton = screen.getByTestId('pricing-modal-track-confirmation');

      expect(closeButton).toBeInTheDocument();
      expect(startTrialButton).toBeInTheDocument();
      expect(trackConfirmationButton).toBeInTheDocument();
    });

    it('should call onClose when PricingModal close button is clicked', () => {
      render(<TrialModal {...defaultProps} />);

      const closeButton = screen.getByTestId('pricing-modal-close');
      closeButton.click();

      expect(mockOnClose).toHaveBeenCalledWith({ skip: false });
    });

    it('should call onClickStartTrial when PricingModal start trial button is clicked', () => {
      render(<TrialModal {...defaultProps} />);

      const startTrialButton = screen.getByTestId('pricing-modal-start-trial');
      startTrialButton.click();

      expect(mockOnClickStartTrial).toHaveBeenCalledWith({
        skip: false,
        isPricingModal: true,
        plan: 'premium',
      });
    });

    it('should call trackModalConfirmation when PricingModal track confirmation button is clicked', () => {
      render(<TrialModal {...defaultProps} />);

      const trackConfirmationButton = screen.getByTestId('pricing-modal-track-confirmation');
      trackConfirmationButton.click();

      expect(mockTrackModalConfirmation).toHaveBeenCalled();
    });
  });

  describe('when pricing modal is disabled', () => {
    beforeEach(() => {
      (useEnableNewPricing as jest.Mock).mockReturnValue({
        enabled: false,
        loading: false,
      });
      (useEnableWebReskin as jest.Mock).mockReturnValue({
        isEnableReskin: true,
        loading: false,
      });
    });

    it('should render StartTrialModalWrapper', () => {
      render(<TrialModal {...defaultProps} />);

      expect(screen.getByTestId('start-trial-modal-wrapper')).toBeInTheDocument();
      expect(screen.queryByTestId('pricing-modal')).not.toBeInTheDocument();
    });

    it('should pass correct props to StartTrialModalWrapper', () => {
      render(<TrialModal {...defaultProps} />);

      const startTrialModalWrapper = screen.getByTestId('start-trial-modal-wrapper');
      expect(startTrialModalWrapper).toBeInTheDocument();

      // Test that the StartTrialModalWrapper receives the correct props
      const closeButton = screen.getByTestId('start-trial-modal-close');
      const startTrialButton = screen.getByTestId('start-trial-modal-start-trial');

      expect(closeButton).toBeInTheDocument();
      expect(startTrialButton).toBeInTheDocument();
    });

    it('should call onClose when StartTrialModalWrapper close button is clicked', () => {
      render(<TrialModal {...defaultProps} />);

      const closeButton = screen.getByTestId('start-trial-modal-close');
      closeButton.click();

      expect(mockOnClose).toHaveBeenCalledWith({ skip: true });
    });

    it('should call onClickStartTrial when StartTrialModalWrapper start trial button is clicked', () => {
      render(<TrialModal {...defaultProps} />);

      const startTrialButton = screen.getByTestId('start-trial-modal-start-trial');
      startTrialButton.click();

      expect(mockOnClickStartTrial).toHaveBeenCalledWith({ skip: true });
    });
  });

  describe('when reskin is disabled', () => {
    beforeEach(() => {
      (useEnableNewPricing as jest.Mock).mockReturnValue({
        enabled: true,
        loading: false,
      });
      (useEnableWebReskin as jest.Mock).mockReturnValue({
        isEnableReskin: false,
        loading: false,
      });
    });

    it('should render StartTrialModalWrapper', () => {
      render(<TrialModal {...defaultProps} />);

      expect(screen.getByTestId('start-trial-modal-wrapper')).toBeInTheDocument();
      expect(screen.queryByTestId('pricing-modal')).not.toBeInTheDocument();
    });
  });

  describe('when both feature flags are disabled', () => {
    beforeEach(() => {
      (useEnableNewPricing as jest.Mock).mockReturnValue({
        enabled: false,
        loading: false,
      });
      (useEnableWebReskin as jest.Mock).mockReturnValue({
        isEnableReskin: false,
        loading: false,
      });
    });

    it('should render StartTrialModalWrapper', () => {
      render(<TrialModal {...defaultProps} />);

      expect(screen.getByTestId('start-trial-modal-wrapper')).toBeInTheDocument();
      expect(screen.queryByTestId('pricing-modal')).not.toBeInTheDocument();
    });
  });

  describe('when openTrialModal is false', () => {
    beforeEach(() => {
      (useEnableNewPricing as jest.Mock).mockReturnValue({
        enabled: false,
        loading: false,
      });
      (useEnableWebReskin as jest.Mock).mockReturnValue({
        isEnableReskin: false,
        loading: false,
      });
    });

    it('should not render any modal content when openTrialModal is false', () => {
      render(<TrialModal {...defaultProps} openTrialModal={false} />);

      // StartTrialModalWrapper should still render but without content when openTrialModal is false
      expect(screen.getByTestId('start-trial-modal-wrapper')).toBeInTheDocument();
      expect(screen.queryByTestId('start-trial-modal-close')).not.toBeInTheDocument();
      expect(screen.queryByTestId('start-trial-modal-start-trial')).not.toBeInTheDocument();
    });
  });

  describe('hook behavior', () => {
    it('should call useEnableNewPricing hook', () => {
      (useEnableNewPricing as jest.Mock).mockReturnValue({
        enabled: false,
        loading: false,
      });
      (useEnableWebReskin as jest.Mock).mockReturnValue({
        isEnableReskin: false,
        loading: false,
      });

      render(<TrialModal {...defaultProps} />);

      expect(useEnableNewPricing).toHaveBeenCalled();
    });

    it('should call useEnableWebReskin hook', () => {
      (useEnableNewPricing as jest.Mock).mockReturnValue({
        enabled: false,
        loading: false,
      });
      (useEnableWebReskin as jest.Mock).mockReturnValue({
        isEnableReskin: false,
        loading: false,
      });

      render(<TrialModal {...defaultProps} />);

      expect(useEnableWebReskin).toHaveBeenCalled();
    });
  });

  describe('edge cases', () => {
    it('should handle loading states from hooks', () => {
      (useEnableNewPricing as jest.Mock).mockReturnValue({
        enabled: false,
        loading: true,
      });
      (useEnableWebReskin as jest.Mock).mockReturnValue({
        isEnableReskin: false,
        loading: true,
      });

      render(<TrialModal {...defaultProps} />);

      // Should still render StartTrialModalWrapper when loading
      expect(screen.getByTestId('start-trial-modal-wrapper')).toBeInTheDocument();
    });

    it('should handle undefined hook return values', () => {
      (useEnableNewPricing as jest.Mock).mockReturnValue({
        enabled: undefined,
        loading: false,
      });
      (useEnableWebReskin as jest.Mock).mockReturnValue({
        isEnableReskin: undefined,
        loading: false,
      });

      render(<TrialModal {...defaultProps} />);

      // Should render StartTrialModalWrapper when values are undefined
      expect(screen.getByTestId('start-trial-modal-wrapper')).toBeInTheDocument();
    });
  });
});
