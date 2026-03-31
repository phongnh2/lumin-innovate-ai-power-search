/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import React, { useCallback, useContext, useMemo, useState } from 'react';
import { useDrop } from 'react-dnd';
import { compose } from 'redux';

import { DocumentContext } from 'luminComponents/Document/context';
import { DocumentListContext } from 'luminComponents/DocumentList/Context';
import ModalFolder from 'luminComponents/ModalFolder';
import UploadDropZone from 'luminComponents/UploadDropZone';

import withDragMoveDoc from 'HOC/withDragMoveDoc';

import { useGetCurrentOrganization, useTranslation, useGetFolderType, useIsInOrgPage } from 'hooks';
import { useGetCurrentUser } from 'hooks/useGetCurrentUser';

import { organizationServices } from 'services';

import { toastUtils } from 'utils';
import { lazyWithRetry } from 'utils/lazyWithRetry';

import { ItemTypes, folderType, layoutType } from 'constants/documentConstants';
import { FolderType, DocFolderMapping } from 'constants/folderConstant';
import { INFO_MODAL_TYPE } from 'constants/lumin-common';

import { IFolder } from 'interfaces/folder/folder.interface';

import useClickFolder from './hooks/useClickFolder';
import useMoveDocuments from './hooks/useMoveDocuments';
import { FolderGridItem } from '../FolderGridItem';
import { FolderListItem } from '../FolderListItem';

const InfoModal = lazyWithRetry(() => import('lumin-components/InfoModal'));

type FolderItemContainerProps = {
  type: string;
  folder: IFolder;
  onDragMovingFile: (_name: string, _countMoveFile: number, _toggle: boolean) => void;
  toggleEditFolderModal: () => void;
  toggleFolderInfoModal: () => void;
};

const FolderItemContainer = React.memo((props: FolderItemContainerProps) => {
  const { t } = useTranslation();
  const currentUser = useGetCurrentUser();
  const { _id: currentUserId } = currentUser;
  const { type, folder, onDragMovingFile, toggleEditFolderModal, toggleFolderInfoModal } = props;

  const {
    handleSelectedItems,
    shiftHoldingRef,
    lastSelectedDocIdRef,
    selectedFolders,
    selectedDocList,
    setRemoveDocList,
  } = useContext(DocumentContext);
  const { onHandleDocumentOvertimeLimit, onMoveDocumentsDecorator } = useContext(DocumentListContext);

  const isSelected = useMemo(
    () => selectedFolders.some((item: IFolder) => item._id === folder._id),
    [selectedFolders, folder._id]
  );

  const { userRole } = useGetCurrentOrganization() || {};
  const isOrgManager = organizationServices.isManager(userRole);

  const { getId, getMoveDocumentIds, moveDocumentsToFolder } = useMoveDocuments();

  const onCollect = useCallback(
    (monitor: { isOver: (arg0: { shallow: boolean }) => boolean }) => ({ isOver: monitor.isOver({ shallow: true }) }),
    []
  );
  const onDrop = useCallback(
    (_item: { itemRender: any }, monitor: { getDropResult: () => void }) => {
      const moveDocumentList = selectedDocList.length ? selectedDocList : [_item.itemRender];
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      const documentLimited = moveDocumentList.find((doc) => doc.isOverTimeLimit);
      if (documentLimited) {
        onHandleDocumentOvertimeLimit(documentLimited);
        return;
      }
      if (isOrgManager) {
        onMoveDocumentsDecorator(moveDocumentList, () =>
          moveDocumentsToFolder({
            onDragMovingFile,
            documentIds: moveDocumentList.map(getId),
            name: folder.name,
            folder,
            setRemoveDocList,
          })
        );
      } else {
        const { hasNotOwnedDocument, moveDocumentIds } = getMoveDocumentIds(moveDocumentList, currentUserId) as {
          hasNotOwnedDocument: boolean;
          moveDocumentIds: string[];
        };
        if (hasNotOwnedDocument) {
          toastUtils.error({
            message: t('errorMessage.moveDocumentWithoutPermission'),
          });
        }
        if (moveDocumentIds.length && !hasNotOwnedDocument) {
          onMoveDocumentsDecorator(moveDocumentList, () =>
            moveDocumentsToFolder({
              onDragMovingFile,
              documentIds: moveDocumentIds,
              name: folder.name,
              folder,
              setRemoveDocList,
            })
          );
        }
      }
      return { endDrag: monitor.getDropResult() };
    },
    [folder._id, folder.name, selectedDocList]
  );

  const [collectedProps, drop] = useDrop({
    accept: ItemTypes.DOCUMENT,
    collect: onCollect,
    drop: onDrop,
  });

  const isListLayout = type === layoutType.list;
  const { onCheckboxChange } = useClickFolder({ folder, handleSelectedItems, shiftHoldingRef, lastSelectedDocIdRef });

  return isListLayout ? (
    <FolderListItem
      key={folder._id}
      folder={folder}
      onCheckboxChange={onCheckboxChange}
      isSelected={isSelected}
      drop={drop}
      isOver={collectedProps.isOver}
      toggleEditFolderModal={toggleEditFolderModal}
      toggleFolderInfoModal={toggleFolderInfoModal}
    />
  ) : (
    <FolderGridItem
      key={folder._id}
      folder={folder}
      onCheckboxChange={onCheckboxChange}
      isSelected={isSelected}
      drop={drop}
      isOver={collectedProps.isOver}
      toggleEditFolderModal={toggleEditFolderModal}
      toggleFolderInfoModal={toggleFolderInfoModal}
    />
  );
});

const FolderItemWrapper = (props: FolderItemContainerProps) => {
  const [openFolderInfoModal, setOpenFolderInfoModal] = useState(false);
  const [openEditFolderModal, setOpenEditFolderModal] = useState(false);

  const currentFolderType = useGetFolderType();
  const isInOrgPage = useIsInOrgPage();

  const defaultFolderType = isInOrgPage ? FolderType.ORGANIZATION : FolderType.PERSONAL;
  const documentFolderType =
    currentFolderType === folderType.STARRED ? defaultFolderType : DocFolderMapping[currentFolderType];

  const toggleEditFolderModal = useCallback(() => setOpenEditFolderModal((prevState) => !prevState), []);

  const toggleFolderInfoModal = useCallback(() => setOpenFolderInfoModal((prevState) => !prevState), []);

  return (
    <>
      <UploadDropZone {...props}>
        <FolderItemContainer
          {...props}
          toggleEditFolderModal={toggleEditFolderModal}
          toggleFolderInfoModal={toggleFolderInfoModal}
        />
      </UploadDropZone>
      {openEditFolderModal && (
        <ModalFolder.Edit folder={props.folder} type={documentFolderType} onClose={toggleEditFolderModal} />
      )}
      {openFolderInfoModal && (
        <InfoModal
          open
          modalType={INFO_MODAL_TYPE.FOLDER}
          currentTarget={props.folder}
          closeDialog={toggleFolderInfoModal}
        />
      )}
    </>
  );
};

export default compose(withDragMoveDoc.Consumer, React.memo)(FolderItemWrapper);
