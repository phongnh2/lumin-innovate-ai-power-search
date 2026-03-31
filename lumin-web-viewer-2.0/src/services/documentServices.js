/* eslint-disable no-case-declarations */
import produce from 'immer';
import { get, differenceWith, uniqWith } from 'lodash';
import pLimit from 'p-limit';
import { matchPath } from 'react-router';

import { enqueueSnackbar } from '@libs/snackbar';
import { mappingCropTypeEventTracking } from '@new-ui/components/ToolProperties/components/CropPanel/helpers/mappingCropTypeEventTracking';

import actions from 'actions';
import core from 'core';
import selectors from 'selectors';

import { DocumentQueryRetriever } from 'luminComponents/DocumentQuery/DocumentQueryProxy';

import { commandHandler, cachingFileHandler } from 'HOC/OfflineStorageHOC';

import dropboxServices from 'services/dropboxServices';
import googleServices from 'services/googleServices';
import documentGraphServices from 'services/graphServices/documentGraphServices';
import indexedDBService from 'services/indexedDBService';
import { oneDriveServices } from 'services/oneDriveServices';
import { socketService } from 'services/socketServices';
import teamServices from 'services/teamServices';

import fireEvent from 'helpers/fireEvent';
import logger from 'helpers/logger';

import compressImage from 'utils/compressImage';
import errorExtract from 'utils/error';
import documentEvent from 'utils/Factory/EventCollection/DocumentEventCollection';
import fileUtils from 'utils/file';
import { getWidgetXfdf } from 'utils/formBuildUtils';
import getFileService from 'utils/getFileService';
import { eventTracking } from 'utils/recordUtil';
import validator from 'utils/validator';

import annotationLoadObserver, { AnnotationEvent } from 'features/Annotation/utils/annotationLoadObserver';
import { annotationSyncQueue } from 'features/AnnotationSyncQueue';
import { documentCacheBase, getCacheKey } from 'features/DocumentCaching';
import { OutlineCoreUtils } from 'features/Outline/utils/outlineCore.utils';
import { OutlineStoreUtils } from 'features/Outline/utils/outlineStore.utils';

import { CUSTOM_EVENT } from 'constants/customEvent';
import {
  DOCUMENT_TYPE,
  folderType,
  OPENED_BY,
  ACCOUNTABLE_BY,
  BULK_UPDATE_LIST_TITLE,
  AnnotationSubjectMapping,
} from 'constants/documentConstants';
import UserEventConstants from 'constants/eventConstants';
import { MAXIMUM_MULTIPART_DRIVE_UPLOAD_LIMIT } from 'constants/fileSize';
import { LANGUAGES } from 'constants/language';
import {
  STATUS_CODE,
  MANIPULATION_TYPE,
  CHECKBOX_TYPE,
  STORAGE_TYPE,
  STORAGE_TYPE_DESC,
  LOGGER,
  MAX_THUMBNAIL_SIZE,
  THIRD_PARTY_DOCUMENT_SERVICES,
} from 'constants/lumin-common';
import { TOUR } from 'constants/plan';
import { ROUTE_MATCH } from 'constants/Routers';
import { SOCKET_EMIT } from 'constants/socketConstant';

import documentServices from './documentServices';
import { documentSyncQueue } from './documentSyncQueue';
import PersonalDocumentUploadService from './personalDocumentUploadService';
import { store } from '../redux/store';
import { socket } from '../socket';

/**
 * Don't remove this line, it's workaround for circular dependency
 */
// eslint-disable-next-line import/order
import Axios from '@libs/axios';

const { dispatch } = store;
const limitPromise = pLimit(1);

function storeManipulationToDb(newManipulation) {
  const insertedManipulationData = { ...newManipulation };
  const docId = core.getDocument()?.getDocumentId?.() ?? '';
  const annotList = core.getAnnotationManager().getAnnotationsList();
  switch (newManipulation.type) {
    case MANIPULATION_TYPE.ROTATE_PAGE: {
      const {
        option: { pageIndexes: pageIndexesData },
      } = newManipulation;
      insertedManipulationData.option.pageIndexes = pageIndexesData.map((page) => {
        const unqAnnot = annotList.find((annot) => annot.PageNumber === parseInt(page) && annot.Subject === 'LUnique');
        return { data: page, belongsTo: unqAnnot?.Id };
      });
      break;
    }
    case MANIPULATION_TYPE.CROP_PAGE: {
      const {
        option: { pageCrops },
      } = newManipulation;
      insertedManipulationData.option.pageCrops = pageCrops.map((page) => {
        const unqAnnot = annotList.find((annot) => annot.PageNumber === parseInt(page) && annot.Subject === 'LUnique');
        return { data: page, belongsTo: unqAnnot?.Id };
      });
      break;
    }
    default: {
      break;
    }
  }
  commandHandler.insertManipulation(docId, insertedManipulationData);
}

async function overrideDocumentToS3({
  file,
  remoteId,
  documentId,
  thumbnail,
  thumbnailRemoteId,
  uploadDocFrom,
  increaseVersion = false,
  isAppliedOCR = false,
  signal,
}) {
  socketService.modifyDocumentContent(documentId, { status: 'syncing', increaseVersion, isAppliedOCR });
  const { encodedUploadData } = await documentServices.uploadDocumentWithThumbnailToS3({
    thumbnail,
    thumbnailRemoteId,
    file,
    remoteId,
    uploadDocFrom,
    signal,
  });
  return Axios.axiosInstance.post(
    '/document/v2/sync-file-s3',
    {
      documentId,
      encodedUploadData,
      increaseVersion,
    },
    { signal }
  );
}

async function uploadDocumentWithThumbnailToS3({
  thumbnail,
  thumbnailRemoteId,
  file,
  remoteId,
  uploadDocFrom,
  signal,
}) {
  const {
    thumbnail: thumbnailPresignedData,
    document: filePresignedData,
    encodedUploadData,
  } = await documentServices.getPresignedUrlForUploadDoc(
    {
      thumbnailMimeType: thumbnail?.type,
      documentMimeType: file.type,
      thumbnailKey: thumbnailRemoteId,
      documentKey: remoteId,
      uploadDocFrom,
    },
    { signal }
  );

  const compressedThumbnail =
    thumbnail &&
    (await compressImage(thumbnail, {
      convertSize: MAX_THUMBNAIL_SIZE,
      maxWidth: 800,
      maxHeight: 400,
    }));

  await Promise.all([
    thumbnailPresignedData &&
      documentServices.uploadFileToS3({
        presignedUrl: thumbnailPresignedData.url,
        file: compressedThumbnail,
        options: { signal },
      }),
    documentServices.uploadFileToS3({
      presignedUrl: filePresignedData.url,
      file,
      options: { signal },
    }),
  ]);
  return { thumbnail: thumbnailPresignedData, document: filePresignedData, encodedUploadData };
}

