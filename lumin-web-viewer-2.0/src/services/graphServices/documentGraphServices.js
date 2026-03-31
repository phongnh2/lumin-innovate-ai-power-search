/// <reference path="./documentGraphServices.d.ts" />
import produce from 'immer';

import errorUtils from 'utils/error';
import { verifySignedResponse } from 'utils/verifySignedResponse';

import { FETCH_POLICY } from 'constants/graphConstant';

import { client, clientUpload } from '../../apollo';
import {
  STAR_DOCUMENT,
  UPDATE_MIMETYPE,
  CREATE_PDF_FORM,
  GET_FORM_LIST,
  SUB_UPDATE_BOOKMARK,
  REQUEST_ACCESS_DOCUMENT,
  ACCEPT_REQUEST_ACCESS_DOCUMENT,
  REJECT_REQUEST_ACCESS_DOCUMENT,
  GET_REQUEST_ACCESS_DOCLIST,
  DELETE_DOCUMENT,
  SHARE_DOCUMENT_BY_EMAIL,
  UPDATE_SHARE_SETTING_DOCUMENT,
  GET_SHARE_INVITE_BY_EMAIL,
  REMOVE_SHARE_DOCUMENT_PERMISSION,
  UPDATE_SHARE_DOCUMENT_PERMISSION,
  GET_MENTION_LIST_BY_DOCUMENT_ID,
  GET_PDF_INFO,
  DELETE_MULTIPLE_DOCUMENT,
  DELETE_SHARED_DOCUMENTS,
  GET_TOTAL_DOCUMENTS,
  SUB_DELETE_ORIGINAL_DOCUMENT,
  GET_INDIVIDUAL_SHAREES_DOCUMENT,
  GET_FULL_SHAREES_DOCUMENT,
  DUPLICATE_DOCUMENT,
  MOVE_DOCUMENTS,
  MOVE_DOCUMENTS_TO_FOLDER,
  DUPLICATE_DOCUMENT_TO_FOLDER,
  RENAME_DOCUMENT,
  GET_DOCUMENT_BY_ID,
  BULK_UPDATE_DOCUMENT_INVITED_LIST,
  BULK_UPDATE_DOCUMENT_MEMBER_LIST,
  DOWNLOAD_DOCUMENT,
  CREATE_USER_STARTED_DOCUMENT,
  CREATE_ORG_STARTED_DOCUMENT,
  TRACKING_USER_USE_DOCUMENT,
  GET_REQUEST_ACCESS_DOC_BY_ID,
  CREATE_DOCUMENTS,
  GET_DOC_STACK_INFO,
  CHECK_THIRD_PARTY_STORAGE,
  GET_ANNOTATIONS,
  GET_PREMIUM_TOOLS_INFO_FOR_USER,
  FIND_AVAILABLE_LOCATION,
  UPDATE_BOOKMARKS,
  GET_PRESIGNED_URL_FOR_IMAGE,
  GET_ORIGINAL_FILE_URL,
  RESTORE_ORIGINAL_VERSION,
  DELETE_DOCUMENT_IMAGES,
  GET_PRESIGNED_URL_UPLOAD_DOC,
  GET_PRESIGNED_URL_FOR_LUMIN_SIGN_INTERGRATION,
  GET_PRESIGNED_URL_UPLOAD_THUMBNAIL,
  GET_SIGNED_URL_FOR_SIGNATURE,
  GET_DOCUMENT_BY_REMOTEID_AND_CLIENTID,
  GET_PRESIGNED_URL_FOR_TEMPORARY_DRIVE,
  CREATE_TEMPORARY_CONTENT_FOR_DRIVE,
  DELETE_TEMPORARY_CONTENT_FOR_DRIVE,
  GET_DOCUMENT_ETAG,
  GET_SIGNED_URL_TO_USE_OCR,
  GET_TEMPORARY_DOCUMENT_PRESIGNED_URL,
  GET_PRESIGNED_URL_FOR_MULTIPLE_DOCUMENT_IMAGES,
  CREATE_PDF_FROM_STATIC_TOOL_UPLOAD,
  GET_SIGNED_URL_FOR_ANNOTATIONS,
  REFRESH_DOCUMENT_IMAGE_SIGNED_URLS,
  GET_PROMPT_INVITE_GOOGLE_USERS,
  GET_FORM_FIELD,
  GET_DOCUMENT_OUTLINES,
  IMPORT_DOCUMENT_OUTLINES,
  GET_DOCUMENT_WITH_ANNOTATION_AND_FORM_FIELD,
  CREATE_PRESIGNED_FORM_FIELD_DETECTION_URL,
  COUNT_DOC_STACK_USAGE,
  GET_DOCUMENTS_IN_FOLDER,
  CHECK_DOWNLOAD_MULTIPLE_DOCUMENTS,
  UPDATE_STACKED_DOCUMENTS,
  PROCESS_APPLIED_FORM_FIELDS,
  GET_SIGNED_URL_FOR_EXTERNAL_PDF,
  CHECK_SHARE_THIRD_PARTY_DOCUMENT,
  BATCH_CREATE_PRESIGNED_FORM_FIELD_DETECTION_URL,
  GET_DOCUMENT_TEMPLATE_WITH_FORM_FIELD,
  UPDATE_DOCUMENT_MIME_TYPE_TO_PDF,
} from '../../graphql/DocumentGraph';

