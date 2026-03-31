import { Skeleton } from 'lumin-ui/kiwi-ui';
import React from 'react';

import SvgElement from 'luminComponents/SvgElement';

import { useThemeMode } from 'hooks/useThemeMode';

import styles from './SkeletonLoading.module.scss';

const SkeletonLoading = () => {
  const theme = useThemeMode();

  return (
    <div className={styles.editorPage}>
      <div className={styles.docsTitlebarContainer}>
      <div className={styles.tiltlebarLeftSide}>
        <SvgElement content="new-ui-lumin-logo" width={48} height={48} />
      </div>

      <div className={styles.titlebarRightSide}>
        <div className={styles.titlebarRightSideItem}>
          <Skeleton width={36} height={36} circle />
          <Skeleton width={36} height={36} circle />
        </div>
        <div>
          <Skeleton width={36} height={36} circle />
        </div>
      </div>
    </div>
    <div className={styles.body}>
      <div className={styles.leftSideBar} />
      <div className={styles.container} >
        <div className={styles.toolbar} />
        <div className={styles.viewport} >
            <SvgElement content={theme === 'dark' ? 'logo-loading-dark' : 'logo-loading'} width={160} height={160} classNameSvg="animation-skeleton-loading"/>
        </div>
      </div>
      <div className={styles.rightSidebar} />
    </div>
  </div>
);};

export default SkeletonLoading;
