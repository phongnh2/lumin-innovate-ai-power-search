import { renderHook, act } from '@testing-library/react';
import { useTranslation } from 'react-i18next';
import { useDispatch, batch } from 'react-redux';
import useShowModal from '../useShowModal';
import actions from 'actions';
import logger from 'helpers/logger';
import modalEvent, { ModalName, ModalPurpose } from 'utils/Factory/EventCollection/ModalEventCollection';
import dataElements from 'constants/dataElement';
import { LOGGER, ModalTypes } from 'constants/lumin-common';

jest.mock('features/FormFieldDetection/components/FormFieldDetectionConsent', () => ({
  __esModule: true,
  default: jest.fn(() => null),
}));

jest.mock('features/FormFieldDetection/components/FormFieldDetectionUnprocessable', () => ({
  __esModule: true,
  default: jest.fn(() => null),
}));

jest.mock('features/FormFieldDetection/components/PreconditionNotMatchModal', () => ({
  __esModule: true,
  default: jest.fn(() => null),
}));

jest.mock('react-i18next', () => ({
  useTranslation: jest.fn(),
}));

jest.mock('react-redux', () => ({
  useDispatch: jest.fn(),
  batch: jest.fn((fn) => fn()),
}));

jest.mock('actions', () => ({
  __esModule: true,
  default: {
    openViewerModal: jest.fn((config) => ({ type: 'OPEN_VIEWER_MODAL', payload: config })),
    openElement: jest.fn((element) => ({ type: 'OPEN_ELEMENT', payload: element })),
    closeElement: jest.fn((element) => ({ type: 'CLOSE_ELEMENT', payload: element })),
    setupViewerLoadingModal: jest.fn((config) => ({ type: 'SETUP_VIEWER_LOADING_MODAL', payload: config })),
  },
}));

jest.mock('helpers/logger', () => ({
  __esModule: true,
  default: {
    logError: jest.fn(),
  },
}));

jest.mock('utils/Factory/EventCollection/ModalEventCollection', () => ({
  __esModule: true,
  default: {
    modalViewed: jest.fn(),
  },
  ModalName: {
    FORM_FIELD_DETECTION_CONSENT: 'FORM_FIELD_DETECTION_CONSENT',
  },
  ModalPurpose: {
    FORM_FIELD_DETECTION_CONSENT: 'FORM_FIELD_DETECTION_CONSENT_PURPOSE',
  },
}));

jest.mock('constants/dataElement', () => ({
  __esModule: true,
  default: {
    VIEWER_LOADING_MODAL: 'viewerLoadingModal',
  },
}));

jest.mock('constants/lumin-common', () => ({
  LOGGER: {
    Service: {
      TRACK_EVENT_ERROR: 'TRACK_EVENT_ERROR',
    },
  },
  ModalTypes: {
    INFO: 'INFO',
  },
}));

