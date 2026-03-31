import { Skeleton } from 'lumin-ui/kiwi-ui';
import React from 'react';

import styles from './SignSubSidebarSkeleton.module.scss';

const itemsWidth = [208, 208, 140, 80];

const SignSubSidebarSkeleton = () => (
  <div className={styles.wrapper}>
    {itemsWidth.map((width, index) => (
      <Skeleton
        key={index}
        radius="sm"
        color="var(--kiwi-colors-surface-surface-container-high)"
        width={width}
        height={24}
      />
    ))}
  </div>
);

export default SignSubSidebarSkeleton;