async function syncFileToS3Exclusive(currentDocument, options = {}) {
  const result = await documentSyncQueue.addToQueue(currentDocument, options);

  await annotationSyncQueue.processQueueForDocument(currentDocument._id);

  return result;
}

async function uploadFileToBananaSign(currentDocument) {
  const file = await getFileService.getLinearizedDocumentFile(currentDocument.name);
  if (!file) {
    throw new Error(LOGGER.Service.PDFTRON);
  }

  return new Promise(async (resolve) => {
    try {
      const { document: filePresignedData } = await getPresignedUrlForLuminSignIntegration({
        documentMimeType: file.type,
      });

      await documentServices.uploadFileToS3({
        file,
        presignedUrl: filePresignedData.url,
      });

      resolve(filePresignedData.fields.key);
    } catch (e) {
      throw new Error(LOGGER.Service.GRAPHQL_ERROR);
    }
  });
}

async function uploadThumbnail(documentId, thumbnail) {
  if (!thumbnail) {
    return null;
  }
  const compressedThumbnail = await compressImage(thumbnail, {
    convertSize: MAX_THUMBNAIL_SIZE,
    maxWidth: 800,
    maxHeight: 400,
  });
  const presignedResult = await documentServices.getPresignedUrlForUploadThumbnail({
    thumbnailMimeType: compressedThumbnail.type,
  });
  if (!presignedResult) {
    return null;
  }
  await documentServices.uploadFileToS3({
    file: compressedThumbnail,
    presignedUrl: presignedResult.thumbnail.url,
  });
  return Axios.axiosInstance.post('/document/v2/upload-thumbnail', {
    encodedUploadData: presignedResult.encodedUploadData,
    documentId,
  });
}

function getDocumentIdFromPath() {
  const pathNameRegex = new RegExp(`^/(${Object.values(LANGUAGES).join('|')})/`);
  const pathName = window.location.pathname.replace(pathNameRegex, '/');
  const viewerMatch = matchPath({ path: ROUTE_MATCH.VIEWER, end: false }, pathName);
  const templateViewerMatch = matchPath({ path: ROUTE_MATCH.TEMPLATE_VIEWER, end: false }, pathName);
  if (!viewerMatch && !templateViewerMatch) {
    return '';
  }
  return get(viewerMatch || templateViewerMatch, 'params.documentId');
}

/**
 *
 * @deprecated we have been removed the tour document permanently
 */
function isRealTime() {
  const documentId = getDocumentIdFromPath();
  return ![process.env.DOCUMENT_TOUR_ID, TOUR].includes(documentId);
}

function isOfflineMode() {
  const state = store.getState();
  return selectors.isOffline(state);
}

function insertFileToDrive({ fileData, fileMetadata }) {
  return googleServices.insertFileToDrive({ fileData, fileMetadata });
}

function syncFileToDrive({ fileId, fileMetadata, fileData }) {
  if (fileData.size > MAXIMUM_MULTIPART_DRIVE_UPLOAD_LIMIT) {
    return googleServices.uploadFileToDriveResumable({ fileId, fileMetadata, fileData });
  }
  return googleServices.uploadFileToDrive({ fileId, fileMetadata, fileData });
}

function insertFileToDropbox({ fileName, file, folderPath = '' }, { signal } = {}) {
  return dropboxServices.insertFileToDropbox({ fileName, file, folderPath }, { signal });
}

function syncFileToDropbox({ fileId, file }, { signal } = {}) {
  return dropboxServices.uploadFileToDropbox({ fileId, file }, { signal });
}

function renameFileFromDropbox(fileId, fileName, pathDisplay, { signal } = {}) {
  return dropboxServices.renameFile(fileId, fileName, pathDisplay, { signal });
}

function getDropboxFileInfo(fileId, { signal } = {}) {
  return dropboxServices.getFileMetaData(fileId, { signal });
}

async function rotatePages({ currentDocument, pageIndexes, angle }) {
  if (documentServices.isOfflineMode() && !currentDocument.isSystemFile) {
    storeManipulationToDb({ type: MANIPULATION_TYPE.ROTATE_PAGE, option: { pageIndexes, angle } });
  } else if (documentServices.isRealTime()) {
    const option = {
      pageIndexes,
      angle,
    };
    commandHandler.insertTempAction(currentDocument._id, [
      {
        type: 'manipulation',
        method: MANIPULATION_TYPE.ROTATE_PAGE,
        option,
      },
    ]);
    const data = {
      type: MANIPULATION_TYPE.ROTATE_PAGE,
      option,
    };
    emitData({ document: currentDocument, type: SOCKET_EMIT.MANIPULATION, data });
    fireEvent(CUSTOM_EVENT.MANIPULATION_CHANGED);
  }
  await core.rotatePages(pageIndexes, angle);
  core.updateView();
}

function emitSocketRemovePage({ currentDocument, deletedAnnotIds, totalPages, option, manipulationId }) {
  if (documentServices.isRealTime() && !currentDocument.isSystemFile) {
    const data = {
      type: MANIPULATION_TYPE.REMOVE_PAGE,
      totalPages,
      deletedAnnotIds,
      roomId: currentDocument._id,
      option,
      manipulationId,
    };
    commandHandler.insertTempAction(currentDocument._id, [
      {
        type: 'manipulation',
        method: MANIPULATION_TYPE.REMOVE_PAGE,
        option,
      },
    ]);
    eventTracking(UserEventConstants.EventType.DOCUMENT_PAGE_DELETED, { pageToDelete: option?.pagesRemove.length });
    emitManipulationChanged({ document: currentDocument, data });
  }
}

