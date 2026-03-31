import classNames from 'classnames';
import { Skeleton } from 'lumin-ui/kiwi-ui';
import React from 'react';

import itemStyles from 'lumin-components/NotificationItem/NotificationItem.module.scss';

import styles from './NotificationListSkeleton.module.scss';

const SkeletonColor = 'var(--kiwi-colors-surface-surface-container-low)';

const NotificationListSkeleton = ({ isGeneral }: { isGeneral: boolean }) => (
  <div>
    <div className={styles.labelWrapper}>
      <Skeleton width={80} height={16} radius="sm" color={SkeletonColor} />
    </div>
    {Array.from(Array(3)).map((_, index) => (
      <div className={classNames(itemStyles.container, styles.container)} key={index}>
        <div className={itemStyles.avatarWrapper}>
          <Skeleton width={32} height={32} radius="xl" color={SkeletonColor} />
        </div>
        <div className={classNames(itemStyles.contentWrapper, itemStyles.contentWrapper)}>
          <div className={itemStyles.content}>
            <Skeleton width={200} height={16} radius="sm" color={SkeletonColor} />
          </div>
          <div className={itemStyles.bottomWrapper}>
            <div className={itemStyles.timeAndProduct}>
              <Skeleton width={80} height={16} radius="sm" color={SkeletonColor} />
            </div>
            <div className={itemStyles.actionsWrapper}>
              <Skeleton width={48} height={24} radius="sm" color={isGeneral ? 'transparent' : SkeletonColor} />
              <Skeleton width={48} height={24} radius="sm" color={isGeneral ? 'transparent' : SkeletonColor} />
            </div>
          </div>
        </div>
      </div>
    ))}
  </div>
);

export default NotificationListSkeleton;
