import { Divider, Skeleton } from 'lumin-ui/kiwi-ui';
import React from 'react';

import styles from './MainSidebar.module.scss';

const MainNavigationSkeleton = () => (
  <div className={styles.container}>
    <Skeleton width={40} height={40} radius="md" />
    <div className={styles.dividerWrapper}>
      <Divider />
    </div>
    {Array.from(Array(3).keys()).map((_, index) => (
      <div key={index} className={styles.navigationItem}>
        <Skeleton width={40} height={40} radius="md" />
        <Skeleton width={30} height={12} radius="xs" />
      </div>
    ))}
  </div>
);

export default MainNavigationSkeleton;
