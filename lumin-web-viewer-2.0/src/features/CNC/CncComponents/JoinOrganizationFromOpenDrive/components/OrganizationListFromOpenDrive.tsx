/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Button, ButtonSize, ButtonVariant, Icomoon } from 'lumin-ui/kiwi-ui';
import React, { useState } from 'react';

import Skeleton from 'luminComponents/Shared/Skeleton';

import { useTranslation } from 'hooks/useTranslation';

import { SuggestedOrganization } from 'interfaces/organization/organization.interface';

import OrganizationItemFromOpenDrive from './OrganizationItemFromOpenDrive';
import OrganizationItemFromOpenDriveSkeleton from './OrganizationItemFromOpenDriveSkeleton';

import styles from './OrganizationListFromOpenDrive.module.scss';

type Props = {
  orgList: SuggestedOrganization[];
  loading: boolean;
  onSkip: () => void;
  documentId: string;
};

const ITEMS_PER_PAGE = 5;

const OrganizationListFromOpenDrive = ({ orgList, loading, onSkip, documentId }: Props) => {
  const { t } = useTranslation();
  const [page, setPage] = useState(1);

  const handleShowMore = () => {
    setPage((prevPage) => prevPage + 1);
  };

  const handleShowLess = () => {
    setPage(1);
  };

  const renderCircleList = () => {
    if (loading) {
      return (
        <>
          {[...Array(ITEMS_PER_PAGE).fill(null)].map((_, index) => (
            <OrganizationItemFromOpenDriveSkeleton key={index} />
          ))}

          <div className={styles.buttonWrapper}>
            <Skeleton variant="rectangular" width={182} height={40} />
          </div>
        </>
      );
    }

    const displayedOrganizations = orgList.slice(0, page * ITEMS_PER_PAGE);

    return displayedOrganizations.map((org, index) => (
      <OrganizationItemFromOpenDrive
        key={org._id}
        organization={org}
        onSkip={onSkip}
        documentId={documentId}
        index={index}
      />
    ));
  };

  return (
    <div className={styles.circleListContainer}>
      {renderCircleList()}
      {orgList.length > ITEMS_PER_PAGE && !loading && (
        <div className={styles.buttonWrapper}>
          {page * ITEMS_PER_PAGE < orgList.length ? (
            <Button
              onClick={handleShowMore}
              variant={ButtonVariant.text}
              size={ButtonSize.lg}
              endIcon={<Icomoon type="chevron-down-lg" size="lg" />}
            >
              {t('action.showMore')}
            </Button>
          ) : (
            <Button
              onClick={handleShowLess}
              variant={ButtonVariant.text}
              size={ButtonSize.lg}
              endIcon={<Icomoon type="chevron-up-lg" size="lg" />}
            >
              {t('viewer.noteContent.showLess')}
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default OrganizationListFromOpenDrive;
