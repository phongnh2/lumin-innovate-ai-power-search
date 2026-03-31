import { Text, Button, ButtonVariant, ButtonSize } from 'lumin-ui/kiwi-ui';
import React from 'react';
import { Trans } from 'react-i18next';
import { Img } from 'react-image';
import { useDispatch } from 'react-redux';

import TadaSvg from 'assets/lumin-svgs/tada.svg';

import actions from 'actions';

import { useTranslation } from 'hooks/useTranslation';

import showContactCustomerSupportModal from 'features/CNC/helpers/showContactCustomerSupportModal';
import { useShowContactCustomerSupportModal } from 'features/CNC/hooks/useShowContactCustomerSupportModal';

import { IOrganization } from 'interfaces/organization/organization.interface';

import styles from './JoinedOrganizationModal.module.scss';

const JoinedOrganizationModal = ({
  organization,
  numberInvited,
}: {
  organization: IOrganization;
  numberInvited?: number;
}) => {
  const dispatch = useDispatch();
  const { name: organizationName } = organization || {};
  const { t } = useTranslation();
  const { shouldOpenContactCustomerSupportModal } = useShowContactCustomerSupportModal({ organization, numberInvited });

  const handleCloseModal = () => {
    dispatch(actions.closeModal());
    if (shouldOpenContactCustomerSupportModal) {
      showContactCustomerSupportModal({
        numberInvited,
      });
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Img src={TadaSvg} alt="tada" width="88" height="80" />
        <Text type="headline" size="lg" color="var(--kiwi-colors-surface-on-surface)">
          {t('googleOnboarding.welcome', { organizationName })}
        </Text>
        <Text type="body" size="md" color="var(--kiwi-colors-semantic-on-success-container)">
          <Trans i18nKey="googleOnboarding.description" values={{ organizationName }} components={{ b: <b /> }} />
        </Text>
      </div>
      <div className={styles.buttonWrapper}>
        <Button variant={ButtonVariant.filled} size={ButtonSize.lg} onClick={handleCloseModal}>
          {t('common.gotIt')}
        </Button>
      </div>
    </div>
  );
};

export default JoinedOrganizationModal;
