import classNames from 'classnames';
import produce from 'immer';
import { Text, Chip, ButtonSize, PlainTooltip } from 'lumin-ui/kiwi-ui';
import React, { useMemo, useState } from 'react';

import { DocumentItemStar } from 'luminComponents/ReskinLayout/components/DocumentItemStar';
import { DocumentThumbnail } from 'luminComponents/ReskinLayout/components/DocumentListItem/components';
import QuickActions from 'luminComponents/ReskinLayout/components/DocumentListItem/QuickActions';
import SvgElement from 'luminComponents/SvgElement';

import { useTranslation } from 'hooks';

import { dateUtil, getFileService } from 'utils';

import {
  DocumentItem as BaseDocumentItem,
  DocumentMoreActionsButton,
  DocumentItemProps as BaseDocumentItemProps,
} from 'features/DocumentList/components';

import { StorageLogoMapping } from 'constants/lumin-common';

import { IDocumentBase } from 'interfaces/document/document.interface';

import styles from './DocumentItem.module.scss';

interface DocumentItemProps extends Omit<BaseDocumentItemProps, 'children'> {
  document: IDocumentBase & { storageLogo?: string };
}

const DocumentItem = (props: DocumentItemProps) => {
  const { document, refetchDocument, openDocumentModal, containerScrollRef, updateDocumentInfo } = props;
  const [openedMoreActions, setOpenedMoreActions] = useState(false);

  const documentInterceptor = useMemo(
    () =>
      produce(document, (draftState) => {
        draftState.lastAccess = dateUtil.formatMDYTime(Number(draftState.lastAccess));
        draftState.storageLogo = StorageLogoMapping[document.service];
      }),
    [document]
  );

  const { name, lastAccess, thumbnail, isOverTimeLimit, newUpload, ownerName, storageLogo } = documentInterceptor;
  const documentName = name.substring(0, name.lastIndexOf('.')) || name;

  const { t } = useTranslation();

  const onClickAction = (event: React.MouseEvent<HTMLButtonElement>, actionFunction: () => void) => {
    event.stopPropagation();
    actionFunction();
  };

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
          <div className={styles.ownerColWrapper}>
            <PlainTooltip content={ownerName}>
              <Text type="body" size="md" ellipsis className={styles.ownerCol}>
                {ownerName}
              </Text>
            </PlainTooltip>
          </div>
          <div className={styles.storageCol}>
            <SvgElement content={storageLogo} height={24} maxWidth={24} isReskin />
          </div>
          {renderHiddenElement(
            <Text type="body" size="md" ellipsis className={styles.lastUpdatedCol}>
              {lastAccess}
            </Text>,
            <QuickActions
              document={document}
              actions={{
                copyLink: (e) => onClickAction(e, actions.copyLink),
                share: (e) => onClickAction(e, actions.share),
                makeACopy: (e) => onClickAction(e, actions.makeACopy),
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

export default DocumentItem;
