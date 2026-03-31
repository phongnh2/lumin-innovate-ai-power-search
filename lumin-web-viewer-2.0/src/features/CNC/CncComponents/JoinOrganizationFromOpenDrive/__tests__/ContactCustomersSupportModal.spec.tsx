import React from 'react';
import { render, screen, fireEvent } from 'features/CNC/utils/testUtil';
import { useTranslation } from 'react-i18next';
import ContactCustomerSupportModal from '../components/ContactCustomerSupportModal';
import { useTrackingModalEvent } from 'hooks';
import '@testing-library/jest-dom'

jest.mock('react-i18next', () => ({
  ...jest.requireActual('react-i18next'),
  useTranslation: jest.fn(),
}));

jest.mock('hooks', () => ({
  useTrackingModalEvent: jest.fn(),
}));

// Mock actions since we don't need the real implementation
jest.mock('actions', () => ({
  closeModal: jest.fn(() => ({ type: 'CLOSE_MODAL' })),
}));

// Mock window.open
global.open = jest.fn();

describe('ContactCustomerSupportModal', () => {
  const mockTrackModalConfirmation = jest
  .fn(() => Promise.resolve())
  .mockRejectedValue(new Error('Track failed'));
  const mockTrackModalDismiss = jest
    .fn(() => Promise.resolve())
    .mockRejectedValue(new Error('Track failed'));
  const mockT = jest.fn((key) => key);

  beforeEach(() => {
    (useTranslation as jest.Mock).mockReturnValue({ t: mockT });
    (useTrackingModalEvent as jest.Mock).mockReturnValue({
      trackModalConfirmation: mockTrackModalConfirmation,
      trackModalDismiss: mockTrackModalDismiss,
    });
    jest.clearAllMocks();
  });

  const renderComponent = (numberInvited: number) => {
    render(<ContactCustomerSupportModal numberInvited={numberInvited} />);
  };

  it('should render the modal with correct title, content and buttons', () => {
    renderComponent(25);

    expect(screen.getByText('contactCustomerSupportModal.title')).toBeInTheDocument();
    expect(
      screen.getByText('contactCustomerSupportModal.content')
    ).toBeInTheDocument();
    expect(screen.getByText('contactCustomerSupportModal.cta')).toBeInTheDocument();
    expect(screen.getByLabelText('Close')).toBeInTheDocument();
  });

  it('should call trackModalDismiss when the close button is clicked', () => {
    renderComponent(25);

    const closeButton = screen.getByLabelText('Close');
    fireEvent.click(closeButton);

    expect(mockTrackModalDismiss).toHaveBeenCalled();
  });

  it('should call trackModalConfirmation and open a new window when the CTA button is clicked', async () => {
    renderComponent(25);

    const ctaButton = screen.getByText('contactCustomerSupportModal.cta');
    fireEvent.click(ctaButton);

    expect(mockTrackModalConfirmation).toHaveBeenCalled();
    expect(global.open).toHaveBeenCalledWith(
      'https://luminpdf.chilipiper.com/me/celisse-moyer/lumin-meeting',
      '_blank',
      'noopener,noreferrer'
    );
  });
});