const handleUploadFileGraph = async (file, payload) => {
  if (!file) {
    try {
      return await client.mutate(payload);
    } catch (e) {
      const firstError = e.graphQLErrors[0];
      const error = errorUtils.deriveAxiosGraphToHttpError(firstError);
      error.graphQLErrors = e.graphQLErrors;
      throw error;
    }
  }
  const newPayload = {
    ...payload,
    variables: {
      ...payload.variables,
      file,
    },
  };
  return clientUpload(newPayload);
};

function starDocumentMutation(data) {
  const { document, currentUser, clientId, callback } = data;

  if (!currentUser._id) {
    return;
  }
  return client.mutate({
    mutation: STAR_DOCUMENT,
    variables: {
      input: {
        documentId: document._id,
        clientId,
        _id: currentUser._id,
      },
    },
    // eslint-disable-next-line no-unused-vars
    update: (cache, { data: { starDocument } }) => {
      callback && callback(starDocument);
    },
  });
}

async function updateMimeType(documentId) {
  const response = await client.mutate({
    mutation: UPDATE_MIMETYPE,
    variables: {
      documentId,
    },
  });
  return response.data.updateMimeType;
}

async function createPDFForm({ remoteId, formStaticPath, source }) {
  const res = await client.mutate({
    mutation: CREATE_PDF_FORM,
    variables: {
      input: {
        _id: remoteId,
        formStaticPath,
        source,
      },
    },
  });
  return res.data.createPDFForm;
}

async function createPdfFromStaticToolUpload({ encodeData, orgId }) {
  const res = await client.mutate({
    mutation: CREATE_PDF_FROM_STATIC_TOOL_UPLOAD,
    variables: {
      input: {
        encodedUploadData: encodeData,
        orgId,
      },
    },
  });
  return res.data.createPdfFromStaticToolUpload;
}

function getFormList({ category, pageNumber }) {
  return client.query({
    query: GET_FORM_LIST,
    variables: {
      input: {
        category,
        pageNumber,
      },
    },
  });
}

function subUpdateBookmark({ userId, documentId, callback }) {
  return client
    .subscribe({
      query: SUB_UPDATE_BOOKMARK,
      variables: {
        input: {
          clientId: userId,
          documentId,
        },
      },
    })
    .subscribe({
      next({ data }) {
        callback(data.updateBookmark);
      },
      error(err) {
        console.log(err);
      },
    });
}

function requestAccessDocument({ documentId, documentRole, message }) {
  return client.mutate({
    mutation: REQUEST_ACCESS_DOCUMENT,
    variables: {
      input: {
        documentId,
        documentRole,
        message,
      },
    },
  });
}

function rejectRequestAccessDocument({ documentId, requesterIds }) {
  return client.mutate({
    mutation: REJECT_REQUEST_ACCESS_DOCUMENT,
    variables: {
      input: {
        documentId,
        requesterIds,
      },
    },
  });
}

function acceptRequestAccessDocument({ documentId, requesterIds }) {
  return client.mutate({
    mutation: ACCEPT_REQUEST_ACCESS_DOCUMENT,
    variables: {
      input: {
        documentId,
        requesterIds,
      },
    },
  });
}

