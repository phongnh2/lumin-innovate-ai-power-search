import { Skeleton } from 'lumin-ui/kiwi-ui';
import React from 'react';

import styles from './MemberGroupAvatar.module.scss';

const MemberGroupAvatarSkeleton = () => (
  <div className={styles.skeletonContainer}>
    <Skeleton circle mr="var(--kiwi-spacing-0-25)" radius="lg" width={24} height={24} />
    <Skeleton circle mr="var(--kiwi-spacing-1-5)" radius="lg" width={24} height={24} />
    <Skeleton mr="var(--kiwi-spacing-1-5)" radius="sm" width={80} height={14} />
  </div>
);

export default MemberGroupAvatarSkeleton;
