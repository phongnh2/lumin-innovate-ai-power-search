import { useDisclosure } from '@mantine/hooks';
import { Button, Icomoon, Menu, MenuItem, FileButton } from 'lumin-ui/kiwi-ui';
import React, { useRef } from 'react';

import GoogleDriveLogo from 'assets/reskin/lumin-svgs/google.svg';

import GoogleFilePicker from 'luminComponents/GoogleFilePicker';
import { ResponseObject } from 'luminComponents/GoogleFilePicker/types';

import { useTranslation } from 'hooks';

import { UPLOAD_FILE_TYPE } from 'constants/customConstant';

import { SUPPORTED_FILE_TYPES } from '../../constants';
import { FileSource } from '../../enum';
import { useMultipleMergeContext } from '../../hooks/useMultipleMergeContext';
import MultipleMergeList from '../MultipleMergeList/MultipleMergeList';

import styles from './MultipleMergeDocumentsManipulation.module.scss';

const MultipleMergeDocumentsManipulation = () => {
  const [opened, handlers] = useDisclosure(false);
  const resetRef = useRef<() => void>(null);

  const { t } = useTranslation();
  const { isExceedMaxDocumentsSize, isLoadingDocument, handleUploadDocuments } = useMultipleMergeContext();

  const handleChangeFilesFromDevice = (files: File[]) => {
    handleUploadDocuments({ files, source: FileSource.LOCAL });
    resetRef.current?.();
    handlers.close();
  };

  const handlePickFilesFromGoogleDrive = (data: ResponseObject) => {
    handlers.close();
    handleUploadDocuments({
      files: data.docs.map((file) => ({
        remoteId: file.id,
        mimeType: file.mimeType,
        name: file.name,
        size: file.sizeBytes,
      })) as unknown as File[],
      source: FileSource.GOOGLE,
    });
  };

  return (
    <>
      <Menu
        closeOnItemClick={false}
        onClose={handlers.close}
        opened={opened}
        disabled={isLoadingDocument}
        width="432px"
        ComponentTarget={
          <Button
            startIcon={<Icomoon type="ph-file-arrow-up" size="lg" />}
            variant="outlined"
            size="lg"
            fullWidth
            onClick={handlers.toggle}
            disabled={isLoadingDocument}
          >
            {t('action.addMoreFiles')}
          </Button>
        }
      >
        <FileButton
          accept={SUPPORTED_FILE_TYPES.join(',')}
          onChange={handleChangeFilesFromDevice}
          multiple
          resetRef={resetRef}
        >
          {(props) => (
            <MenuItem {...props} leftIconProps={{ type: 'device-desktop-lg' }} disabled={isLoadingDocument}>
              {t('navbar.fromMyDevice')}
            </MenuItem>
          )}
        </FileButton>

        <GoogleFilePicker
          onClose={handlers.close}
          onPicked={handlePickFilesFromGoogleDrive}
          uploadType={UPLOAD_FILE_TYPE.DOCUMENT}
          multiSelect
          mimeType={SUPPORTED_FILE_TYPES.join(',')}
          isUpload={false}
        >
          <MenuItem
            component="div"
            disabled={isLoadingDocument}
            leftSection={<img src={GoogleDriveLogo} alt="Upload from Google Drive" />}
          >
            {t('navbar.fromText', { text: 'Google Drive' })}
          </MenuItem>
        </GoogleFilePicker>
      </Menu>
      <MultipleMergeList />
      <div className={styles.uploadFilesError}>{isExceedMaxDocumentsSize && t('multipleMerge.totalSizeExceed')}</div>
    </>
  );
};

export default MultipleMergeDocumentsManipulation;
