import { Skeleton } from 'lumin-ui/kiwi-ui';
import React from 'react';

import styles from './DocumentSkeleton.module.scss';

const DocumentSkeleton = () => (
  <div className={styles.container}>
    <div className={styles.infoContainer}>
      <div className={styles.info}>
        <Skeleton radius="sm" width={24} height={24} />
        <Skeleton radius="sm" width={160} height={16} />
      </div>
      <div className={styles.status}>
        <Skeleton radius="sm" width={16} height={16} />
      </div>
    </div>
    <Skeleton radius="sm" width={132} height={16} />
    <Skeleton radius="sm" width={24} height={24} className={styles.storageCol} />
    <Skeleton radius="sm" width={132} height={16} />
  </div>
);

export default DocumentSkeleton;
