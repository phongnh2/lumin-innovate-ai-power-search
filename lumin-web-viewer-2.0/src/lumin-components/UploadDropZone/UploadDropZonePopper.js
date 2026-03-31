/**
 * need to setup Dropbox before opening it again
 */
import { MenuItem } from 'lumin-ui/kiwi-ui';
import PropTypes from 'prop-types';
import React, { useRef, useEffect } from 'react';
import { Trans } from 'react-i18next';

import DropboxLogo from 'assets/reskin/lumin-svgs/logo-dropbox-md.svg';
import GoogleDriveLogo from 'assets/reskin/lumin-svgs/logo-googledrive-md.svg';
import OneDriveLogo from 'assets/reskin/lumin-svgs/logo-onedrive-md.svg';

import DropboxFileChooser from 'luminComponents/DropboxFileChooser';
import GoogleFilePicker from 'luminComponents/GoogleFilePicker';
import OneDriveFilePicker from 'luminComponents/OneDriveFilePicker';

import { useTranslation, useUploadOptions } from 'hooks';
import useOpenUploadFile from 'hooks/useOpenUploadFile';

import { isElectron } from 'utils/corePathHelper';
import { ButtonName, ButtonPurpose } from 'utils/Factory/EventCollection/constants/ButtonEvent';

import { UPLOAD_FILE_TYPE, DOCUMENT_STORAGE } from 'constants/customConstant';
import { DocumentStorage } from 'constants/documentConstants';
import { general, acceptedMimeType as acceptedMimeTypeDefault } from 'constants/documentType';

import * as Styled from './UploadDropZone.styled';

const propTypes = {
  closePopper: PropTypes.func,
  onUploadLuminFiles: PropTypes.func,
  folderId: PropTypes.string,
  folderType: PropTypes.string,
  isOffline: PropTypes.bool,
  uploadType: PropTypes.oneOf(Object.values(UPLOAD_FILE_TYPE)),
  buttonProps: PropTypes.object,
  isOnHomeEditAPdfFlow: PropTypes.bool,
};

const defaultProps = {
  closePopper: () => {},
  onUploadLuminFiles: () => {},
  folderId: null,
  folderType: null,
  isOffline: false,
  uploadType: UPLOAD_FILE_TYPE.DOCUMENT,
  isOnHomeEditAPdfFlow: false,
  buttonProps: {
    [DOCUMENT_STORAGE.google]: {},
    [DOCUMENT_STORAGE.dropbox]: {},
    [DOCUMENT_STORAGE.s3]: {},
    [DOCUMENT_STORAGE.oneDrive]: {},
  },
};

const uploadInputStyles = {
  visibility: 'hidden',
  opacity: 0,
  position: 'absolute',
  left: -99999,
};

const UploadText = ({ text }) => (
  <Styled.PopperText>
    <Trans i18nKey="navbar.fromText" values={{ text }} />
  </Styled.PopperText>
);

UploadText.propTypes = {
  text: PropTypes.string.isRequired,
};

