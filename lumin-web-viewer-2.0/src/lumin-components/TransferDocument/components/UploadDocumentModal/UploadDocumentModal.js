import axios from 'axios';
import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { Trans } from 'react-i18next';
import { useSelector, shallowEqual } from 'react-redux';

import selectors from 'selectors';

import { storageHandler, systemFileHandler } from 'HOC/OfflineStorageHOC';

import { useTabletMatch, useTranslation } from 'hooks';
import { useViewerMatch } from 'hooks/useViewerMatch';

import documentServices from 'services/documentServices';
import organizationServices from 'services/organizationServices';
import uploadServices from 'services/uploadServices';

import errorExtract from 'utils/error';
import errorInterceptor from 'utils/errorInterceptor';
import { fileUtils } from 'utils/file';
import getFileService from 'utils/getFileService';
import toastUtils from 'utils/toastUtils';

import { DOCUMENT_TYPE, MAX_LENGTH_DOCUMENT_NAME, MAX_SIZE_UPLOAD_DOCUMENT } from 'constants/documentConstants';
import { general, images, office } from 'constants/documentType';
import { ErrorCode, DefaultErrorCode } from 'constants/errorCode';
import { ModalTypes } from 'constants/lumin-common';
import {
  ERROR_MESSAGE_DOCUMENT,
  ERROR_MESSAGE_LIMIT_REQUESTS,
  DEVICE_FILE_ERROR_MAPPING,
  getUploadOverFileSizeError,
} from 'constants/messages';
import { MAXIMUM_ORG_TOTAL_MEMBER_PUSH_NOTIFICATION } from 'constants/organizationConstants';

import { useDestination } from '../../hooks/useDestination';
import TransferDocument from '../../TransferDocumentLibrary';
import ExpandedList from '../ExpandedList';

