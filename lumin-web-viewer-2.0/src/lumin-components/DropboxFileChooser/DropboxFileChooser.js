/* eslint-disable no-param-reassign */
import PropTypes from 'prop-types';
import React from 'react';
import DropboxChooser from 'react-dropbox-chooser';
import { withTranslation } from 'react-i18next';
import { compose } from 'redux';

import { withHomeEditAPdfFlow } from 'luminComponents/TopFeaturesSection/hoc';

import { dropboxServices, documentServices } from 'services';
import PersonalDocumentUploadService from 'services/personalDocumentUploadService';

import logger from 'helpers/logger';

import { file, toastUtils, compressImage, errorUtils } from 'utils';
import mime from 'utils/mime-types';
import { handleDisplayModal } from 'utils/uploadingModalUtils';

import { UPLOAD_FILE_TYPE } from 'constants/customConstant';
import { DocumentService } from 'constants/document.enum';
import { folderType } from 'constants/documentConstants';
import { dropboxType } from 'constants/documentType';
import { ErrorCode } from 'constants/errorCode';
import { ModalTypes, STORAGE_TYPE, LOGGER, MAX_THUMBNAIL_SIZE } from 'constants/lumin-common';
import { ERROR_MESSAGE_RESTRICTED_ACTION } from 'constants/messages';

class DropboxFileChooser extends React.Component {
  getCurrentFolderType = () => {
    const { currentFolderType, folderType: folderTypeFromHomeEditPdfFlow } = this.props;
    if (folderTypeFromHomeEditPdfFlow) {
      return folderTypeFromHomeEditPdfFlow;
    }
    return currentFolderType;
  };

