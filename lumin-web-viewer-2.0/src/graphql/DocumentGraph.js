import { gql } from '@apollo/client';

import Fragments from './Fragment';
import { DocumentCapabilities } from './fragments/DocumentBase';

const RENAME_DOCUMENT = gql`
  mutation renameDocument($input: RenameDocumentInput!) {
    renameDocument(input: $input) {
      message
      statusCode
      data
    }
  }
`;

const MORE_DOCUMENTS_USER = gql`
  query getDocuments($input: GetPersonalWorkspaceDocumentsInput!) {
    getDocuments(input: $input) {
      cursor
      hasNextPage
      documents {
        ...DocumentData
        belongsTo {
          type
          workspaceId
          location {
            _id
            name
          }
        }
      }
      total
    }
  }
  ${Fragments.DocumentData}
`;

const CREATE_DOCUMENTS = gql`
  mutation createDocuments($input: CreateDocumentsInput!) {
    createDocuments(input: $input) {
      message
      statusCode
      documents {
        _id
        remoteId
        name
        size
      }
    }
  }
`;

const DELETE_DOCUMENT = gql`
  mutation deleteDocument($input: DeleteDocumentInput!) {
    deleteDocument(input: $input) {
      message
      statusCode
    }
  }
`;

const GET_DOCUMENT_BY_REMOTEID_AND_CLIENTID = gql`
  query getDocumentByRemoteId($documentRemoteId: ID!, $clientId: ID) {
    getDocumentByRemoteId(documentRemoteId: $documentRemoteId, clientId: $clientId) {
      haveDocument
      message
      document {
        ...DocumentData
      }
    }
  }
  ${Fragments.DocumentData}
`;

const UPDATE_SHARE_SETTING_DOCUMENT = gql`
  mutation updateShareSetting($input: UpdateShareSettingInput!) {
    updateShareSetting(input: $input) {
      permission
      linkType
    }
  }
`;

const GET_DOCUMENT_WITH_ANNOTATION_AND_FORM_FIELD = gql`
  query document($documentId: ID!, $usePwa: Boolean, $useEditorServer: Boolean!) {
    document: document(documentId: $documentId, usePwa: $usePwa) {
      ...DocumentViewerData
      etag
      signedUrl
      enableGoogleSync
      isShared
      version
      thumbnailRemoteId
      getAnnotationUrl @include(if: $useEditorServer)
      belongsTo {
        type
        workspaceId
        location {
          _id
          name
          ownedOrgId
          url
        }
      }
      premiumToolsInfo {
        ...PremiumToolsInfo
      }
      status {
        isSyncing
      }
      actionCountDocStack {
        print
        download
        share
        sync
      }
      ...DocumentCapabilities
    }
    getFormField(documentId: $documentId) {
      name
      value
      xfdf
      isDeleted
      isInternal
    }
  }
  ${Fragments.DocumentViewerData}
  ${Fragments.PremiumToolsInfo}
  ${DocumentCapabilities}
`;

const UPDATE_THUMBNAIL = gql`
  mutation updateThumbnail($input: UpdateThumbnailInput!) {
    updateThumbnail(input: $input) {
      ...BasicResponseData
    }
  }
  ${Fragments.BasicResponseData}
`;

const GET_DOCUMENT_TOUR = gql`
  query getDocumentTour {
    document: getDocumentTour {
      _id
      name
      remoteId
      remoteEmail
      size
      service
      mimeType
      annotations
      downloadUrl
      lastAccess
      createdAt
    }
  }
`;

const GET_SHAREES_DOCUMENT = gql`
  query getShareesDocument($documentId: ID!, $clientId: ID) {
    getShareesDocument(documentId: $documentId, clientId: $clientId) {
      sharees {
        _id
        email
        name
        avatarRemoteId
        role
        type
        teamName
      }
    }
  }
`;

const GET_FORM_LIST = gql`
  query getFormList($input: GetDocumentFormInput!) {
    getFormList(input: $input) {
      documents {
        _id
        thumbnail
        name
        size
      }
      totalPage
    }
  }
`;

const SHARE_DOCUMENT = gql`
  mutation createDocumentPermission($input: CreateDocumentPermissionInput!) {
    createDocumentPermission(input: $input) {
      message
      statusCode
    }
  }
`;