function getRequestAccessDocsList({ documentId, cursor, limit }) {
  return client.query({
    query: GET_REQUEST_ACCESS_DOCLIST,
    variables: {
      input: {
        documentId,
        cursor,
        limit,
      },
    },
    fetchPolicy: FETCH_POLICY.NETWORK_ONLY,
  });
}

async function getDocument({ documentId, usePwa = false }) {
  const response = await client.query({
    query: GET_DOCUMENT_WITH_ANNOTATION_AND_FORM_FIELD,
    variables: {
      documentId,
      usePwa,
      useEditorServer: !process.env.DISABLE_EDITOR_SERVER,
    },
    fetchPolicy: FETCH_POLICY.NO_CACHE,
  });
  const { signedResponse } = response.data?.document?.premiumToolsInfo || {};
  if (signedResponse) {
    const verifiedPremiumToolsInfo = await verifySignedResponse(signedResponse, 'getDocument');
    return produce(response, (draft) => {
      draft.data.document.premiumToolsInfo = verifiedPremiumToolsInfo;
    });
  }
  return response;
}

async function getDocumentTemplate({ documentId }) {
  const response = await client.query({
    query: GET_DOCUMENT_TEMPLATE_WITH_FORM_FIELD,
    variables: {
      documentId,
    },
    fetchPolicy: FETCH_POLICY.NO_CACHE,
  });
  const { signedResponse } = response.data?.documentTemplate?.premiumToolsInfo || {};
  if (signedResponse) {
    const verifiedPremiumToolsInfo = await verifySignedResponse(signedResponse, 'getDocumentTemplate');
    return produce(response, (draft) => {
      draft.data.documentTemplate.premiumToolsInfo = verifiedPremiumToolsInfo;
    });
  }
  return response;
}

async function deleteDocument({ documentId, clientId, isNotify = false }) {
  return client.mutate({
    mutation: DELETE_DOCUMENT,
    variables: {
      input: {
        documentId,
        clientId,
        isNotify,
      },
    },
  });
}

async function shareDocumentByEmail({ emails, message, documentId, role }) {
  return client.mutate({
    mutation: SHARE_DOCUMENT_BY_EMAIL,
    variables: {
      input: {
        emails,
        message,
        documentId,
        role,
      },
    },
  });
}

async function updateShareSettingDocument({ linkType, permission, documentId }) {
  return client.mutate({
    mutation: UPDATE_SHARE_SETTING_DOCUMENT,
    variables: {
      input: {
        linkType,
        permission,
        documentId,
      },
    },
  });
}

async function getShareInviteByEmailList({ documentId, searchKey }) {
  return client.query({
    query: GET_SHARE_INVITE_BY_EMAIL,
    variables: {
      documentId,
      searchKey,
    },
    fetchPolicy: FETCH_POLICY.NO_CACHE,
  });
}

async function getIndividualShareesDocument({ documentId, requestAccessInput }) {
  return client.query({
    query: GET_INDIVIDUAL_SHAREES_DOCUMENT,
    variables: {
      documentId,
      requestAccessInput,
    },
    fetchPolicy: FETCH_POLICY.NO_CACHE,
  });
}

async function getFullShareesDocument({ internalMemberInput, requestAccessInput }) {
  return client.query({
    query: GET_FULL_SHAREES_DOCUMENT,
    variables: {
      documentId: internalMemberInput.documentId,
      internalMemberInput,
      requestAccessInput,
    },
    fetchPolicy: FETCH_POLICY.NO_CACHE,
  });
}

async function removeDocumentPermission({ documentId, email }) {
  return client.mutate({
    mutation: REMOVE_SHARE_DOCUMENT_PERMISSION,
    variables: {
      input: {
        documentId,
        email,
      },
    },
  });
}

async function updateDocumentPermission({ documentId, role, email }) {
  return client.mutate({
    mutation: UPDATE_SHARE_DOCUMENT_PERMISSION,
    variables: {
      input: {
        documentId,
        role,
        email,
      },
    },
  });
}

async function getMentionList({ documentId, searchKey, excludeUserIds = [] }, { signal } = {}) {
  const response = await client.query({
    query: GET_MENTION_LIST_BY_DOCUMENT_ID,
    variables: {
      input: {
        documentId,
        searchKey,
        excludeUserIds,
      },
    },
    fetchPolicy: FETCH_POLICY.NETWORK_ONLY,
    context: {
      fetchOptions: { signal },
    },
  });
  return response.data.getMentionList.mentionList;
}

