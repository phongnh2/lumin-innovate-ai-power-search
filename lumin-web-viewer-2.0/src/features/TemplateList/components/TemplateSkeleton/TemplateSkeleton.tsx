import classNames from 'classnames';
import { Skeleton } from 'lumin-ui/kiwi-ui';
import React from 'react';

import useTemplatesPageMatch from 'hooks/useTemplatesPageMatch';

import styles from './TemplateSkeleton.module.scss';

const TemplateSkeleton = () => {
  const { isPersonalTemplatePage } = useTemplatesPageMatch();

  return (
    <div className={classNames(styles.skeletonContainer, { [styles.personalRoute]: isPersonalTemplatePage })}>
      <div className={styles.infoContainer}>
        <div className={styles.info}>
          <Skeleton radius="sm" width={24} height={24} />
          <Skeleton radius="sm" width={160} height={16} />
        </div>
      </div>
      {!isPersonalTemplatePage ? <Skeleton radius="sm" width={80} height={16} /> : null}
      <Skeleton radius="sm" width={80} height={16} />
      <Skeleton radius="sm" width={24} height={24} />
    </div>
  );
};

export default TemplateSkeleton;
