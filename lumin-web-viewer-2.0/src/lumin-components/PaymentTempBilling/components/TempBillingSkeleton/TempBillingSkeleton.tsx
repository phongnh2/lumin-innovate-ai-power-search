import { Skeleton as KiwiSkeleton } from 'lumin-ui/kiwi-ui';
import React from 'react';

import Skeleton from 'lumin-components/Shared/Skeleton';

import { useEnableWebReskin } from 'hooks';

import styles from './TempBillingSkeleton.module.scss';

const TempBillingSkeleton = (): JSX.Element => {
  const { isEnableReskin } = useEnableWebReskin();

  if (isEnableReskin) {
    const skeletonColor = 'var(--kiwi-colors-surface-surface-container-low)';
    return (
      <div className={styles.container}>
        <KiwiSkeleton width={100} height={12} radius="sm" color={skeletonColor} />
        <KiwiSkeleton width={202} height={20} radius="sm" color={skeletonColor} />
        <KiwiSkeleton width={134} height={12} radius="sm" color={skeletonColor} />
      </div>
    );
  }

  return (
    <div>
      <Skeleton width="30%" />
      <Skeleton width="60%" gap={{ top: 16, bottom: 16 }} />
      <Skeleton width="40%" />
    </div>
  );
};

TempBillingSkeleton.propTypes = {};

export default TempBillingSkeleton;
