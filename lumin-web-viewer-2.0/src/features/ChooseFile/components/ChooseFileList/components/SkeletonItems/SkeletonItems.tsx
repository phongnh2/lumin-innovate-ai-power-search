import { Skeleton } from 'lumin-ui/kiwi-ui';
import React from 'react';

import styles from './SkeletonItems.module.scss';

type SkeletonItemsProps = {
  itemLength?: number;
};

const SkeletonItems = ({ itemLength = 1 }: SkeletonItemsProps) => {
  const items = Array.from({ length: itemLength }, () => 1);

  return items.map((_, index) => (
    <div key={`SkeletonItem_${index}`} className={styles.item}>
      <div className={styles.leftSection}>
        <Skeleton radius="sm" width={24} height={24} />
        <Skeleton radius="sm" width={160} height={16} />
      </div>
      <Skeleton radius="sm" width={16} height={16} />
    </div>
  ));
};

export default SkeletonItems;
