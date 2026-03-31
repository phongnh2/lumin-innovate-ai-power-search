import { FileLockIcon } from '@luminpdf/icons/dist/csr/FileLock';
import React from 'react';

import { useTranslation } from 'hooks/useTranslation';

import styles from './SuccessTitleModal.module.scss';

const SuccessTitleModal = () => {
  const { t } = useTranslation();
  return (
    <div>
      <div className={styles.titleWrapper}>
        <FileLockIcon color="var(--kiwi-colors-custom-brand-sign-sign)" size={32} />{' '}
        {t('viewer.bananaSign.successModalTitle')}
      </div>
    </div>
  );
};

export default SuccessTitleModal;
