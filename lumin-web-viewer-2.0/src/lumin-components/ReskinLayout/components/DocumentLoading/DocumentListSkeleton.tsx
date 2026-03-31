import classNames from 'classnames';
import { Skeleton } from 'lumin-ui/kiwi-ui';
import React from 'react';

import { useTabletMatch, usePersonalDocPathMatch } from 'hooks';

import styles from './DocumentLoading.module.scss';

const DocumentListSkeleton = () => {
  const isTabletUpMatch = useTabletMatch();
  const isPersonalDocumentsRoute = usePersonalDocPathMatch();

  return (
    <div className={classNames(styles.container, { [styles.containerWithoutOwner]: isPersonalDocumentsRoute })}>
      <div className={styles.commonInfoWrapper}>
        <Skeleton mr="var(--kiwi-spacing-1-5)" radius="sm" width={24} height={24} />
        <Skeleton radius="sm" width={160} height={16} />
        <Skeleton m="auto" mr="var(--kiwi-spacing-2-5)" radius="sm" width={16} height={16} />
      </div>
      {isPersonalDocumentsRoute ? null : <Skeleton radius="sm" width={isTabletUpMatch ? 130 : 88} height={16} />}
      <Skeleton mx="var(--kiwi-spacing-2)" radius="sm" width={24} height={24} />
      <Skeleton ml="calc(var(--kiwi-spacing-1) * -1)" radius="sm" width={isTabletUpMatch ? 130 : 88} height={16} />
    </div>
  );
};

export default DocumentListSkeleton;
