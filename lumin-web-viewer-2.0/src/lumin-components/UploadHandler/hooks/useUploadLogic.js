import axios from 'axios';
import React from 'react';
import { Trans } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { useMatch } from 'react-router';

import actions from 'actions';
import selectors from 'selectors';

import useIsUploadablePage from 'luminComponents/ReskinLayout/components/UploadingPopper/hooks/useIsUploadablePage';

import { useHomeMatch, useShallowSelector } from 'hooks';
import useGetCurrentUser from 'hooks/useGetCurrentUser';
import { useGetPresignedUrlForUploadDoc } from 'hooks/useGetPresignedUrl';
import useGetUserOrgForUpload from 'hooks/useGetUserOrgForUpload';
import { useViewerMatch } from 'hooks/useViewerMatch';

import { documentServices } from 'services';

import logger from 'helpers/logger';

import { toastUtils, file as fileUtils, eventTracking } from 'utils';
import { DocumentTypeTemplateScopeMapping, TemplateChannel, TemplateCreateMethod, TemplatePlatform } from 'utils/Factory/EventCollection/constants/TemplateEvent';

import { documentCacheBase, getCacheKey } from 'features/DocumentCaching';

import { DOCUMENT_TYPE, folderType, DOCUMENT_KIND } from 'constants/documentConstants';
import UserEventConstants from 'constants/eventConstants';
import { FULL_PROGRESS, LOGGER, ModalTypes } from 'constants/lumin-common';
import { NOTIFY_UPLOAD_KEY, ORG_TEXT } from 'constants/organizationConstants';

import useCompressThumbnail from './useCompressThumbnail';
import { store } from '../../../redux/store';

/**
 * Shared upload logic for both documents and templates
 */
