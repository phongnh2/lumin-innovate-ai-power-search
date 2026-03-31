import classNames from 'classnames';
import { get } from 'lodash';
import { Button, Icomoon, IconButton, Modal } from 'lumin-ui/kiwi-ui';
import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';

import AgreementGenHeroImage from 'assets/lumin-svgs/agreement-gen-hero-image.svg';
import AgreementGenHeroMedia from 'assets/media/agreement-gen-hero-media.webm';

import { useGetCurrentUser, useThemeMode, useTranslation } from 'hooks';

import userServices from 'services/userServices';

import logger from 'helpers/logger';

import modalEvent, { ModalName, ModalPurpose } from 'utils/Factory/EventCollection/ModalEventCollection';

import { INTRODUCING_AGREEMENT_GEN_URL } from 'constants/urls';
import { USER_METADATA_KEY } from 'constants/userConstants';

import { useTryAgreementGen } from '../../hooks/useTryAgreementGen';
import { closeEditInAgreementGenModal } from '../../slices';

import styles from './EditInAgreementGen.module.scss';

const EditInAgreementGen = () => {
  const dispatch = useDispatch();
  const themeMode = useThemeMode();
  const { t } = useTranslation();
  const { tryAgreementGen } = useTryAgreementGen();
  const currentUser = useGetCurrentUser();
  const hasShownEditInAgreementGenModal = get(currentUser, 'metadata.hasShownEditInAgreementGenModal');
  const trackingData = {
    modalName: ModalName.INTRODUCE_USERS_TO_USE_AGREEMENT_GEN,
    modalPurpose: ModalPurpose[ModalName.INTRODUCE_USERS_TO_USE_AGREEMENT_GEN],
  };

  const updateHasShownEditInAgreementGenModal = async () => {
    if (hasShownEditInAgreementGenModal) {
      return;
    }

    try {
      await userServices.updateUserMetadata({
        key: USER_METADATA_KEY.HAS_SHOWN_EDIT_IN_AGREEMENT_GEN_MODAL,
        value: true,
      });
    } catch (error) {
      logger.logError({ error: error as Error });
    }
  };

  const onClose = () => {
    dispatch(closeEditInAgreementGenModal());
    modalEvent.modalDismiss(trackingData).catch(() => {});
    updateHasShownEditInAgreementGenModal().catch(() => {});
  };

  const handleClickTryAgreementGen = async () => {
    dispatch(closeEditInAgreementGenModal());
    modalEvent.modalConfirmation(trackingData).catch(() => {});
    await Promise.all([tryAgreementGen(), updateHasShownEditInAgreementGenModal()]);
  };

  useEffect(() => {
    modalEvent.modalViewed(trackingData).catch(() => {});
  }, []);

  return (
    <Modal
      classNames={{
        body: classNames([styles.modal, themeMode === 'dark' && styles.modalDark]),
        content: styles.content,
      }}
      onClose={onClose}
      opened
      size="md"
    >
      <div className={styles.content}>
        <div className={styles.header}>
          <div className={styles.closeIconWrapper}>
            <IconButton
              className={styles.closeIcon}
              icon="stamp-cross-lg"
              onClick={onClose}
              iconSize="sm"
              iconColor="var(--kiwi-colors-core-on-primary)"
            />
          </div>
          <div className={styles.title}>
            <h2 className={styles.titleText}>{t('viewer.editInAgreementGen.title')}</h2>
            <div className={styles.logoWrapper} />
          </div>
        </div>
        <p className={styles.description}>{t('viewer.editInAgreementGen.description')}</p>
        <video autoPlay loop muted playsInline className={styles.image} poster={AgreementGenHeroImage}>
          <source src={AgreementGenHeroMedia} type="video/webm" />
        </video>
        <div className={styles.buttonWrapper}>
          <a className={styles.learnMoreButton} href={INTRODUCING_AGREEMENT_GEN_URL} target="_blank" rel="noreferrer">
            <p className={styles.learnMoreButtonText}>{t('common.learnMore')}</p>
            <Icomoon type="external-link-lg" size="lg" color="var(--kiwi-colors-surface-on-surface)" />
          </a>
          <Button size="lg" onClick={handleClickTryAgreementGen}>
            {t('viewer.editInAgreementGen.tryAgreementGen')}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default EditInAgreementGen;
