import React from 'react';

import FindSomethingImage from 'assets/reskin/images/find-something.png';

import { useTranslation } from 'hooks';

import styles from './NoOrganizationAvailable.module.scss';

const NoOrganizationAvailable = () => {
  const { t } = useTranslation();

  return (
    <div className={styles.container}>
      <img src={FindSomethingImage} alt="Find Something" />
      <p>{t('settingBilling.noWorkspaceAvailable')}</p>
    </div>
  );
};

export default NoOrganizationAvailable;