async function removePages({ pagesRemove }) {
  await core.removePages(pagesRemove);
  core.updateView();
}

async function movePages({ currentDocument, pagesToMove, insertBeforePage, manipulationId }) {
  const positionToInsert = parseInt(insertBeforePage);
  if (documentServices.isRealTime() && !currentDocument.isSystemFile) {
    const option = {
      pagesToMove,
      insertBeforePage,
    };
    commandHandler.insertTempAction(currentDocument._id, [
      {
        type: 'manipulation',
        method: MANIPULATION_TYPE.MOVE_PAGE,
        option,
      },
    ]);
    const data = {
      type: MANIPULATION_TYPE.MOVE_PAGE,
      option,
      manipulationId,
    };
    eventTracking(UserEventConstants.EventType.DOCUMENT_PAGE_MOVED, { from: pagesToMove, to: positionToInsert });

    emitManipulationChanged({ document: currentDocument, data });
  }

  let toPage = positionToInsert;
  if (pagesToMove !== positionToInsert) {
    if (pagesToMove > positionToInsert) {
      toPage = positionToInsert;
    }
    if (pagesToMove < positionToInsert) {
      toPage = positionToInsert + 1;
    }
  }

  await core.movePages([pagesToMove], toPage);
  core.updateView();
}

function emitSocketCropPage({ currentDocument, pageCrops, cropType, top, bottom, left, right }) {
  if (!currentDocument.isSystemFile) {
    if (documentServices.isOfflineMode()) {
      documentServices.storeManipulationToDb({
        type: MANIPULATION_TYPE.CROP_PAGE,
        option: {
          pageCrops,
          top,
          bottom,
          left,
          right,
        },
      });
    } else if (documentServices.isRealTime()) {
      const option = {
        pageCrops,
        top,
        bottom,
        left,
        right,
      };
      commandHandler.insertTempAction(currentDocument._id, [
        {
          type: 'manipulation',
          method: MANIPULATION_TYPE.CROP_PAGE,
          option,
        },
      ]);
      const data = {
        type: MANIPULATION_TYPE.CROP_PAGE,
        option,
      };

      const type = mappingCropTypeEventTracking({ cropType });
      eventTracking(UserEventConstants.EventType.DOCUMENT_CROP_PAGE, {
        top,
        bottom,
        left,
        right,
        type,
      });
      emitData({ document: currentDocument, type: SOCKET_EMIT.MANIPULATION, data });
      fireEvent(CUSTOM_EVENT.MANIPULATION_CHANGED);
    }
  }
}

async function cropPages({ pageCrops, top, bottom, left, right, isUndo, croppedAnnotations }) {
  await core.cropPages(pageCrops, top, bottom, left, right);
  if (isUndo) {
    core.addAnnotations(croppedAnnotations, { imported: true });
  }
  core.updateView();
}

async function insertBlankPages({ currentDocument, insertPages, sizePage, totalPages, manipulationId }) {
  if (documentServices.isRealTime() && !currentDocument.isSystemFile) {
    const option = {
      insertPages,
    };
    commandHandler.insertTempAction(currentDocument._id, [
      {
        type: 'manipulation',
        method: MANIPULATION_TYPE.INSERT_BLANK_PAGE,
        option,
      },
    ]);
    const data = {
      type: MANIPULATION_TYPE.INSERT_BLANK_PAGE,
      totalPages,
      option,
      manipulationId,
    };
    eventTracking(UserEventConstants.EventType.DOCUMENT_INSERT_BLANK_PAGE, {
      position: insertPages[0],
      numberOfPages: insertPages.length,
    });
    emitManipulationChanged({ document: currentDocument, data });
  }
  await core.insertBlankPages(insertPages, sizePage);
}

async function emitSocketMergePages({
  currentDocument,
  totalPages,
  numberOfPageToMerge,
  positionToMerge,
  totalPagesBeforeMerge,
  isSaveLimit,
}) {
  if (documentServices.isRealTime() && !currentDocument.isSystemFile) {
    socket.emit(SOCKET_EMIT.SEND_MANIPULATION_CHANGED, {
      type: MANIPULATION_TYPE.MERGE_PAGE,
      roomId: currentDocument._id,
      option: {
        numberOfPageToMerge,
        positionToMerge,
        totalPagesBeforeMerge,
        totalPages,
        isSaveLimit,
        shouldSaveOutlines: !OutlineStoreUtils.isExceedSaveThreshold(),
      },
    });
  }
}

async function emitSocketFormField({ currentDocument, currentUser, isSaveToDb, allowEmpty = false }) {
  const widgets = core
    .getAnnotationsList()
    .filter((annot) => annot instanceof window.Core.Annotations.WidgetAnnotation);
  if (!widgets.length && !allowEmpty) {
    return;
  }
  const xfdf = await getWidgetXfdf(isSaveToDb);
  const data = {
    annotationType: AnnotationSubjectMapping.widget,
    annotationAction: 'add',
    userId: currentUser._id,
    email: currentUser.email,
    xfdf,
    annotationId: currentDocument._id,
  };

  if (isOfflineMode()) {
    commandHandler.insertAnnotation(currentDocument._id, {
      manager: core.getAnnotationManager(),
      annots: [
        {
          annotation: xfdf,
          belongsTo: '',
          ...data,
        },
      ],
    });
  } else {
    commandHandler.insertTempAction(currentDocument._id, [
      {
        type: 'annotation',
        xfdf,
        annotationId: currentDocument._id,
      },
    ]);
    annotationSyncQueue.addFormFieldAnnotation(currentDocument._id, data)?.catch(console.error);
  }
}

function documentManipulationChangedCallback({ data, document }) {
  if (data.type === MANIPULATION_TYPE.INSERT_BLANK_PAGE && document.isOfflineValid) {
    const { unqId, unqXfdf } = cachingFileHandler._addUniqueFlagForEachPage(document._id, {
      pages: data.option.insertPages.map((page) => page - 1),
    });
    cachingFileHandler.updateDocumentPropertyById(document._id, {
      addedAnnotation: {
        xfdf: unqXfdf,
        annotationId: unqId,
      },
    });
  }
}

