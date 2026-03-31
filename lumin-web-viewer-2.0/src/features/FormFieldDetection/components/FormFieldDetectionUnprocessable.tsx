import { ButtonSize, Button, ButtonVariant } from 'lumin-ui/kiwi-ui';
import React, { useEffect } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { AnyAction } from 'redux';

import actions from 'actions';

import modalEvent, { ModalName, ModalPurpose } from 'utils/Factory/EventCollection/ModalEventCollection';

import { FormFieldDetectionFeedbackUrl } from '../constants/detectionField.constant';

import styles from './FormFieldDetection.module.scss';

const FormFieldDetectionUnprocessable = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const trackingData = {
    modalName: ModalName.ERROR_WHEN_DETECT_FORM_FIELDS,
    modalPurpose: ModalPurpose[ModalName.ERROR_WHEN_DETECT_FORM_FIELDS],
  };

  useEffect(() => {
    modalEvent.modalViewed(trackingData).catch(() => {});
  }, []);

  return (
    <div className={styles.modalWrapper}>
      <h3 className={styles.title}>{t('viewer.formFieldDetection.unprocess.title')}</h3>
      <div className={styles.content}>
        <span className={styles.text}>
          <Trans i18nKey="viewer.formFieldDetection.unprocess.content" components={{ br: <br /> }} />
        </span>
      </div>
      <div className={styles.footer}>
        <Button
          size={ButtonSize.lg}
          variant={ButtonVariant.text}
          onClick={() => {
            modalEvent.modalConfirmation(trackingData).catch(() => {});
            window.open(FormFieldDetectionFeedbackUrl, '_blank');
            dispatch(actions.closeModal() as AnyAction);
          }}
        >
          {t('common.sendFeedback')}
        </Button>
        <Button
          size={ButtonSize.lg}
          variant={ButtonVariant.tonal}
          onClick={() => {
            modalEvent.modalDismiss(trackingData).catch(() => {});
            dispatch(actions.closeModal() as AnyAction);
          }}
        >
          {t('viewer.formBuildPanel.insertFields')}
        </Button>
      </div>
    </div>
  );
};

export default FormFieldDetectionUnprocessable;
