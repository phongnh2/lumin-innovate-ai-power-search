import PropTypes from 'prop-types';
import React from 'react';

import CookieWarningContext from 'luminComponents/CookieWarningModal/Context';

import documentServices from 'services/documentServices';
import googleServices from 'services/googleServices';
import PersonalDocumentUploadService from 'services/personalDocumentUploadService';

import fireEvent from 'helpers/fireEvent';
import logger from 'helpers/logger';

import compressImage from 'utils/compressImage';
import file from 'utils/file';
import mime from 'utils/mime-types';
import toastUtils from 'utils/toastUtils';
import { toggleMantineModals } from 'utils/toggleMantineModals';
import { handleDisplayModal } from 'utils/uploadingModalUtils';

import { DriveScopes } from 'constants/authConstant';
import { UPLOAD_FILE_TYPE } from 'constants/customConstant';
import { CUSTOM_EVENT } from 'constants/customEvent';
import { DocumentService } from 'constants/document.enum';
import { folderType } from 'constants/documentConstants';
import { general, images, office } from 'constants/documentType';
import { ErrorCode } from 'constants/errorCode';
import { ModalTypes, STORAGE_TYPE, LOGGER, MAX_THUMBNAIL_SIZE } from 'constants/lumin-common';
import { supportedPDFExtensions, supportedOfficeExtensions } from 'constants/supportedFiles';

class GoogleFilePicker extends React.PureComponent {
  initialPicker = async () => {
    if (!window.gapi.picker) {
      await new Promise((resolve) => {
        window.gapi.load('picker', resolve);
      });
    }
    const oauthToken = googleServices.getImplicitAccessToken().access_token;
    const { fileName, mimeType, isRequestAccess, multiSelect } = this.props;
    let googlePickerBuilder;
    if (!isRequestAccess) {
      const defaultMimeType = [general.PDF, office.DOCX, office.XLSX, office.PPTX];
      const supportedImageMimeType = [images.PNG, images.JPEG, images.JPG];
      const pdfViewId = window.google.picker.ViewId.DOCS;
      googlePickerBuilder = new window.google.picker.PickerBuilder()
        .addView(new window.google.picker.DocsView(pdfViewId).setMimeTypes(mimeType || defaultMimeType.join(',')))
        .addView(
          new window.google.picker.DocsView(pdfViewId)
            .setMimeTypes(mimeType || defaultMimeType.join(','))
            .setIncludeFolders(true)
            .setEnableDrives(true)
        )
        .addView(
          new window.google.picker.DocsView(window.google.picker.ViewId.DOCS_IMAGES).setMimeTypes(
            mimeType || supportedImageMimeType.join(',')
          )
        )
        .enableFeature(window.google.picker.Feature.SUPPORT_DRIVES)
        .setAppId(process.env.GOOGLE_PICKER_APP_ID)
        .setOAuthToken(oauthToken)
        .setDeveloperKey(process.env.GOOGLE_PICKER_DEVELOPERKEY)
        .setCallback(this.googlePickerCallback);
      if (multiSelect) {
        googlePickerBuilder.enableFeature(window.google.picker.Feature.MULTISELECT_ENABLED);
      }
      return googlePickerBuilder;
    }
    const searchView = new window.google.picker.DocsView(window.google.picker.ViewId.DOCS)
      .setMimeTypes(mimeType)
      .setQuery(fileName);
    googlePickerBuilder = new window.google.picker.PickerBuilder()
      .addView(searchView)
      .enableFeature(window.google.picker.Feature.SUPPORT_DRIVES)
      .setAppId(process.env.GOOGLE_PICKER_APP_ID)
      .setOAuthToken(oauthToken)
      .setDeveloperKey(process.env.GOOGLE_PICKER_DEVELOPERKEY)
      .setCallback((data) => {
        this.googlePickerCallback(data);
      });
    if (multiSelect) {
      googlePickerBuilder.enableFeature(window.google.picker.Feature.MULTISELECT_ENABLED);
    }
    return googlePickerBuilder;
  };

  getCurrentFolderType = () => {
    const { currentFolderType, folderType: folderTypeFromHomeEditPdfFlow } = this.props;
    if (folderTypeFromHomeEditPdfFlow) {
      return folderTypeFromHomeEditPdfFlow;
    }
    return currentFolderType;
  };

  googlePickerCallback = (data) => {
    const { closeModal, onClose, onPicked } = this.props;
    switch (data.action) {
      case 'loaded':
        closeModal();
        break;
      case 'cancel':
        onClose();
        toggleMantineModals.show();
        break;
      case 'picked':
        this.handlePickFileGoogle(data);
        onPicked(data);
        toggleMantineModals.show();
        break;
      default:
    }
  };