async function emitData({ document, type, data }) {
  if (document.isSystemFile && !document.unsaved) {
    dispatch(actions.setCurrentDocument({ ...document, unsaved: true }));
    return;
  }
  if (type === SOCKET_EMIT.ANNOTATION_CHANGE) {
    await socketService.annotationChange({ ...data, roomId: document._id });
    return;
  }

  socket.emit(SOCKET_EMIT.SEND_MANIPULATION_CHANGED, { ...data, roomId: document._id }, () =>
    documentManipulationChangedCallback({ data, document })
  );
}

function emitManipulationChanged({ document, data }) {
  if (document.isSystemFile && !document.unsaved) {
    dispatch(actions.setCurrentDocument({ ...document, unsaved: true }));
    return;
  }
  limitPromise(
    () =>
      new Promise((resolve) => {
        fireEvent(CUSTOM_EVENT.MANIPULATION_CHANGED);
        socket.emit(
          SOCKET_EMIT.SEND_MANIPULATION_CHANGED,
          { ...data, roomId: document._id, shouldSaveOutlines: !OutlineStoreUtils.isExceedSaveThreshold() },
          () => {
            if (data.type === MANIPULATION_TYPE.INSERT_BLANK_PAGE && document.isOfflineValid) {
              const { unqId, unqXfdf } = cachingFileHandler._addUniqueFlagForEachPage(document._id, {
                pages: data.option.insertPages.map((page) => page - 1),
              });
              cachingFileHandler.updateDocumentPropertyById(document._id, {
                addedAnnotation: {
                  xfdf: unqXfdf,
                  annotationId: unqId,
                },
              });
            }
            resolve();
          }
        );
      })
  );
}

function requestAccessDocument({ documentId, documentRole, message }) {
  return documentGraphServices.requestAccessDocument({
    documentId,
    documentRole,
    message,
  });
}

function acceptRequestAccessDocument({ documentId, requesterIds }) {
  requesterIds.forEach((_) => {
    eventTracking(UserEventConstants.EventType.ACCEPT_DOCUMENT_PERMISSION, {
      LuminFileId: documentId,
    });
  });
  return documentGraphServices.acceptRequestAccessDocument({
    documentId,
    requesterIds,
  });
}

function rejectRequestAccessDocument({ documentId, requesterIds }) {
  requesterIds.forEach((_) => {
    eventTracking(UserEventConstants.EventType.REJECT_DOCUMENT_PERMISSION, {
      LuminFileId: documentId,
    });
  });
  return documentGraphServices.rejectRequestAccessDocument({
    documentId,
    requesterIds,
  });
}

async function getRequestAccessDocsList({ documentId, cursor, limit }) {
  const res = await documentGraphServices.getRequestAccessDocsList({
    documentId,
    cursor,
    limit,
  });
  return res.data.getRequestAccessDocsList;
}

async function getIndividualShareesDocument({ documentId, requestAccessInput }) {
  const res = await documentGraphServices.getIndividualShareesDocument({
    documentId,
    requestAccessInput,
  });
  return res.data;
}

async function getFullShareesDocument({ internalMemberInput, requestAccessInput }) {
  const res = await documentGraphServices.getFullShareesDocument({
    internalMemberInput,
    requestAccessInput,
  });
  return res.data;
}

async function getDocument({ documentId }) {
  return documentGraphServices.getDocument({
    documentId,
  });
}

function deleteDocument(data) {
  return documentGraphServices.deleteDocument(data);
}

function deleteSharedDocuments({ documentIds }) {
  return documentGraphServices.deleteSharedDocuments({ documentIds });
}

function shareDocumentByEmail({ emails, message, documentId, role }) {
  return documentGraphServices.shareDocumentByEmail({
    emails,
    message,
    documentId,
    role,
  });
}

function updateShareSettingDocument({ linkType, permission, documentId }) {
  return documentGraphServices.updateShareSettingDocument({ linkType, permission, documentId });
}

async function getShareInviteByEmailList({ documentId }) {
  const res = await documentGraphServices.getShareInviteByEmailList({ documentId });
  return res.data.getShareInviteByEmailList.sharees;
}

async function removeDocumentPermission({ documentId, email }) {
  const res = await documentGraphServices.removeDocumentPermission({ documentId, email });
  return res.data.removeDocumentPermission;
}

async function updateDocumentPermission({ documentId, role, email }) {
  const res = await documentGraphServices.updateDocumentPermission({
    documentId,
    role,
    email,
  });
  return res.data.updateDocumentPermission;
}

function getRemoveDocumentSocketType(documentData, orgData = [], teams = []) {
  const type = 'DELETE';
  const { currentUser } = store.getState().auth;
  const { clientId: documentClientId } = documentData;
  switch (documentData.documentType) {
    case DOCUMENT_TYPE.PERSONAL:
      if (documentData.isPersonal && documentData.ownerId === currentUser._id) {
        return type;
      }
      return null;
    case DOCUMENT_TYPE.ORGANIZATION_TEAM: {
      const isTeamMember = Boolean(teams.find((team) => team._id === documentClientId));
      return isTeamMember ? type : null;
    }
    case DOCUMENT_TYPE.ORGANIZATION: {
      const isOrgMember = Boolean((orgData || []).find((org) => org.organization._id === documentClientId));
      return isOrgMember ? type : null;
    }
    default:
      return null;
  }
}
async function getPDFInfo(currentDocument) {
  const isGoogleStorage = currentDocument.service === STORAGE_TYPE.GOOGLE;
  const fileInfo = await documentGraphServices.getPDFInfo(currentDocument._id);
  if (isGoogleStorage && currentDocument.enableGoogleSync) {
    const { size } = await googleServices.getFileInfo(currentDocument.remoteId, 'size', 'getPDFInfo');
    return { ...fileInfo.data.getPDFInfo, fileSize: size };
  }
  return fileInfo.data.getPDFInfo;
}

async function downloadDocument(documentId) {
  const res = await documentGraphServices.downloadDocument(documentId);
  return res.data.downloadDocument;
}

async function deleteMultipleDocument({ documentIds, clientId, isNotify = true }) {
  await Promise.all([
    documentCacheBase.deleteMultiple(documentIds.map((documentId) => getCacheKey(documentId))),
    indexedDBService.deleteAutoDetectFormFields(documentIds),
  ]);
  const res = await documentGraphServices.deleteMultipleDocument({
    documentIds,
    clientId,
    isNotify,
  });
  return res.data.deleteMultipleDocument;
}