const STAR_DOCUMENT = gql`
  mutation starDocument($input: StarDocumentInput!) {
    starDocument(input: $input) {
      message
      statusCode
      document {
        _id
        listUserStar
      }
    }
  }
`;

const UPDATE_MIMETYPE = gql`
  mutation updateMimeType($documentId: ID!) {
    updateMimeType(documentId: $documentId) {
      message
      statusCode
      data
    }
  }
`;

const UPDATE_SHARE_DOCUMENT_PERMISSION = gql`
  mutation updateDocumentPermission($input: UpdateDocumentPermissionInput!) {
    updateDocumentPermission(input: $input) {
      message
      statusCode
    }
  }
`;

const REMOVE_SHARE_DOCUMENT_PERMISSION = gql`
  mutation removeDocumentPermission($input: RemoveDocumentPermissionInput!) {
    removeDocumentPermission(input: $input) {
      message
      statusCode
    }
  }
`;

const SHARE_DOCUMENT_BY_EMAIL = gql`
  mutation shareDocument($input: ShareDocumentInput!) {
    shareDocument(input: $input) {
      message
      statusCode
    }
  }
`;

const UPDATE_BOOKMARKS = gql`
  mutation updateBookmarks($input: UpdateBookmarksInput!) {
    updateBookmarks(input: $input) {
      message
      statusCode
    }
  }
`;

const CREATE_PDF_FORM = gql`
  mutation createPDFForm($input: CreatePDFFormInput!) {
    createPDFForm(input: $input) {
      documentId
      documentName
    }
  }
`;

const CREATE_PDF_FROM_STATIC_TOOL_UPLOAD = gql`
  mutation createPdfFromStaticToolUpload($input: CreatePdfFromStaticToolUploadInput!) {
    createPdfFromStaticToolUpload(input: $input) {
      documentId
      documentName
      documentSize
      documentMimeType
      temporaryRemoteId
    }
  }
`;

const SUB_UPDATE_DOCUMENT_LIST = gql`
  subscription updateDocumentList($input: UpdateDocumentListInput!) {
    updateDocumentList(input: $input) {
      type
      statusCode
      teamId
      organizationId
      additionalSettings {
        keepInSearch
      }
      document {
        ownerName
        ownerAvatarRemoteId
        ownerId
        _id
        remoteId
        name
        lastAccess
        createdAt
        size
        isPersonal
        service
        remoteEmail
        mimeType
        roleOfDocument
        thumbnail
        shareSetting {
          link
          permission
          linkType
        }
        listUserStar
        isOverTimeLimit
        clientId
        documentType
        folderId
        isShared
        folderData {
          _id
          name
          canOpen
        }
        belongsTo {
          type
          workspaceId
          location {
            _id
            name
            url
          }
        }
        externalStorageAttributes
        ...DocumentCapabilities
      }
    }
  }
  ${DocumentCapabilities}
`;

const SUB_UPDATE_DOCUMENT_INFO = gql`
  subscription updateDocumentInfo($input: UpdateDocumentInfoInput!) {
    updateDocumentInfo(input: $input) {
      type
      statusCode
      ownerId
      document {
        _id
        ownerName
        name
        listUserStar
        thumbnail
        service
        isOverTimeLimit
        clientId
        documentType
        folderId
        ...DocumentCapabilities
      }
    }
  }
  ${DocumentCapabilities}
`;

const SUB_UPDATE_BOOKMARK = gql`
  subscription updateBookmark($input: UpdateDocumentBookmarkInput!) {
    updateBookmark(input: $input) {
      bookmarks {
        bookmark {
          message
          email
        }
        page
      }
    }
  }
`;

const SUB_DELETE_ORIGINAL_DOCUMENT = gql`
  subscription deleteOriginalDocument($clientId: ID!) {
    deleteOriginalDocument(clientId: $clientId) {
      statusCode
      type
      teamId
      organizationId
      additionalSettings {
        keepInSearch
      }
      documentList {
        documentId
        documentFolder
      }
    }
  }
`;

const REQUEST_ACCESS_DOCUMENT = gql`
  mutation requestAccessDocument($input: RequestAccessDocumentInput!) {
    requestAccessDocument(input: $input) {
      message
      statusCode
    }
  }
`;