async function getPDFInfo(documentId) {
  return client.query({
    query: GET_PDF_INFO,
    variables: {
      documentId,
    },
    fetchPolicy: FETCH_POLICY.NETWORK_ONLY,
  });
}

function deleteMultipleDocument({ documentIds, clientId, isNotify = true }) {
  return client.mutate({
    mutation: DELETE_MULTIPLE_DOCUMENT,
    variables: {
      input: {
        documentIds,
        clientId,
        isNotify,
      },
    },
  });
}

function deleteSharedDocuments({ documentIds }) {
  return client.mutate({
    mutation: DELETE_SHARED_DOCUMENTS,
    variables: {
      input: {
        documentIds,
      },
    },
  });
}

function getTotalDocuments({ clientId, ownedFilterCondition, lastModifiedFilterCondition, folderId }) {
  return client.query({
    query: GET_TOTAL_DOCUMENTS,
    variables: {
      input: {
        clientId,
        ownedFilterCondition,
        lastModifiedFilterCondition,
        folderId,
      },
    },
    fetchPolicy: FETCH_POLICY.NETWORK_ONLY,
  });
}

function subcriptDeleteMultipleDocument({ clientId, callback }) {
  return client
    .subscribe({
      query: SUB_DELETE_ORIGINAL_DOCUMENT,
      variables: {
        clientId,
      },
    })
    .subscribe({
      next({ data }) {
        callback(data.deleteOriginalDocument);
      },
      error(err) {
        console.log(err);
      },
    });
}

async function duplicateDocument({ documentName, destinationId, destinationType, notifyUpload, documentId, file }) {
  const payload = {
    mutation: DUPLICATE_DOCUMENT,
    variables: {
      input: {
        documentId,
        newDocumentData: {
          destinationId,
          destinationType,
          documentName,
          notifyUpload,
        },
      },
    },
  };

  const res = await handleUploadFileGraph(file, payload);
  if (!file) {
    return res.data.duplicateDocument;
  }

  return res.data.data.duplicateDocument;
}

async function duplicateDocumentToFolder({ documentName, folderId, notifyUpload, documentId, file }) {
  const payload = {
    mutation: DUPLICATE_DOCUMENT_TO_FOLDER,
    variables: {
      input: {
        documentId,
        folderId,
        documentName,
        notifyUpload,
      },
    },
  };

  const res = await handleUploadFileGraph(file, payload);
  if (!file) {
    return res.data.duplicateDocument;
  }

  return res.data.data.duplicateDocument;
}

const moveDocuments = async ({ documentIds, destinationType, destinationId, isNotify, file, documentName }) => {
  const payload = {
    mutation: MOVE_DOCUMENTS,
    variables: {
      input: {
        documentIds,
        destinationType,
        destinationId,
        isNotify,
        documentName,
      },
    },
  };

  const { data } = await handleUploadFileGraph(file, payload);
  return data;
};

const moveDocumentsToFolder = async ({ documentIds, folderId, isNotify, file, documentName }) => {
  const payload = {
    mutation: MOVE_DOCUMENTS_TO_FOLDER,
    variables: {
      input: {
        documentIds,
        folderId,
        isNotify,
        documentName,
      },
      file,
    },
  };

  const { data } = await handleUploadFileGraph(file, payload);
  return data;
};

async function renameDocument({ documentId, newName }) {
  const response = await client.mutate({
    mutation: RENAME_DOCUMENT,
    variables: {
      input: {
        documentId,
        newDocumentName: newName,
      },
    },
  });
  return response.data.renameDocument;
}

async function getDocumentById(documentId) {
  const response = await client.query({
    query: GET_DOCUMENT_BY_ID,
    variables: {
      documentId,
    },
  });
  return response.data.getDocumentById;
}

async function bulkUpdateDocumentInvitedList(input) {
  const response = await client.mutate({
    mutation: BULK_UPDATE_DOCUMENT_INVITED_LIST,
    variables: {
      input,
    },
  });
  return response.data.bulkUpdateDocumentInvitedList;
}