async function onConfirmDelete({ document, notify, isSharedDocument, t }) {
  const state = store.getState();
  const teams = selectors.getTeams(state);
  const currentUser = selectors.getCurrentUser(state) ?? {};
  const {
    organizations: { data: orgData },
  } = state.organization;
  const { documentType, _id: documentId, clientId: documentClientId } = document;
  const deleteDocumentParams = {
    documentId,
    clientId: currentUser._id,
  };
  let deleteMessage = THIRD_PARTY_DOCUMENT_SERVICES.includes(document.service)
    ? t('modalDeleteDoc.documentHasBeenRemoved')
    : t('modalDeleteDoc.documentHasBeenDeleted');
  switch (documentType) {
    case DOCUMENT_TYPE.PERSONAL:
      break;
    case DOCUMENT_TYPE.ORGANIZATION_TEAM:
      // Check if current user has external role of team document
      if (selectors.getTeamById(state, documentClientId)) {
        deleteDocumentParams.clientId = documentClientId;
      }
      break;
    case DOCUMENT_TYPE.ORGANIZATION:
      {
        // Check if current user has external role of org document
        const { organization } = selectors.getOrganizationById(state, documentClientId) || {};
        if (organization) {
          deleteDocumentParams.clientId = documentClientId;
          deleteDocumentParams.isNotify = notify;
        }
      }
      break;
    default:
      enqueueSnackbar({
        message: t('common.unknownError'),
        variant: 'error',
        preventDuplicate: true,
      });
      return;
  }
  try {
    const key = getCacheKey(documentId);
    await Promise.all([documentCacheBase.delete(key), indexedDBService.deleteAutoDetectFormFields([documentId])]);
    if (isSharedDocument) {
      deleteMessage = t('modalDeleteDoc.documentHasBeenRemoved');
      await documentServices.deleteSharedDocuments({
        ...deleteDocumentParams,
        documentIds: [deleteDocumentParams.documentId],
      });
    } else {
      await documentServices.deleteDocument(deleteDocumentParams);
    }

    documentEvent.deleteDocument({
      LuminFileId: documentId,
      LuminUserId: deleteDocumentParams.clientId,
    });
    socket.emit(SOCKET_EMIT.REMOVE_DOCUMENT, {
      documentId: document._id,
      userId: currentUser._id,
      type: documentServices.getRemoveDocumentSocketType(document, orgData, teams),
    });

    enqueueSnackbar({
      message: deleteMessage,
      variant: 'success',
    });
  } catch (e) {
    enqueueSnackbar({
      message: t('modalDeleteDoc.failedToRemoveDocument'),
      variant: 'error',
    });
  }
}

async function getTotalDocuments({ clientId, ownedFilterCondition, lastModifiedFilterCondition, folderId }) {
  const res = await documentGraphServices.getTotalDocuments({
    clientId,
    ownedFilterCondition,
    lastModifiedFilterCondition,
    folderId,
  });
  return res.data.getTotalDocuments;
}

function getCurrentDocumentList(currentFolderType, { teamId, orgId }) {
  switch (currentFolderType) {
    case folderType.INDIVIDUAL:
    case folderType.STARRED:
      return DocumentQueryRetriever(currentFolderType, {});
    case folderType.TEAMS:
      return DocumentQueryRetriever(currentFolderType, { teamId });
    case folderType.ORGANIZATION:
      return DocumentQueryRetriever(currentFolderType, { orgId });
    case folderType.SHARED:
      return DocumentQueryRetriever(currentFolderType, {});
    default:
      return [];
  }
}

async function getDocumentInfo({ document, userInfo, organizations }) {
  const { documentType, clientId, ownerOfTeamDocument, isShared, isGuest } = document;
  const documentStatus = {
    isPremium: false,
    openedBy: OPENED_BY.OTHER,
    accountableBy: ACCOUNTABLE_BY.PERSONAL,
    targetId: '',
  };
  const documentReference = {
    accountableBy: ACCOUNTABLE_BY.PERSONAL,
    refId: clientId,
    documentId: document._id,
    data: {},
  };

  if (!userInfo) {
    return [documentStatus, documentReference];
  }

  documentStatus.targetId = userInfo._id;
  const isNotGuestOrSharedUser = !isShared && !isGuest;
  switch (documentType) {
    case DOCUMENT_TYPE.ORGANIZATION_TEAM: {
      if (isNotGuestOrSharedUser) {
        const team = await teamServices.getTeamDetail(clientId);
        const orgId = get(team, 'data.team.belongsTo.targetId', null);
        const ownerOrgDoc = organizations.find(({ organization }) => organization._id === orgId);
        if (ownerOfTeamDocument) {
          documentStatus.accountableBy = ACCOUNTABLE_BY.ORGANIZATION;
          documentStatus.openedBy = OPENED_BY.MANAGER;
          documentStatus.targetId = orgId;
        }

        documentReference.accountableBy = ACCOUNTABLE_BY.ORGANIZATION;
        documentReference.refId = orgId;
        documentReference.data = ownerOrgDoc?.organization || {};
      }
      break;
    }
    case DOCUMENT_TYPE.ORGANIZATION: {
      if (isNotGuestOrSharedUser) {
        const ownerOrgDoc = organizations.find(({ organization }) => organization._id === clientId);
        if (ownerOfTeamDocument) {
          documentStatus.accountableBy = ACCOUNTABLE_BY.ORGANIZATION;
          documentStatus.openedBy = OPENED_BY.MANAGER;
          documentStatus.targetId = clientId;
        }
        documentReference.refId = clientId;
        documentReference.accountableBy = ACCOUNTABLE_BY.ORGANIZATION;
        documentReference.data = ownerOrgDoc.organization;
      }
      break;
    }
    case DOCUMENT_TYPE.PERSONAL: {
      const workspaceId = get(document, 'belongsTo.workspaceId');
      if (isNotGuestOrSharedUser && workspaceId) {
        const ownerOrgDoc = organizations.find(({ organization }) => organization._id === workspaceId);
        documentReference.accountableBy = ACCOUNTABLE_BY.ORGANIZATION;
        documentReference.data = ownerOrgDoc.organization;
        documentReference.refId = workspaceId;
      }
      break;
    }
    default:
      break;
  }

  documentStatus.isPremium = validator.validatePremiumUser(userInfo, organizations);

  return [documentStatus, documentReference];
}

