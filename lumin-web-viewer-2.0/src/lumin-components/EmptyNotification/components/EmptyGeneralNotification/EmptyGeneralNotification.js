import { Avatar } from 'lumin-ui/kiwi-ui';
import React from 'react';

import LuminLogo from 'assets/reskin/images/lumin-logo.png';

import { useTranslation } from 'hooks';

import styles from './EmptyGeneralNotification.module.scss';

function EmptyGeneralNotification() {
  const { t } = useTranslation();

  return (
    <div>
      <p className={styles.label}>{t('common.today')}</p>
      <div className={styles.container}>
        <div className={styles.imgWrapper}>
          <Avatar size="sm" src={LuminLogo} alt="lumin-logo" variant="outline" />
        </div>
        <div className={styles.descriptionContainer}>
          <p className={styles.title}>{t('notification.emptyNotification.generalTitle')}</p>
          <p>
            {t('notification.emptyNotification.generalDescription1')}
            <br />
            {t('notification.emptyNotification.generalDescription2')}
            <br />
            {t('notification.emptyNotification.generalDescription3')}
          </p>
        </div>
      </div>
    </div>
  );
}

export default EmptyGeneralNotification;