async function bulkUpdateDocumentMemberList(input) {
  const response = await client.mutate({
    mutation: BULK_UPDATE_DOCUMENT_MEMBER_LIST,
    variables: {
      input,
    },
  });
  return response.data.bulkUpdateDocumentMemberList;
}

async function downloadDocument(documentId) {
  const response = await client.query({
    query: DOWNLOAD_DOCUMENT,
    variables: {
      documentId,
      useEditorServer: !process.env.DISABLE_EDITOR_SERVER,
    },
    fetchPolicy: FETCH_POLICY.NETWORK_ONLY,
  });
  const { premiumToolsInfo } = response.data?.downloadDocument || {};
  const { signedResponse } = premiumToolsInfo || {};
  if (signedResponse) {
    const verifiedPremiumToolsInfo = await verifySignedResponse(signedResponse, 'downloadDocument');
    return produce(response, (draft) => {
      draft.data.downloadDocument.premiumToolsInfo = verifiedPremiumToolsInfo;
    });
  }
  return response;
}

async function createUserStartedDocument() {
  const response = await client.mutate({
    mutation: CREATE_USER_STARTED_DOCUMENT,
    variables: {
      isMobile: false,
    },
  });
  return response.data.createUserStartedDocument;
}

async function createOrgStartedDocument({ orgId }) {
  const response = await client.mutate({
    mutation: CREATE_ORG_STARTED_DOCUMENT,
    variables: {
      orgId,
      isMobile: false,
    },
  });
  return response.data.createOrgStartedDocument;
}

function trackingUserUseDocument(documentId) {
  return client.mutate({
    mutation: TRACKING_USER_USE_DOCUMENT,
    variables: {
      documentId,
    },
  });
}

function countDocStackUsage(documentId) {
  return client.mutate({
    mutation: COUNT_DOC_STACK_USAGE,
    variables: {
      documentId,
    },
  });
}

function getRequestAccessDocById(documentId, requesterId) {
  return client.query({
    query: GET_REQUEST_ACCESS_DOC_BY_ID,
    variables: {
      documentId,
      requesterId,
    },
    fetchPolicy: FETCH_POLICY.NETWORK_ONLY,
  });
}

async function importThirdPartyDocuments({ userId, documents, folderId }) {
  const response = await client.mutate({
    mutation: CREATE_DOCUMENTS,
    variables: {
      input: {
        clientId: userId,
        documents,
        ...(Boolean(folderId) && { folderId }),
      },
    },
  });

  return response.data.createDocuments.documents;
}

async function getDocStackInfo(documentId, fetchOptions) {
  return client.query({
    query: GET_DOC_STACK_INFO,
    variables: {
      documentId,
    },
    fetchPolicy: FETCH_POLICY.NO_CACHE,
    context: {
      fetchOptions,
    },
  });
}

async function checkThirdPartyStorage({ remoteIds }) {
  return client.query({
    query: CHECK_THIRD_PARTY_STORAGE,
    variables: {
      remoteIds,
    },
    fetchPolicy: FETCH_POLICY.NO_CACHE,
  });
}
async function getAnnotations(documentId, fetchOptions) {
  const response = await client.query({
    query: GET_ANNOTATIONS,
    variables: {
      documentId,
    },
    fetchPolicy: FETCH_POLICY.NO_CACHE,
    context: {
      fetchOptions,
    },
  });
  return response.data.getAnnotations;
}

async function getPremiumToolInfoAvailableForUser() {
  const response = await client.query({
    query: GET_PREMIUM_TOOLS_INFO_FOR_USER,
    fetchPolicy: FETCH_POLICY.NO_CACHE,
  });
  const { getPremiumToolInfoAvailableForUser } = response.data || {};
  const { signedResponse } = getPremiumToolInfoAvailableForUser || {};
  return verifySignedResponse(signedResponse, 'getPremiumToolInfoAvailableForUser');
}

async function findAvailableLocation({ type, searchKey, orgId }, { signal } = {}) {
  return client.query({
    query: FIND_AVAILABLE_LOCATION,
    variables: {
      input: {
        context: type,
        searchKey,
        orgId,
      },
    },
    fetchPolicy: FETCH_POLICY.NETWORK_ONLY,
    context: {
      fetchOptions: { signal },
    },
  });
}

async function updateBookmarks({ documentId, bookmarks = [] }) {
  return client.mutate({
    mutation: UPDATE_BOOKMARKS,
    variables: {
      input: {
        documentId,
        bookmarks,
      },
    },
  });
}