function duplicateDocument({ documentName, destinationId, destinationType, notifyUpload, documentId, file }) {
  return documentGraphServices.duplicateDocument({
    documentName,
    destinationId,
    destinationType,
    notifyUpload,
    documentId,
    file,
  });
}

function duplicateDocumentToFolder({ documentName, folderId, notifyUpload, documentId, file }) {
  return documentGraphServices.duplicateDocumentToFolder({
    documentName,
    folderId,
    notifyUpload,
    documentId,
    file,
  });
}

function moveDocuments({ documentIds, destinationType, destinationId, isNotify, file, documentName }) {
  return documentGraphServices.moveDocuments({
    documentIds,
    destinationType,
    destinationId,
    isNotify,
    file,
    documentName,
  });
}

const documentIdEquivalentComparator = (origin, peer) => origin._id === peer._id;

function setSelectedList({ selectedList, data, type }) {
  return produce(selectedList, (draft) => {
    switch (type) {
      case CHECKBOX_TYPE.SELECT:
        draft.push(...data);
        const unique = uniqWith(draft, documentIdEquivalentComparator);
        draft.splice(0, draft.length, ...unique);
        break;

      case CHECKBOX_TYPE.DESELECT:
        const remaining = differenceWith(draft, data, documentIdEquivalentComparator);
        draft.splice(0, draft.length, ...remaining);
        break;

      case CHECKBOX_TYPE.DELETE:
        draft.splice(0); // clear the array
        break;

      case CHECKBOX_TYPE.ALL:
      case CHECKBOX_TYPE.SELECT_ONE:
        draft.splice(0, draft.length, ...data);
        break;

      default:
        // no changes
        break;
    }
  });
}

function moveDocumentsToFolder({ documentIds, folderId, isNotify, file, documentName }) {
  return documentGraphServices.moveDocumentsToFolder({
    documentIds,
    folderId,
    isNotify,
    file,
    documentName,
  });
}

const renameDocumentToThirdParty = async ({ storageType, payload, t }) => {
  const storageDesc = { storageType: STORAGE_TYPE_DESC[storageType] };
  const handler = {
    [STORAGE_TYPE.GOOGLE]: googleServices.renameFileToDrive,
    [STORAGE_TYPE.ONEDRIVE]: oneDriveServices.renameFile,
  }[storageType];

  if (!handler) {
    enqueueSnackbar({
      message: t('renameDocument.docNameChanged'),
      variant: 'success',
    });
    return;
  }

  try {
    await handler(payload);
    enqueueSnackbar({
      variant: 'success',
      message: t('renameDocument.docNameChangedAndSyned', storageDesc),
    });
  } catch (error) {
    enqueueSnackbar({
      variant: 'warning',
      message: t('renameDocument.message', storageDesc),
    });
  }
};

function renameDocument({ document, newName, t }) {
  return new Promise(async (resolve) => {
    const extension = fileUtils.getExtension(document.name);
    const result = await documentGraphServices.renameDocument({
      documentId: document._id,
      newName: `${newName}.${extension}`,
    });
    if (result.statusCode === STATUS_CODE.SUCCEED && result.data.nameWithExtension) {
      socket.emit(SOCKET_EMIT.UPDATE_DOCUMENT, {
        roomId: document._id,
        type: 'rename',
      });
      const payload = {
        fileId: document.remoteId,
        driveId: document.externalStorageAttributes?.driveId,
        newName: result.data.nameWithExtension,
      };
      await renameDocumentToThirdParty({ storageType: document.service, payload, t });
      resolve(result.data.nameWithExtension);
    } else {
      enqueueSnackbar({
        message: result.message,
        variant: 'error',
      });
      resolve(false);
    }
  });
}

function getDocumentById(documentId) {
  return documentGraphServices.getDocumentById(documentId);
}

function createUserStartedDocument() {
  return documentGraphServices.createUserStartedDocument();
}

function createOrgStartedDocument({ orgId }) {
  return documentGraphServices.createOrgStartedDocument({ orgId });
}

function bulkUpdateSharingPermission({ documentId, list, permission }) {
  const input = {
    documentId,
    role: permission,
  };
  return Promise.all(
    list.map((value) => {
      switch (value) {
        case BULK_UPDATE_LIST_TITLE.MEMBER_LIST:
          return documentGraphServices.bulkUpdateDocumentMemberList(input);
        case BULK_UPDATE_LIST_TITLE.INVITED_LIST:
          return documentGraphServices.bulkUpdateDocumentInvitedList(input);
        default:
          throw new Error('Invalid bulk update list');
      }
    })
  );
}

async function injectOutlinesToDocument() {
  try {
    const pdfDoc = await core.getDocument().getPDFDoc();
    await OutlineCoreUtils.importOutlinesToDoc({ pdfDoc });
  } catch (error) {
    logger.logError({
      reason: LOGGER.Service.INJECT_OUTLINES_ERROR,
      error,
    });
  }
}

async function saveDocument(
  fileHandle,
  { fromSaveAs = false, successCallback = () => {}, onErrorHandler = () => {}, name } = {}
) {
  try {
    if (!fromSaveAs) {
      await fileHandle.getFile();
    }
    const writable = await fileHandle.createWritable();
    await injectOutlinesToDocument();
    const file = await getFileService.getLinearizedDocumentFile(name);
    await writable.write(file);
    await writable.close();
    successCallback(fileHandle, file.size);
  } catch (e) {
    onErrorHandler(e);
  }

  return fileHandle;
}

async function saveAsDocument(document, options = {}) {
  const saveOptions = {
    suggestedName: fileUtils.getFilenameWithoutExtension(document.name),
    startIn: document.fileHandle,
    types: [
      {
        description: 'PDF Files',
        accept: {
          'application/pdf': ['.pdf'],
        },
      },
    ],
  };
  try {
    const handle = await window.showSaveFilePicker(saveOptions);
    documentServices.saveDocument(handle, { ...options, fromSaveAs: true, name: document.name });
  } catch (error) {
    logger.logInfo({
      message: JSON.stringify(error),
      reason: LOGGER.Service.WINDOW_EXCEPTIONS,
    });
  }
}

