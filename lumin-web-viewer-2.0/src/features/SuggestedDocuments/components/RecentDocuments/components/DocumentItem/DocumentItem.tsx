import classNames from 'classnames';
import produce from 'immer';
import { Text, Chip, ButtonSize, Button, PlainTooltip } from 'lumin-ui/kiwi-ui';
import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router';

import { DocumentItemStar } from 'luminComponents/ReskinLayout/components/DocumentItemStar';
import { DocumentThumbnail } from 'luminComponents/ReskinLayout/components/DocumentListItem/components';
import QuickActions from 'luminComponents/ReskinLayout/components/DocumentListItem/QuickActions';

import { useGetCurrentOrganization, useTranslation } from 'hooks';

import { dateUtil, getFileService } from 'utils';

import {
  DocumentItem as BaseDocumentItem,
  DocumentMoreActionsButton,
  DocumentItemProps as BaseDocumentItemProps,
} from 'features/DocumentList/components';

import { LocationType } from 'constants/locationConstant';
import { ORG_TEXT } from 'constants/organizationConstants';
import { TEAM_TEXT } from 'constants/teamConstant';

import { IDocumentBase } from 'interfaces/document/document.interface';

import styles from './DocumentItem.module.scss';

interface DocumentItemProps extends Omit<BaseDocumentItemProps, 'children'> {
  document: IDocumentBase;
}

type LocationDataType = {
  label: string;
  path: string;
};

const DocumentItem = (props: DocumentItemProps) => {
  const { document, refetchDocument, openDocumentModal, containerScrollRef, updateDocumentInfo } = props;

  const navigate = useNavigate();

  const [openedMoreActions, setOpenedMoreActions] = useState(false);

  const documentInterceptor = useMemo(
    () =>
      produce(document, (draftState) => {
        const lastAccess: Date | number = !Number.isNaN(Number(draftState.lastAccess))
          ? Number(draftState.lastAccess)
          : new Date(draftState.lastAccess);
        draftState.lastAccess = dateUtil.formatMDYTime(lastAccess);
      }),
    [document]
  );

  const {
    _id: documentId,
    name,
    lastAccess,
    thumbnail,
    isOverTimeLimit,
    newUpload,
    belongsTo,
    folderId,
    isShared,
    folderData,
  } = documentInterceptor;
  const documentName = name.substring(0, name.lastIndexOf('.')) || name;

  const { t } = useTranslation();

  const currentOrganization = useGetCurrentOrganization();

  const locationData: LocationDataType | null = useMemo(() => {
    const { type, location } = belongsTo;
    let prefixPath = '/';
    if (currentOrganization) {
      const { url } = currentOrganization;
      prefixPath = `/${ORG_TEXT}/${url}/`;
    }
    if (isShared) {
      return {
        label: t('sidebar.sharedWithMe'),
        path: `${prefixPath}documents/shared`,
      };
    }
    switch (type) {
      case LocationType.PERSONAL: {
        const label = folderId ? folderData.name : t('sidebar.myDocuments');
        const path = folderId
          ? `${prefixPath}documents/personal/folder/${folderId}`
          : `${prefixPath}documents/personal`;
        return {
          label,
          path,
        };
      }
      case LocationType.ORGANIZATION: {
        const label = folderId ? folderData.name : `All ${location.name}`;
        const path = folderId
          ? `${prefixPath}documents/${ORG_TEXT}/folder/${folderId}`
          : `${prefixPath}documents/${ORG_TEXT}`;
        return {
          label,
          path,
        };
      }
      case LocationType.ORGANIZATION_TEAM: {
        const label = folderId ? folderData.name : location.name;
        const path = folderId
          ? `${prefixPath}documents/${TEAM_TEXT}/${location._id}/folder/${folderId}`
          : `${prefixPath}documents/${TEAM_TEXT}/${location._id}`;
        return {
          label,
          path,
        };
      }
      default:
        return null;
    }
  }, [belongsTo, currentOrganization, folderData, folderId, isShared, t]);

  return (
    <BaseDocumentItem
      document={document}
      classNames={{ container: styles.container }}
      refetchDocument={refetchDocument}
      openDocumentModal={openDocumentModal}
      isActivatedMoreActions={openedMoreActions}
      updateDocumentInfo={updateDocumentInfo}
    >
      {({ renderHiddenElement, renderMoreActionsElement, actions, isStarred }) => (
        <>
          <div className={styles.infoContainer}>
            <div className={styles.info}>
              <DocumentThumbnail
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                src={getFileService.getThumbnailUrl(thumbnail)}
                altText={documentName}
                isNewUpload={newUpload}
              />
              <PlainTooltip content={documentName}>
                <Text type="title" size="sm" ellipsis>
                  {documentName}
                </Text>
              </PlainTooltip>
            </div>
            <div className={classNames(styles.status, { [styles.overTimeLimit]: isOverTimeLimit })}>
              {isOverTimeLimit && <Chip label={t('documentPage.expired')} variant="light" size="sm" colorType="grey" />}
              <div className={styles.starWrapper}>
                <DocumentItemStar document={document} isStarred={isStarred} disabled={false} size={ButtonSize.sm} />
              </div>
            </div>
          </div>
          <div className={styles.locationInfoWrapper}>
            {locationData ? (
              <PlainTooltip content={locationData.label}>
                <Button
                  data-cy="document_location_button"
                  variant="text"
                  classNames={{ root: styles.locationInfo }}
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(locationData.path, { state: { documentId, documentName: name } });
                  }}
                >
                  <span className={styles.label}>{locationData.label}</span>
                </Button>
              </PlainTooltip>
            ) : (
              '-'
            )}
          </div>
          {renderHiddenElement(
            <Text type="body" size="md" ellipsis className={styles.lastUpdatedCol}>
              {lastAccess}
            </Text>,
            <QuickActions
              document={document}
              actions={{
                copyLink: () => actions.copyLink(),
                share: () => actions.share(),
                makeACopy: () => actions.makeACopy(),
              }}
            />
          )}
          {renderMoreActionsElement(
            <DocumentMoreActionsButton
              actions={actions}
              document={document}
              containerScrollRef={containerScrollRef}
              onToggle={setOpenedMoreActions}
            />
          )}
        </>
      )}
    </BaseDocumentItem>
  );
};

export default React.memo(DocumentItem);