async function getPresignedUrlForDocumentImage({ documentId, mimeType }) {
  const response = await client.query({
    query: GET_PRESIGNED_URL_FOR_IMAGE,
    variables: {
      input: {
        documentId,
        mimeType,
      },
    },
    fetchPolicy: FETCH_POLICY.NO_CACHE,
  });
  return response.data.getPresignedUrlForDocumentImage;
}

async function getPresignedUrlForSignature(fileType) {
  const response = await client.query({
    query: GET_SIGNED_URL_FOR_SIGNATURE,
    variables: {
      fileType,
    },
    fetchPolicy: FETCH_POLICY.NO_CACHE,
  });
  return response.data.getCreatedSignaturePresignedUrl;
}

async function getDocumentOriginalFileUrl(documentId) {
  const response = await client.query({
    query: GET_ORIGINAL_FILE_URL,
    variables: {
      documentId,
    },
    fetchPolicy: FETCH_POLICY.NO_CACHE,
  });
  return response.data.getDocumentOriginalFileUrl;
}

function restoreOriginalVersion(documentId) {
  return client.mutate({
    mutation: RESTORE_ORIGINAL_VERSION,
    variables: {
      documentId,
    },
  });
}

function deleteDocumentImages(input, config) {
  return client.mutate({
    mutation: DELETE_DOCUMENT_IMAGES,
    variables: {
      input,
    },
    context: {
      fetchOptions: config,
    },
  });
}

async function getPresignedUrlForUploadDoc(
  { documentMimeType, thumbnailMimeType, documentKey, thumbnailKey, uploadDocFrom },
  fetchOptions
) {
  const res = await client.query({
    query: GET_PRESIGNED_URL_UPLOAD_DOC,
    fetchPolicy: 'no-cache',
    variables: {
      input: {
        documentMimeType,
        thumbnailMimeType,
        documentKey,
        thumbnailKey,
        uploadDocFrom,
      },
    },
    context: {
      fetchOptions,
    },
  });
  return res.data.getPresignedUrlForUploadDoc;
}

async function getPresignedUrlForLuminSignIntegration({ documentMimeType, documentKey }) {
  const res = await client.query({
    query: GET_PRESIGNED_URL_FOR_LUMIN_SIGN_INTERGRATION,
    fetchPolicy: 'no-cache',
    variables: {
      input: {
        documentMimeType,
        documentKey,
      },
    },
  });
  return res.data.getPresignedUrlForLuminSignIntegration;
}

async function getPresignedUrlForUploadThumbnail({ thumbnailMimeType, thumbnailKey }) {
  const res = await client.query({
    query: GET_PRESIGNED_URL_UPLOAD_THUMBNAIL,
    fetchPolicy: 'no-cache',
    variables: {
      input: {
        thumbnailMimeType,
        thumbnailKey,
      },
    },
  });
  return res.data.getPresignedUrlForUploadThumbnail;
}

async function getDocumentByRemoteAndClientId({ remoteId, clientId }) {
  const res = await client.query({
    query: GET_DOCUMENT_BY_REMOTEID_AND_CLIENTID,
    variables: {
      documentRemoteId: remoteId,
      clientId,
    },
  });
  return res.data.getDocumentByRemoteId;
}

async function getPresignedUrlForTemporaryDrive(documentId) {
  const response = await client.query({
    query: GET_PRESIGNED_URL_FOR_TEMPORARY_DRIVE,
    fetchPolicy: 'no-cache',
    variables: {
      documentId,
    },
  });
  return response.data.getPresignedUrlForTemporaryDrive;
}

function createTemporaryContentForDrive(input) {
  return client.mutate({
    mutation: CREATE_TEMPORARY_CONTENT_FOR_DRIVE,
    variables: {
      input,
    },
  });
}

function deleteTemporaryContentForDrive(documentId) {
  return client.mutate({
    mutation: DELETE_TEMPORARY_CONTENT_FOR_DRIVE,
    variables: {
      documentId,
    },
  });
}

async function getDocumentEtag(documentId) {
  const response = await client.query({
    query: GET_DOCUMENT_ETAG,
    fetchPolicy: 'no-cache',
    variables: {
      documentId,
    },
  });
  return response.data.document.etag;
}