const ACCEPT_REQUEST_ACCESS_DOCUMENT = gql`
  mutation acceptRequestAccessDocument($input: UpdateRequestAccessInput!) {
    acceptRequestAccessDocument(input: $input) {
      message
      statusCode
    }
  }
`;

const REJECT_REQUEST_ACCESS_DOCUMENT = gql`
  mutation rejectRequestAccessDocument($input: UpdateRequestAccessInput!) {
    rejectRequestAccessDocument(input: $input) {
      message
      statusCode
    }
  }
`;

const GET_REQUEST_ACCESS_DOCLIST = gql`
  query getRequestAccessDocsList($input: DocumentRequestAccessInput!) {
    getRequestAccessDocsList(input: $input) {
      requesters {
        _id
        email
        name
        avatarRemoteId
        role
        type
        teamName
      }
      cursor
      hasNextPage
      total
    }
  }
`;

const GET_SHARE_INVITE_BY_EMAIL = gql`
  query getShareInviteByEmailList($documentId: ID!, $searchKey: String) {
    getShareInviteByEmailList(documentId: $documentId, searchKey: $searchKey) {
      sharees {
        _id
        email
        name
        avatarRemoteId
        role
        type
        teamName
      }
    }
  }
`;

const GET_INDIVIDUAL_SHAREES_DOCUMENT = gql`
  query getIndividualShareesDocument($documentId: ID!, $requestAccessInput: DocumentRequestAccessInput!) {
    internalShareList: getShareInviteByEmailList(documentId: $documentId) {
      sharees {
        _id
        email
        name
        avatarRemoteId
        role
        type
        teamName
      }
    }
    requestAccessList: getRequestAccessDocsList(input: $requestAccessInput) {
      requesters {
        _id
        email
        name
        avatarRemoteId
        role
        type
        teamName
      }
      total
      hasNextPage
      cursor
    }
  }
`;

const GET_FULL_SHAREES_DOCUMENT = gql`
  query getFullShareesDocument(
    $documentId: ID!
    $internalMemberInput: GetMembersByDocumentIdInput!
    $requestAccessInput: DocumentRequestAccessInput!
  ) {
    internalMemberPayload: getMembersByDocumentId(input: $internalMemberInput) {
      organizationName
      hasNextPage
      cursor
      total
      currentRole
      documentRole
      teamName
      members {
        userId
        name
        avatarRemoteId
        email
        permission
        role
      }
    }
    internalShareList: getShareInviteByEmailList(documentId: $documentId) {
      sharees {
        _id
        email
        name
        avatarRemoteId
        role
        type
        teamName
      }
    }
    requestAccessList: getRequestAccessDocsList(input: $requestAccessInput) {
      requesters {
        _id
        email
        name
        avatarRemoteId
        role
        type
        teamName
      }
      total
      hasNextPage
      cursor
    }
  }
`;

const GET_MENTION_LIST_BY_DOCUMENT_ID = gql`
  query getMentionList($input: MentionListInput!) {
    getMentionList(input: $input) {
      mentionList {
        _id
        email
        name
        avatarRemoteId
      }
    }
  }
`;

const GET_PDF_INFO = gql`
  query getPDFInfo($documentId: ID!) {
    getPDFInfo(documentId: $documentId) {
      teamName
      organizationName
      fileName
      fileType
      fileSize
      creator
      creationDate
      modificationDate
      storage
    }
  }
`;

const DELETE_MULTIPLE_DOCUMENT = gql`
  mutation deleteMultipleDocument($input: DeleteMultipleDocumentInput!) {
    deleteMultipleDocument(input: $input) {
      ...BasicResponseData
    }
  }
  ${Fragments.BasicResponseData}
`;

const DELETE_SHARED_DOCUMENTS = gql`
  mutation deleteSharedDocuments($input: DeleteSharedDocumentsInput) {
    deleteSharedDocuments(input: $input) {
      message
      statusCode
    }
  }
`;

const GET_TOTAL_DOCUMENTS = gql`
  query getTotalDocuments($input: GetTotalDocumentsInput!) {
    getTotalDocuments(input: $input)
  }
`;

const DUPLICATE_DOCUMENT = gql`
  mutation duplicateDocument($input: DuplicateDocumentInput!, $file: Upload) {
    duplicateDocument(input: $input, file: $file) {
      _id
    }
  }
`;

