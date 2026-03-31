import axios from 'axios';
import { omit } from 'lodash';
import PropTypes from 'prop-types';
import React from 'react';
import { withTranslation } from 'react-i18next';
import { connect } from 'react-redux';
import { useMatch } from 'react-router';
import { compose } from 'redux';
import v4 from 'uuid/v4';

import actions from 'actions';
import selectors from 'selectors';

import ModalNotifyUploadDocument from 'luminComponents/ModalNotifyUploadDocument';
import { withHomeEditAPdfFlow } from 'luminComponents/TopFeaturesSection/hoc';

import withCurrentTeam from 'HOC/withCurrentTeam';

import useGetUploadFolderType from 'hooks/useGetUploadFolderType';
import useGetUserOrgForUpload from 'hooks/useGetUserOrgForUpload';
import useTemplatesPageMatch from 'hooks/useTemplatesPageMatch';
import { useViewerMatch } from 'hooks/useViewerMatch';

import { uploadServices, dropboxServices, oneDriveServices } from 'services';

import logger from 'helpers/logger';

import { checkDocumentType, toastUtils, UploadUtils, validator, errorUtils, getFileService, documentUtil } from 'utils';

import { folderType } from 'constants/documentConstants';
import { ModalTypes, STORAGE_TYPE } from 'constants/lumin-common';
import { ERROR_MESSAGE_TYPE } from 'constants/messages';
import { NOTIFY_UPLOAD_KEY, ORG_PATH } from 'constants/organizationConstants';

import ErrorMessageUtils from './utils/getErrorUploadMessage';
import getThumbnail from './utils/getThumbnail';
import { store } from '../../redux/store';

const propTypes = {
  updateUploadingFile: PropTypes.func.isRequired,
  addUploadingFiles: PropTypes.func.isRequired,
  children: PropTypes.func.isRequired,
  onUpload: PropTypes.func.isRequired,
  currentFolderType: PropTypes.string.isRequired,
  currentUser: PropTypes.object.isRequired,
  currentTeam: PropTypes.object,
  currentOrganization: PropTypes.object,
  currentDocument: PropTypes.object,
  organizations: PropTypes.object,
  isOrgPage: PropTypes.bool.isRequired,
  handleNavigateToEditor: PropTypes.func,
  t: PropTypes.func,
  isViewer: PropTypes.bool,
  isTemplatesPage: PropTypes.bool,
};

const defaultProps = {
  currentTeam: null,
  organizations: {},
  handleNavigateToEditor: () => {},
  t: () => {},
  currentDocument: null,
  isViewer: false,
  isTemplatesPage: false,
};

