/* eslint-disable no-use-before-define */
import PropTypes from 'prop-types';
import React, { forwardRef, useImperativeHandle } from 'react';

import { enqueueSnackbar } from '@libs/snackbar';

import { useTranslation } from 'hooks/useTranslation';

import googleServices from 'services/googleServices';

import logger from 'helpers/logger';

import { getLanguage } from 'utils/getLanguage';
import { toggleMantineModals } from 'utils/toggleMantineModals';

import { DriveScopes } from 'constants/authConstant';
import { ErrorCode } from 'constants/errorCode';
import { GOOGLE_LANGUAGES } from 'constants/language';
import { LOGGER } from 'constants/lumin-common';

const GoogleFolderPicker = forwardRef(({ multiSelect, children, onClose, selectedFolder, loadingModal }, ref) => {
  const language = getLanguage();
  const { t } = useTranslation();
  useImperativeHandle(ref, () => ({
    openPicker() {
      openPicker({});
    },
  }));

  const handlePickFolderGoogle = async (data) => {
    if (!window.gapi.drive) {
      await window.gapi.client.load('drive', 'v3', null);
    }
    selectedFolder(data);
  };

  const googlePickerCallback = (data) => {
    switch (data.action) {
      case 'loaded':
        loadingModal();
        break;
      case 'cancel':
        onClose();
        toggleMantineModals.show();
        break;
      case 'picked': {
        handlePickFolderGoogle(data);
        toggleMantineModals.show();
        break;
      }
      default:
        break;
    }
  };

  const initialPicker = async () => {
    if (!window.gapi.picker) {
      await new Promise((resolve) => {
        window.gapi.load('picker', resolve);
      });
    }
    const oauthToken = googleServices.getImplicitAccessToken().access_token;
    const viewFolderMode = window.google.picker.ViewId.FOLDERS;
    const mimeTypes = 'application/vnd.google-apps.folder';
    const folderView = new window.google.picker.DocsView(viewFolderMode)
      .setMimeTypes(mimeTypes)
      .setIncludeFolders(true)
      .setOwnedByMe(true)
      .setSelectFolderEnabled(true);

    const sharedView = new window.google.picker.DocsView(viewFolderMode)
      .setMimeTypes(mimeTypes)
      .setIncludeFolders(true)
      .setEnableDrives(true)
      .setOwnedByMe(true)
      .setSelectFolderEnabled(true);

    const googlePickerBuilder = new window.google.picker.PickerBuilder()
      .addView(folderView)
      .addView(sharedView)
      .enableFeature(window.google.picker.Feature.SUPPORT_DRIVES)
      .setAppId(process.env.GOOGLE_PICKER_APP_ID)
      .setOAuthToken(oauthToken)
      .setDeveloperKey(process.env.GOOGLE_PICKER_DEVELOPERKEY)
      .setCallback(googlePickerCallback)
      .setLocale(GOOGLE_LANGUAGES[language])
      .setTitle(t('openDrive.selectFolder'));

    if (multiSelect) {
      googlePickerBuilder.enableFeature(window.google.picker.Feature.MULTISELECT_ENABLED);
    }
    return googlePickerBuilder;
  };

  const openPicker = ({ scope = [], isValidToken = true }) => {
    if (isValidToken && googleServices.hasGrantedScope(DriveScopes.DRIVE_FILE)) {
      createPicker();
      return;
    }
    googleServices.implicitSignIn({
      callback: () => {
        createPicker();
      },
      onError: (error) => {
        const { type: grantPermissionError } = error;
        logger.logError({
          reason: LOGGER.Service.GOOGLE_API_ERROR,
          error,
        });
        if (grantPermissionError === ErrorCode.Common.POPUP_FAILED_TO_OPEN) {
          enqueueSnackbar({
            message: t('openDrive.blockByBrowser'),
            variant: 'error',
          });
        } else {
          enqueueSnackbar({
            message: t('openDrive.accessDenied'),
            variant: 'error',
          });
        }
      },
      loginHint: googleServices.getAccessTokenEmail(),
      scope,
    });
  };

  const createPicker = async () => {
    const isValidToken = await googleServices.isValidToken();
    if (!isValidToken) {
      googleServices.removeImplicitAccessToken();
      openPicker({ isValidToken: false });
      return;
    }
    if (!googleServices.hasGrantedScope(DriveScopes.DRIVE_FILE)) {
      openPicker({ scope: [DriveScopes.DRIVE_INSTALL] });
      return;
    }
    const picker = await initialPicker();
    logger.logInfo({
      message: LOGGER.EVENT.CREATE_GOOGLE_FILE_PICKER,
      reason: LOGGER.Service.GOOGLE_API_INFO,
    });
    picker.build().setVisible(true);
    toggleMantineModals.hide();
  };

  return (
    <div role="button" tabIndex={0} onClick={() => openPicker({})}>
      {children}
    </div>
  );
});

GoogleFolderPicker.propTypes = {
  multiSelect: PropTypes.bool,
  children: PropTypes.node,
  selectedFolder: PropTypes.func,
  onClose: PropTypes.func,
  loadingModal: PropTypes.func,
};

GoogleFolderPicker.defaultProps = {
  children: <div style={{ display: 'none' }} />,
  multiSelect: false,
  selectedFolder: () => {},
  onClose: () => {},
  loadingModal: () => {},
};

export default GoogleFolderPicker;