const DUPLICATE_DOCUMENT_TO_FOLDER = gql`
  mutation duplicateDocumentToFolder($input: DuplicateDocumentToFolderInput!, $file: Upload) {
    duplicateDocumentToFolder(input: $input, file: $file) {
      _id
    }
  }
`;

const MOVE_DOCUMENTS = gql`
  mutation moveDocuments($input: MoveDocumentsInput!, $file: Upload) {
    moveDocuments(input: $input, file: $file) {
      message
      statusCode
    }
  }
`;

const MOVE_DOCUMENTS_TO_FOLDER = gql`
  mutation moveDocumentsToFolder($input: MoveDocumentsToFolderInput!, $file: Upload) {
    moveDocumentsToFolder(input: $input, file: $file) {
      message
      statusCode
    }
  }
`;

const GET_DOCUMENTS_IN_FOLDER = gql`
  query getDocumentsInFolder($input: GetDocumentsInFolderInput!) {
    getDocuments: getDocumentsInFolder(input: $input) {
      documents {
        ...DocumentData
        belongsTo {
          type
          workspaceId
          location {
            _id
            name
            url
          }
        }
      }
      cursor
      hasNextPage
      total
    }
  }
  ${Fragments.DocumentData}
`;

const GET_DOCUMENT_BY_ID = gql`
  query getDocumentById($documentId: ID!) {
    getDocumentById(documentId: $documentId) {
      ...DocumentData
      belongsTo {
        type
        workspaceId
        location {
          _id
          name
          avatarRemoteId
        }
      }
    }
  }
  ${Fragments.DocumentData}
`;

const BULK_UPDATE_DOCUMENT_INVITED_LIST = gql`
  mutation bulkUpdateDocumentInvitedList($input: BulkUpdateDocumentPermissionInput!) {
    bulkUpdateDocumentInvitedList(input: $input) {
      ...BasicResponseData
    }
  }
  ${Fragments.BasicResponseData}
`;

const BULK_UPDATE_DOCUMENT_MEMBER_LIST = gql`
  mutation bulkUpdateDocumentMemberList($input: BulkUpdateDocumentPermissionInput!) {
    bulkUpdateDocumentMemberList(input: $input) {
      ...BasicResponseData
    }
  }
  ${Fragments.BasicResponseData}
`;

const CREATE_USER_STARTED_DOCUMENT = gql`
  mutation createUserStartedDocument($isMobile: Boolean) {
    createUserStartedDocument(isMobile: $isMobile) {
      ...DocumentData
    }
  }
  ${Fragments.DocumentData}
`;

const CREATE_ORG_STARTED_DOCUMENT = gql`
  mutation createOrgStartedDocument($orgId: ID!, $isMobile: Boolean) {
    createOrgStartedDocument(orgId: $orgId, isMobile: $isMobile) {
      ...DocumentData
    }
  }
  ${Fragments.DocumentData}
`;

const DOWNLOAD_DOCUMENT = gql`
  query downloadDocument($documentId: ID!, $useEditorServer: Boolean!) {
    downloadDocument(documentId: $documentId) {
      _id
      name
      remoteId
      size
      service
      mimeType
      listUserStar
      ownerName
      lastAccess
      createdAt
      isPersonal
      manipulationStep
      bookmarks
      signedUrl
      roleOfDocument
      ownerOfTeamDocument
      ownerId
      version
      documentType
      clientId
      thumbnail
      isOverTimeLimit
      belongsTo {
        type
        workspaceId
        location {
          _id
          name
        }
      }
      imageSignedUrls
      getAnnotationUrl @include(if: $useEditorServer)
      premiumToolsInfo {
        ...PremiumToolsInfo
      }
      sharedPermissionInfo {
        type
        total
        organizationName
        teamName
      }
      metadata {
        hasAppliedOCR
        hasMerged
        hasOutlines
      }
    }
  }
  ${Fragments.PremiumToolsInfo}
`;

const TRACKING_USER_USE_DOCUMENT = gql`
  mutation trackingUserUseDocument($documentId: ID!) {
    trackingUserUseDocument(documentId: $documentId) {
      message
      statusCode
    }
  }
`;

const COUNT_DOC_STACK_USAGE = gql`
  mutation countDocStackUsage($documentId: ID!) {
    countDocStackUsage(documentId: $documentId) {
      message
      statusCode
    }
  }
`;

