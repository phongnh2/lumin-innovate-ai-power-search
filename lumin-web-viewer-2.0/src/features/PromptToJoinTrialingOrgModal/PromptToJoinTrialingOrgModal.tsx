import { Dialog, IconButton } from 'lumin-ui/kiwi-ui';
import React, { useEffect } from 'react';

import JoinOrganizationItem from 'luminComponents/JoinOrganizationItem';

import { useTrackingModalEvent, useTranslation } from 'hooks';

import { ModalName, ModalPurpose } from 'utils/Factory/EventCollection/ModalEventCollection';

import { useCheckModalAvailable, useSubmit } from './hooks';

import styles from './PromptToJoinTrialingOrgModal.module.scss';

const PromptToJoinTrialingOrgModal = () => {
  const { t } = useTranslation();

  const { trackModalViewed, trackModalDismiss } = useTrackingModalEvent({
    modalName: ModalName.PROMPT_TO_JOIN_TRIALING_WS,
    modalPurpose: ModalPurpose[ModalName.PROMPT_TO_JOIN_TRIALING_WS],
  });

  const { available, organization, setAvailable } = useCheckModalAvailable();

  const { isSubmitting, handleSubmit } = useSubmit({ onSuccess: () => setAvailable(false) });

  useEffect(() => {
    if (!available) {
      return;
    }
    trackModalViewed().finally(() => {});
  }, [available]);

  const handleCloseModal = () => {
    if (isSubmitting) {
      return;
    }
    trackModalDismiss().finally(() => {});
    setAvailable(false);
  };

  if (!available) {
    return null;
  }

  return (
    <Dialog
      opened
      centered
      zIndex="var(--zindex-modal-high)"
      closeOnClickOutside={false}
      closeOnEscape={false}
      onClose={handleCloseModal}
      style={{
        '--modal-size': '560px',
      }}
    >
      <div className={styles.header}>
        <h1 className={styles.title}>{t('joinOrgs.title')}</h1>
        <IconButton className={styles.closeButton} size="lg" icon="x-lg" onClick={handleCloseModal} />
      </div>
      <div className={styles.wrapper}>
        <p className={styles.description}>{t('joinOrgs.descriptionForModal')}</p>
        <JoinOrganizationItem
          isReskin
          organization={organization}
          onClick={() => handleSubmit(organization)}
          isSubmitting={isSubmitting}
        />
      </div>
    </Dialog>
  );
};

export default React.memo(PromptToJoinTrialingOrgModal);