async function trackingUserUseDocument(documentId) {
  const res = await documentGraphServices.trackingUserUseDocument(documentId);
  return res.data.trackingUserUseDocument;
}

async function countDocStackUsage(documentId) {
  const res = await documentGraphServices.countDocStackUsage(documentId);
  return res.data.countDocStackUsage;
}

async function getRequestAccessDocById(documentId, requesterId) {
  const res = await documentGraphServices.getRequestAccessDocById(documentId, requesterId);
  return res.data.getRequestAccessDocById;
}

function importThirdPartyDocuments({ folderId, userId, documents }) {
  return documentGraphServices.importThirdPartyDocuments({
    folderId,
    userId,
    documents,
  });
}

async function getDocStackInfo(documentId, { signal }) {
  const res = await documentGraphServices.getDocStackInfo(documentId, { signal });
  return res.data.getDocStackInfo;
}

export const uploadDocumentFromDrive = async ({ document, orgId }) => {
  const documentData = [
    {
      remoteId: document.remoteId,
      name: document.name,
      size: document.size * 1,
      mimeType: document.mimeType,
      service: 'google',
      remoteEmail: document.remoteEmail,
    },
  ];
  const uploader = new PersonalDocumentUploadService();
  const createdDocuments = await uploader.import({
    documents: documentData,
    orgId,
  });
  return createdDocuments[0]._id;
};

const getAnnotations = async ({ documentId, fetchByGraphql = false, fetchOptions = {} }) => {
  const annots = [];
  let isFetchBySignedUrl = false;
  try {
    if (process.env.DISABLE_EDITOR_SERVER || fetchByGraphql) {
      const fetchedAnnots = await documentGraphServices.getAnnotations(documentId, fetchOptions);
      annots.push(...fetchedAnnots);
    } else {
      isFetchBySignedUrl = true;
      const annotationSignedUrl = await documentGraphServices.getAnnotationSignedUrl(documentId, fetchOptions);

      const response = await Axios.editorInstance.get(annotationSignedUrl, fetchOptions);
      annots.push(...(response.data || []));
    }
    logger.logInfo({
      message: 'Total annots',
      reason: 'Log total annotations of document',
      attributes: {
        _id: documentId,
        totalAnnots: annots.length,
        isFetchBySignedUrl,
      },
    });
    annotationLoadObserver.setAnnotations(annots);
    annotationLoadObserver.notify(AnnotationEvent.ExternalAnnotLoaded);
    return annots;
  } catch (error) {
    if (errorExtract.isAbortError(error)) {
      return [];
    }
    annotationLoadObserver.notify(AnnotationEvent.ExternalAnnotLoaded);
    logger.logError({
      reason: LOGGER.Service.GET_ANNOTATIONS_ERROR,
      error,
      attributes: {
        isFetchBySignedUrl,
      },
    });
    if (isFetchBySignedUrl) {
      return getAnnotations({ documentId, fetchByGraphql: true });
    }
    return [];
  }
};

async function checkThirdPartyStorage({ remoteIds }) {
  const res = await documentGraphServices.checkThirdPartyStorage({ remoteIds });
  return res.data.checkThirdPartyStorage;
}

async function findAvailableLocation({ type, searchKey, orgId }, { signal }) {
  const res = await documentGraphServices.findAvailableLocation(
    {
      type,
      searchKey,
      orgId,
    },
    { signal }
  );

  return res.data.findAvailableLocation;
}

function updateBookmarks({ documentId, bookmarksString, currentUser }) {
  if (bookmarksString) {
    const bookmarks = JSON.parse(bookmarksString).map((item) => ({
      message: item.bookmark[currentUser.email],
      page: parseInt(item.page),
    }));
    documentGraphServices.updateBookmarks({ documentId, bookmarks });
  }
}

function createPDFForm({ remoteId, formStaticPath, source }) {
  return documentGraphServices.createPDFForm({ remoteId, formStaticPath, source });
}

function createPdfFromStaticToolUpload({ encodeData, orgId }) {
  return documentGraphServices.createPdfFromStaticToolUpload({ encodeData, orgId });
}

function putFileToS3ByPresignedUrl({ presignedUrl, file }) {
  return Axios.axios.put(presignedUrl, file);
}

function uploadFileToS3(
  { presignedUrl, file, headers = {}, options = {} },
  { cancelToken, onUploadProgress } = {}
) {
  const { signal } = options;
  return Axios.axios.put(presignedUrl, file, {
    headers: { 'Content-Type': file.type, ...headers },
    cancelToken,
    onUploadProgress,
    signal,
  });
}

async function backupDocumentForDrive(document) {
  if (!document.premiumToolsInfo.restoreOriginal || document.backupInfo || !document.remoteId) {
    return;
  }
  const originalFileUrl = await documentGraphServices.getDocumentOriginalFileUrl(document._id);
  if (originalFileUrl) {
    return;
  }
  const { revisions } = await googleServices.getFileRevisions(document.remoteId);
  // eslint-disable-next-line no-magic-numbers
  const previousFile = await googleServices.getPreviousFileVersionContent(document, revisions[revisions.length - 2].id);
  const { document: presignedData, encodedUploadData } = await documentGraphServices.getPresignedUrlForDocument({
    documentId: document._id,
    documentMimeType: previousFile.type,
  });
  await uploadFileToS3({
    presignedUrl: presignedData.url,
    file: previousFile,
  });
  await documentGraphServices.createDocumentBackupInfo({
    documentId: document._id,
    encodedUploadData,
  });
  fireEvent('refetchDocument');
}

async function deleteSignedUrlImage({ currentDocument, remoteIds }, { signal }) {
  if (currentDocument.isSystemFile) {
    return;
  }

  if (!documentServices.isOfflineMode()) {
    documentGraphServices.deleteDocumentImages(
      {
        documentId: currentDocument._id,
        remoteIds,
      },
      { signal }
    );
  }

  if (signal?.aborted) {
    return;
  }

  if (currentDocument.isOfflineValid) {
    cachingFileHandler.deleteDocumentImageUrlById(currentDocument._id, remoteIds);
  }
}

