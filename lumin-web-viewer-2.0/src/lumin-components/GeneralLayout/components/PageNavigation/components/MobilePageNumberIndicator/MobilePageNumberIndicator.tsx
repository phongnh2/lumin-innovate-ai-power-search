import React from 'react';
import { useSelector } from 'react-redux';

import selectors from 'selectors';

import styles from './MobilePageNumberIndicator.module.scss';

const MobilePageNumberIndicator = () => {
  const currentPage = useSelector(selectors.getCurrentPage);
  const totalPages = useSelector(selectors.getTotalPages);

  return (
    <div className={styles.container}>
      <p className={styles.pageNumber}>
        {currentPage}/{totalPages}
      </p>
    </div>
  );
};

export default MobilePageNumberIndicator;
