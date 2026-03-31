import { Skeleton as KiwiSkeleton, SkeletonProps } from 'lumin-ui/kiwi-ui';
import React from 'react';

import subSidebarItemStyles from '../../../SubSidebarItem/SubSidebarItem.module.scss';
import styles from '../../LeftSubSidebar.module.scss';

const Skeleton = (props: React.JSX.IntrinsicAttributes & SkeletonProps) => (
  <KiwiSkeleton color="var(--kiwi-colors-surface-surface-container-high)" {...props} />
);

const SkeletonSubSidebar = () => (
  <>
    <div className={styles.itemsContainer}>
      {Array.from(Array(3).keys()).map((_, index) => (
        <div className={subSidebarItemStyles.container} data-skeleton="true" key={index}>
          <Skeleton width={20} height={20} radius="sm" />
          <Skeleton width={160} height={16} radius="sm" />
        </div>
      ))}
    </div>
    <div className={styles.itemsContainer}>
      <div className={styles.spaceTitleContainer}>
        <Skeleton width={80} height={20} radius="md" />
        <Skeleton width={32} height={32} radius="md" />
      </div>
      {Array.from(Array(3).keys()).map((_, index) => (
        <div className={subSidebarItemStyles.container} data-skeleton="true" key={index}>
          <Skeleton width={24} height={24} circle />
          <Skeleton width={160} height={16} radius="sm" />
        </div>
      ))}
    </div>
  </>
);

export default SkeletonSubSidebar;
