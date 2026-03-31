import { Button, ButtonSize, ButtonVariant } from 'lumin-ui/kiwi-ui';
import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { AnyAction } from 'redux';

import actions from 'actions';

import modalEvent, { ModalName, ModalPurpose } from 'utils/Factory/EventCollection/ModalEventCollection';

import { TOTAL_PAGES_LIMIT } from '../constants/detectionField.constant';

import styles from './FormFieldDetection.module.scss';

const PreconditionNotMatchModal = () => {
  const dispatch = useDispatch();
  const { t } = useTranslation();

  const modalEventData = {
    modalName: ModalName.FFD_DOCUMENT_IS_UNSUPPORTED,
    modalPurpose: ModalPurpose[ModalName.FFD_DOCUMENT_IS_UNSUPPORTED],
  };

  const handleGotIt = () => {
    dispatch(actions.closeModal() as AnyAction);
    modalEvent.modalDismiss(modalEventData).catch(() => {});
  };

  useEffect(() => {
    modalEvent.modalViewed(modalEventData).catch(() => {});
  }, []);

  return (
    <div className={styles.modalWrapper}>
      <h3 className={styles.title}>{t('viewer.formFieldDetection.precondition.title')}</h3>
      <div className={styles.preconditionModalBody}>
        <span>
          {t('viewer.formFieldDetection.precondition.body', {
            pageLimit: TOTAL_PAGES_LIMIT,
          })}
        </span>
      </div>
      <div className={styles.footer}>
        <Button variant={ButtonVariant.text} size={ButtonSize.lg} onClick={handleGotIt}>
          {t('common.gotIt')}
        </Button>
      </div>
    </div>
  );
};

export default PreconditionNotMatchModal;
