import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import actions from 'actions';
import modalEvent from 'utils/Factory/EventCollection/ModalEventCollection';
import FormFieldDetectionUnprocessable from '../FormFieldDetectionUnprocessable';

jest.mock('react-redux', () => ({
  useDispatch: jest.fn(),
}));

jest.mock('react-i18next', () => ({
  useTranslation: jest.fn(),
  Trans: ({ i18nKey }: { i18nKey: string }) => <div>{i18nKey}</div>,
}));

jest.mock('actions', () => ({
  closeModal: jest.fn(() => ({ type: 'CLOSE_MODAL' })),
}));

jest.mock('utils/Factory/EventCollection/ModalEventCollection', () => ({
  modalDismiss: jest.fn().mockResolvedValue({}),
  modalConfirmation: jest.fn().mockResolvedValue({}),
  modalViewed: jest.fn().mockResolvedValue({}),
  ModalName: { ERROR_WHEN_DETECT_FORM_FIELDS: 'ERROR_WHEN_DETECT_FORM_FIELDS' },
  ModalPurpose: { ERROR_WHEN_DETECT_FORM_FIELDS: 'error_detect' },
}));

jest.mock('lumin-ui/kiwi-ui', () => ({
  Button: ({ children, onClick, variant }: any) => (
    <button onClick={onClick} data-testid={`btn-${variant}`}>
      {children}
    </button>
  ),
  ButtonSize: { lg: 'lg' },
  ButtonVariant: { text: 'text', tonal: 'tonal' },
}));

describe('FormFieldDetectionUnprocessable', () => {
  const mockDispatch = jest.fn();
  const originalOpen = window.open;

  beforeAll(() => {
    window.open = jest.fn();
  });

  afterAll(() => {
    window.open = originalOpen;
  });

  beforeEach(() => {
    jest.clearAllMocks();
    (useDispatch as jest.Mock).mockReturnValue(mockDispatch);
    (useTranslation as jest.Mock).mockReturnValue({ t: (key: string) => key });
  });

  it('should track view on mount', () => {
    render(<FormFieldDetectionUnprocessable />);
    expect(modalEvent.modalViewed).toHaveBeenCalled();
  });

  it('should handle feedback button click', () => {
    render(<FormFieldDetectionUnprocessable />);
    fireEvent.click(screen.getByTestId('btn-text'));

    expect(modalEvent.modalConfirmation).toHaveBeenCalled();
    expect(window.open).toHaveBeenCalledWith(expect.any(String), '_blank');
    expect(mockDispatch).toHaveBeenCalledWith(actions.closeModal());
  });

  it('should handle insert fields (dismiss) button click', () => {
    render(<FormFieldDetectionUnprocessable />);
    fireEvent.click(screen.getByTestId('btn-tonal'));

    expect(modalEvent.modalDismiss).toHaveBeenCalled();
    expect(mockDispatch).toHaveBeenCalledWith(actions.closeModal());
  });
});