const GET_REQUEST_ACCESS_DOC_BY_ID = gql`
  query getRequestAccessDocById($documentId: ID!, $requesterId: ID!) {
    getRequestAccessDocById(documentId: $documentId, requesterId: $requesterId) {
      _id
      email
      name
      avatarRemoteId
      role
      type
      teamName
    }
  }
`;

const GET_DOC_STACK_INFO = gql`
  query getDocStackInfo($documentId: ID!) {
    getDocStackInfo(documentId: $documentId) {
      canFinishDocument
      totalUsed
      totalStack
    }
  }
`;

const CHECK_THIRD_PARTY_STORAGE = gql`
  query checkThirdPartyStorage($remoteIds: [ID!]!) {
    checkThirdPartyStorage(remoteIds: $remoteIds) {
      documentId
      organization {
        _id
        url
        name
      }
      folder {
        _id
        name
      }
    }
  }
`;

const GET_ANNOTATIONS = gql`
  query getAnnotations($documentId: ID!) {
    getAnnotations(documentId: $documentId) {
      xfdf
      annotationId
    }
  }
`;

const GET_PREMIUM_TOOLS_INFO_FOR_USER = gql`
  query getPremiumToolInfoAvailableForUser {
    getPremiumToolInfoAvailableForUser {
      ...PremiumToolsInfo
    }
  }
  ${Fragments.PremiumToolsInfo}
`;

const FIND_AVAILABLE_LOCATION = gql`
  query findAvailableLocation($input: FindLocationInput!) {
    findAvailableLocation(input: $input) {
      data {
        name
        _id
        avatarRemoteId
        path {
          name
          _id
          path {
            _id
          }
        }
      }
      hasNextPage
      cursor
    }
  }
`;

const GET_PRESIGNED_URL_FOR_IMAGE = gql`
  query getPresignedUrlForDocumentImage($input: PresignedUrlForImageInput!) {
    getPresignedUrlForDocumentImage(input: $input) {
      remoteId
      putSignedUrl
      getSignedUrl
    }
  }
`;

const GET_SIGNED_URL_FOR_SIGNATURE = gql`
  query getCreatedSignaturePresignedUrl($fileType: String!) {
    getCreatedSignaturePresignedUrl(fileType: $fileType) {
      remoteId
      putSignedUrl
      getSignedUrl
      encodeSignatureData
    }
  }
`;

const GET_ORIGINAL_FILE_URL = gql`
  query getDocumentOriginalFileUrl($documentId: ID!) {
    getDocumentOriginalFileUrl(documentId: $documentId)
  }
`;

const RESTORE_ORIGINAL_VERSION = gql`
  mutation restoreOriginalVersion($documentId: ID!) {
    restoreOriginalVersion(documentId: $documentId) {
      message
      statusCode
    }
  }
`;

const DELETE_DOCUMENT_IMAGES = gql`
  mutation deleteDocumentImages($input: DeleteDocumentImagesInput!) {
    deleteDocumentImages(input: $input) {
      message
      statusCode
    }
  }
`;

const GET_PRESIGNED_URL_FOR_TEMPORARY_DRIVE = gql`
  query getPresignedUrlForTemporaryDrive($documentId: ID!) {
    getPresignedUrlForTemporaryDrive(documentId: $documentId) {
      document {
        url
        fields {
          key
        }
      }
      encodedUploadData
    }
  }
`;

const CREATE_TEMPORARY_CONTENT_FOR_DRIVE = gql`
  mutation createTemporaryContentForDrive($input: CreateDocumentBackupInfoInput!) {
    createTemporaryContentForDrive(input: $input) {
      message
      statusCode
    }
  }
`;

const DELETE_TEMPORARY_CONTENT_FOR_DRIVE = gql`
  mutation deleteTemporaryContentForDrive($documentId: ID!) {
    deleteTemporaryContentForDrive(documentId: $documentId) {
      message
      statusCode
    }
  }
`;

const GET_PRESIGNED_URL_UPLOAD_DOC = gql`
  query getPresignedUrlForUploadDoc($input: GetPresignedUrlForUploadDocInput!) {
    getPresignedUrlForUploadDoc(input: $input) {
      document {
        url
        fields {
          key
        }
      }
      thumbnail {
        url
        fields {
          key
        }
      }
      encodedUploadData
    }
  }
`;

