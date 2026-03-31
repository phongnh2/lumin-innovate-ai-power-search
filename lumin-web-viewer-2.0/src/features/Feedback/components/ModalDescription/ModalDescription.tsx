import React from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import { avoidOrphansWord } from 'utils/avoidOrphansWord';

import { LANDING_PAGE_ROUTE } from 'constants/Routers';

import styles from './ModalDescription.module.scss';

const ModalDescription = () => {
  const { t } = useTranslation();

  return (
    <div className={styles.container}>
      <p>
        <Trans
          i18nKey="viewer.switchOldLayoutModal.message"
          components={{
            br: <br />,
          }}
        />
        <Link className={styles.link} to={LANDING_PAGE_ROUTE.CONTACT_SUPPORT} target="_blank">
          {avoidOrphansWord(t('viewer.switchOldLayoutModal.contactSupport'))}
        </Link>
      </p>
    </div>
  );
};

export default ModalDescription;