const UploadDropZonePopper = ({
  closePopper,
  onUploadLuminFiles,
  folderId,
  folderType,
  uploadType,
  buttonProps,
  isOffline,
  isOnHomeEditAPdfFlow,
}) => {
  const { t } = useTranslation();
  const { openUploadFileDialog, deleteSearchParams } = useOpenUploadFile();
  const uploadOptions = useUploadOptions();
  const inputFileRef = useRef();

  const handlePickUpFileByInput = (e) => {
    e.stopPropagation();
    inputFileRef.current.click();
  };

  const handlePickUpFileByFlow = () => {
    deleteSearchParams();
    inputFileRef.current.click();
  };

  const handleChangeFile = (e) => {
    const uploadFiles = Object.keys(e.target.files).map((key) => e.target.files[key]);
    onUploadLuminFiles(uploadFiles);
    e.target.value = null;
    closePopper();
  };

  const getAcceptedMimeType = () => {
    let acceptedMimeType;

    switch (uploadType) {
      case UPLOAD_FILE_TYPE.TEMPLATE:
        acceptedMimeType = [general.PDF];
        break;
      case UPLOAD_FILE_TYPE.DOCUMENT:
        acceptedMimeType = acceptedMimeTypeDefault;
        break;
      default:
        break;
    }
    return acceptedMimeType;
  };

  const acceptedMimeType = getAcceptedMimeType();
  const multipleSelect = uploadType === UPLOAD_FILE_TYPE.DOCUMENT;

  useEffect(() => {
    if (openUploadFileDialog) {
      handlePickUpFileByFlow();
    }
  }, [openUploadFileDialog]);

  const uploadFromText = (from) => t('navbar.fromText', { text: from });

  return (
    <>
      {uploadOptions[DocumentStorage.S3] && (
        <MenuItem
          leftIconProps={{ type: 'device-desktop-md' }}
          disabled={isOffline}
          onClick={handlePickUpFileByInput}
          {...buttonProps[DOCUMENT_STORAGE.s3]}
        >
          <input
            tabIndex={-1}
            type="file"
            id="uploadFile"
            ref={inputFileRef}
            style={uploadInputStyles}
            onChange={handleChangeFile}
            accept={acceptedMimeType.join(',')}
            multiple={multipleSelect}
          />
          {t('navbar.fromMyDevice')}
        </MenuItem>
      )}
      {uploadOptions[DocumentStorage.GOOGLE] && (
        <GoogleFilePicker
          uploadFiles={onUploadLuminFiles}
          onClose={closePopper}
          onPicked={closePopper}
          folderId={folderId}
          folderType={folderType}
          mimeType={acceptedMimeType.join(',')}
          uploadType={uploadType}
          multiSelect={multipleSelect}
          isOnHomeEditAPdfFlow={isOnHomeEditAPdfFlow}
        >
          <MenuItem
            leftSection={
              <Styled.LeftLogoWrapper>
                <img src={GoogleDriveLogo} style={{ height: 20, width: 20 }} alt="upload from Google Drive" />
              </Styled.LeftLogoWrapper>
            }
            disabled={isOffline}
            {...buttonProps[DOCUMENT_STORAGE.google]}
          >
            {uploadFromText('Google Drive')}
          </MenuItem>
        </GoogleFilePicker>
      )}
      {uploadOptions[DocumentStorage.ONEDRIVE] && (
        <OneDriveFilePicker
          uploadFiles={onUploadLuminFiles}
          onClose={closePopper}
          onPicked={closePopper}
          folderId={folderId}
          folderType={folderType}
          mimeType={acceptedMimeType.join(',')}
          uploadType={uploadType}
          multiSelect={multipleSelect}
          isOnHomeEditAPdfFlow={isOnHomeEditAPdfFlow}
        >
          <MenuItem
            leftSection={
              <Styled.LeftLogoWrapper>
                <img src={OneDriveLogo} style={{ height: 24, width: 24 }} alt="upload from OneDrive" />
              </Styled.LeftLogoWrapper>
            }
            disabled={isOffline}
            data-lumin-btn-name={ButtonName.UPLOAD_FROM_ONE_DRIVE}
            data-lumin-btn-purpose={ButtonPurpose[ButtonName.UPLOAD_FROM_ONE_DRIVE]}
            {...buttonProps[DOCUMENT_STORAGE.oneDrive]}
          >
            {uploadFromText('OneDrive')}
          </MenuItem>
        </OneDriveFilePicker>
      )}
      {!isElectron() && uploadOptions[DocumentStorage.DROPBOX] && (
        <DropboxFileChooser
          uploadFiles={onUploadLuminFiles}
          onClose={closePopper}
          onPicked={closePopper}
          folderId={folderId}
          folderType={folderType}
          uploadType={uploadType}
          multiSelect={multipleSelect}
          isOnHomeEditAPdfFlow={isOnHomeEditAPdfFlow}
        >
          <MenuItem
            leftSection={
              <Styled.LeftLogoWrapper>
                <img src={DropboxLogo} style={{ height: 20, width: 20 }} alt="upload from Dropbox" />
              </Styled.LeftLogoWrapper>
            }
            disabled={isOffline}
            {...buttonProps[DOCUMENT_STORAGE.dropbox]}
          >
            {uploadFromText('Dropbox')}
          </MenuItem>
        </DropboxFileChooser>
      )}
    </>
  );
};
UploadDropZonePopper.propTypes = propTypes;
UploadDropZonePopper.defaultProps = defaultProps;

export default UploadDropZonePopper;