const GET_PRESIGNED_URL_FOR_LUMIN_SIGN_INTERGRATION = gql`
  query getPresignedUrlForLuminSignIntegration($input: GetPresignedUrlForLuminSignIntegrationInput!) {
    getPresignedUrlForLuminSignIntegration(input: $input) {
      document {
        url
        fields {
          key
        }
      }
    }
  }
`;

const GET_PRESIGNED_URL_UPLOAD_THUMBNAIL = gql`
  query getPresignedUrlForUploadThumbnail($input: GetPresignedUrlForUploadThumbnailInput!) {
    getPresignedUrlForUploadThumbnail(input: $input) {
      thumbnail {
        url
        fields {
          key
        }
      }
      encodedUploadData
    }
  }
`;

const GET_DOCUMENT_ETAG = gql`
  query document($documentId: ID!, $usePwa: Boolean) {
    document: document(documentId: $documentId, usePwa: $usePwa) {
      etag
    }
  }
`;

const GET_SIGNED_URL_TO_USE_OCR = gql`
  query getSignedUrlForOCR($documentId: ID!, $totalParts: Int!) {
    getSignedUrlForOCR(documentId: $documentId, totalParts: $totalParts) {
      key
      listSignedUrls
    }
  }
`;

const GET_TEMPORARY_DOCUMENT_PRESIGNED_URL = gql`
  query getTemporaryDocumentPresignedUrl($documentId: ID!, $key: String!, $convertType: String!) {
    getTemporaryDocumentPresignedUrl(documentId: $documentId, key: $key, convertType: $convertType) {
      document {
        url
        fields {
          key
        }
      }
    }
  }
`;

const GET_SIGNED_URL_FOR_EXTERNAL_PDF = gql`
  query getSignedUrlForExternalPdfByEncodeData($encodeData: String!) {
    getSignedUrlForExternalPdfByEncodeData(encodeData: $encodeData) {
      signedUrl
      documentName
      remoteId
      fileSize
    }
  }
`;

const GET_PRESIGNED_URL_FOR_MULTIPLE_DOCUMENT_IMAGES = gql`
  query getPresignedUrlForMultipleDocumentImages($input: PresignedUrlForMultiImagesInput!) {
    getPresignedUrlForMultipleDocumentImages(input: $input) {
      remoteId
      putSignedUrl
      getSignedUrl
    }
  }
`;

const GET_SIGNED_URL_FOR_ANNOTATIONS = gql`
  query getSignedUrlForAnnotations($documentId: ID!) {
    getSignedUrlForAnnotations(documentId: $documentId)
  }
`;

const REFRESH_DOCUMENT_IMAGE_SIGNED_URLS = gql`
  query refreshDocumentImageSignedUrls($documentId: ID!) {
    refreshDocumentImageSignedUrls(documentId: $documentId)
  }
`;

const GET_PROMPT_INVITE_USERS_BANNER = gql`
  query getPromptInviteUsersBanner($input: GetPromptInviteUsersBannerInput!) {
    getPromptInviteUsersBanner(input: $input) {
      bannerType
      inviteUsers {
        _id
        name
        email
        avatarRemoteId
      }
    }
  }
`;

const GET_FORM_FIELD = gql`
  query getFormField($documentId: ID!) {
    getFormField(documentId: $documentId) {
      name
      value
      xfdf
      isDeleted
      isInternal
    }
  }
`;

const GET_DOCUMENT_OUTLINES = gql`
  query getDocumentOutlines($input: GetDocumentOutlinesInput!) {
    getDocumentOutlines(input: $input) {
      name
      parentId
      pathId
      level
      pageNumber
      verticalOffset
      horizontalOffset
      hasChildren
    }
  }
`;

const IMPORT_DOCUMENT_OUTLINES = gql`
  mutation importDocumentOutlines($input: ImportDocumentOutlinesInput!) {
    importDocumentOutlines(input: $input) {
      ...BasicResponseData
    }
  }
  ${Fragments.BasicResponseData}
`;

const CREATE_PRESIGNED_FORM_FIELD_DETECTION_URL = gql`
  query createPresignedFormFieldDetectionUrl($input: CreatePresignedFormFieldDetectionUrlInput!) {
    createPresignedFormFieldDetectionUrl(input: $input) {
      blockTime
      presignedUrl
      sessionId
      usage
      sessionId
      isExceeded
    }
  }
`;

