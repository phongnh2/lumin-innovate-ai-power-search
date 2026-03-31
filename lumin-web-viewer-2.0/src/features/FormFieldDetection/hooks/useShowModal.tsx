import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { batch, useDispatch } from 'react-redux';
import { AnyAction } from 'redux';

import actions from 'actions';

import logger from 'helpers/logger';

import modalEvent, { ModalName, ModalPurpose } from 'utils/Factory/EventCollection/ModalEventCollection';

import dataElements from 'constants/dataElement';
import { LOGGER, ModalTypes } from 'constants/lumin-common';

import styles from '../components/FormFieldDetection.module.scss';
import FormFieldDetectionConsent from '../components/FormFieldDetectionConsent';
import FormFieldDetectionUnprocessable from '../components/FormFieldDetectionUnprocessable';
import PreconditionNotMatchModal from '../components/PreconditionNotMatchModal';

const useShowModal = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const showConsentModal = (onDetectingFormField?: () => Promise<void>) => {
    const modalEventData = {
      modalName: ModalName.FORM_FIELD_DETECTION_CONSENT,
      modalPurpose: ModalPurpose[ModalName.FORM_FIELD_DETECTION_CONSENT],
    };

    dispatch(
      actions.openViewerModal({
        type: ModalTypes.INFO,
        title: null,
        message: (
          <FormFieldDetectionConsent onDetectingFormField={onDetectingFormField} modalEventData={modalEventData} />
        ),
        size: 'large',
        footerVariant: null,
      }) as AnyAction
    );

    modalEvent
      .modalViewed(modalEventData)
      .catch((error: unknown) => logger.logError({ error, reason: LOGGER.Service.TRACK_EVENT_ERROR }));
  };

  const showPreconditionNotMatchModal = () => {
    dispatch(
      actions.openViewerModal({
        type: ModalTypes.INFO,
        title: null,
        message: <PreconditionNotMatchModal />,
        PaperProps: {
          className: styles.preconditionModalPaper,
        },
        size: 'large',
        footerVariant: null,
      }) as AnyAction
    );
  };

  const showLoadingModal = useCallback(
    ({
      cancelProcess = () => {},
      currentStep,
      isCancelable = true,
    }: {
      cancelProcess?: () => void;
      currentStep: number;
      isCancelable?: boolean;
    }) => {
      batch(() => {
        dispatch(actions.openElement(dataElements.VIEWER_LOADING_MODAL) as AnyAction);
        dispatch(
          actions.setupViewerLoadingModal({
            totalSteps: 2,
            currentStep,
            renderStatus: () => `${t('viewer.formFieldDetection.loading')}`,
            progressSuffix: null,
            isHideProgressContent: true,
            size: 'small',
            circularSize: 48,
            variant: 'download',
            onCancel: () => {
              cancelProcess();
            },
            isCancelable,
            fancyLoading: true,
            shouldDisableCancelAtSecondToLastStep: false,
          }) as AnyAction
        );
      });
    },
    [dispatch, t]
  );

  const showUnprocessableModal = useCallback(() => {
    dispatch(
      actions.openViewerModal({
        type: ModalTypes.INFO,
        title: null,
        message: <FormFieldDetectionUnprocessable />,
        size: 'medium',
        footerVariant: null,
        PaperProps: {
          className: styles.unProcessableModalPaper,
        },
      }) as AnyAction
    );
  }, [dispatch]);

  return {
    showConsentModal,
    showLoadingModal,
    showUnprocessableModal,
    showPreconditionNotMatchModal,
  };
};

export default useShowModal;
