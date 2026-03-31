import React from 'react';

import Skeleton from 'lumin-components/Shared/Skeleton';

import styles from './DocumentViewerSkeleton.module.scss';

const DocumentViewerSkeleton = () => (
  <div className={styles.container}>
    <Skeleton className={styles.skeleton} variant="rectangular" height="100%" width="100%" />
  </div>
);

export default DocumentViewerSkeleton;