async function getSignedUrlForOCR({ documentId, totalParts }) {
  const res = await client.query({
    query: GET_SIGNED_URL_TO_USE_OCR,
    fetchPolicy: 'no-cache',
    variables: {
      documentId,
      totalParts,
    },
  });
  return res.data.getSignedUrlForOCR;
}

async function getTemporaryDocumentPresignedUrl(documentId, key, convertType) {
  const response = await client.query({
    query: GET_TEMPORARY_DOCUMENT_PRESIGNED_URL,
    fetchPolicy: 'no-cache',
    variables: {
      documentId,
      key,
      convertType,
    },
  });
  return response.data.getTemporaryDocumentPresignedUrl;
}

async function getSignedUrlForExternalPdfByEncodeData(encodeData) {
  const response = await client.query({
    query: GET_SIGNED_URL_FOR_EXTERNAL_PDF,
    fetchPolicy: 'no-cache',
    variables: { encodeData },
  });
  return response.data.getSignedUrlForExternalPdfByEncodeData;
}

async function getPresignedUrlForMultipleDocumentImages(documentId, listMimeTypes) {
  const response = await client.query({
    query: GET_PRESIGNED_URL_FOR_MULTIPLE_DOCUMENT_IMAGES,
    fetchPolicy: 'no-cache',
    variables: {
      input: {
        documentId,
        listMimeTypes,
      },
    },
  });
  return response.data.getPresignedUrlForMultipleDocumentImages;
}

async function getAnnotationSignedUrl(documentId, fetchOptions) {
  const response = await client.query({
    query: GET_SIGNED_URL_FOR_ANNOTATIONS,
    fetchPolicy: 'no-cache',
    variables: {
      documentId,
    },
    context: {
      fetchOptions,
    },
  });
  return response.data.getSignedUrlForAnnotations;
}

async function refreshDocumentImageSignedUrls(documentId) {
  const response = await client.query({
    query: REFRESH_DOCUMENT_IMAGE_SIGNED_URLS,
    fetchPolicy: 'no-cache',
    variables: {
      documentId,
    },
  });
  return response.data.refreshDocumentImageSignedUrls;
}

async function getFormFields(documentId, fetchOptions) {
  const response = await client.query({
    query: GET_FORM_FIELD,
    fetchPolicy: 'no-cache',
    variables: {
      documentId,
    },
    context: {
      fetchOptions,
    },
  });
  return response.data.getFormField;
}

async function getPromptInviteUsersBanner(
  { accessToken, forceUpdate, googleAuthorizationEmail, orgId },
  { signal } = {}
) {
  return client.query({
    query: GET_PROMPT_INVITE_GOOGLE_USERS,
    variables: {
      input: {
        orgId,
        accessToken,
        forceUpdate,
        googleAuthorizationEmail,
      },
    },
    fetchPolicy: FETCH_POLICY.NETWORK_ONLY,
    context: {
      fetchOptions: { signal },
    },
  });
}

async function getDocumentOutlines(input) {
  const response = await client.query({
    query: GET_DOCUMENT_OUTLINES,
    fetchPolicy: 'no-cache',
    variables: {
      input,
    },
  });

  return response.data.getDocumentOutlines;
}

async function importDocumentOutlines(input) {
  return client.mutate({
    mutation: IMPORT_DOCUMENT_OUTLINES,
    variables: {
      input,
    },
  });
}

async function createPresignedFormFieldDetectionUrl(input, fetchOptions) {
  const res = await client.query({
    query: CREATE_PRESIGNED_FORM_FIELD_DETECTION_URL,
    fetchPolicy: 'no-cache',
    variables: {
      input,
    },
    context: {
      fetchOptions,
    },
  });
  return res.data.createPresignedFormFieldDetectionUrl;
}

async function batchCreatePresignedFormFieldDetectionUrl(inputs, fetchOptions) {
  const res = await client.query({
    query: BATCH_CREATE_PRESIGNED_FORM_FIELD_DETECTION_URL,
    fetchPolicy: 'no-cache',
    variables: {
      inputs,
    },
    context: {
      fetchOptions,
    },
  });
  return res.data.batchCreatePresignedFormFieldDetectionUrl;
}

