import { DocumentRole } from './documentConstants';
// 1 - 100 ( DOCUMENT NOTI RELATION )
// 100 - 150 ( PAYMENT NOTI )

export const NotiDocument = {
  CREATE: 0,
  DELETE: 1,
  SHARE: 2,
  UPLOADED_IN_TEAM: 3,
  REQUEST_TO_ACCESS: 4,
  REQUEST_ACCEPTED: 5,
  UPLOAD_ORGANIZATION_DOCUMENT: 6,
  UPLOAD_ORG_TEAM_DOCUMENT: 7,
  UPDATE_USER_PERMISSION: 8,
  UPDATE_ANNOT_OF_ANOTHER: 9,
  REMOVE_SHARED_USER: 10,
  RESTORE_ORIGINAL_VERSION: 11,
  RESTORE_DOCUMENT_VERSION: 12,
};

export const NotiComment = {
  CREATE: 50,
  DELETE: 51,
  MENTION: 52,
  REPLY: 53,
};

// export const NotiPayment = {
//   CREATE: 100,
//   CANCEL: 101,
//   UPGRADE: 102,
//   RENEW_SUCCESS: 103,
//   RENEW_FAIL: 104,
//   CREATE_SUCCESS: 105,
// };

export const NotiTeam = {
  ADD_MEMBER: 150,
  DELETE_DOCUMENT_TEAM: 151,
  ADD_MEMBER_LIST: 152,
  DELETE_MEMBER: 153,
  DELETE_MEMBER_LIST: 154,
  TRANSFER_OWNER: 155,
  TRANSFER_OWNER_LIST: 156,
  CHANGE_ROLE: 157,
  DELETE_TEAM: 158,
  LEAVE_TEAM: 159,
  MOVE_FILE: 160,
  DELETE_MULTI_DOCUMENT: 161,
  DELETE_TEAM_TEMPLATE: 162,
};

export const NotiOrg = {
  REQUEST_JOIN: 200,
  INVITE_JOIN: 201,
  TRANSFER_OWNER: 202,
  UPDATE_USER_ROLE: 203,
  LEAVE_ORG: 204,
  REMOVE_MEMBER: 205,
  ACCEPT_REQUEST_ACCESS_ORG: 206,
  REMOVE_DOCUMENT: 207,
  DELETE_MULTI_DOCUMENT: 208,
  DISABLED_AUTO_APPROVE: 209,
  AUTO_JOIN_ORGANIZATION: 210,
  DELETE_ORGANIZATION: 211,
  STOP_TRANSFER_ADMIN: 212,
  CONVERT_TO_MAIN_ORGANIZATION: 213,
  CONVERT_TO_CUSTOM_ORGANIZATION: 214,
  DELETE_ORGANIZATION_TEMPLATE: 215,
  UPLOAD_TEMPLATE: 216,
  REMOVE_ASSOCIATE_DOMAIN: 217,
  FIRST_USER_MANUALLY_JOIN_ORG: 218,
  FIRST_MEMBER_INVITE_COLLABORATOR: 219,
  INVITE_JOIN_SAME_UNPOPULAR_DOMAIN: 220,
  MEMBERS_OF_FREE_CIRCLE_START_FREE_TRIAL: 221,
  MEMBERS_OF_FREE_CIRCLE_UPGRADE_SUBSCRIPTION: 222,
  ANYONE_CAN_JOIN_ENABLED_AUTOMATICALLY: 223,
  DELETE_MULTI_FOLDER: 224,
  JOIN_ORG_VIA_INVITE_LINK: 225,
  TRANSFER_AGREEMENT_TO_ANOTHER_ORG: 226,
  LUMIN_ADMIN_DELETE_ORG: 227,
  ASSIGNED_SIGN_SEATS: 228,
  UNASSIGNED_SIGN_SEATS: 229,
  REJECT_SIGN_SEAT_REQUEST: 230,
};

export const NotiOrgTeam = {
  ADD_MEMBER: 250,
  TRANSFER_OWNER: 251,
  LEAVE_ORG_TEAM: 252,
  REMOVE_MEMBER: 254,
  DELETE_TEAM: 253,
  DELETE_MULTIPLE_DOCUMENTS: 255,
  DELETE_SINGLE_DOCUMENT: 256,
  DELETE_TEAM_TEMPLATE: 257,
  UPLOAD_TEMPLATE: 258,
  DELETE_MULTI_FOLDER: 259,
  TEAM_MEMBER_INVITED: 260,
};

