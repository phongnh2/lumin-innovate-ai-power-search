import type { DraggableProvided, DraggableStateSnapshot } from '@hello-pangea/dnd';
import classNames from 'classnames';
import { IconButton } from 'lumin-ui/kiwi-ui';
import React from 'react';

import ImageDrag from 'assets/lumin-svgs/dndHandle.svg';

import { UploadStatusType } from '../../enum';
import { useMultipleMergeContext } from '../../hooks/useMultipleMergeContext';
import { MergeDocumentMetadataType, MergeDocumentType } from '../../types';
import DocumentInfo from '../DocumentInfo/DocumentInfo';

import styles from './MultipleMergeItem.module.scss';

type MultipleMergeItemProps = {
  _id: string;
  isLoadingDocument: boolean;
  name: string;
  thumbnail?: string;
  size: number;
  status: UploadStatusType;
  provided: DraggableProvided;
  snapshot: DraggableStateSnapshot;
  metadata?: MergeDocumentMetadataType;
};

export const MultipleMergeItem = ({
  _id,
  isLoadingDocument = false,
  name,
  provided,
  thumbnail,
  size,
  status,
  metadata,
}: MultipleMergeItemProps) => {
  const { deleteDocument } = useMultipleMergeContext();

  return (
    <div
      className={classNames([styles.container, isLoadingDocument && styles.disabled])}
      ref={provided.innerRef}
      {...provided.draggableProps}
      {...provided.dragHandleProps}
    >
      <img className={styles.dragImage} src={ImageDrag} alt="Drag Document" />
      <DocumentInfo thumbnail={thumbnail} name={name} size={size} status={status} errorCode={metadata?.errorCode} />
      <IconButton icon="x-sm" onClick={() => deleteDocument(_id)} disabled={isLoadingDocument} />
    </div>
  );
};

type MultipleMergeItemCloneProps = {
  document: MergeDocumentType;
  isLoadingDocument?: boolean;
  provided: DraggableProvided;
  snapshot: DraggableStateSnapshot;
};

export const MultipleMergeItemClone = ({
  document,
  isLoadingDocument,
  provided,
  snapshot,
}: MultipleMergeItemCloneProps) => {
  const { _id, name, thumbnail, size, status, metadata } = document;

  return (
    <MultipleMergeItem
      _id={_id}
      isLoadingDocument={isLoadingDocument}
      name={name}
      thumbnail={thumbnail}
      size={size}
      status={status}
      provided={provided}
      snapshot={snapshot}
      metadata={metadata}
    />
  );
};