class UploadContainer extends React.PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      isOpen: false,
      files: [],
      folderId: null,
    };
  }

  componentDidMount() {
    this.isComponentMounted = true;
  }

  componentWillUnmount() {
    this.isComponentMounted = false;
  }

  handleUploadProgress = async (fileUpload) => {
    const { currentOrganization, updateUploadingFile, handleNavigateToEditor, t } = this.props;
    const isValidForUpload = selectors.isValidForUpload(store.getState());
    if (
      [UploadUtils.UploadStatus.COMPLETED, UploadUtils.UploadStatus.ERROR].includes(fileUpload.status) ||
      !isValidForUpload(fileUpload.groupId)
    ) {
      return null;
    }
    updateUploadingFile({
      groupId: fileUpload.groupId,
      status: UploadUtils.UploadStatus.UPLOADING,
      organization: currentOrganization,
    });
    let uploadStatus = null;
    let errorMessage = '';
    let errorCode = null;
    let document = null;
    let isCancelTask = false;
    try {
      document = await this.handleBeforeUploadingFile(fileUpload.fileData, fileUpload.groupId);
      uploadStatus = UploadUtils.UploadStatus.COMPLETED;
    } catch (error) {
      if (!axios.isCancel(error)) {
        const { code } = errorUtils.extractGqlError(error);
        uploadStatus = UploadUtils.UploadStatus.ERROR;
        errorMessage = ErrorMessageUtils.getErrorMessage({ t, fileUpload, error });
        errorCode = code;
      }
      isCancelTask = true;
    } finally {
      if (uploadStatus) {
        updateUploadingFile({
          groupId: fileUpload.groupId,
          status: uploadStatus,
          errorMessage,
          errorCode,
          documentId: document?._id,
          document,
        });
        if (uploadStatus === UploadUtils.UploadStatus.COMPLETED) {
          handleNavigateToEditor(document?._id, !!fileUpload.fileData?.file?.extraPayload?.isOnHomeEditAPdfFlow);
        }
      }
    }

    return isCancelTask && fileUpload.groupId;
  };

  handleErrorUploadFile = (error, data = {}) => {
    const { t } = this.props;
    if (!(axios.isCancel(error) || error.message === ERROR_MESSAGE_TYPE.CANCEL_UPLOAD) && !this.isComponentMounted) {
      const toastSetting = {
        type: ModalTypes.ERROR,
        message: ErrorMessageUtils.getUploadErrorMessage({ t, messageType: error.message, fileData: data }).of('toast'),
        limit: 3,
        useReskinToast: true,
      };
      toastUtils.openToastMulti(toastSetting);
    }
  };

  preCheckingFileUpload = (file) => {
    if (!file) {
      throw new Error(ERROR_MESSAGE_TYPE.PDF_NOT_FOUND);
    }
    const { name: fileName, type, size, extraPayload } = file;
    if (!checkDocumentType(type || file.file.mimeType)) {
      throw new Error(ERROR_MESSAGE_TYPE.PDF_UNSUPPORT_TYPE);
    }
    const { allowedUpload, maxSizeAllow } = uploadServices.checkUploadBySize(
      size,
      this.isPremiumPlan(extraPayload?.folderType)
    );
    if (!allowedUpload) {
      const pdfSizeError = new Error(ERROR_MESSAGE_TYPE.PDF_SIZE);
      pdfSizeError.metadata = {
        maxSizeAllow,
        fileName,
      };
      throw pdfSizeError;
    }
  };

  handleBeforeUploadingFile = async (fileData, fileId) => {
    const { updateUploadingFile, onUpload } = this.props;

    try {
      const { uploadFrom, file } = fileData;
      this.preCheckingFileUpload(file);
      let fileUpload = null;
      switch (uploadFrom) {
        case STORAGE_TYPE.LOCAL:
          fileUpload = await documentUtil.convertFileToBlob(file);
          break;
        case STORAGE_TYPE.GOOGLE:
          fileUpload = await getFileService.getDocument({
            remoteId: file.id,
            name: file.name,
            mimeType: file.mimeType,
            service: STORAGE_TYPE.GOOGLE,
          });
          break;
        case STORAGE_TYPE.DROPBOX:
          fileUpload = await dropboxServices.getFileFromDropbox(file.name, file.link);
          break;
        case STORAGE_TYPE.ONEDRIVE:
          fileUpload = await oneDriveServices.getFileContent({
            remoteId: file.id,
            driveId: file.parentReference.driveId,
            name: file.name,
            mimeType: file.file.mimeType,
          });
          break;
        default:
          break;
      }

      const { documentInstance, linearizedFile } = await uploadServices.linearPdfFromFiles(fileUpload);

      const thumbnail = await getThumbnail({ file, documentInstance });

      const currentFile = UploadUtils.getFileByGroupId(selectors.getUploadingDocuments(store.getState()), fileId);
      if (currentFile && UploadUtils.UploadStatus.ERROR === currentFile.status) {
        throw new Error(ERROR_MESSAGE_TYPE.CANCEL_UPLOAD);
      }
      const groupDocument = {
        groupId: fileId,
        thumbnail,
      };
      updateUploadingFile(groupDocument);
      return await onUpload({
        file: linearizedFile,
        fileId,
        fileName: file.name,
        thumbnail,
        uploadFrom,
      });
    } catch (error) {
      logger.logError({
        message: error.message,
      });
      if (errorUtils.isRateLimitError(error)) {
        this.handleErrorUploadFile({ message: ERROR_MESSAGE_TYPE.DAILY_DOCUMENT_UPLOAD });
      } else {
        this.handleErrorUploadFile(error, omit(error, ['message']));
      }
      throw error;
    }
  };

  isPremiumPlan = (folderTypeArg) => {
    const {
      isOrgPage,
      isViewer,
      currentUser,
      currentOrganization,
      currentFolderType: currentFolderTypeProp,
      organizations,
    } = this.props;
    const currentFolderType = folderTypeArg || currentFolderTypeProp;
    switch (currentFolderType) {
      case folderType.INDIVIDUAL:
        return isOrgPage || (isViewer && currentOrganization)
          ? validator.validatePremiumOrganization(currentOrganization)
          : validator.validatePremiumUser(currentUser, organizations.data);
      case folderType.TEAMS:
      case folderType.ORGANIZATION:
        return validator.validatePremiumOrganization(currentOrganization);
      default:
        return null;
    }
  };

  getClientId = () => {
    const { isOrgPage, currentFolderType, currentTeam, currentUser, currentOrganization, currentDocument } = this.props;

    switch (currentFolderType) {
      case folderType.INDIVIDUAL:
        return isOrgPage ? currentOrganization?._id : currentUser._id;
      case folderType.TEAMS:
        return currentDocument ? currentDocument.clientId : currentTeam._id;
      case folderType.ORGANIZATION:
        return currentOrganization?._id;
      default:
        return null;
    }
  };

  uploadMultipleFiles = (files, folderId) => {
    const { addUploadingFiles, currentFolderType, currentOrganization, isTemplatesPage } = this.props;
    const fileUploads = Array.from(files);
    addUploadingFiles(
      fileUploads.map((fileData) => {
        const groupId = v4();
        const { isOnHomeEditAPdfFlow, folderType: folderTypePayload, targetId } = fileData.file?.extraPayload || {};
        const folderType = isOnHomeEditAPdfFlow ? folderTypePayload : currentFolderType;
        const entityId =
          isOnHomeEditAPdfFlow && folderTypePayload ? targetId || currentOrganization?._id : this.getClientId();
        const handlerName = isTemplatesPage ? uploadServices.TEMPLATE_HANDLER : uploadServices.DOCUMENT_HANDLER;

        return {
          groupId,
          fileData,
          thumbnail: null,
          folderType,
          entityId,
          folderId,
          handlerName,
        };
      })
    );
  };

  getNotifyKey = () => {
    const { currentOrganization, currentUser } = this.props;
    return `${NOTIFY_UPLOAD_KEY}:${currentOrganization?._id}:${currentUser?._id}`;
  };

  handleShowNotifyModal = (files, folderId) => {
    const notifyKey = this.getNotifyKey();
    try {
      const { isNotify, show } = JSON.parse(localStorage.getItem(notifyKey)) || {};
      const disabledNotiBySetting = typeof isNotify === 'boolean' && typeof show === 'boolean' && !show;
      const { currentOrganization } = this.props;
      const { totalActiveMember } = currentOrganization || {};

      if (disabledNotiBySetting || totalActiveMember === 1) {
        this.uploadMultipleFiles(files, folderId);
      } else {
        this.setState({
          folderId,
          files,
          isOpen: true,
        });
      }
    } catch (e) {
      localStorage.removeItem(notifyKey);
      toastUtils.openToastMulti({
        message: 'An error has occurred! Please try again',
        type: ModalTypes.ERROR,
        useReskinToast: true,
      });
    }
  };

  uploadMultipleFilesHOF = (files, folderId = null) => {
    const { currentFolderType, isTemplatesPage } = this.props;
    const isUploadToOrg = currentFolderType === folderType.ORGANIZATION;
    const isOnHomeEditAPdfFlow = files[0].file?.extraPayload?.isOnHomeEditAPdfFlow;
    if (isUploadToOrg && !isOnHomeEditAPdfFlow && !isTemplatesPage) {
      this.handleShowNotifyModal(files, folderId);
    } else {
      this.uploadMultipleFiles(files, folderId);
    }
  };

  onNotifyButtonClick = (notShowAgain, isNotify) => {
    const { files, folderId } = this.state;
    const notifyKey = this.getNotifyKey();
    localStorage.setItem(
      notifyKey,
      JSON.stringify({
        show: !notShowAgain,
        isNotify,
      })
    );
    this.uploadMultipleFiles(files, folderId);
    this.setState({
      files: [],
      isOpen: false,
      folderId: null,
    });
  };

  render() {
    const { children } = this.props;
    const { isOpen } = this.state;
    return (
      <>
        {children({
          upload: this.uploadMultipleFilesHOF,
          handleUploadProgress: this.handleUploadProgress,
        })}
        <ModalNotifyUploadDocument
          open={isOpen}
          onConfirm={(notShowAgain) => this.onNotifyButtonClick(notShowAgain, true)}
          onCancel={(notShowAgain) => this.onNotifyButtonClick(notShowAgain, false)}
        />
      </>
    );
  }
}