export const NotiContract = {
  APPROVE: 400,
  REJECT: 401,
  NO_RESPONSE: 402,
  ASSIGNED_SIGNER: 403,
  ASSIGNED_VIEWER: 404,
  REMOVED_SIGNER: 405,
  REMOVED_VIEWER: 406,
  MOVE_TO_APPROVE: 407,
  MOVE_TO_REJECT: 408,
  // TODO: handle this if Lumin sign is supported
  // REQUEST_TO_SIGN: 409,
  REJECT_TO_SIGN: 410,
  REMINDER: 411,
  TAGGED_IN_COMMENT: 412,
  COMMENT: 413,
  TAGGED_IN_REPLY: 414,
  REPLY: 415,
  // APPROVE_TO_SIGN: 416,
  UPDATE_DUE_TIME: 417,
  CHANGED_ROLE_SIGNER_TO_VIEWER: 418,
  CHANGED_ROLE_VIEWER_TO_SINGER: 419,
};

export const NotiType = {
  DOCUMENT: 'DocumentNotification',
  TEAM: 'TeamNotification',
  COMMENT: 'CommentNotification',
  PAYMENT: 'PaymentNotification',
  ORGANIZATION: 'OrganizationNotification',
  FOLDER: 'FolderNotification',
  CONTRACT: 'ContractNotification',
};

export class NotiFolder {
  static Notification = {
    Organization: {
      DELETE_ORG_FOLDER: 300,
      DELETE_TEAM_FOLDER: 301,
      CREATE_ORG_FOLDER: 302,
      CREATE_TEAM_FOLDER: 303,
    },
    Personal: {},
  };

  static isOrganizationNoti(notificationName) {
    return Object.values(NotiFolder.Notification.Organization).includes(notificationName);
  }
}

export const NotificationTabs = {
  GENERAL: 'GENERAL',
  INVITES: 'INVITES',
  REQUESTS: 'REQUESTS',
};

export const NotiDocumentRoleActions = {
  [DocumentRole.SPECTATOR]: 'View',
  [DocumentRole.VIEWER]: 'Comment',
  [DocumentRole.EDITOR]: 'Edit',
  [DocumentRole.SHARER]: 'Share',
};

export const NotiDocumentName = {
  [NotiDocument.CREATE]: 'documentCreated',
  [NotiDocument.DELETE]: 'sharedDocumentDeleted',
  [NotiDocument.SHARE]: 'documentShared',
  [NotiDocument.UPLOADED_IN_TEAM]: 'teamDocumentUploaded',
  [NotiDocument.REQUEST_TO_ACCESS]: 'documentPermissionRequested',
  [NotiDocument.REQUEST_ACCEPTED]: 'documentPermissionRequestApproved',
  [NotiDocument.UPLOAD_ORGANIZATION_DOCUMENT]: 'circleDocumentUploaded',
  [NotiDocument.UPLOAD_ORG_TEAM_DOCUMENT]: 'teamDocumentUploaded',
  [NotiDocument.UPDATE_USER_PERMISSION]: 'documentPermissionUpdated',
  [NotiDocument.UPDATE_ANNOT_OF_ANOTHER]: 'annotationUpdated',
  [NotiDocument.REMOVE_SHARED_USER]: 'sharedDocumentAccessRemoved',
  [NotiDocument.RESTORE_ORIGINAL_VERSION]: 'documentRestored',
};

export const NotiCommentName = {
  [NotiComment.CREATE]: 'commentAdded',
  [NotiComment.DELETE]: 'commentDeleted',
  [NotiComment.MENTION]: 'commentMentioned',
  [NotiComment.REPLY]: 'commentReplied',
};

export const NotiOwnerCommentName = {
  [NotiComment.REPLY]: 'commentOwnedReplied',
};

export const NotiTeamName = {
  [NotiTeam.ADD_MEMBER]: 'invitedToPersonalTeam',
  [NotiTeam.DELETE_DOCUMENT_TEAM]: 'personalTeamDocumentDeleted',
  [NotiTeam.ADD_MEMBER_LIST]: 'personalTeamMemberInvited',
  [NotiTeam.DELETE_MEMBER]: 'personalTeamMemberRemoved',
  [NotiTeam.DELETE_MEMBER_LIST]: 'personalTeamMembersRemoved',
  [NotiTeam.TRANSFER_OWNER]: 'receivedPersonalTeamOwnership',
  [NotiTeam.TRANSFER_OWNER_LIST]: 'personalTeamOwnershipTransferred',
  [NotiTeam.CHANGE_ROLE]: 'personalTeamRoleChanged',
  [NotiTeam.DELETE_TEAM]: 'personalTeamDeleted',
  [NotiTeam.LEAVE_TEAM]: 'personalTeamMemberLeft',
  [NotiTeam.MOVE_FILE]: 'personalTeamDocumentMoved',
  [NotiTeam.DELETE_MULTI_DOCUMENT]: 'multiPersonalTeamDocumentDeleted',
  [NotiTeam.DELETE_TEAM_TEMPLATE]: 'personalTeamTemplateDeleted',
};

