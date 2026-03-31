import axios from 'axios';
import PropTypes from 'prop-types';
import React from 'react';
import { useDispatch } from 'react-redux';

import actions from 'actions';
import selectors from 'selectors';

import { useTranslation } from 'hooks';

import { uploadServices, dropboxServices } from 'services';
import templateServices from 'services/templateServices';

import logger from 'helpers/logger';

import { UploadUtils, toastUtils, getFileService, documentUtil } from 'utils';
import errorInterceptor from 'utils/errorInterceptor';
import templateEvent from 'utils/Factory/EventCollection/TemplateEventCollection';

import {
  FULL_PROGRESS, LOGGER, ModalTypes, STORAGE_TYPE,
} from 'constants/lumin-common';
import { TEMPLATE_TABS, TEMPLATE_UPDATE_ACTIONS } from 'constants/templateConstant';

import { store } from '../../../redux/store';

const ERROR_MESSAGE_TYPE = {
  CANCEL_UPLOAD: 'cancel_upload',
  DEFAULT: 'default',
};

/**
 * @deprecated old layout
 */
const withUploadTemplateProcess = (Component) => {
  const HOC = (props) => {
    const { t } = useTranslation();
    const { onListChanged } = props;
    const dispatch = useDispatch();
    const updateUploadingFile = (data) => dispatch(actions.updateUploadingFile(data));

    const addNewTemplate = (template) => onListChanged(template, TEMPLATE_UPDATE_ACTIONS.ADD);

    const onUpload = async (data) => {
      const {
        fileId, file, name, thumbnail, description, isNotify, templateType,
      } = data;
      const fileUpload = selectors.getUploadingDocumentByGroupId(store.getState(), fileId);
      if (!fileUpload) {
        throw new Error();
      }

      const { CancelToken } = axios;
      const source = CancelToken.source();
      const { folder: { entityId } } = fileUpload;
      const uploadData = {
        file,
        name,
        thumbnail,
        description,
        fileId,
        isNotify,
      };

      switch (templateType) {
        case TEMPLATE_TABS.TEAM:
          uploadData.teamId = entityId;
          break;
        case TEMPLATE_TABS.ORGANIZATION:
          uploadData.orgId = entityId;
          break;
        default:
          break;
      }

      updateUploadingFile({
        groupId: fileId,
        cancelToken: source,
      });

      logger.logInfo({
        message: LOGGER.EVENT.FILE_UPLOADED,
        reason: LOGGER.Service.HIGH_RISK_FUNCTIONALITY_INFO,
      });

      return templateServices.from(templateType).upload({
        ...uploadData,
        cancelToken: source.token,
        onUploadProgress(progressEvent) {
          const progress = Math.round(
            (progressEvent.loaded * FULL_PROGRESS) / progressEvent.total,
          );
          updateUploadingFile({
            groupId: fileId,
            progress,
          });
        },
      });
    };

    const handleErrorUploadFile = (error) => {
      if (!(axios.isCancel(error) || error.message === ERROR_MESSAGE_TYPE.CANCEL_UPLOAD)) {
        const toastSetting = {
          type: ModalTypes.ERROR,
          message: error.message,
          limit: 3,
        };
        toastUtils.openToastMulti(toastSetting);
      }
    };

    const handleUpload = async (
      fileData,
      fileId,
    ) => {
      try {
        const {
          file, name, description, thumbnail, isNotify, uploadFrom, templateType,
        } = fileData;

        let fileUpload = file;
        let thumbnailUpload = thumbnail;
        switch (uploadFrom) {
          case STORAGE_TYPE.GOOGLE:
            fileUpload = await getFileService.getDocument({
              remoteId: file.id,
              name: file.name,
              mimeType: file.mimeType,
              service: STORAGE_TYPE.GOOGLE,
            });
            break;
          case STORAGE_TYPE.DROPBOX:
            fileUpload = await dropboxServices.getFileFromDropbox(
              file.name,
              file.link,
            );
            break;
          default:
            break;
        }

        const { documentInstance, linearizedFile } = await uploadServices.linearPdfFromFiles(fileUpload, {
          unlockPassword: true,
          passwordModalMessage: t('templatePage.passwordModalMessage'),
        });
        const includeFormFields = await documentUtil.includeFormFields(documentInstance);
        if (!thumbnailUpload) {
          thumbnailUpload = await uploadServices.getThumbnailDocument(documentInstance);
        }
        const currentFile = UploadUtils.getFileByGroupId(selectors.getUploadingDocuments(store.getState()), fileId);
        if (currentFile && UploadUtils.UploadStatus.ERROR === currentFile.status) {
          throw new Error(ERROR_MESSAGE_TYPE.CANCEL_UPLOAD);
        }
        const groupDocument = {
          groupId: fileId,
          thumbnail: thumbnailUpload,
        };
        updateUploadingFile(groupDocument);
        const newTemplate = await onUpload({
          fileId,
          name,
          description,
          file: linearizedFile,
          thumbnail: thumbnailUpload,
          isNotify,
          templateType,
        });
        templateEvent.uploadSuccess({
          fileId: newTemplate._id,
          fileName: name,
          containFillableFields: includeFormFields,
          destination: templateType,
        });
        return newTemplate;
      } catch (error) {
        handleErrorUploadFile(error);
        throw error;
      }
    };

    const handleUploadProgress = async (fileUpload) => {
      const {
        status, groupId, fileData, thumbnail, isNotify,
      } = fileUpload;
      const isValidForUpload = selectors.isValidForUpload(store.getState());

      if (
        [UploadUtils.UploadStatus.COMPLETED, UploadUtils.UploadStatus.ERROR].includes(status) ||
        !isValidForUpload(groupId)
      ) {
        return;
      }
      updateUploadingFile({
        groupId,
        status: UploadUtils.UploadStatus.UPLOADING,
      });
      let uploadStatus = null;
      let errorMessage = '';
      let template = null;
      let isCancelTask = false;
      try {
        // eslint-disable-next-line no-await-in-loop
        template = await handleUpload({ ...fileData, thumbnail, isNotify }, groupId);
        addNewTemplate(template);
        uploadStatus = UploadUtils.UploadStatus.COMPLETED;
      } catch (error) {
        if (!axios.isCancel(error)) {
          uploadStatus = UploadUtils.UploadStatus.ERROR;
          errorMessage = errorInterceptor.getTemplateErrorMessage(error);
        }
        isCancelTask = true;
      } finally {
        if (uploadStatus) {
          updateUploadingFile({
            groupId,
            status: uploadStatus,
            errorMessage,
            templateId: template?._id,
          });
        }
      }

      return isCancelTask && groupId;
    };

    return (
      <Component {...props} handlerName={uploadServices.TEMPLATE_HANDLER} handleUploadProgress={handleUploadProgress} />
    );
  };

  HOC.propTypes = {
    onListChanged: PropTypes.func.isRequired,
  };

  return HOC;
};

export default withUploadTemplateProcess;
