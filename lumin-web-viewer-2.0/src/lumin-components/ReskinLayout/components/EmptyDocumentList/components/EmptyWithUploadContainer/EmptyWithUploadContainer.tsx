import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';

import selectors from 'selectors';

import { useUploadOptions } from 'hooks';

import EmptyDragAndDropUpload from '../EmptyDragAndDropUpload';
import EmptyUploadSourceButtons from '../EmptyUploadSourceButtons';

import styles from './EmptyWithUploadContainer.module.scss';

interface EmptyWithUploadContainerProps {
  onFilesPicked: (files: File[], uploadFrom?: string) => void;
  disabled: boolean;
  folderId?: string;
}

function EmptyWithUploadContainer({ onFilesPicked, disabled, folderId }: EmptyWithUploadContainerProps) {
  const isOffline = useSelector(selectors.isOffline);
  const uploadOptions = useUploadOptions();

  const disableUpload = useMemo(() => disabled || isOffline, [disabled, isOffline]);

  return (
    <div className={styles.emptyWithUploadContainer}>
      <EmptyDragAndDropUpload onFilesPicked={onFilesPicked} disableUpload={disableUpload} />
      <EmptyUploadSourceButtons
        onFilesPicked={onFilesPicked}
        disableUpload={disableUpload}
        uploadOptions={uploadOptions}
        folderId={folderId}
      />
    </div>
  );
}

export default EmptyWithUploadContainer;
