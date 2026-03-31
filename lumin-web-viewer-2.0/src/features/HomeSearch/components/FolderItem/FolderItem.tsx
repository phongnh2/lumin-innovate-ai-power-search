import { Text, ButtonSize, PlainTooltip } from 'lumin-ui/kiwi-ui';
import React, { useContext, useState } from 'react';
import Highlighter from 'react-highlight-words';

import { DocumentThumbnail } from 'luminComponents/ReskinLayout/components/DocumentListItem/components';
import { FolderItemStar } from 'luminComponents/ReskinLayout/components/FolderItemStar';
import SvgElement from 'luminComponents/SvgElement';

import { useGetFolderType, useIsInOrgPage, useNetworkStatus } from 'hooks';

import {
  FolderItem as BaseFolderItem,
  FolderItemProps as BaseFolderItemProps,
  FolderMoreActionsButton,
} from 'features/DocumentList/components';
import { SearchResultContext } from 'features/HomeSearch/contexts';

import { folderType } from 'constants/documentConstants';
import { DocFolderMapping, FolderType } from 'constants/folderConstant';
import { StorageLogo } from 'constants/lumin-common';

import { IFolder } from 'interfaces/folder/folder.interface';

import styles from './FolderItem.module.scss';

interface FolderItemProps extends Omit<BaseFolderItemProps, 'children'> {
  folder: IFolder;
}

const DocumentItem = (props: FolderItemProps) => {
  const currentFolderType = useGetFolderType();
  const isInOrgPage = useIsInOrgPage();
  const { isOffline } = useNetworkStatus();

  const { folder, openFolderModal, containerScrollRef } = props;

  const { state } = useContext(SearchResultContext);

  const [openedMoreActions, setOpenedMoreActions] = useState(false);

  const { name, ownerName } = folder;

  const defaultFolderType = isInOrgPage ? FolderType.ORGANIZATION : FolderType.PERSONAL;
  const documentFolderType =
    currentFolderType === folderType.STARRED ? defaultFolderType : DocFolderMapping[currentFolderType];

  return (
    <BaseFolderItem
      folder={folder}
      classNames={{ container: styles.container }}
      openFolderModal={openFolderModal}
      isActivatedMoreActions={openedMoreActions}
    >
      {({ renderHiddenElement, renderMoreActionsElement, actions, isStarred }) => (
        <>
          <div className={styles.infoContainer}>
            <div className={styles.info}>
              <DocumentThumbnail isFolder altText={name} />
              <PlainTooltip content={name}>
                <Text type="title" size="sm" ellipsis>
                  <Highlighter searchWords={[state.searchKey]} autoEscape textToHighlight={name} />
                </Text>
              </PlainTooltip>
            </div>
            <div role="button" tabIndex={0} className={styles.status} onClick={(e) => e.stopPropagation()}>
              <FolderItemStar
                folderType={documentFolderType}
                folder={folder}
                isStarred={isStarred}
                size={ButtonSize.sm}
                disabled={isOffline}
                isOutsideDocumentList
              />
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
            <SvgElement content={StorageLogo.LUMIN} height={24} maxWidth={24} isReskin />
          </div>
          {renderHiddenElement(
            <Text type="body" size="md" ellipsis className={styles.lastUpdatedCol}>
              -
            </Text>,
            <div className={styles.mockupQuickActions} />
          )}
          {renderMoreActionsElement(
            <FolderMoreActionsButton
              actions={actions}
              folder={folder}
              containerScrollRef={containerScrollRef}
              onToggle={setOpenedMoreActions}
            />
          )}
        </>
      )}
    </BaseFolderItem>
  );
};

export default DocumentItem;
