import { CloudArrowUpIcon } from '@luminpdf/icons/dist/csr/CloudArrowUp';
import { Text, FileButton } from 'lumin-ui/kiwi-ui';
import React, { useRef } from 'react';
import { compose } from 'redux';

import { OneDriveFilePickerProvider } from 'lumin-components/OneDriveFilePicker';
import UploadDropZone, { UploadDropZoneContext } from 'lumin-components/UploadDropZone';

import withDropDocPopup from 'HOC/withDropDocPopup';

import { useTranslation } from 'hooks/useTranslation';

import { acceptedMimeType } from 'constants/documentType';
import { STORAGE_TYPE } from 'constants/lumin-common';

import UploadButton from './components/UploadButton';

import styles from './UploadContainer.module.scss';

interface UploadContainerProps {
  onUpload: (fileUploads: Array<{ file: File; uploadFrom: string }>) => void;
}

const UploadContainer = ({ onUpload }: UploadContainerProps) => {
  const { t } = useTranslation();
  const resetRef = useRef<() => void>(null);

  const handleFileChange = (files: File[]) => {
    if (files && files.length > 0 && onUpload) {
      onUpload(files.map((file) => ({ file, uploadFrom: STORAGE_TYPE.LOCAL })));
    }
    resetRef.current?.();
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <UploadDropZone highlight>
      <UploadDropZoneContext.Consumer>
        {({ showHighlight }) => (
          <FileButton accept={acceptedMimeType.join(',')} onChange={handleFileChange} multiple resetRef={resetRef}>
            {({ ...props }) => (
              <div
                {...props}
                className={`${styles.uploadContainer} ${showHighlight ? styles.showHighlight : ''}`}
                role="button"
                tabIndex={0}
                onClick={handleClick}
              >
                <div className={styles.uploadHeader}>
                  <CloudArrowUpIcon size={20} color="var(--kiwi-colors-surface-on-surface)" />
                  <Text type="body" size="sm" color="var(--kiwi-colors-surface-on-surface)">
                    {t('documentPage.reskin.uploadDocument.dragAndDrop')}
                  </Text>
                </div>
                <OneDriveFilePickerProvider>
                  <UploadButton />
                </OneDriveFilePickerProvider>
              </div>
            )}
          </FileButton>
        )}
      </UploadDropZoneContext.Consumer>
    </UploadDropZone>
  );
};

export default compose(withDropDocPopup.Provider)(UploadContainer);