async function getDocumentsInFolder(input, fetchOptions = {}) {
  const response = await client.query({
    query: GET_DOCUMENTS_IN_FOLDER,
    fetchPolicy: 'no-cache',
    variables: {
      input,
    },
    context: {
      fetchOptions,
    },
  });
  return response.data.getDocuments;
}

async function checkDownloadMultipleDocuments(input, fetchOptions = {}) {
  const response = await client.query({
    query: CHECK_DOWNLOAD_MULTIPLE_DOCUMENTS,
    fetchPolicy: 'no-cache',
    variables: {
      input,
    },
    context: {
      fetchOptions,
    },
  });
  return response.data.checkDownloadMultipleDocuments;
}

async function updateStackedDocuments(input) {
  return client.mutate({
    mutation: UPDATE_STACKED_DOCUMENTS,
    variables: {
      input,
    },
  });
}

async function processAppliedFormFields(input) {
  return client.mutate({
    mutation: PROCESS_APPLIED_FORM_FIELDS,
    variables: {
      input,
    },
  });
}

async function checkShareThirdPartyDocument(input) {
  const response = await client.query({
    query: CHECK_SHARE_THIRD_PARTY_DOCUMENT,
    variables: {
      input,
    },
    fetchPolicy: FETCH_POLICY.NO_CACHE,
  });
  return response.data.checkShareThirdPartyDocument;
}

async function updateDocumentMimeTypeToPdf(documentId, remoteId) {
  const response = await client.mutate({
    mutation: UPDATE_DOCUMENT_MIME_TYPE_TO_PDF,
    variables: {
      documentId,
      remoteId,
    },
  });
  return response.data.updateDocumentMimeTypeToPdf;
}

export default {
  starDocumentMutation,
  updateMimeType,
  createPDFForm,
  createPdfFromStaticToolUpload,
  getFormList,
  subUpdateBookmark,
  requestAccessDocument,
  rejectRequestAccessDocument,
  acceptRequestAccessDocument,
  getRequestAccessDocsList,
  getDocument,
  deleteDocument,
  shareDocumentByEmail,
  updateShareSettingDocument,
  getShareInviteByEmailList,
  removeDocumentPermission,
  updateDocumentPermission,
  getMentionList,
  getPDFInfo,
  deleteMultipleDocument,
  deleteSharedDocuments,
  getTotalDocuments,
  subcriptDeleteMultipleDocument,
  getIndividualShareesDocument,
  getFullShareesDocument,
  duplicateDocument,
  duplicateDocumentToFolder,
  moveDocuments,
  moveDocumentsToFolder,
  renameDocument,
  getDocumentById,
  bulkUpdateDocumentInvitedList,
  bulkUpdateDocumentMemberList,
  downloadDocument,
  createUserStartedDocument,
  createOrgStartedDocument,
  trackingUserUseDocument,
  getRequestAccessDocById,
  importThirdPartyDocuments,
  getDocStackInfo,
  checkThirdPartyStorage,
  getAnnotations,
  getPremiumToolInfoAvailableForUser,
  findAvailableLocation,
  updateBookmarks,
  getPresignedUrlForDocumentImage,
  getDocumentOriginalFileUrl,
  restoreOriginalVersion,
  deleteDocumentImages,
  getPresignedUrlForUploadDoc,
  getPresignedUrlForUploadThumbnail,
  getPresignedUrlForLuminSignIntegration,
  getPresignedUrlForSignature,
  getDocumentByRemoteAndClientId,
  getPresignedUrlForTemporaryDrive,
  createTemporaryContentForDrive,
  deleteTemporaryContentForDrive,
  getDocumentEtag,
  getSignedUrlForOCR,
  getTemporaryDocumentPresignedUrl,
  getAnnotationSignedUrl,
  getPresignedUrlForMultipleDocumentImages,
  refreshDocumentImageSignedUrls,
  getDocumentOutlines,
  importDocumentOutlines,
  getPromptInviteUsersBanner,
  getFormFields,
  createPresignedFormFieldDetectionUrl,
  countDocStackUsage,
  getDocumentsInFolder,
  checkDownloadMultipleDocuments,
  updateStackedDocuments,
  processAppliedFormFields,
  getSignedUrlForExternalPdfByEncodeData,
  checkShareThirdPartyDocument,
  batchCreatePresignedFormFieldDetectionUrl,
  getDocumentTemplate,
  updateDocumentMimeTypeToPdf,
};