  openPicker = ({ scope = [], isValidToken = true }) => {
    const { t } = this.props;

    if (isValidToken && googleServices.hasGrantedScope(DriveScopes.DRIVE_FILE)) {
      this.createPicker();
      return;
    }
    googleServices.implicitSignIn({
      callback: (tokenData) => {
        fireEvent(CUSTOM_EVENT.SHOW_PROMPT_INVITE_USERS_BANNER, tokenData);
        this.createPicker();
      },
      onError: (error) => {
        logger.logError({
          reason: LOGGER.Service.GOOGLE_API_ERROR,
          error,
        });
        const { type: grantPermissionError } = error;
        const message =
          grantPermissionError === ErrorCode.Common.POPUP_FAILED_TO_OPEN
            ? t('openDrive.blockByBrowser')
            : t('openDrive.accessDenied');
        toastUtils.openToastMulti({
          message,
          type: ModalTypes.ERROR,
          useReskinToast: true,
        });
      },
      loginHint: googleServices.getAccessTokenEmail(),
      scope,
    });
  };

  createPicker = async () => {
    const isValidToken = await googleServices.isValidToken();
    if (!isValidToken) {
      this.openPicker({ isValidToken: false });
      return;
    }
    if (!googleServices.hasGrantedScope(DriveScopes.DRIVE_FILE)) {
      this.openPicker({ scope: [DriveScopes.DRIVE_INSTALL] });
      return;
    }
    const picker = await this.initialPicker();
    logger.logInfo({
      message: LOGGER.EVENT.CREATE_GOOGLE_FILE_PICKER,
      reason: LOGGER.Service.GOOGLE_API_INFO,
    });
    picker.build().setVisible(true);
    toggleMantineModals.hide();
  };

  handlePickUpFile = (data) => {
    const { uploadFiles } = this.props;
    const fileList = data.docs.map((doc) => {
      let documentName;
      const documentType = file.getExtension(doc.name);
      if (mime.extension(doc.mimeType) === 'gdoc') documentName = `${doc.name}.docx`;
      if (mime.extension(doc.mimeType) === 'gsheet') documentName = `${doc.name}.xlsx`;
      if (!supportedOfficeExtensions.includes(documentType) && !supportedPDFExtensions.includes(documentType)) {
        documentName = `${doc.name}.${mime.extension(doc.mimeType)}`;
      }

      return {
        ...doc,
        name: documentName || doc.name,
        type: doc.mimeType,
        size: doc.sizeBytes,
      };
    });
    uploadFiles(fileList, STORAGE_TYPE.GOOGLE);
  };

  handleUpdateThumbnail = async (driveDocument, createdDocuments) => {
    const { updateDocumentData } = this.props;
    const docIndex = createdDocuments.findIndex((document) => document.remoteId === driveDocument.id);
    const documentId = createdDocuments[docIndex]._id;
    try {
      const { thumbnailLink } = await googleServices.getFileInfo(driveDocument.id, '*', 'handleUpdateThumbnail');
      if (!thumbnailLink) {
        return;
      }
      const thumbnailCanvas = await file.getCanvasFromUrl(thumbnailLink);
      const thumbnailFile = await file.convertThumnailCanvasToFile(
        thumbnailCanvas,
        file.getFilenameWithoutExtension(driveDocument.name)
      );
      const compressedThumbnail =
        thumbnailFile &&
        (await compressImage(thumbnailFile, {
          convertSize: MAX_THUMBNAIL_SIZE,
          maxWidth: 800,
          maxHeight: 400,
        }));
      const { data: thumbnail } = await documentServices.uploadThumbnail(documentId, compressedThumbnail);
      updateDocumentData(this.getCurrentFolderType(), {
        _id: documentId,
        thumbnail,
      });
      logger.logInfo({
        message: LOGGER.EVENT.GET_FILE_INFO,
        reason: LOGGER.Service.GOOGLE_API_INFO,
      });
    } catch (error) {
      logger.logError({
        reason: LOGGER.Service.GOOGLE_API_ERROR,
        error,
      });
    }
  };

  // eslint-disable-next-line class-methods-use-this
  getDocumentList = (data, remoteEmail) =>
    Promise.all(
      data.docs.map(async (doc) => {
        let documentName;
        const documentType = file.getExtension(doc.name);
        if (mime.extension(doc.mimeType) === 'gdoc') documentName = `${doc.name}.docx`;
        if (mime.extension(doc.mimeType) === 'gsheet') documentName = `${doc.name}.xlsx`;
        if (!supportedOfficeExtensions.includes(documentType) && !supportedPDFExtensions.includes(documentType)) {
          documentName = `${doc.name}.${mime.extension(doc.mimeType)}`;
        }
        return {
          remoteId: doc.id,
          name: documentName || doc.name,
          size: doc.sizeBytes,
          mimeType: doc.mimeType,
          service: 'google',
          remoteEmail,
        };
      })
    );

