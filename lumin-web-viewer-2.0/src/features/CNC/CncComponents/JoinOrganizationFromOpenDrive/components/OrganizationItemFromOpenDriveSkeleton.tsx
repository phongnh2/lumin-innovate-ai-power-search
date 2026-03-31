import React from 'react';

import Skeleton from 'luminComponents/Shared/Skeleton';

import styles from './OrganizationItemFromOpenDrive.module.scss';

function OrganizationItemFromOpenDriveSkeleton(): JSX.Element {
  return (
    <div className={styles.circleContainer}>
      <div className={styles.avatarContainer}>
        <Skeleton variant="circular" width={48} height={48} />
        <div className={styles.info}>
          <Skeleton variant="rectangular" width={125} height={16} />
          <Skeleton variant="rectangular" width={88} height={24} />
        </div>
      </div>
      <Skeleton variant="rectangular" width={53} height={32} />
    </div>
  );
}

export default OrganizationItemFromOpenDriveSkeleton;
