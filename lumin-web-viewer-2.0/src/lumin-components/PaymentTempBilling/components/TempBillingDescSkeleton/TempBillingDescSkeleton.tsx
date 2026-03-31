import { Skeleton as KiwiSkeleton } from 'lumin-ui/kiwi-ui';
import React from 'react';

import Skeleton from 'lumin-components/Shared/Skeleton';

import { useEnableWebReskin } from 'hooks';

import styles from './TempBillingDescSkeleton.module.scss';

const TempBillingDescSkeleton = (): JSX.Element => {
  const { isEnableReskin } = useEnableWebReskin();

  if (isEnableReskin) {
    const skeletonColor = 'var(--kiwi-colors-surface-surface-container-low)';
    return (
      <div className={styles.container}>
        <KiwiSkeleton width={100} height={12} radius="sm" color={skeletonColor} />
        <KiwiSkeleton width={260} height={20} radius="sm" color={skeletonColor} />
        <KiwiSkeleton width="100%" height={12} radius="sm" color={skeletonColor} />
      </div>
    );
  }

  return (
    <div>
      <Skeleton width="50%" />
      <Skeleton height={32} gap={{ top: 8, bottom: 16 }} />
      <Skeleton />
      <Skeleton width="30%" />
    </div>
  );
};

TempBillingDescSkeleton.propTypes = {};

export default TempBillingDescSkeleton;
