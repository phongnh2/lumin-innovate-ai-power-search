import { Skeleton } from 'lumin-ui/kiwi-ui';
import React from 'react';

import { ORGANIZATION_MEMBER_TYPE } from 'constants/organizationConstants';

import styles from './OrganizationListLoading.module.scss';

type OrganizationListLoadingProps = {
  listType: string;
};

const LIST_SKELETON = Array.from({ length: 4 }, () => 1);

const OrganizationListLoading = ({ listType }: OrganizationListLoadingProps) => {
  const renderExtraColumns = () => {
    if ([ORGANIZATION_MEMBER_TYPE.PEOPLE_MEMBER, ORGANIZATION_MEMBER_TYPE.PEOPLE_GUEST].includes(listType)) {
      return (
        <>
          <Skeleton width={80} height={16} radius="sm" />
          <Skeleton width={80} height={16} radius="sm" />
        </>
      );
    }
    if ([ORGANIZATION_MEMBER_TYPE.PEOPLE_REQUEST_ACCESS, ORGANIZATION_MEMBER_TYPE.MEMBER].includes(listType)) {
      return (
        <>
          <Skeleton width={80} height={16} radius="sm" />
          {listType === ORGANIZATION_MEMBER_TYPE.MEMBER && <span />}
        </>
      );
    }
    return null;
  };

  return LIST_SKELETON.map((key) => (
    <div
      key={`org_member_loading_${key as number}`}
      className={styles.container}
      data-list-type={listType.toLowerCase()}
    >
      <div className={styles.memberInfo}>
        <Skeleton width={24} height={24} radius="sm" />
        <Skeleton width={160} height={16} radius="sm" />
      </div>
      <Skeleton width={80} height={16} radius="sm" />
      {renderExtraColumns()}
      {[ORGANIZATION_MEMBER_TYPE.PEOPLE_PENDING_MEMBER, ORGANIZATION_MEMBER_TYPE.PEOPLE_REQUEST_ACCESS].includes(
        listType
      ) ? (
        <div className={styles.buttons}>
          <Skeleton width={48} height={16} radius="sm" />
          <Skeleton width={48} height={16} radius="sm" />
        </div>
      ) : (
        <Skeleton width={16} height={16} radius="sm" />
      )}
    </div>
  ));
};

export default OrganizationListLoading;