async function uploadDriveDocumentTemporary({ _id, name }) {
  const { document: presignedData, encodedUploadData } = await documentGraphServices.getPresignedUrlForTemporaryDrive(
    _id
  );
  const file = await getFileService.getLinearizedDocumentFile(name);
  await uploadFileToS3({ presignedUrl: presignedData.url, file });
  await documentGraphServices.createTemporaryContentForDrive({ documentId: _id, encodedUploadData });
  const etag = await documentGraphServices.getDocumentEtag(_id);

  await documentCacheBase.updateCache({
    key: getCacheKey(_id),
    etag,
    file,
  });
}

async function removeDriveDocumentTemporary(documentId) {
  await documentGraphServices.deleteTemporaryContentForDrive(documentId);
  dispatch(actions.setCurrentDocument({ signedUrl: '' }));
}

async function getCurrentDocumentSize(currentDocument) {
  const file = await getFileService.getLinearizedDocumentFile(currentDocument.name);
  return file.size;
}

function getPresignedUrlForUploadDoc(params, { signal } = {}) {
  return documentGraphServices.getPresignedUrlForUploadDoc(params, { signal });
}

function getPresignedUrlForLuminSignIntegration(params) {
  return documentGraphServices.getPresignedUrlForLuminSignIntegration(params);
}

function getPresignedUrlForUploadThumbnail(params) {
  return documentGraphServices.getPresignedUrlForUploadThumbnail(params);
}

function getSignedUrlForOCR({ documentId, totalParts }) {
  return documentGraphServices.getSignedUrlForOCR({
    documentId,
    totalParts,
  });
}

async function uploadTemporaryDocument(currentDocument, key, convertType) {
  const { document: presignedData } = await documentGraphServices.getTemporaryDocumentPresignedUrl(
    currentDocument._id,
    key,
    convertType
  );
  const file = await getFileService.getLinearizedDocumentFile(currentDocument.name, {
    shouldRemoveSecurity: true,
  });
  await uploadFileToS3({ presignedUrl: presignedData.url, file });
}

function getDocumentByRemoteAndClientId({ remoteId, clientId }) {
  return documentGraphServices.getDocumentByRemoteAndClientId({ remoteId, clientId });
}

async function getPromptInviteUsersBanner({ accessToken, forceUpdate, googleAuthorizationEmail, orgId }, { signal }) {
  const res = await documentGraphServices.getPromptInviteUsersBanner(
    {
      accessToken,
      forceUpdate,
      googleAuthorizationEmail,
      orgId,
    },
    { signal }
  );

  return res.data.getPromptInviteUsersBanner;
}

function createPresignedFormFieldDetectionUrl(input, { signal }) {
  return documentGraphServices.createPresignedFormFieldDetectionUrl(input, { signal });
}

function batchCreatePresignedFormFieldDetectionUrl(inputs, { signal }) {
  return documentGraphServices.batchCreatePresignedFormFieldDetectionUrl(inputs, { signal });
}

function processAppliedFormFields(input) {
  return documentGraphServices.processAppliedFormFields(input);
}

function checkDownloadMultipleDocuments(input, fetchOptions) {
  return documentGraphServices.checkDownloadMultipleDocuments(input, fetchOptions);
}

function updateStackedDocuments(input) {
  return documentGraphServices.updateStackedDocuments(input);
}

function checkShareThirdPartyDocument(input) {
  return documentGraphServices.checkShareThirdPartyDocument(input);
}

export default {
  overrideDocumentToS3,
  insertFileToDrive,
  syncFileToDrive,
  rotatePages,
  removePages,
  movePages,
  cropPages,
  emitSocketMergePages,
  insertBlankPages,
  insertFileToDropbox,
  syncFileToDropbox,
  renameFileFromDropbox,
  getDropboxFileInfo,
  uploadFileToBananaSign,
  uploadThumbnail,
  emitSocketRemovePage,
  emitSocketCropPage,
  emitManipulationChanged,
  syncFileToS3Exclusive,
  isRealTime,
  requestAccessDocument,
  acceptRequestAccessDocument,
  rejectRequestAccessDocument,
  getRequestAccessDocsList,
  getDocument,
  deleteDocument,
  shareDocumentByEmail,
  updateShareSettingDocument,
  getShareInviteByEmailList,
  removeDocumentPermission,
  updateDocumentPermission,
  getRemoveDocumentSocketType,
  getPDFInfo,
  deleteMultipleDocument,
  deleteSharedDocuments,
  onConfirmDelete,
  getTotalDocuments,
  getCurrentDocumentList,
  getDocumentInfo,
  getIndividualShareesDocument,
  getFullShareesDocument,
  emitData,
  duplicateDocument,
  duplicateDocumentToFolder,
  moveDocuments,
  setSelectedList,
  moveDocumentsToFolder,
  renameDocument,
  getDocumentById,
  bulkUpdateSharingPermission,
  storeManipulationToDb,
  isOfflineMode,
  saveDocument,
  saveAsDocument,
  downloadDocument,
  emitSocketFormField,
  createUserStartedDocument,
  createOrgStartedDocument,
  trackingUserUseDocument,
  getRequestAccessDocById,
  importThirdPartyDocuments,
  getDocStackInfo,
  uploadDocumentFromDrive,
  getAnnotations,
  checkThirdPartyStorage,
  findAvailableLocation,
  updateBookmarks,
  createPDFForm,
  createPdfFromStaticToolUpload,
  uploadFileToS3,
  backupDocumentForDrive,
  deleteSignedUrlImage,
  getPresignedUrlForUploadDoc,
  uploadDocumentWithThumbnailToS3,
  putFileToS3ByPresignedUrl,
  getPresignedUrlForUploadThumbnail,
  getPresignedUrlForLuminSignIntegration,
  getDocumentByRemoteAndClientId,
  uploadDriveDocumentTemporary,
  removeDriveDocumentTemporary,
  getCurrentDocumentSize,
  getSignedUrlForOCR,
  uploadTemporaryDocument,
  getDocumentIdFromPath,
  getPromptInviteUsersBanner,
  createPresignedFormFieldDetectionUrl,
  countDocStackUsage,
  processAppliedFormFields,
  checkDownloadMultipleDocuments,
  updateStackedDocuments,
  checkShareThirdPartyDocument,
  batchCreatePresignedFormFieldDetectionUrl,
};
