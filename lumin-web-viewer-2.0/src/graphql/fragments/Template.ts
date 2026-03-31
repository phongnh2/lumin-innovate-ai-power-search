import { gql } from '@apollo/client';

export const DocumentTemplateData = gql`
  fragment DocumentTemplateData on DocumentTemplate {
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
    kind
  }
`;
