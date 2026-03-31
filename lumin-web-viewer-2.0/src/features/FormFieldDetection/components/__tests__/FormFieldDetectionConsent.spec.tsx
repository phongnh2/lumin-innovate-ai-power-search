import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import actions from 'actions';
import logger from 'helpers/logger';
import { eventTracking } from 'utils';
import modalEvent from 'utils/Factory/EventCollection/ModalEventCollection';
import FormFieldDetectionConsent from '../FormFieldDetectionConsent';

jest.mock('react-redux', () => ({
  useDispatch: jest.fn(),
}));

jest.mock('react-i18next', () => ({
  useTranslation: jest.fn(),
  Trans: ({ i18nKey, components }: any) => (
    <div data-testid={`trans-${i18nKey}`}>
      {i18nKey}
      {components?.Link}
    </div>
  ),
}));

const mockLinkOnClickHandlers: Map<string, (e: any) => void> = new Map();

jest.mock('react-router-dom', () => ({
  Link: ({ to, children, onClick }: any) => {
    // Store onClick handler for testing purposes using the 'to' prop as key
    if (onClick && to) {
      mockLinkOnClickHandlers.set(to, onClick);
    }
    return (
      <a href={to} onClick={onClick} data-testid="router-link" data-link-to={to}>
        {children}
      </a>
    );
  },
}));

jest.mock('lumin-ui/kiwi-ui', () => ({
  Button: ({ children, onClick, disabled, variant }: any) => (
    <button 
      onClick={onClick} 
      disabled={disabled} 
      data-testid={`button-${variant}`}
    >
      {children}
    </button>
  ),
}));

jest.mock('@new-ui/general-components/Checkbox', () => ({
  __esModule: true,
  default: ({ checked, onChange, className }: any) => (
    <input 
      type="checkbox" 
      checked={checked} 
      onChange={onChange} 
      className={className}
      data-testid="checkbox-v2" 
    />
  ),
}));

jest.mock('actions', () => ({
  closeModal: jest.fn(() => ({ type: 'CLOSE_MODAL' })),
}));

jest.mock('helpers/logger', () => ({
  logError: jest.fn(),
}));

jest.mock('utils', () => ({
  eventTracking: jest.fn().mockResolvedValue({}),
}));

jest.mock('utils/Factory/EventCollection/ModalEventCollection', () => ({
  modalDismiss: jest.fn().mockResolvedValue({}),
  modalConfirmation: jest.fn().mockResolvedValue({}),
}));

jest.mock('utils/Factory/EventCollection/constants/CheckboxEvent', () => ({
  CheckboxName: {
    AGREE_DOCUMENT_DATA_WILL_BE_USED: 'AGREE_DOCUMENT_DATA_WILL_BE_USED',
    AGREE_TO_USE_SFD: 'AGREE_TO_USE_SFD',
  },
  CheckboxPurpose: {
    AGREE_DOCUMENT_DATA_WILL_BE_USED: 'purpose_doc_data',
    AGREE_TO_USE_SFD: 'purpose_sfd',
  },
}));

jest.mock('constants/lumin-common', () => ({
  LOGGER: {
    Service: {
      TRACK_EVENT_ERROR: 'TRACK_EVENT_ERROR',
    },
  },
}));

jest.mock('constants/urls', () => ({
  STATIC_PAGE_URL: 'https://static.example.com',
}));

jest.mock('constants/Routers', () => ({
  Routers: {
    TERMS_OF_USE: '/terms-of-use',
    PRIVACY_POLICY: '/privacy-policy',
  },
}));