UploadContainer.defaultProps = defaultProps;
UploadContainer.propTypes = propTypes;

const mapStateToProps = (state) => ({
  uploadingFiles: selectors.getUploadingDocuments(state),
  currentUser: selectors.getCurrentUser(state),
  organizations: selectors.getOrganizationList(state),
  currentDocument: selectors.getCurrentDocument(state),
});

const mapDispatchToProps = (dispatch) => ({
  addUploadingFiles: (group) => dispatch(actions.addUploadingFiles(group)),
  updateUploadingFile: (group) => dispatch(actions.updateUploadingFile(group)),
});

const EnhancedUploadContainer = (props) => {
  const isOrgPage = useMatch(ORG_PATH);
  const { isViewer } = useViewerMatch();
  const { isTemplatesPage } = useTemplatesPageMatch();
  const currentOrganization = useGetUserOrgForUpload();
  const currentFolderType = useGetUploadFolderType();
  return (
    <UploadContainer
      isOrgPage={Boolean(isOrgPage)}
      isViewer={Boolean(isViewer)}
      currentOrganization={currentOrganization}
      currentFolderType={currentFolderType}
      isTemplatesPage={isTemplatesPage}
      {...props}
    />
  );
};

export default compose(
  connect(mapStateToProps, mapDispatchToProps),
  withCurrentTeam,
  withTranslation(),
  withHomeEditAPdfFlow
)(EnhancedUploadContainer);