const BATCH_CREATE_PRESIGNED_FORM_FIELD_DETECTION_URL = gql`
  query batchCreatePresignedFormFieldDetectionUrl($inputs: BatchCreatePresignedFormFieldDetectionUrlInput!) {
    batchCreatePresignedFormFieldDetectionUrl(inputs: $inputs) {
      blockTime
      presignedUrl
      sessionId
      usage
      isExceeded
    }
  }
`;

const PROCESS_APPLIED_FORM_FIELDS = gql`
  query processAppliedFormFields($input: ProcessAppliedFormFieldsInput!) {
    processAppliedFormFields(input: $input) {
      ...BasicResponseData
    }
  }
  ${Fragments.BasicResponseData}
`;

const CHECK_DOWNLOAD_MULTIPLE_DOCUMENTS = gql`
  query checkDownloadMultipleDocuments($input: CheckDownloadMultipleDocumentsInput!) {
    checkDownloadMultipleDocuments(input: $input) {
      isDocStackInsufficient
      isDocumentLimitExceeded
      isTotalSizeExceeded
      totalDocuments
    }
  }
`;

const UPDATE_STACKED_DOCUMENTS = gql`
  mutation updateStackedDocuments($input: UpdateStackedDocumentsInput!) {
    updateStackedDocuments(input: $input) {
      message
      statusCode
    }
  }
`;

const SUB_DOCUMENT_SHARING_QUEUE = gql`
  subscription documentSharingQueue($clientId: ID!) {
    documentSharingQueue(clientId: $clientId) {
      isChannelSharing
      documentName
      isOverwritePermission
      hasUnshareableEmails
      documentId
    }
  }
`;

const CHECK_SHARE_THIRD_PARTY_DOCUMENT = gql`
  query checkShareThirdPartyDocument($input: CheckShareThirdPartyDocumentInput!) {
    checkShareThirdPartyDocument(input: $input) {
      isAllowed
    }
  }
`;

const GET_DOCUMENT_TEMPLATE_WITH_FORM_FIELD = gql`
  query documentTemplate($documentId: ID!) {
    documentTemplate: documentTemplate(documentId: $documentId) {
      ...DocumentTemplateData
      etag
      signedUrl
      enableGoogleSync
      isShared
      version
      thumbnailRemoteId
      belongsTo {
        type
        workspaceId
        location {
          _id
          name
          ownedOrgId
          url
        }
      }
      premiumToolsInfo {
        ...PremiumToolsInfo
      }
      status {
        isSyncing
      }
      actionCountDocStack {
        print
        download
        share
        sync
      }
      manipulationStep
      metadata {
        hasAppliedOCR
        hasMerged
        hasOutlines
      }
    }
    getFormField(documentId: $documentId) {
      name
      value
      xfdf
      isDeleted
      isInternal
    }
  }
  ${Fragments.DocumentTemplateData}
  ${Fragments.PremiumToolsInfo}
`;

const UPDATE_DOCUMENT_MIME_TYPE_TO_PDF = gql`
  mutation updateDocumentMimeTypeToPdf($documentId: ID!, $remoteId: String!) {
    updateDocumentMimeTypeToPdf(documentId: $documentId, remoteId: $remoteId) {
      message
      statusCode
      data
    }
  }
`;