export const NotiOrgName = {
  [NotiOrg.REQUEST_JOIN]: 'circleAccessRequested',
  [NotiOrg.INVITE_JOIN]: 'newCircleMemberInvited',
  [NotiOrg.JOIN_ORG_VIA_INVITE_LINK]: 'newCircleMemberJoinedViaInteLink',
  [NotiOrg.TRANSFER_OWNER]: 'circleOwnershipTransferred',
  [NotiOrg.UPDATE_USER_ROLE]: 'circleRoleChanged',
  [NotiOrg.LEAVE_ORG]: 'circleMemberLeft',
  [NotiOrg.REMOVE_MEMBER]: 'circleMemberRemoved',
  [NotiOrg.ACCEPT_REQUEST_ACCESS_ORG]: 'circleAccessAccepted',
  [NotiOrg.REMOVE_DOCUMENT]: 'circleDocumentDeleted',
  [NotiOrg.DELETE_MULTI_DOCUMENT]: 'circleMultipleDocumentsDeleted',
  [NotiOrg.DISABLED_AUTO_APPROVE]: 'circleSettingRequestToJoinEnabled',
  [NotiOrg.AUTO_JOIN_ORGANIZATION]: 'newCircleMemberJoined',
  [NotiOrg.DELETE_ORGANIZATION]: 'circleDeleted',
  [NotiOrg.STOP_TRANSFER_ADMIN]: 'transferringCircleOwnershipDeleted',
  [NotiOrg.CONVERT_TO_MAIN_ORGANIZATION]: 'convertedToMainCircle',
  [NotiOrg.CONVERT_TO_CUSTOM_ORGANIZATION]: 'convertedToCustomCircle',
  [NotiOrg.DELETE_ORGANIZATION_TEMPLATE]: 'circleTemplateDeleted',
  [NotiOrg.UPLOAD_TEMPLATE]: 'circleTemplateUploaded',
  [NotiOrg.REMOVE_ASSOCIATE_DOMAIN]: 'circleAssociatedDomainRemovedByLuminAdmin',
  [NotiOrg.FIRST_USER_MANUALLY_JOIN_ORG]: 'circleAnyoneCanJoin',
  [NotiOrg.FIRST_MEMBER_INVITE_COLLABORATOR]: 'circleAnyoneCanInvite',
  [NotiOrg.INVITE_JOIN_SAME_UNPOPULAR_DOMAIN]: 'newCircleMemberSameDomainInvited',
  [NotiOrg.MEMBERS_OF_FREE_CIRCLE_START_FREE_TRIAL]: 'circleMemberGrantedAdminAsStartTrial',
  [NotiOrg.MEMBERS_OF_FREE_CIRCLE_UPGRADE_SUBSCRIPTION]: 'circleMemberGrantedAdminAsUpgradedSubs',
  [NotiOrg.ANYONE_CAN_JOIN_ENABLED_AUTOMATICALLY]: 'circleSettingAnyoneCanJoinEnabled',
  [NotiOrg.TRANSFER_AGREEMENT_TO_ANOTHER_ORG]: 'circleMemberLeft',
  [NotiOrg.LUMIN_ADMIN_DELETE_ORG]: 'circleDeletedByLuminAdmin',
  [NotiOrg.ASSIGNED_SIGN_SEATS]: 'signSeatAssigned',
  [NotiOrg.UNASSIGNED_SIGN_SEATS]: 'signSeatUnassigned',
  [NotiOrg.REJECT_SIGN_SEAT_REQUEST]: 'signSeatRequestRejected',
};

export const NotiOwnerOrgName = {
  [NotiOrg.INVITE_JOIN]: 'invitedToCircle',
  [NotiOrg.REMOVE_MEMBER]: 'circleAccessRemoved',
  [NotiOrg.TRANSFER_OWNER]: 'receivedCircleOwnership',
  [NotiOrg.UPDATE_USER_ROLE]: 'yourCircleRoleChanged',
};

export const NotiOrgNameAddition = {
  [NotiOrg.INVITE_JOIN]: 'multipleCircleMembersInvited',
};

