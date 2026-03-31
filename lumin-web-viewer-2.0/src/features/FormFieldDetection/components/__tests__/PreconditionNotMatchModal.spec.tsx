import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import actions from 'actions';
import modalEvent from 'utils/Factory/EventCollection/ModalEventCollection';
import PreconditionNotMatchModal from '../PreconditionNotMatchModal';

jest.mock('react-redux', () => ({
  useDispatch: jest.fn(),
}));

jest.mock('react-i18next', () => ({
  useTranslation: jest.fn(),
}));

jest.mock('actions', () => ({
  closeModal: jest.fn(() => ({ type: 'CLOSE_MODAL' })),
}));

jest.mock('utils/Factory/EventCollection/ModalEventCollection', () => ({
  modalDismiss: jest.fn().mockResolvedValue({}),
  modalViewed: jest.fn().mockResolvedValue({}),
  ModalName: { FFD_DOCUMENT_IS_UNSUPPORTED: 'FFD_DOCUMENT_IS_UNSUPPORTED' },
  ModalPurpose: { FFD_DOCUMENT_IS_UNSUPPORTED: 'unsupported_doc' },
}));

jest.mock('lumin-ui/kiwi-ui', () => ({
  Button: ({ children, onClick }: any) => <button onClick={onClick}>{children}</button>,
  ButtonSize: { lg: 'lg' },
  ButtonVariant: { text: 'text' },
}));

describe('PreconditionNotMatchModal', () => {
  const mockDispatch = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useDispatch as jest.Mock).mockReturnValue(mockDispatch);
    (useTranslation as jest.Mock).mockReturnValue({
      t: (key: string, options?: any) => (options?.pageLimit ? `${key}_${options.pageLimit}` : key),
    });
  });

  it('should track modal view on mount', () => {
    render(<PreconditionNotMatchModal />);
    expect(modalEvent.modalViewed).toHaveBeenCalledWith(expect.objectContaining({
      modalName: 'FFD_DOCUMENT_IS_UNSUPPORTED',
    }));
  });

  it('should render content with page limit', () => {
    render(<PreconditionNotMatchModal />);
    expect(screen.getByText('viewer.formFieldDetection.precondition.title')).toBeInTheDocument();
    // Assuming TOTAL_PAGES_LIMIT is exported as a number (e.g., 50)
    expect(screen.getByText(/viewer.formFieldDetection.precondition.body/)).toBeInTheDocument();
  });

  it('should handle "Got it" click', () => {
    render(<PreconditionNotMatchModal />);
    fireEvent.click(screen.getByText('common.gotIt'));

    expect(mockDispatch).toHaveBeenCalledWith(actions.closeModal());
    expect(modalEvent.modalDismiss).toHaveBeenCalled();
  });
});