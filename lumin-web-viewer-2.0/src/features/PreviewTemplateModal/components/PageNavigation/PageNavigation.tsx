import { IconButton, Text } from 'lumin-ui/kiwi-ui';
import React from 'react';

import core from 'core';

import styles from './PageNavigation.module.scss';

const PageNavigation = ({ currentPage, totalPages }: { currentPage: number; totalPages: number }) => (
  <div className={styles.pageWrapper}>
    <IconButton
      disabled={currentPage === 1}
      size="md"
      icon="ph-caret-left"
      onClick={() => core.setCurrentPage(currentPage - 1)}
    />
    <Text size="sm" type="body">
      {currentPage}/{totalPages}
    </Text>
    <IconButton
      disabled={currentPage === totalPages}
      size="md"
      icon="ph-caret-right"
      onClick={() => core.setCurrentPage(currentPage + 1)}
    />
  </div>
);

export default PageNavigation;
