import { Skeleton } from 'lumin-ui/dist/kiwi-ui';
import React from 'react';

import styles from './SkeletonAppPanel.module.scss';

const SkeletonAppPanel = () => (
  <div className={styles.wrapper}>
    <div className={styles.header}>
      <Skeleton height={24} width={144} radius="sm" />
      <Skeleton height={24} width={24} radius="sm" />
    </div>
    <div className={styles.body}>
      <Skeleton height={24} width={100} radius="sm" />
      <Skeleton height={48} width="100%" radius="sm" />
      <Skeleton height={24} width={80} radius="sm" />
      <Skeleton height={24} width={80} radius="sm" />
      <Skeleton height={24} width={80} radius="sm" />
      <Skeleton height={48} width="100%" radius="sm" />
    </div>
  </div>
);

export default SkeletonAppPanel;