  handleUploadFile = async ({ driveDocuments, documentList }) => {
    const { folderId, currentOrganization, t, handleNavigateToEditor, isViewer, currentDocument } = this.props;

    const uploader = new PersonalDocumentUploadService();
    const isSharedDocument = currentDocument?.isShared;
    const createdDocuments = await uploader.import({
      documents: documentList,
      ...(folderId && !isSharedDocument && { folderId }),
      orgId: currentOrganization?._id,
    });
    driveDocuments.forEach((driveDocument) => {
      this.handleUpdateThumbnail(driveDocument, createdDocuments);
    });

    if (isViewer) {
      handleDisplayModal(
        createdDocuments,
        DocumentService.google,
        this.getCurrentFolderType(),
        currentOrganization,
        folderId
      );
      return;
    }

    if (createdDocuments.length) {
      toastUtils.success({ message: t('openDrive.yourDocumentsWereSuccessfullyImported'), useReskinToast: true });
      handleNavigateToEditor(createdDocuments[0]._id);
    }
  };

  handlePickFileGoogle = async (data) => {
    // eslint-disable-next-line max-len
    const {
      t,
      isUpload,
      folderId,
      uploadType,
      currentOrganization,
      handlePickThirdPartyFile,
      handleVerifyBeforeUploadingFlow,
    } = this.props;
    if (!isUpload) {
      return;
    }
    const driveDocuments = data.docs;
    const { allowedUpload, errorHandler } = handleVerifyBeforeUploadingFlow(driveDocuments);

    if (!allowedUpload) {
      errorHandler();
      return;
    }

    if (!window.gapi.drive) {
      await window.gapi.client.load('drive', 'v3', null);
    }
    const remoteEmail = await googleServices.getCurrentRemoteEmail();
    if (this.getCurrentFolderType() === folderType.INDIVIDUAL && uploadType === UPLOAD_FILE_TYPE.DOCUMENT) {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'smooth',
      });
      try {
        const documentList = await this.getDocumentList(data, remoteEmail);
        await handlePickThirdPartyFile({
          documents: documentList,
          handleUploadFile: () => this.handleUploadFile({ driveDocuments, documentList }),
          destinationFolderId: folderId,
          destinationOrgId: currentOrganization?._id,
        });
      } catch (e) {
        toastUtils.error({
          message: t('importExternalDocument.failToImport', { externalService: 'Google Drive' }),
          useReskinToast: true,
        });
      }
    } else {
      this.handlePickUpFile(data);
    }
  };

  render() {
    return (
      <div
        role="button"
        tabIndex={-1}
        onClick={(e) => {
          e.stopPropagation();
          this.openPicker({});
        }}
        onKeyDown={this.props.onPickKeyDown}
      >
        {this.props.children}
      </div>
    );
  }
}

GoogleFilePicker.propTypes = {
  fileName: PropTypes.string,
  mimeType: PropTypes.string,
  isRequestAccess: PropTypes.bool,
  closeModal: PropTypes.func,
  onPicked: PropTypes.func,
  children: PropTypes.any.isRequired,
  uploadFiles: PropTypes.func,
  currentFolderType: PropTypes.string,
  onClose: PropTypes.func,
  updateDocumentData: PropTypes.func,
  isUpload: PropTypes.bool,
  multiSelect: PropTypes.bool,
  folderId: PropTypes.string,
  folderType: PropTypes.string,
  uploadType: PropTypes.string,
  currentOrganization: PropTypes.object,
  currentDocument: PropTypes.object,
  handlePickThirdPartyFile: PropTypes.func,
  t: PropTypes.func,
  handleVerifyBeforeUploadingFlow: PropTypes.func,
  handleNavigateToEditor: PropTypes.func,
  onPickKeyDown: PropTypes.func,
  isViewer: PropTypes.bool,
};

GoogleFilePicker.defaultProps = {
  fileName: '',
  mimeType: '',
  isRequestAccess: false,
  closeModal: () => {},
  uploadFiles: () => {},
  onPicked: () => {},
  currentFolderType: '',
  onClose: () => {},
  updateDocumentData: () => {},
  isUpload: true,
  multiSelect: true,
  folderId: null,
  folderType: null,
  uploadType: UPLOAD_FILE_TYPE.DOCUMENT,
  currentOrganization: {},
  currentDocument: {},
  handlePickThirdPartyFile: () => {},
  t: () => {},
  handleVerifyBeforeUploadingFlow: () => {},
  handleNavigateToEditor: () => {},
  onPickKeyDown: () => {},
  isViewer: false,
};

GoogleFilePicker.contextType = CookieWarningContext;

export default GoogleFilePicker;