const useUploadLogic = (props) => {
  const { uploadServices, enableCaching = false, kind } = props;
  const { isUploadablePage } = useIsUploadablePage();

  const { isHomePage } = useHomeMatch();
  const isOrgDocumentTab = useMatch({ path: `/${ORG_TEXT}/:orgName/documents`, end: false }) || isHomePage;
  const { isViewer } = useViewerMatch();
  const [getPresignedUrl] = useGetPresignedUrlForUploadDoc();
  const [compressThumbnail] = useCompressThumbnail();
  const currentOrganization = useGetUserOrgForUpload();
  const currentDocument = useShallowSelector(selectors.getCurrentDocument);
  const currentUser = useGetCurrentUser();

  const dispatch = useDispatch();
  const updateUploadingFile = (group) => dispatch(actions.updateUploadingFile(group));

  const isTemplate = kind === DOCUMENT_KIND.TEMPLATE;

  const getOrgId = (clientId) => {
    if (isViewer) {
      return currentOrganization?._id;
    }
    if (isTemplate) {
      return clientId;
    }
    return isOrgDocumentTab ? clientId : null;
  };

  const getUploadFolderId = (folderId) => {
    if (currentDocument && currentDocument.isShared) {
      return null;
    }
    return folderId;
  };

  const onUploadProgress = (fileId) => (progressEvent) => {
    const progress = Math.round((progressEvent.loaded * FULL_PROGRESS) / progressEvent.total);
    updateUploadingFile({
      groupId: fileId,
      progress,
    });
  };

  const displayOrganizationToast = (uploadData) => {
    const { clientId, fileName } = uploadData;
    const org = selectors.getOrganizationById(store.getState(), clientId);
    if (isViewer) {
      return;
    }
    if (org) {
      const orgName = org.organization.name;
      toastUtils.openToastMulti({
        message: (
          <Trans
            i18nKey="message.uploadDocumentToOrg "
            values={{ fileName: fileUtils.getShortFilename(fileName), orgName }}
            components={{ b: <strong /> }}
          />
        ),
        type: ModalTypes.SUCCESS,
        limit: 3,
      });
    }
  };

  const displayOrgTeamToast = (uploadData) => {
    const { clientId, fileName } = uploadData;
    const team = selectors.getTeamById(store.getState(), clientId);
    if (isViewer) {
      return;
    }
    if (team) {
      toastUtils.openToastMulti({
        message: (
          <Trans
            i18nKey="message.uploadDocument "
            values={{ fileName: fileUtils.getShortFilename(fileName) }}
            components={{ b: <strong /> }}
          />
        ),
        type: ModalTypes.SUCCESS,
      });
    }
  };

  const uploadFilesToS3 = async ({ file, thumbnail }, { cancelToken, onUploadProgress } = {}) => {
    const {
      document: documentPresignedData,
      thumbnail: thumbnailPresignedData,
      encodedUploadData,
    } = await getPresignedUrl({ documentMimeType: file.type, thumbnailMimeType: thumbnail?.type });
    await Promise.all([
      documentServices.uploadFileToS3(
        {
          file,
          presignedUrl: documentPresignedData.url,
        },
        { cancelToken, onUploadProgress }
      ),
      documentServices.uploadFileToS3({
        file: thumbnail,
        presignedUrl: thumbnailPresignedData.url,
      }),
    ]);
    return encodedUploadData;
  };

  // handle uploading document for circle and org team
  const uploadOrganizationResourceDocument = async ({ data, uploadFunction, displayToastFn }) => {
    const { file, fileId, thumbnail, clientId, source, documentType, folderId } = data;
    const uploadData = {
      file,
      thumbnail,
      fileId,
    };
    if (folderId) {
      uploadData.folderId = folderId;
    }
    switch (documentType) {
      case DOCUMENT_TYPE.ORGANIZATION: {
        if (currentUser && !isTemplate) {
          const { isNotify } =
            JSON.parse(localStorage.getItem(`${NOTIFY_UPLOAD_KEY}:${clientId}:${currentUser._id}`)) || {};
          uploadData.isNotify = isNotify;
        }
        uploadData.orgId = clientId;
        break;
      }
      case DOCUMENT_TYPE.ORGANIZATION_TEAM:
        uploadData.teamId = clientId;
        break;
      default:
        break;
    }
    const encodedUploadData = await uploadFilesToS3(
      { file, thumbnail },
      {
        cancelToken: source.token,
        onUploadProgress: onUploadProgress(fileId),
      }
    );

    const document = await uploadFunction({
      ...uploadData,
      encodedUploadData,
      fileName: file.name,
    });

    const shouldShowToast = !isUploadablePage;
    if (shouldShowToast) {
      displayToastFn(data);
    }
    return document;
  };

  const uploadDocumentToOrganization = async (data) =>
    uploadOrganizationResourceDocument({
      data,
      uploadFunction: uploadServices.uploadToOrganization,
      displayToastFn: displayOrganizationToast,
    });

  const uploadDocumentToOrgTeam = (data) =>
    uploadOrganizationResourceDocument({
      data,
      uploadFunction: uploadServices.uploadToOrgTeam,
      displayToastFn: displayOrgTeamToast,
    });

  const uploadDocumentToPersonal = async (data) => {
    const { file, fileId, fileName, thumbnail, source, clientId, folderId } = data;
    logger.logInfo({
      message: LOGGER.EVENT.FILE_UPLOADED,
      reason: LOGGER.Service.HIGH_RISK_FUNCTIONALITY_INFO,
    });
    const encodedUploadData = await uploadFilesToS3(
      { file, thumbnail },
      {
        cancelToken: source.token,
        onUploadProgress: onUploadProgress(fileId),
      }
    );
    const document = await uploadServices.uploadToPersonal({
      fileName: file.name,
      documentId: null,
      orgId: getOrgId(clientId),
      folderId,
      encodedUploadData,
    });

    const shouldShowToast = !isUploadablePage;

    if (shouldShowToast) {
      toastUtils.openToastMulti({
        message: (
          <>
            <strong>{fileUtils.getShortFilename(fileName)}</strong> have been uploaded to your Lumin Drive
          </>
        ),
        type: ModalTypes.SUCCESS,
        limit: 3,
      });
    }

    return document;
  };

  const onUpload = async (data, uploadFunction) => {
    const { CancelToken } = axios;
    const source = CancelToken.source();
    updateUploadingFile({
      groupId: data.fileId,
      cancelToken: source,
    });
    const res = await uploadFunction({
      ...data,
      ...(data.thumbnail && {
        thumbnail: await compressThumbnail(data.thumbnail),
      }),
      source,
    });

    // Cache document if enabled
    if (enableCaching) {
      const { file } = data;
      const { _id, etag } = res;
      const key = getCacheKey(_id);
      documentCacheBase.add({ key, etag, file });
    }

    // Track event
    if (isTemplate) {
      eventTracking(UserEventConstants.EventType.TEMPLATE_CREATED, {
        method: TemplateCreateMethod.FILE_UPLOAD,
        templateName: res?.name,
        luminTemplateId: res?._id,
        platform: TemplatePlatform.PDF,
        channel: TemplateChannel.TEMPLATE_LIST,
        scope: DocumentTypeTemplateScopeMapping[res?.documentType],
      });
    } else {
      eventTracking(UserEventConstants.EventType.UPLOAD_DOCUMENT, {
        LuminFileId: res?._id,
        fileName: res?.name,
        source: data?.uploadFrom,
      });
    }
    return res;
  };

  const onUploadHOC = (data) => {
    const { fileId } = data;
    const fileUpload = selectors.getUploadingDocumentByGroupId(store.getState(), fileId);
    if (!fileUpload) {
      throw new Error();
    }

    const { folder = {} } = fileUpload;
    const { entityId, folderId } = folder;

    const uploadData = {
      ...data,
      folder,
      clientId: entityId,
      folderId: getUploadFolderId(folderId),
    };

    logger.logInfo({
      message: LOGGER.EVENT.FILE_UPLOADED,
      reason: LOGGER.Service.HIGH_RISK_FUNCTIONALITY_INFO,
    });

    switch (folder.type) {
      case folderType.INDIVIDUAL:
        return onUpload(uploadData, uploadDocumentToPersonal);
      case folderType.TEAMS: {
        uploadData.documentType = DOCUMENT_TYPE.ORGANIZATION_TEAM;
        return onUpload(uploadData, uploadDocumentToOrgTeam);
      }
      case folderType.ORGANIZATION:
        uploadData.documentType = DOCUMENT_TYPE.ORGANIZATION;
        return onUpload(uploadData, uploadDocumentToOrganization);
      default:
        throw new Error();
    }
  };

  return {
    onUploadHOC,
  };
};

export default useUploadLogic;
