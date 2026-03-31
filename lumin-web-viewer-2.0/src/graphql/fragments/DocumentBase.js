import { gql } from '@apollo/client';

export const DocumentCapabilities = gql`
  fragment DocumentCapabilities on Document {
    capabilities {
      canEditDocumentActionPermission
      canCopy
      canExport
      canPrint
      canSaveAsTemplate
      canMerge
      canSendForSignatures
      canRequestSignatures
      canSaveACertifiedVersion
      principleList
    }
  }
`;

export const DocumentData = gql`
  fragment DocumentData on Document {
    _id
    name
    remoteId
    remoteEmail
    size
    service
    mimeType
    ownerId
    ownerName
    ownerEmail
    ownerAvatarRemoteId
    lastModify
    lastAccess
    createdAt
    roleOfDocument
    isPersonal
    shareSetting {
      link
      permission
      linkType
    }
    thumbnail
    listUserStar
    isOverTimeLimit
    ownerOfTeamDocument
    documentType
    clientId
    isShared
    folderData {
      _id
      name
      canOpen
    }
    folderId
    belongsTo {
      workspaceId
    }
    externalStorageAttributes
    ...DocumentCapabilities
  }
  ${DocumentCapabilities}
`;
