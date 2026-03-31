import classNames from 'classnames';
import { Icomoon, TextType, TextSize, Text } from 'lumin-ui/kiwi-ui';
import React, { useContext, useRef } from 'react';

import DragAndDropDocument from 'assets/reskin/images/drag-and-drop-document.png';

import { UploadDropZoneContext } from 'luminComponents/UploadDropZone';

import { useTranslation } from 'hooks';

import { useAgreementSectionStore } from 'features/CNC/hooks/useAgreementSectionStore';

import { acceptedMimeType } from 'constants/documentType';

import styles from './EmptyDragAndDropUpload.module.scss';

interface EmptyDragAndDropUploadProps {
  onFilesPicked: (files: File[]) => void;
  disableUpload: boolean;
}

function EmptyDragAndDropUpload({ onFilesPicked, disableUpload }: EmptyDragAndDropUploadProps) {
  const { t } = useTranslation();
  const { isOpenAgreementSection } = useAgreementSectionStore();
  const { isDragging } = useContext(UploadDropZoneContext);
  const inputFileRef = useRef<HTMLInputElement>(null);

  const handlePickUpFile = () => {
    if (!disableUpload) {
      inputFileRef.current.click();
    }
  };

  const handleChangeFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadFiles = Array.from(e.target.files);
    onFilesPicked(uploadFiles);
    e.target.value = null;
  };

  return (
    <>
      <input
        type="file"
        className={styles.uploadFromMyDeviceInput}
        ref={inputFileRef}
        onChange={handleChangeFile}
        accept={acceptedMimeType.join(',')}
        multiple
      />
      <div
        className={classNames(styles.dragAndDropSection, {
          [styles.dropping]: isDragging,
          [styles.disabled]: disableUpload,
          [styles.agreementSectionOpen]: isOpenAgreementSection,
        })}
        role="presentation"
        onClick={handlePickUpFile}
      >
        <svg
          className={styles.dragAndDropSectionBackground}
          xmlns="http://www.w3.org/2000/svg"
          width="100%"
          height="100%"
        >
          <rect
            width="100%"
            height="100%"
            fill="none"
            strokeDasharray="6"
            strokeDashoffset="0"
            strokeLinecap="square"
            className={classNames(styles.dragAndDropSectionBackgroundBorder, { [styles.dragging]: isDragging })}
          />
        </svg>
        <div className={styles.dragAndDrop}>
          <img className={styles.dragAndDropImage} src={DragAndDropDocument} alt="empty document list" />
          <Icomoon className={styles.dragAndDropIcon} type="cloud-upload-xl" size="xl" />
          <Text type={TextType.body} size={TextSize.lg} className={styles.dragAndDropDescription}>
            {t('documentPage.reskin.uploadDocument.dragAndDrop')}
          </Text>
        </div>
      </div>
    </>
  );
}

export default EmptyDragAndDropUpload;