export const NotiOrgTeamName = {
  [NotiOrgTeam.ADD_MEMBER]: 'invitedToTeam',
  [NotiOrgTeam.TRANSFER_OWNER]: 'teamOwnershipTransferred',
  [NotiOrgTeam.LEAVE_ORG_TEAM]: 'teamMemberLeft',
  [NotiOrgTeam.REMOVE_MEMBER]: 'teamMemberRemoved',
  [NotiOrgTeam.DELETE_TEAM]: 'teamDeleted',
  [NotiOrgTeam.DELETE_MULTIPLE_DOCUMENTS]: 'teamMultipleDocumentsDeleted',
  [NotiOrgTeam.DELETE_SINGLE_DOCUMENT]: 'teamDocumentDeleted',
  [NotiOrgTeam.DELETE_TEAM_TEMPLATE]: 'teamTemplateDeleted',
  [NotiOrgTeam.UPLOAD_TEMPLATE]: 'teamTemplateUploaded',
  [NotiOrgTeam.TEAM_MEMBER_INVITED]: 'teamMemberInvited',
};

export const NotiOwnerOrgTeamName = {
  [NotiOrgTeam.TRANSFER_OWNER]: 'receivedTeamOwnership',
};

export const NotiFolderName = {
  [NotiFolder.Notification.Organization.CREATE_ORG_FOLDER]: 'circleFolderCreated',
  [NotiFolder.Notification.Organization.CREATE_TEAM_FOLDER]: 'teamFolderCreated',
  [NotiFolder.Notification.Organization.DELETE_ORG_FOLDER]: 'circleFolderDeleted',
  [NotiFolder.Notification.Organization.DELETE_TEAM_FOLDER]: 'teamFolderDeleted',
};

export const NotiContractName = {
  signagreementSent: 'signagreementSent',
  signRoleChanged: 'signRoleChanged',
  signRemindSent: 'signRemindSent',
  signDueDateChanged: 'signDueDateChanged',
  signagreementDeleted: 'signagreementDeleted',
  signagreementApproved: 'signagreementApproved',
  signagreementSigned: 'signagreementSigned',
  signCommentAdded: 'signCommentAdded',
  signCommentMentioned: 'signCommentMentioned',
  signagreementRejected: 'signagreementRejected',
  signNoResponse: 'signNoResponse',
};

export const ContractNotiTypeToName = {
  [NotiContract.APPROVE]: NotiContractName.signagreementSigned,
  [NotiContract.REJECT]: NotiContractName.signagreementRejected,
  [NotiContract.NO_RESPONSE]: NotiContractName.signNoResponse,
  [NotiContract.ASSIGNED_SIGNER]: NotiContractName.signagreementSent,
  [NotiContract.ASSIGNED_VIEWER]: NotiContractName.signagreementSent,
  [NotiContract.REMOVED_SIGNER]: NotiContractName.signagreementDeleted,
  [NotiContract.REMOVED_VIEWER]: NotiContractName.signagreementDeleted,
  [NotiContract.MOVE_TO_APPROVE]: NotiContractName.signagreementApproved,
  [NotiContract.MOVE_TO_REJECT]: NotiContractName.signagreementRejected,
  [NotiContract.REJECT_TO_SIGN]: NotiContractName.signagreementRejected,
  [NotiContract.REMINDER]: NotiContractName.signRemindSent,
  [NotiContract.TAGGED_IN_COMMENT]: NotiContractName.signCommentMentioned,
  [NotiContract.COMMENT]: NotiContractName.signCommentAdded,
  [NotiContract.TAGGED_IN_REPLY]: NotiContractName.signCommentMentioned,
  [NotiContract.REPLY]: NotiContractName.signCommentAdded,
  [NotiContract.UPDATE_DUE_TIME]: NotiContractName.signDueDateChanged,
  [NotiContract.CHANGED_ROLE_SIGNER_TO_VIEWER]: NotiContractName.signRoleChanged,
  [NotiContract.CHANGED_ROLE_VIEWER_TO_SINGER]: NotiContractName.signRoleChanged,
};

export const NotiTypeNameMapping = {
  [NotiType.DOCUMENT]: NotiDocumentName,
  [NotiType.TEAM]: NotiTeamName,
  [NotiType.COMMENT]: NotiCommentName,
  [NotiType.ORGANIZATION]: { ...NotiOrgName, ...NotiOrgTeamName },
  [NotiType.FOLDER]: NotiFolderName,
  [NotiType.CONTRACT]: ContractNotiTypeToName,
};

export const NotiOwnerTypeNameMapping = {
  [NotiType.DOCUMENT]: NotiDocumentName,
  [NotiType.TEAM]: NotiTeamName,
  [NotiType.COMMENT]: { ...NotiCommentName, ...NotiOwnerCommentName },
  [NotiType.ORGANIZATION]: { ...NotiOrgName, ...NotiOwnerOrgName, ...NotiOrgTeamName, ...NotiOwnerOrgTeamName },
  [NotiType.FOLDER]: NotiFolderName,
  [NotiType.CONTRACT]: ContractNotiTypeToName,
};
