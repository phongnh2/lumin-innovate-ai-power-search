import classNames from 'classnames';
import { Icomoon, Button, Text, TextType, TextSize, Menu } from 'lumin-ui/kiwi-ui';
import { cssVar } from 'polished';
import React, { useContext, useRef, useState } from 'react';
import { useSelector } from 'react-redux';

import DragAndDropDocument1 from 'assets/reskin/images/drag-and-drop-document-1.png';

import selectors from 'selectors';

import { OneDriveFilePickerProvider } from 'luminComponents/OneDriveFilePicker';
import { UploadDropZoneContext, UploadDropZonePopper } from 'luminComponents/UploadDropZone';

import withDropDocPopup from 'HOC/withDropDocPopup';

import { useTranslation } from 'hooks';

import { acceptedMimeType } from 'constants/documentType';

import styles from './EmptyDocuments.module.scss';

interface EmptyDocumentsProps {
  onFilesPicked: (files: File[], uploadFrom?: string) => void;
  folderId?: string;
}

const EmptyDocuments = ({ folderId, onFilesPicked }: EmptyDocumentsProps) => {
  const [opened, setOpened] = useState(false);
  const { t } = useTranslation();
  const { isDragging } = useContext(UploadDropZoneContext);
  const isOffline = useSelector(selectors.isOffline);

  const inputFileRef = useRef<HTMLInputElement>(null);

  const _handlePickUpFile = () => {
    inputFileRef.current.click();
  };

  const handleChangeFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadFiles = Array.from(e.target.files);
    onFilesPicked(uploadFiles);
    e.target.value = null;
  };

  return (
    <div className={styles.emptyWithUploadContainer}>
      <input
        type="file"
        className={styles.uploadFromMyDeviceInput}
        ref={inputFileRef}
        onChange={handleChangeFile}
        accept={acceptedMimeType.join(',')}
        multiple
      />
      <div
        className={classNames(styles.dragAndDropSection, { [styles.dropping]: isDragging })}
        role="presentation"
        onClick={_handlePickUpFile}
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
            rx={cssVar('--kiwi-border-radius-md', 8)}
            className={classNames(styles.dragAndDropSectionBackgroundBorder, { [styles.dragging]: isDragging })}
          />
        </svg>
        <div className={styles.dragAndDrop}>
          <img className={styles.dragAndDropImage} src={DragAndDropDocument1} alt="empty document list" />
          <Text type={TextType.body} size={TextSize.lg} className={styles.dragAndDropDescription}>
            {t('suggestedDocuments.dropHere')}
          </Text>
          <OneDriveFilePickerProvider>
            <Menu
              classNames={{
                dropdown: styles.uploadPopper,
              }}
              ComponentTarget={
                <Button
                  size="lg"
                  variant="elevated"
                  startIcon={<Icomoon type="upload-lg" size="lg" />}
                  className={styles.uploadButton}
                  disabled={isOffline}
                  onClick={(e) => e.stopPropagation()}
                >
                  {t('suggestedDocuments.uploadDocument')}
                </Button>
              }
              closeOnItemClick={false}
              opened={opened}
              onChange={setOpened}
              disabled={isOffline}
              withinPortal={false}
            >
              <UploadDropZonePopper
                folderId={folderId}
                closePopper={() => setOpened(false)}
                onUploadLuminFiles={onFilesPicked}
                isOffline={isOffline}
              />
            </Menu>
          </OneDriveFilePickerProvider>
        </div>
      </div>
    </div>
  );
};

export default withDropDocPopup.Consumer<EmptyDocumentsProps>(EmptyDocuments);