describe('FormFieldDetectionConsent', () => {
  const mockDispatch = jest.fn();
  const mockOnDetectingFormField = jest.fn();
  const mockModalEventData = {
    modalName: 'FFD_Consent',
    modalPurpose: 'User_Agreement',
  };

  const defaultProps = {
    onDetectingFormField: mockOnDetectingFormField,
    modalEventData: mockModalEventData,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockLinkOnClickHandlers.clear();
    (useDispatch as jest.Mock).mockReturnValue(mockDispatch);
    (useTranslation as jest.Mock).mockReturnValue({
      t: (key: string) => key,
    });
    mockOnDetectingFormField.mockResolvedValue(undefined);
  });

  it('should render initial state correctly', () => {
    render(<FormFieldDetectionConsent {...defaultProps} />);

    expect(screen.getByText('viewer.formFieldDetection.consent.title')).toBeInTheDocument();
    expect(screen.getByTestId('button-filled')).toBeDisabled();
    expect(screen.getAllByTestId('checkbox-v2')).toHaveLength(2);
  });

  it('should enable agree button when terms and conditions are checked', () => {
    render(<FormFieldDetectionConsent {...defaultProps} />);
    const checkboxes = screen.getAllByTestId('checkbox-v2');
    
    fireEvent.click(checkboxes[0]); 

    expect(screen.getByTestId('button-filled')).not.toBeDisabled();
  });

  it('should toggle checkboxes when clicking the labels/text spans', () => {
    render(<FormFieldDetectionConsent {...defaultProps} />);
    const termsLabel = screen.getByTestId('trans-viewer.formFieldDetection.consent.checkbox.termsAndConditions');
    
    fireEvent.click(termsLabel);
    expect(screen.getByTestId('button-filled')).not.toBeDisabled();
    
    fireEvent.click(termsLabel);
    expect(screen.getByTestId('button-filled')).toBeDisabled();
  });

  it('should call cancel logic when cancel button is clicked', async () => {
    render(<FormFieldDetectionConsent {...defaultProps} />);
    
    fireEvent.click(screen.getByTestId('button-outlined'));

    expect(mockDispatch).toHaveBeenCalledWith(actions.closeModal());
    expect(modalEvent.modalDismiss).toHaveBeenCalledWith(mockModalEventData);
  });

  it('should track both consent events and call detection when both checkboxes are checked', async () => {
    render(<FormFieldDetectionConsent {...defaultProps} />);
    const checkboxes = screen.getAllByTestId('checkbox-v2');
    
    fireEvent.click(checkboxes[0]); 
    fireEvent.click(checkboxes[1]); 
    fireEvent.click(screen.getByTestId('button-filled'));

    expect(mockDispatch).toHaveBeenCalledWith(actions.closeModal());
    expect(modalEvent.modalConfirmation).toHaveBeenCalledWith(mockModalEventData);
    
    await waitFor(() => {
      expect(eventTracking).toHaveBeenCalledTimes(2);
      expect(mockOnDetectingFormField).toHaveBeenCalled();
    });
  });

  it('should log error when tracking fails during cancel', async () => {
    const error = new Error('Track error');
    (modalEvent.modalDismiss as jest.Mock).mockRejectedValue(error);
    
    render(<FormFieldDetectionConsent {...defaultProps} />);
    fireEvent.click(screen.getByTestId('button-outlined'));

    await waitFor(() => {
      expect(logger.logError).toHaveBeenCalledWith(
        expect.objectContaining({ error })
      );
    });
  });

  it('should prevent propagation when clicking the link inside the checkbox label', () => {
    render(<FormFieldDetectionConsent {...defaultProps} />);
    
    // Find the Trans component that contains the terms and conditions link
    const termsTrans = screen.getByTestId('trans-viewer.formFieldDetection.consent.checkbox.termsAndConditions');
    expect(termsTrans).toBeTruthy();
    
    // Find the link within the Trans component
    const termsLink = termsTrans.querySelector('[data-testid="router-link"]') as HTMLElement;
    expect(termsLink).toBeTruthy();
    
    // Get the link 'to' value - it should be STATIC_PAGE_URL + Routers.TERMS_OF_USE
    const expectedLinkTo = 'https://static.example.com/terms-of-use';
    const linkTo = termsLink?.getAttribute('data-link-to') || termsLink?.getAttribute('href');
    
    // Get the onClick handler from the stored map (line 116)
    const onClickHandler = linkTo ? mockLinkOnClickHandlers.get(linkTo) : undefined;
    // If not found by exact match, try to find it by checking all handlers
    const handler = onClickHandler || Array.from(mockLinkOnClickHandlers.values())[0];
    expect(handler).toBeDefined();
    
    const mockEvent = {
      stopPropagation: jest.fn(),
      preventDefault: jest.fn(),
    };
    
    // Simulate clicking the link - this should call stopPropagation (line 116)
    handler(mockEvent);
    
    // Verify stopPropagation was called (line 116)
    expect(mockEvent.stopPropagation).toHaveBeenCalled();
    
    // Verify that clicking the link doesn't toggle the checkbox
    // (checkbox should remain unchecked, button should remain disabled)
    expect(screen.getByTestId('button-filled')).toBeDisabled();
  });

  it('should toggle document data checkbox when clicking the text span', () => {
    render(<FormFieldDetectionConsent {...defaultProps} />);
    
    // Find the document data checkbox text span (line 132)
    const documentDataText = screen.getByText('viewer.formFieldDetection.consent.checkbox.documentData');
    
    // Initially checkbox should be unchecked
    const checkboxes = screen.getAllByTestId('checkbox-v2');
    expect(checkboxes[1]).not.toBeChecked();
    
    // Click the text span
    fireEvent.click(documentDataText);
    
    // Verify checkbox is now checked
    expect(checkboxes[1]).toBeChecked();
    
    // Click again to uncheck
    fireEvent.click(documentDataText);
    expect(checkboxes[1]).not.toBeChecked();
  });

  it('should log error when eventTracking fails in trackConsentAgreementEvent', async () => {
    const error = new Error('Event tracking failed');
    (eventTracking as jest.Mock).mockRejectedValueOnce(error);
    
    render(<FormFieldDetectionConsent {...defaultProps} />);
    const checkboxes = screen.getAllByTestId('checkbox-v2');
    
    // Check both checkboxes and click agree
    fireEvent.click(checkboxes[0]);
    fireEvent.click(checkboxes[1]);
    fireEvent.click(screen.getByTestId('button-filled'));

    await waitFor(() => {
      // Verify logger.logError was called when eventTracking fails (line 46)
      expect(logger.logError).toHaveBeenCalledWith(
        expect.objectContaining({
          error,
          reason: expect.any(String),
        })
      );
    });
  });

  it('should log error when modalConfirmation fails in onAgreeConsent', async () => {
    const error = new Error('Modal confirmation failed');
    (modalEvent.modalConfirmation as jest.Mock).mockRejectedValueOnce(error);
    
    render(<FormFieldDetectionConsent {...defaultProps} />);
    const checkboxes = screen.getAllByTestId('checkbox-v2');
    
    // Check terms checkbox and click agree
    fireEvent.click(checkboxes[0]);
    fireEvent.click(screen.getByTestId('button-filled'));

    await waitFor(() => {
      // Verify logger.logError was called when modalConfirmation fails (line 60)
      expect(logger.logError).toHaveBeenCalledWith(
        expect.objectContaining({
          error,
          reason: expect.any(String),
        })
      );
    });
  });
});