import useShowModal from '../useShowModal';

jest.spyOn(console, 'error').mockImplementation(() => {});

jest.mock('helpers/i18n', () => ({
  __esModule: true,
  default: {},
}));

jest.mock('react-redux', () => {
  const dispatchMock = jest.fn();
  return {
    useDispatch: jest.fn(() => dispatchMock),
    batch: (fn: () => void) => fn(),
    __dispatchMock: dispatchMock,
  };
});

jest.mock('hooks/useTranslation', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

jest.mock('lumin-components/WarningOCRContent', () => 'WarningOCRContent');

jest.mock('../utils', () => ({
  onCheckboxValue: jest.fn(),
}));

jest.mock('utils/Factory/EventCollection/ModalEventCollection', () => {
  const modalEventMock = {
    modalViewed: jest.fn(),
    modalConfirmation: jest.fn(),
    modalDismiss: jest.fn(),
    modalHidden: jest.fn(),
  };
  return {
    __esModule: true,
    default: modalEventMock,
    ModalName: {
      OCR_UNAVAILABLE: 'OCR_UNAVAILABLE',
      CONFIRM_PERFORMING_OCR: 'CONFIRM_PERFORMING_OCR',
    },
    ModalPurpose: {
      OCR_UNAVAILABLE: 'OCR_UNAVAILABLE_PURPOSE',
      CONFIRM_PERFORMING_OCR: 'CONFIRM_PERFORMING_OCR_PURPOSE',
    },
    __modalEventMock: modalEventMock,
  };
});

jest.mock('actions', () => ({
  openViewerModal: jest.fn((payload) => ({ type: 'OPEN_VIEWER_MODAL', payload })),
  closeModal: jest.fn(() => ({ type: 'CLOSE_MODAL' })),
  openElement: jest.fn((payload) => ({ type: 'OPEN_ELEMENT', payload })),
  setupViewerLoadingModal: jest.fn((payload) => ({ type: 'SETUP_VIEWER_LOADING_MODAL', payload })),
}));

jest.mock('constants/dataElement', () => ({
  DataElements: {
    VIEWER_LOADING_MODAL: 'VIEWER_LOADING_MODAL',
  },
}));

jest.mock('constants/lumin-common', () => ({
  ModalTypes: {
    ERROR: 'ERROR',
    WARNING: 'WARNING',
  },
}));

describe('useShowModal', () => {
  const actions = jest.requireMock('actions');
  const onCheckboxValue = jest.requireMock('../utils').onCheckboxValue as jest.Mock;
  const dispatchMock = jest.requireMock('react-redux').__dispatchMock as jest.Mock;
  const modalEventMock = jest.requireMock('utils/Factory/EventCollection/ModalEventCollection')
    .__modalEventMock as {
    modalViewed: jest.Mock;
    modalConfirmation: jest.Mock;
    modalDismiss: jest.Mock;
    modalHidden: jest.Mock;
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('opens unavailable modal and handles confirmation', async () => {
    const { showUnavailableModal } = useShowModal();

    showUnavailableModal();

    expect(dispatchMock).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'OPEN_VIEWER_MODAL',
      })
    );
    expect(modalEventMock.modalViewed).toHaveBeenCalledWith(
      expect.objectContaining({ modalName: 'OCR_UNAVAILABLE' })
    );

    const modalPayload = actions.openViewerModal.mock.calls[0][0];
    await modalPayload.onConfirm();

    expect(modalEventMock.modalConfirmation).toHaveBeenCalledWith(
      expect.objectContaining({ modalName: 'OCR_UNAVAILABLE' })
    );
    expect(dispatchMock).toHaveBeenCalledWith({ type: 'CLOSE_MODAL' });
  });

  it('shows prompt modal and wires handlers', async () => {
    const { showPromptModal } = useShowModal();
    const processOCR = jest.fn().mockResolvedValue(undefined);

    showPromptModal(processOCR);

    expect(dispatchMock).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'OPEN_VIEWER_MODAL' })
    );
    expect(modalEventMock.modalViewed).toHaveBeenCalledWith(
      expect.objectContaining({ modalName: 'CONFIRM_PERFORMING_OCR' })
    );

    const modalPayload = actions.openViewerModal.mock.calls[0][0];
    modalPayload.onCancel(true);
    expect(onCheckboxValue).toHaveBeenCalledWith(
      true,
      expect.objectContaining({ modalName: 'CONFIRM_PERFORMING_OCR' })
    );
    expect(modalEventMock.modalDismiss).toHaveBeenCalled();

    await modalPayload.onConfirm(false);
    expect(onCheckboxValue).toHaveBeenCalledWith(
      false,
      expect.objectContaining({ modalName: 'CONFIRM_PERFORMING_OCR' })
    );
    expect(modalEventMock.modalConfirmation).toHaveBeenCalled();
    expect(dispatchMock).toHaveBeenCalledWith({ type: 'CLOSE_MODAL' });
    expect(processOCR).toHaveBeenCalledTimes(1);
  });

  it('opens loading modal with correct payload', () => {
    const { openLoadingModal } = useShowModal();

    openLoadingModal(5);

    expect(dispatchMock).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'OPEN_ELEMENT', payload: 'VIEWER_LOADING_MODAL' })
    );
    expect(dispatchMock).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'SETUP_VIEWER_LOADING_MODAL',
        payload: expect.objectContaining({ totalSteps: 5 }),
      })
    );
  });

  it('renderStatus returns correct OCR performing message', () => {
    const { openLoadingModal } = useShowModal();

    openLoadingModal(3);

    const setupPayload = actions.setupViewerLoadingModal.mock.calls[0][0];
    const statusMessage = setupPayload.renderStatus();

    expect(statusMessage).toBe('viewer.ocr.performing...');
  });
});