export {
  GET_DOCUMENT_BY_REMOTEID_AND_CLIENTID,
  MORE_DOCUMENTS_USER,
  RENAME_DOCUMENT,
  DELETE_DOCUMENT,
  CREATE_DOCUMENTS,
  UPDATE_SHARE_SETTING_DOCUMENT,
  GET_SHAREES_DOCUMENT,
  SHARE_DOCUMENT,
  STAR_DOCUMENT,
  SHARE_DOCUMENT_BY_EMAIL,
  GET_DOCUMENT_TOUR,
  UPDATE_THUMBNAIL,
  UPDATE_BOOKMARKS,
  UPDATE_MIMETYPE,
  UPDATE_SHARE_DOCUMENT_PERMISSION,
  REMOVE_SHARE_DOCUMENT_PERMISSION,
  SUB_UPDATE_DOCUMENT_LIST,
  SUB_UPDATE_DOCUMENT_INFO,
  CREATE_PDF_FORM,
  GET_FORM_LIST,
  SUB_UPDATE_BOOKMARK,
  SUB_DELETE_ORIGINAL_DOCUMENT,
  REQUEST_ACCESS_DOCUMENT,
  ACCEPT_REQUEST_ACCESS_DOCUMENT,
  REJECT_REQUEST_ACCESS_DOCUMENT,
  GET_REQUEST_ACCESS_DOCLIST,
  GET_SHARE_INVITE_BY_EMAIL,
  GET_MENTION_LIST_BY_DOCUMENT_ID,
  GET_PDF_INFO,
  DELETE_MULTIPLE_DOCUMENT,
  DELETE_SHARED_DOCUMENTS,
  GET_TOTAL_DOCUMENTS,
  GET_INDIVIDUAL_SHAREES_DOCUMENT,
  GET_FULL_SHAREES_DOCUMENT,
  DUPLICATE_DOCUMENT,
  DUPLICATE_DOCUMENT_TO_FOLDER,
  MOVE_DOCUMENTS,
  MOVE_DOCUMENTS_TO_FOLDER,
  GET_DOCUMENTS_IN_FOLDER,
  GET_DOCUMENT_BY_ID,
  BULK_UPDATE_DOCUMENT_INVITED_LIST,
  BULK_UPDATE_DOCUMENT_MEMBER_LIST,
  DOWNLOAD_DOCUMENT,
  CREATE_USER_STARTED_DOCUMENT,
  CREATE_ORG_STARTED_DOCUMENT,
  TRACKING_USER_USE_DOCUMENT,
  GET_REQUEST_ACCESS_DOC_BY_ID,
  GET_DOC_STACK_INFO,
  CHECK_THIRD_PARTY_STORAGE,
  GET_ANNOTATIONS,
  GET_PREMIUM_TOOLS_INFO_FOR_USER,
  FIND_AVAILABLE_LOCATION,
  GET_PRESIGNED_URL_FOR_IMAGE,
  GET_SIGNED_URL_FOR_SIGNATURE,
  GET_ORIGINAL_FILE_URL,
  RESTORE_ORIGINAL_VERSION,
  DELETE_DOCUMENT_IMAGES,
  GET_PRESIGNED_URL_FOR_TEMPORARY_DRIVE,
  CREATE_TEMPORARY_CONTENT_FOR_DRIVE,
  DELETE_TEMPORARY_CONTENT_FOR_DRIVE,
  GET_PRESIGNED_URL_UPLOAD_DOC,
  GET_PRESIGNED_URL_FOR_LUMIN_SIGN_INTERGRATION,
  GET_PRESIGNED_URL_UPLOAD_THUMBNAIL,
  GET_DOCUMENT_ETAG,
  GET_SIGNED_URL_TO_USE_OCR,
  GET_TEMPORARY_DOCUMENT_PRESIGNED_URL,
  GET_PRESIGNED_URL_FOR_MULTIPLE_DOCUMENT_IMAGES,
  CREATE_PDF_FROM_STATIC_TOOL_UPLOAD,
  GET_SIGNED_URL_FOR_ANNOTATIONS,
  REFRESH_DOCUMENT_IMAGE_SIGNED_URLS,
  GET_DOCUMENT_OUTLINES,
  IMPORT_DOCUMENT_OUTLINES,
  GET_PROMPT_INVITE_USERS_BANNER as GET_PROMPT_INVITE_GOOGLE_USERS,
  GET_FORM_FIELD,
  GET_DOCUMENT_WITH_ANNOTATION_AND_FORM_FIELD,
  CREATE_PRESIGNED_FORM_FIELD_DETECTION_URL,
  COUNT_DOC_STACK_USAGE,
  CHECK_DOWNLOAD_MULTIPLE_DOCUMENTS,
  UPDATE_STACKED_DOCUMENTS,
  SUB_DOCUMENT_SHARING_QUEUE,
  PROCESS_APPLIED_FORM_FIELDS,
  GET_SIGNED_URL_FOR_EXTERNAL_PDF,
  CHECK_SHARE_THIRD_PARTY_DOCUMENT,
  BATCH_CREATE_PRESIGNED_FORM_FIELD_DETECTION_URL,
  GET_DOCUMENT_TEMPLATE_WITH_FORM_FIELD,
  UPDATE_DOCUMENT_MIME_TYPE_TO_PDF,
};
