import { Text, Button, ButtonVariant, ButtonSize, IconButton } from 'lumin-ui/kiwi-ui';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';

import actions from 'actions';

import { useTrackingModalEvent } from 'hooks';

import { CNCModalName, CNCModalPurpose } from 'features/CNC/constants/events/modal';

import styles from './ContactCustomerSupportModal.module.scss';

const ContactCustomerSupportModal = ({ numberInvited }: { numberInvited: number }) => {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const { trackModalConfirmation, trackModalDismiss } = useTrackingModalEvent({
    modalName: CNCModalName.CONTACT_CUSTOMER_SUCCESS_MODAL,
    modalPurpose: CNCModalPurpose[CNCModalName.CONTACT_CUSTOMER_SUCCESS_MODAL],
  });
  const handleCloseModal = () => {
    dispatch(actions.closeModal());
    trackModalDismiss().catch(() => {});
  };

  const handleOpenSupportPage = () => {
    dispatch(actions.closeModal());
    trackModalConfirmation().catch(() => {});
    window.open('https://luminpdf.chilipiper.com/me/celisse-moyer/lumin-meeting', '_blank', 'noopener,noreferrer');
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Text type="headline" size="lg" color="var(--kiwi-colors-surface-on-surface)">
          {t('contactCustomerSupportModal.title')}
        </Text>
      </div>

      <IconButton size="lg" icon="x-lg" className={styles.closeButton} onClick={handleCloseModal} aria-label="Close" />
      <Text type="body" size="md" color="var(--kiwi-colors-surface-on-surface-variant)">
        {t('contactCustomerSupportModal.content', { amount: numberInvited })}
      </Text>
      <div className={styles.buttonWrapper}>
        <Button variant={ButtonVariant.filled} size={ButtonSize.lg} onClick={handleOpenSupportPage}>
          {t('contactCustomerSupportModal.cta')}
        </Button>
      </div>
    </div>
  );
};

export default ContactCustomerSupportModal;
