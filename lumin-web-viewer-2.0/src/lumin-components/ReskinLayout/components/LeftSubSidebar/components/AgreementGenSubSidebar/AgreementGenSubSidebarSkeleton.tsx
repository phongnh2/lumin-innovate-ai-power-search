import { Skeleton } from 'lumin-ui/kiwi-ui';
import React from 'react';

import styles from './AgreementGenSubSidebar.module.scss';

const itemsWidth = [228, 228];

const AgreementGenSubSidebarSkeleton = () => (
  <div className={styles.skeletonsWrapper}>
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

export default AgreementGenSubSidebarSkeleton;
