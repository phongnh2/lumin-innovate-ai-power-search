import { Grid } from '@mui/material';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch, shallowEqual } from 'react-redux';
import { useParams } from 'react-router';

import actions from 'actions';
import selectors from 'selectors';

import Loading from 'luminComponents/Loading';
import SvgElement from 'luminComponents/SvgElement';

import { useTranslation } from 'hooks';

import { documentServices, googleServices } from 'services';

import { dateUtil, bytesToSize, file } from 'utils';
import { makeCancelable } from 'utils/makeCancelable';
import mime from 'utils/mime-types';

import { DriveErrorCode } from 'constants/authConstant';
import { THEME_MODE, STORAGE_TYPE, ModalTypes } from 'constants/lumin-common';
import { TOUR } from 'constants/plan';

import FileInfoRow from './FileInfoRow';

import './FileInfoPanel.scss';

function FileInfoPanel({ display }) {
  const currentDocument = useSelector(selectors.getCurrentDocument, shallowEqual);
  const dispatch = useDispatch();
  const themeMode = useSelector(selectors.getThemeMode);
  const isOffline = useSelector(selectors.isOffline);
  const [pdfInfo, setPdfInfo] = useState({});
  const [loading, setLoading] = useState(true);

  const { fileName, fileType, fileSize, creator, creationDate, modificationDate, storage } = pdfInfo;
  const currentFileName = currentDocument?.name || fileName;
  const pdfType = mime.extension(fileType);
  const { documentId } = useParams();
  const creatorName = documentId === TOUR ? 'Lumin' : creator;
  const isLightMode = themeMode === THEME_MODE.LIGHT;
  // eslint-disable-next-line no-magic-numbers
  const svgLogoStorageWidth = storage === STORAGE_TYPE.DROPBOX ? 80 : 83;
  const { t } = useTranslation();

  useEffect(() => {
    if (isOffline || currentDocument.isSystemFile || currentDocument.isAnonymousDocument) {
      setPdfInfo({
        fileName: currentDocument.name,
        fileType: currentDocument.mimeType,
        fileSize: currentDocument.size,
        creator: currentDocument.ownerName,
        creationDate: currentDocument.createdAt,
        modificationDate: currentDocument.lastModify || currentDocument.createdAt,
        storage: currentDocument.service === STORAGE_TYPE.CACHING ? STORAGE_TYPE.S3 : currentDocument.service,
      });
      setLoading(false);
      return undefined;
    }
    const { promise, cancel } = makeCancelable(() => documentServices.getPDFInfo(currentDocument));
    const getPdfInfo = async () => {
      try {
        const pdfInfoValue = await promise();
        setPdfInfo(pdfInfoValue);
        setLoading(false);
        dispatch(actions.updateCurrentDocument({ size: parseInt(pdfInfoValue.fileSize) }));
      } catch (error) {
        if (error.message === DriveErrorCode.MISSING_ACCESS_TOKEN) {
          dispatch(
            actions.openModal({
              type: ModalTypes.DRIVE,
              title: t('openDrive.permissionRequired'),
              message: t('openDrive.popupBrowserBlocked', { storageService: 'Drive' }),
              confirmButtonTitle: t('openDrive.givePermission'),
              onConfirm: () => {
                googleServices.implicitSignIn({
                  loginHint: googleServices.getAccessTokenEmail(),
                  callback: () => window.location.reload(),
                });
              },
              disableBackdropClick: true,
              disableEscapeKeyDown: true,
              isFullWidthButton: false,
            })
          );
        }
      }
    };
    getPdfInfo();
    return () => {
      cancel();
    };
  }, []);

  useEffect(() => {
    setPdfInfo((prevPdfInfo) => ({ ...prevPdfInfo, fileSize: currentDocument.size.toString() }));
  }, [currentDocument.size]);

  const getSvgContent = (fileStorage) => `file-${fileStorage || 'google'}-${isLightMode ? 'light' : 'dark'}`;

  const getStorage = (fileStorage) => {
    const localLogoContent = fileStorage === STORAGE_TYPE.S3 ? 'logo-lumin' : 'system';
    return ([STORAGE_TYPE.S3, STORAGE_TYPE.SYSTEM].includes(fileStorage) ? (
      // eslint-disable-next-line no-magic-numbers
      <SvgElement content={localLogoContent} width={fileStorage === STORAGE_TYPE.S3 ? 73 : 20} height={20} />
    ) : (
      <SvgElement content={getSvgContent(fileStorage)} width={svgLogoStorageWidth} height={20} />
    ));
  };

  return loading ? (
    <Loading normal containerStyle={{ minHeight: 320 }} size={32} />
  ) : (
    <div
      className="Panel FileInfoPanel custom-scrollbar custom-scrollbar--hide-thumb"
      style={{ display }}
      data-element="fileInfoPanel"
    >
      <FileInfoRow
        classes="FileInfoPanel__row--margin-top"
        title={t('viewer.fileInfo.fileName')}
        content={file.getFilenameWithoutExtension(currentFileName)}
      />
      <FileInfoRow title={t('viewer.fileInfo.fileType')} content={pdfType.toString()} />
      <FileInfoRow title={t('viewer.fileInfo.fileSize')} content={bytesToSize(fileSize)} />
      <div className="FileInfoPanel__divider" />
      <FileInfoRow title={t('viewer.fileInfo.creator')} content={creatorName} />
      <FileInfoRow
        title={t('viewer.fileInfo.creationDate')}
        content={dateUtil.formatMDYTime(new Date(creationDate * 1))}
      />
      <FileInfoRow
        title={t('viewer.fileInfo.modificationDate')}
        content={dateUtil.formatMDYTime(new Date(modificationDate * 1))}
      />
      <div className="FileInfoPanel__divider" />
      <Grid container className="FileInfoPanel__row">
        <Grid item xs={5}>
          <div className="FileInfoPanel__title">
            {t('viewer.fileInfo.storage')}
          </div>
        </Grid>
        <Grid item xs={7}>
          <div className="FileInfoPanel__content">
            {getStorage(storage)}
          </div>
        </Grid>
      </Grid>
    </div>
  );
}

FileInfoPanel.propTypes = {
  display: PropTypes.string.isRequired,
};

export default FileInfoPanel;