describe('useShowModal', () => {
  const mockDispatch = jest.fn();
  const mockT = jest.fn((key: string) => key);

  beforeEach(() => {
    jest.clearAllMocks();
    (useDispatch as jest.Mock).mockReturnValue(mockDispatch);
    (useTranslation as jest.Mock).mockReturnValue({ t: mockT });
    (modalEvent.modalViewed as jest.Mock).mockResolvedValue(undefined);
  });

  describe('showConsentModal', () => {
    it('should dispatch openViewerModal with FormFieldDetectionConsent component when called without callback', () => {
      const { result } = renderHook(() => useShowModal());

      act(() => {
        result.current.showConsentModal();
      });

      expect(mockDispatch).toHaveBeenCalledWith(
        actions.openViewerModal({
          type: ModalTypes.INFO,
          title: null,
          message: expect.any(Object),
          size: 'large',
          footerVariant: null,
        })
      );

      expect(modalEvent.modalViewed).toHaveBeenCalledWith({
        modalName: ModalName.FORM_FIELD_DETECTION_CONSENT,
        modalPurpose: ModalPurpose[ModalName.FORM_FIELD_DETECTION_CONSENT],
      });
    });

    it('should dispatch openViewerModal with FormFieldDetectionConsent component when called with callback', () => {
      const mockCallback = jest.fn();
      const { result } = renderHook(() => useShowModal());

      act(() => {
        result.current.showConsentModal(mockCallback);
      });

      expect(mockDispatch).toHaveBeenCalledWith(
        actions.openViewerModal({
          type: ModalTypes.INFO,
          title: null,
          message: expect.any(Object),
          size: 'large',
          footerVariant: null,
        })
      );

      expect(modalEvent.modalViewed).toHaveBeenCalledWith({
        modalName: ModalName.FORM_FIELD_DETECTION_CONSENT,
        modalPurpose: ModalPurpose[ModalName.FORM_FIELD_DETECTION_CONSENT],
      });
    });

    it('should handle error when modalViewed rejects', async () => {
      const mockError = new Error('Tracking error');
      (modalEvent.modalViewed as jest.Mock).mockRejectedValue(mockError);
      const { result } = renderHook(() => useShowModal());

      await act(async () => {
        result.current.showConsentModal();
      });

      expect(logger.logError).toHaveBeenCalledWith({
        error: mockError,
        reason: LOGGER.Service.TRACK_EVENT_ERROR,
      });
    });
  });

  describe('showPreconditionNotMatchModal', () => {
    it('should dispatch openViewerModal with PreconditionNotMatchModal component', () => {
      const { result } = renderHook(() => useShowModal());

      act(() => {
        result.current.showPreconditionNotMatchModal();
      });

      expect(mockDispatch).toHaveBeenCalledWith(
        actions.openViewerModal({
          type: ModalTypes.INFO,
          title: null,
          message: expect.any(Object),
          PaperProps: {
            className: expect.any(String),
          },
          size: 'large',
          footerVariant: null,
        })
      );
    });
  });

  describe('showLoadingModal', () => {
    it('should dispatch openElement and setupViewerLoadingModal with default cancelProcess when called with only currentStep', () => {
      const { result } = renderHook(() => useShowModal());

      act(() => {
        result.current.showLoadingModal({ currentStep: 1 });
      });

      expect(batch).toHaveBeenCalled();
      expect(mockDispatch).toHaveBeenCalledWith(actions.openElement(dataElements.VIEWER_LOADING_MODAL));
      expect(mockDispatch).toHaveBeenCalledWith(
        actions.setupViewerLoadingModal({
          totalSteps: 2,
          currentStep: 1,
          renderStatus: expect.any(Function),
          progressSuffix: null,
          isHideProgressContent: true,
          size: 'small',
          circularSize: 48,
          variant: 'download',
          onCancel: expect.any(Function),
          isCancelable: true,
          fancyLoading: true,
          shouldDisableCancelAtSecondToLastStep: false,
        })
      );
    });

    it('should call renderStatus function with correct translation key', () => {
      const { result } = renderHook(() => useShowModal());

      act(() => {
        result.current.showLoadingModal({ currentStep: 1 });
      });

      const setupCall = mockDispatch.mock.calls.find(
        (call) => call[0].type === 'SETUP_VIEWER_LOADING_MODAL'
      );
      const renderStatus = setupCall[0].payload.renderStatus;

      expect(renderStatus()).toBe('viewer.formFieldDetection.loading');
      expect(mockT).toHaveBeenCalledWith('viewer.formFieldDetection.loading');
    });

    it('should dispatch openElement and setupViewerLoadingModal with custom cancelProcess', () => {
      const mockCancelProcess = jest.fn();
      const { result } = renderHook(() => useShowModal());

      act(() => {
        result.current.showLoadingModal({
          currentStep: 2,
          cancelProcess: mockCancelProcess,
        });
      });

      expect(mockDispatch).toHaveBeenCalledWith(actions.openElement(dataElements.VIEWER_LOADING_MODAL));
      
      const setupCall = mockDispatch.mock.calls.find(
        (call) => call[0].type === 'SETUP_VIEWER_LOADING_MODAL'
      );
      const onCancel = setupCall[0].payload.onCancel;

      act(() => {
        onCancel();
      });

      expect(mockCancelProcess).toHaveBeenCalled();
    });

    it('should dispatch openElement and setupViewerLoadingModal with isCancelable set to false', () => {
      const { result } = renderHook(() => useShowModal());

      act(() => {
        result.current.showLoadingModal({
          currentStep: 1,
          isCancelable: false,
        });
      });

      const setupCall = mockDispatch.mock.calls.find(
        (call) => call[0].type === 'SETUP_VIEWER_LOADING_MODAL'
      );

      expect(setupCall[0].payload.isCancelable).toBe(false);
    });

    it('should dispatch openElement and setupViewerLoadingModal with isCancelable set to true', () => {
      const { result } = renderHook(() => useShowModal());

      act(() => {
        result.current.showLoadingModal({
          currentStep: 1,
          isCancelable: true,
        });
      });

      const setupCall = mockDispatch.mock.calls.find(
        (call) => call[0].type === 'SETUP_VIEWER_LOADING_MODAL'
      );

      expect(setupCall[0].payload.isCancelable).toBe(true);
    });

    it('should handle onCancel callback with default empty cancelProcess', () => {
      const { result } = renderHook(() => useShowModal());

      act(() => {
        result.current.showLoadingModal({ currentStep: 1 });
      });

      const setupCall = mockDispatch.mock.calls.find(
        (call) => call[0].type === 'SETUP_VIEWER_LOADING_MODAL'
      );
      const onCancel = setupCall[0].payload.onCancel;

      act(() => {
        onCancel();
      });
    });

    it('should handle onCancel callback with custom cancelProcess', () => {
      const mockCancelProcess = jest.fn();
      const { result } = renderHook(() => useShowModal());

      act(() => {
        result.current.showLoadingModal({
          currentStep: 1,
          cancelProcess: mockCancelProcess,
        });
      });

      const setupCall = mockDispatch.mock.calls.find(
        (call) => call[0].type === 'SETUP_VIEWER_LOADING_MODAL'
      );
      const onCancel = setupCall[0].payload.onCancel;

      act(() => {
        onCancel();
      });

      expect(mockCancelProcess).toHaveBeenCalled();
    });

    it('should handle different currentStep values', () => {
      const { result } = renderHook(() => useShowModal());

      act(() => {
        result.current.showLoadingModal({ currentStep: 0 });
      });

      const setupCall = mockDispatch.mock.calls.find(
        (call) => call[0].type === 'SETUP_VIEWER_LOADING_MODAL'
      );
      expect(setupCall[0].payload.currentStep).toBe(0);

      jest.clearAllMocks();

      act(() => {
        result.current.showLoadingModal({ currentStep: 2 });
      });

      const setupCall2 = mockDispatch.mock.calls.find(
        (call) => call[0].type === 'SETUP_VIEWER_LOADING_MODAL'
      );
      expect(setupCall2[0].payload.currentStep).toBe(2);
    });
  });

  describe('showUnprocessableModal', () => {
    it('should dispatch openViewerModal with FormFieldDetectionUnprocessable component', () => {
      const { result } = renderHook(() => useShowModal());

      act(() => {
        result.current.showUnprocessableModal();
      });

      expect(mockDispatch).toHaveBeenCalledWith(
        actions.openViewerModal({
          type: ModalTypes.INFO,
          title: null,
          message: expect.any(Object),
          size: 'medium',
          footerVariant: null,
          PaperProps: {
            className: expect.any(String),
          },
        })
      );
    });
  });

  describe('hook return value', () => {
    it('should return all modal functions', () => {
      const { result } = renderHook(() => useShowModal());

      expect(result.current).toHaveProperty('showConsentModal');
      expect(result.current).toHaveProperty('showLoadingModal');
      expect(result.current).toHaveProperty('showUnprocessableModal');
      expect(result.current).toHaveProperty('showPreconditionNotMatchModal');
      expect(typeof result.current.showConsentModal).toBe('function');
      expect(typeof result.current.showLoadingModal).toBe('function');
      expect(typeof result.current.showUnprocessableModal).toBe('function');
      expect(typeof result.current.showPreconditionNotMatchModal).toBe('function');
    });
  });
});