  _handlePickFileDropbox = async (files) => {
    const {
      uploadFiles,
      folderId,
      onPicked,
      uploadType,
      currentOrganization,
      handleVerifyBeforeUploadingFlow,
      handleNavigateToEditor,
      t,
      isViewer,
      currentDocument,
    } = this.props;

    const { allowedUpload, errorHandler } = handleVerifyBeforeUploadingFlow(files);

    if (!allowedUpload) {
      errorHandler();
      return;
    }

    logger.logInfo({
      message: LOGGER.EVENT.DROPBOX_HANDLE_PICK_FILE,
      reason: LOGGER.Service.DROPBOX_API_INFO,
    });
    const currentFolderType = this.getCurrentFolderType();
    if (currentFolderType === folderType.INDIVIDUAL && uploadType === UPLOAD_FILE_TYPE.DOCUMENT) {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'smooth',
      });
      try {
        const documentList = await Promise.all(
          files.map(async (eachFile) => ({
            remoteId: eachFile.id,
            name: eachFile.name,
            size: eachFile.bytes,
            mimeType: mime.lookup(eachFile.name),
            service: 'dropbox',
          }))
        );
        const uploader = new PersonalDocumentUploadService();
        const isSharedDocument = currentDocument?.isShared;
        const createdDocuments = await uploader.import({
          documents: documentList,
          ...(folderId && !isSharedDocument && { folderId }),
          orgId: currentOrganization?._id,
        });
        if (isViewer) {
          handleDisplayModal(
            createdDocuments,
            DocumentService.dropbox,
            currentFolderType,
            currentOrganization,
            folderId
          );
          return;
        }

        this.updateThumbnails({ files, createdDocuments, currentFolderType });
        if (createdDocuments.length) {
          const toastSettings = {
            type: ModalTypes.SUCCESS,
            message: t('openDropbox.yourDocumentsWereSuccessfullyImported'),
            useReskinToast: true,
          };
          toastUtils.openToastMulti(toastSettings);
          handleNavigateToEditor(createdDocuments[0]._id);
        }
      } catch (error) {
        logger.logError({
          reason: LOGGER.Service.DROPBOX_API_ERROR,
          error,
        });
        const { code } = errorUtils.extractGqlError(error);
        const toastSettings = {
          type: ModalTypes.ERROR,
          message:
            code === ErrorCode.Common.RESTRICTED_ACTION
              ? ERROR_MESSAGE_RESTRICTED_ACTION
              : 'Failed to upload documents from Dropbox',
          useReskinToast: true,
        };
        toastUtils.openToastMulti(toastSettings);
      }
    } else {
      const fileList = files.map((fileData) => ({
        ...fileData,
        type: 'application/pdf',
        size: fileData.bytes,
      }));
      uploadFiles(fileList, STORAGE_TYPE.DROPBOX);
    }
    onPicked();
  };

  getAcceptedExtension = () => {
    const { uploadType } = this.props;
    let acceptedExtension;

    switch (uploadType) {
      case UPLOAD_FILE_TYPE.TEMPLATE:
        acceptedExtension = [dropboxType.PDF];
        break;
      case UPLOAD_FILE_TYPE.DOCUMENT:
        acceptedExtension = [
          dropboxType.PNG,
          dropboxType.JPG,
          dropboxType.JPEG,
          dropboxType.PDF,
          dropboxType.DOCX,
          dropboxType.XLSX,
          dropboxType.PPTX,
        ];
        break;
      default:
        break;
    }
    return acceptedExtension;
  };

  updateThumbnails({ files, createdDocuments, currentFolderType }) {
    const { updateDocumentData } = this.props;
    files.forEach(async (eachFile) => {
      const docIndex = createdDocuments.findIndex((document) => document.remoteId === eachFile.id);
      const documentId = createdDocuments[docIndex]._id;
      try {
        const fileCreateFromDropbox = await dropboxServices.getFileFromDropbox(eachFile.name, eachFile.link);
        const thumbnailCanvases = await file.getThumbnailWithFile(fileCreateFromDropbox);
        const thumbnailFile = await file.convertThumnailCanvasToFile(thumbnailCanvases, eachFile.name);
        const compressedThumbnail =
          thumbnailFile &&
          (await compressImage(thumbnailFile, {
            convertSize: MAX_THUMBNAIL_SIZE,
            maxWidth: 800,
            maxHeight: 400,
          }));
        const { data: thumbnail } = await documentServices.uploadThumbnail(documentId, compressedThumbnail);
        updateDocumentData(currentFolderType, {
          _id: documentId,
          thumbnail,
        });
      } catch (error) {
        logger.logError({
          reason: LOGGER.Service.DROPBOX_API_ERROR,
          error,
        });
      }
    });
  }

  render() {
    const { onClose, multiSelect } = this.props;
    const acceptedExtensions = this.getAcceptedExtension();
    return (
      <DropboxChooser
        appKey={process.env.DROPBOX_CLIENT_ID}
        success={(files) => this._handlePickFileDropbox(files)}
        cancel={onClose}
        multiselect={multiSelect}
        extensions={acceptedExtensions}
      >
        {this.props.children}
      </DropboxChooser>
    );
  }
}

DropboxFileChooser.propTypes = {
  children: PropTypes.any,
  folderId: PropTypes.string,
  folderType: PropTypes.string,
  uploadFiles: PropTypes.func,
  currentFolderType: PropTypes.string.isRequired,
  uploadType: PropTypes.oneOf(Object.values(UPLOAD_FILE_TYPE)),
  updateDocumentData: PropTypes.func,
  onClose: PropTypes.func,
  onPicked: PropTypes.func,
  multiSelect: PropTypes.bool,
  currentOrganization: PropTypes.object,
  currentDocument: PropTypes.object,
  handleNavigateToEditor: PropTypes.func,
  handleVerifyBeforeUploadingFlow: PropTypes.func,
  t: PropTypes.func.isRequired,
  isViewer: PropTypes.bool,
};

DropboxFileChooser.defaultProps = {
  children: null,
  folderId: null,
  folderType: null,
  uploadType: UPLOAD_FILE_TYPE.DOCUMENT,
  uploadFiles: () => {},
  updateDocumentData: () => {},
  onPicked: () => {},
  onClose: () => {},
  multiSelect: true,
  currentOrganization: {},
  currentDocument: {},
  handleNavigateToEditor: () => {},
  handleVerifyBeforeUploadingFlow: () => {},
  isViewer: false,
};

export default compose(withTranslation(), withHomeEditAPdfFlow)(DropboxFileChooser);
