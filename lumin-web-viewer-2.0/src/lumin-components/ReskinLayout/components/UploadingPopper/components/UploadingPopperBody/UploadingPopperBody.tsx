import React from 'react';
import { useSelector } from 'react-redux';

import selectors from 'selectors';

import { UploadingPopperItem } from '../UploadingPopperItem';
import { UploadingPopperStatusBar } from '../UploadingPopperStatusBar';

import styles from './UploadingPopperBody.module.scss';

type UploadingPopperBodyProps = {
  isCollapsed: boolean;
};

const UploadingPopperBody = ({ isCollapsed }: UploadingPopperBodyProps) => {
  const queue = useSelector(selectors.getUploadBoxQueue);

  return (
    <div className={styles.container} data-collapsed={isCollapsed}>
      <UploadingPopperStatusBar />
      {queue.map((groupId) => (
        <UploadingPopperItem key={groupId} groupId={groupId} />
      ))}
    </div>
  );
};

export default React.memo(UploadingPopperBody);
