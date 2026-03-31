import classNames from 'classnames';
import { Skeleton } from 'lumin-ui/kiwi-ui';
import React from 'react';

import { useChatbotStore } from 'features/WebChatBot/hooks/useChatbotStore';

import styles from './DocumentSkeleton.module.scss';

const DocumentSkeleton = () => {
  const { isVisible } = useChatbotStore();
  return (
    <div className={classNames(styles.suggestedDocSkeletonContainer, { [styles.chatbotOpened]: isVisible })}>
      <div className={styles.infoContainer}>
        <div className={styles.info}>
          <Skeleton radius="sm" width={24} height={24} />
          <Skeleton radius="sm" width={160} height={16} />
        </div>
        <div className={styles.status}>
          <Skeleton radius="sm" width={16} height={16} />
        </div>
      </div>
      <Skeleton className={classNames(styles.column, styles.location)} radius="sm" width={132} height={16} />
      <Skeleton className={classNames(styles.column, styles.lastUpdated)} radius="sm" width={132} height={16} />
      {isVisible && <Skeleton className={styles.moreActions} radius="sm" width={24} height={24} />}
    </div>
  );
};

export default DocumentSkeleton;
