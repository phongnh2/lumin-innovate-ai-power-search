import { Button, Modal } from 'lumin-ui/kiwi-ui';
import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';

import IconThreeStars from 'assets/lumin-svgs/icon-three-stars.svg';

import { useTrackingModalEvent, useTranslation } from 'hooks';
import { useGetRemoveButtonProStartTrial } from 'hooks/growthBook/useGetRemoveButtonProStartTrial';

import { PremiumToolsPopOverEvent } from 'constants/premiumToolsPopOverEvent';

import { useMultipleMergeContext } from '../../hooks/useMultipleMergeContext';

import styles from './PremiumModal.module.scss';

const PremiumModal = () => {
  const { premiumModalContent, openedPremiumModal, openedPremiumModalHandlers } = useMultipleMergeContext();
  const { isRemoveButtonProStartTrial } = useGetRemoveButtonProStartTrial();
  const { t } = useTranslation();

  const { trackModalViewed, trackModalDismiss, trackModalConfirmation } = useTrackingModalEvent({
    modalName: `${PremiumToolsPopOverEvent.MergePage}PopOver`,
    modalPurpose: 'Premium tool pop-over',
  });

  useEffect(() => {
    trackModalViewed().catch(() => {});
  }, []);

  if (!premiumModalContent) {
    return null;
  }

  return (
    <Modal
      opened={openedPremiumModal}
      size="xs"
      fullWidthButton
      onClose={openedPremiumModalHandlers.close}
      padding="sm"
    >
      <div className={styles.premiumModal}>
        <img className={styles.premiumImage} src={IconThreeStars} alt="upgrade to access" />
        <p className={styles.premiumTitle}>{t(premiumModalContent.title)}</p>
        <p className={styles.premiumMessage}>{t(premiumModalContent.message)}</p>
      </div>
      <div className={styles.premiumFooter}>
        {premiumModalContent.startTrialButton && (
          <Button
            size="md"
            classNames={{
              root: styles.premiumButtonRoot,
              label: styles.premiumButtonLabel,
            }}
            fullWidth
            component={Link}
            to={premiumModalContent.startTrialButton.link}
            variant="outlined"
            onClick={trackModalDismiss}
          >
            {t(premiumModalContent.startTrialButton.label)}
          </Button>
        )}
        {!isRemoveButtonProStartTrial && (
          <Button
            size="md"
            classNames={{
              root: styles.premiumButtonRoot,
              label: styles.premiumButtonLabel,
            }}
            fullWidth
            component={Link}
            to={premiumModalContent.upgradeButton.link}
            onClick={trackModalConfirmation}
          >
            {t(premiumModalContent.upgradeButton.label)}
          </Button>
        )}
      </div>
    </Modal>
  );
};

export default PremiumModal;
