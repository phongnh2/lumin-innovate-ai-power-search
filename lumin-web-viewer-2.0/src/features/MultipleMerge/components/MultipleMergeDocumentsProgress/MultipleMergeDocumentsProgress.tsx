import { CircularProgress } from 'lumin-ui/kiwi-ui';
import React from 'react';

import { useTranslation } from 'hooks';

import { useMultipleMergeContext } from '../../hooks/useMultipleMergeContext';

import styles from './MultipleMergeDocumentsProgress.module.scss';

const MultipleMergeDocumentsProgress = () => {
  const { t } = useTranslation();
  const { mergingProgress, documents } = useMultipleMergeContext();

  return (
    <div className={styles.container}>
      <div className={styles.progressContainer}>
        <CircularProgress size="xs" className={styles.progressCircle} />
        <div className={styles.progressDescriptionContainer}>
          <p className={styles.progressDescription}>
            {mergingProgress}/{documents.length}
          </p>
        </div>
      </div>
      <p className={styles.description}>{t('multipleMerge.mergingFiles')}</p>
    </div>
  );
};

export default MultipleMergeDocumentsProgress;
