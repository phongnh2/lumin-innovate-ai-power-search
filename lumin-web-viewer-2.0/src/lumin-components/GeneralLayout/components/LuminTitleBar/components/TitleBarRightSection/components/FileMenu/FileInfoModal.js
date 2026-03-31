import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { useDispatch, connect } from 'react-redux';
import { css, useTheme } from 'styled-components';

import actions from 'actions';
import selectors from 'selectors';

import FileInfoRow from 'lumin-components/GeneralLayout/components/LuminTitleBar/components/TitleBarRightSection/components/FileMenu/FileInfoRow';
import Modal from 'lumin-components/GeneralLayout/general-components/Modal';
import Loading from 'lumin-components/Loading';
import SvgElement from 'luminComponents/SvgElement';

import { useTranslation } from 'hooks';

import { documentServices, googleServices } from 'services';

import { dateUtil, bytesToSize, file } from 'utils';
import { makeCancelable } from 'utils/makeCancelable';
import mime from 'utils/mime-types';

import { STORAGE_TYPE, ModalTypes } from 'constants/lumin-common';
import { spacings } from 'constants/styles/editor';

import * as Styled from './FileMenu.styled';

const FileInfoModal = (props) => {
  const { t } = useTranslation();
  const { currentDocument, isOffline, open, setOpen } = props;
  const [pdfInfo, setPdfInfo] = useState({});
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch();
  const { themeMode } = useTheme();

  const { fileName, fileType, fileSize, creator, creationDate, modificationDate, storage } = pdfInfo;
  const currentFileName = currentDocument?.name || fileName;
  const pdfType = mime.extension(fileType);

  const setPdfInfoFromCurrentDocument = (doc) => {
    setPdfInfo({
      fileType: doc.mimeType,
      fileSize: doc.size,
      fileName: doc.name,
      creationDate: doc.createdAt,
      creator: doc.ownerName || 'Anonymous',
      storage: doc.service === STORAGE_TYPE.CACHING ? STORAGE_TYPE.S3 : doc.service,
      modificationDate: doc.lastModify || doc.createdAt,
    });
  };

  const handleMissingGoogleAccessToken = () => {
    dispatch(
      actions.openModal({
        type: ModalTypes.DRIVE,
        title: t('openDrive.permissionRequired'),
        confirmButtonTitle: t('openDrive.givePermission'),
        message: t('openDrive.popupBrowserBlocked', { storageService: 'Drive' }),
        onConfirm: () => {
          googleServices.implicitSignIn({
            loginHint: googleServices.getAccessTokenEmail(),
            callback: () => window.location.reload(),
          });
        },
        disableBackdropClick: true,
        isFullWidthButton: false,
        disableEscapeKeyDown: true,
      })
    );
  };

  useEffect(() => {
    if (isOffline || currentDocument.isSystemFile || currentDocument.isAnonymousDocument) {
      setPdfInfoFromCurrentDocument(currentDocument);
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
        if (error.message === 'Missing google access token') {
          handleMissingGoogleAccessToken();
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

  const handleClose = () => setOpen(false);

  const getStorage = (fileStorage, themeMode) => {
    switch (fileStorage) {
      case STORAGE_TYPE.SYSTEM:
        return <SvgElement content={`local-storage-${themeMode}`} height={24} width={104} />;
      case STORAGE_TYPE.GOOGLE:
        return <SvgElement content={`google-storage-${themeMode}`} height={24} width={84} />;
      case STORAGE_TYPE.DROPBOX:
        return <SvgElement content={`dropbox-storage-${themeMode}`} height={24} width={80} />;
      case STORAGE_TYPE.ONEDRIVE:
        return <SvgElement content={`file-onedrive-${themeMode}`} height={24} width={24} />;
      case STORAGE_TYPE.S3:
      default:
        return <SvgElement content={`lumin-storage-${themeMode}`} height={24} width={74} />;
    }
  };

  return (
    <Modal
      title={t('common.fileInfomation')}
      open={open}
      onClose={handleClose}
      showCloseIcon
      footerVariant={null}
      size="medium"
    >
      {loading ? (
        <Loading normal containerStyle={{ minHeight: 320 }} size={32} />
      ) : (
        <div
          css={css`
            display: flex;
            flex-direction: column;
            gap: ${spacings.le_gap_1_5}px;
            margin-top: ${spacings.le_gap_2}px;
            padding-bottom: ${spacings.le_gap_1}px;
          `}
        >
          <FileInfoRow
            title={t('viewer.fileInfo.fileName')}
            content={file.getFilenameWithoutExtension(currentFileName)}
          />
          <FileInfoRow title={t('viewer.fileInfo.fileType')} content={pdfType.toString()} />
          <FileInfoRow title={t('viewer.fileInfo.fileSize')} content={bytesToSize(fileSize)} />
          <Styled.Divider />
          <FileInfoRow title={t('viewer.fileInfo.creator')} content={creator} />
          <FileInfoRow
            title={t('viewer.fileInfo.creationDate')}
            content={dateUtil.formatMDYTime(new Date(creationDate * 1))}
          />
          <FileInfoRow
            title={t('viewer.fileInfo.modificationDate')}
            content={dateUtil.formatMDYTime(new Date(modificationDate * 1))}
          />
          <Styled.Divider />
          <FileInfoRow title={t('viewer.fileInfo.storage')} content={getStorage(storage, themeMode)} />
        </div>
      )}
    </Modal>
  );
};

FileInfoModal.propTypes = {
  currentDocument: PropTypes.object.isRequired,
  isOffline: PropTypes.bool.isRequired,
  open: PropTypes.bool.isRequired,
  setOpen: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => ({
  currentDocument: selectors.getCurrentDocument(state),
  isOffline: selectors.isOffline(state),
});

const mapDispatchToProps = () => ({});

export default connect(mapStateToProps, mapDispatchToProps)(FileInfoModal);
