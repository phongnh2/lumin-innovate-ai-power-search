import React from 'react';

import styles from './PresenterModePageIndication.module.scss';

type Props = {
  currentPage: number;
  totalPages: number;
};

const PresenterModePageIndication = ({ currentPage, totalPages }: Props) => (
  <div className={styles.container}>
    <div className={styles.currentPageWrapper}>
      <div className={styles.hiddenTotalPages}>{totalPages}</div>
      <div className={styles.currentPage}>{currentPage}</div>
    </div>
    /{totalPages}
  </div>
);

export default PresenterModePageIndication;