function UploadDocumentModal({ document, visible, onClose, title, submitTitle }) {
  const {
    initialSource,
    initialDestination,
    expandedList,
    expandedStatus,
    changeToNewSource,
    navigateTo,
    breadcrumb,
    search,
    loading,
    getInfoOf,
  } = useDestination({ document });
  const { t } = useTranslation();
  const [data, setData] = useState({
    documentName: fileUtils.getFilenameWithoutExtension(document.name),
    notifyUpload: false,
    destination: initialDestination,
  });

  const currentUser = useSelector(selectors.getCurrentUser, shallowEqual);
  const { isViewer } = useViewerMatch();

  const [submitStatus, setSubmitStatus] = useState({
    isSubmitting: false,
    title: submitTitle,
  });
  const [errorName, setErrorName] = useState('');
  const [error, setError] = useState(null);
  const isTabletMatched = useTabletMatch();

  const onBlurNameField = () => {
    const trimName = data.documentName.trim();
    if (!trimName) {
      setErrorName(t('errorMessage.fieldRequired'));
      return;
    }
    if (trimName.length > MAX_LENGTH_DOCUMENT_NAME) {
      setErrorName(t(ERROR_MESSAGE_DOCUMENT.MAX_LENGTH.key, ERROR_MESSAGE_DOCUMENT.MAX_LENGTH.interpolation));
    }
  };

  const handleError = (e) => {
    const message = errorInterceptor.getDocumentErrorMessage(e);
    setError(message);
  };

  const onSubmit = async () => {
    const {
      documentName,
      destination: { id: destinationId, type: destinationType, belongsTo },
      notifyUpload,
    } = data;
    const { fileHandle, thumbnail, _id } = document;
    try {
      setError(null);
      setSubmitStatus({ isSubmitting: true });
      let file = null;
      if (isViewer) {
        file = await getFileService.getLinearizedDocumentFile(documentName);
      } else {
        const isGranted = await systemFileHandler.preCheckSystemFile(fileHandle, { mode: 'read' });
        if (!isGranted) {
          onClose();
        }
        file = await fileHandle.getFile();
      }
      const { allowedUpload } = uploadServices.checkUploadBySize(file.size, true);
      if (!allowedUpload) {
        throw new Error('File size must be less than 200 MB.');
      }
      const fileExtension = fileUtils.getExtension(file.name);
      const documentFileName = `${documentName}.${fileExtension}`;
      const uploadedData = {
        fileName: documentFileName,
      };
      const fileType =
        file.type ||
        general[fileExtension.toUpperCase()] ||
        images[fileExtension.toUpperCase()] ||
        office[fileExtension.toUpperCase()];
      const newFile = new File([file], documentFileName, {
        type: fileType,
        lastModified: file.lastModified,
      });
      const { linearizedFile, documentInstance } = await uploadServices.linearPdfFromFiles(newFile);
      const thumbnailUrl = `${getFileService.getThumbnailUrl(thumbnail)}?v=${_id}`;
      const thumbnailCached = await storageHandler.getFile(thumbnailUrl);
      let thumbnailUpload;
      if (thumbnailCached) {
        thumbnailUpload = await thumbnailCached.clone().blob();
      } else {
        thumbnailUpload = await uploadServices.getThumbnailDocument(documentInstance);
      }
      let uploadedDocument = null;
      const uploadedType = destinationType === DOCUMENT_TYPE.FOLDER ? belongsTo.type : destinationType;
      switch (uploadedType) {
        case DOCUMENT_TYPE.PERSONAL:
          {
            const desData = belongsTo
              ? {
                  folderId: destinationId,
                  clientId: belongsTo.id,
                }
              : {
                  clientId: destinationId,
                };
            uploadedDocument = await uploadServices.handleUploadDocumentToPersonal({
              ...uploadedData,
              ...desData,
              file: linearizedFile,
              thumbnail: thumbnailUpload,
            });
          }
          break;
        case DOCUMENT_TYPE.ORGANIZATION:
          {
            const desData = belongsTo
              ? {
                  folderId: destinationId,
                  orgId: belongsTo.id,
                }
              : {
                  orgId: destinationId,
                };
            const { encodedUploadData } = await documentServices.uploadDocumentWithThumbnailToS3({
              file: linearizedFile,
              thumbnail: thumbnailUpload,
            });
            uploadedDocument = await organizationServices.uploadDocumentToOrganization(
              {
                ...uploadedData,
                ...desData,
                encodedUploadData,
                isNotify: notifyUpload,
              },
              {}
            );
          }
          break;
        case DOCUMENT_TYPE.ORGANIZATION_TEAM:
          {
            const desData = belongsTo
              ? {
                  folderId: destinationId,
                  teamId: belongsTo.id,
                }
              : {
                  teamId: destinationId,
                };
            const { encodedUploadData } = await documentServices.uploadDocumentWithThumbnailToS3({
              file: linearizedFile,
              thumbnail: thumbnailUpload,
            });
            uploadedDocument = await organizationServices.uploadDocumentToOrgTeam(
              {
                ...uploadedData,
                ...desData,
                encodedUploadData,
              },
              {}
            );
          }
          break;
        default:
          return;
      }
      await documentServices.updateBookmarks({
        documentId: uploadedDocument._id,
        bookmarksString: document.bookmarks,
        currentUser,
      });
      toastUtils.openToastMulti({
        message: (
          <Trans
            i18nKey="message.uploadDocument"
            values={{ fileName: fileUtils.getShortFilename(documentName) }}
            components={{ b: <strong /> }}
          />
        ),
        type: ModalTypes.SUCCESS,
      });
      await systemFileHandler.delete(document);
      window.forceOut = true;
      onClose();
      const openUrl = `/viewer/${uploadedDocument._id}`;
      if (isViewer) {
        window.location.replace(openUrl);
      } else {
        window.open(openUrl, '_blank');
      }
    } catch (e) {
      setSubmitStatus({ isSubmitting: false, title: submitTitle });
      if (errorExtract.isGraphError(e)) {
        // eslint-disable-next-line no-use-before-define
        handleError(e);
        return;
      }
      if (axios.isAxiosError(e)) {
        const code = e.response?.data?.code;
        switch (code) {
          case ErrorCode.Document.OVER_FILE_SIZE_FREE:
            setError(getUploadOverFileSizeError(MAX_SIZE_UPLOAD_DOCUMENT.FREE));
            break;
          case DefaultErrorCode.TOO_MANY_REQUESTS:
            setError(ERROR_MESSAGE_LIMIT_REQUESTS);
            break;
          default:
            break;
        }
        return;
      }
      setError(DEVICE_FILE_ERROR_MAPPING[e.message] || e.message);
    }
  };

  return (
    <TransferDocument.Container open={visible} onClose={onClose} initialSource={initialSource}>
      <TransferDocument.Header
        toolTipProps={{
          title: t('modalUploadDoc.tooltipUpload'),
          placement: isTabletMatched ? 'right' : 'bottom',
        }}
      >
        {title}
      </TransferDocument.Header>
      <TransferDocument.Error error={error} />
      <TransferDocument.NameInput
        label={t('common.name')}
        placeholder={t('modalUploadDoc.documentName')}
        value={data.documentName}
        errorMessage={errorName}
        onChange={(e) => {
          setErrorName('');
          setData({ ...data, documentName: e.target.value });
        }}
        onBlur={onBlurNameField}
      />
      <TransferDocument.DropdownSources onChange={changeToNewSource}>
        {t('modalUploadDoc.destination')}
      </TransferDocument.DropdownSources>
      <TransferDocument.CustomDivider />
      {loading ? (
        <TransferDocument.CustomLoading />
      ) : (
        <ExpandedList
          initialDestination={initialDestination}
          breadcrumb={breadcrumb}
          navigateTo={navigateTo}
          search={search}
          expandedList={expandedList}
          expandedStatus={expandedStatus}
          data={data}
          setData={setData}
        />
      )}
      {((data.destination.type === DOCUMENT_TYPE.ORGANIZATION && breadcrumb.length === 1) ||
        (breadcrumb.length === 2 && expandedStatus.activeSourceName === DOCUMENT_TYPE.FOLDER)) && (
        <TransferDocument.Checkbox
          value={data.notifyUpload}
          onChange={() => setData({ ...data, notifyUpload: !data.notifyUpload })}
        >
          {getInfoOf(data.destination).totalMember > MAXIMUM_ORG_TOTAL_MEMBER_PUSH_NOTIFICATION
            ? t('modalUploadDoc.notifyAdministrators')
            : t('modalUploadDoc.notifyEveryone')}
        </TransferDocument.Checkbox>
      )}
      <TransferDocument.GroupButton
        onSubmit={onSubmit}
        onClose={onClose}
        submitStatus={submitStatus}
        hasError={errorName || !data.destination.id}
      />
    </TransferDocument.Container>
  );
}

UploadDocumentModal.propTypes = {
  document: PropTypes.object.isRequired,
  visible: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  submitTitle: PropTypes.string.isRequired,
};

export default UploadDocumentModal;
