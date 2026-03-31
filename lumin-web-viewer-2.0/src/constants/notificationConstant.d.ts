export const NotiDocument: {
  CREATE: number;
  DELETE: number;
  SHARE: number;
  UPLOADED_IN_TEAM: number;
  REQUEST_TO_ACCESS: number;
  REQUEST_ACCEPTED: number;
  UPLOAD_ORGANIZATION_DOCUMENT: number;
  UPLOAD_ORG_TEAM_DOCUMENT: number;
  UPDATE_USER_PERMISSION: number;
  UPDATE_ANNOT_OF_ANOTHER: number;
  REMOVE_SHARED_USER: number;
  RESTORE_ORIGINAL_VERSION: number;
  RESTORE_DOCUMENT_VERSION: number;
};

export const NotiComment: {
  CREATE: number;
  DELETE: number;
  MENTION: number;
  REPLY: number;
};

export const NotiTeam: {
  ADD_MEMBER: number;
  DELETE_DOCUMENT_TEAM: number;
  ADD_MEMBER_LIST: number;
  DELETE_MEMBER: number;
  DELETE_MEMBER_LIST: number;
  TRANSFER_OWNER: number;
  TRANSFER_OWNER_LIST: number;
  CHANGE_ROLE: number;
  DELETE_TEAM: number;
  LEAVE_TEAM: number;
  MOVE_FILE: number;
  DELETE_MULTI_DOCUMENT: number;
  DELETE_TEAM_TEMPLATE: number;
};

export const NotiOrg: {
  REQUEST_JOIN: number;
  INVITE_JOIN: number;
  TRANSFER_OWNER: number;
  UPDATE_USER_ROLE: number;
  LEAVE_ORG: number;
  REMOVE_MEMBER: number;
  ACCEPT_REQUEST_ACCESS_ORG: number;
  REMOVE_DOCUMENT: number;
  DELETE_MULTI_DOCUMENT: number;
  DISABLED_AUTO_APPROVE: number;
  AUTO_JOIN_ORGANIZATION: number;
  DELETE_ORGANIZATION: number;
  STOP_TRANSFER_ADMIN: number;
  CONVERT_TO_MAIN_ORGANIZATION: number;
  CONVERT_TO_CUSTOM_ORGANIZATION: number;
  DELETE_ORGANIZATION_TEMPLATE: number;
  UPLOAD_TEMPLATE: number;
  REMOVE_ASSOCIATE_DOMAIN: number;
  FIRST_USER_MANUALLY_JOIN_ORG: number;
  FIRST_MEMBER_INVITE_COLLABORATOR: number;
  INVITE_JOIN_SAME_UNPOPULAR_DOMAIN: number;
  MEMBERS_OF_FREE_CIRCLE_START_FREE_TRIAL: number;
  MEMBERS_OF_FREE_CIRCLE_UPGRADE_SUBSCRIPTION: number;
  ANYONE_CAN_JOIN_ENABLED_AUTOMATICALLY: number;
  DELETE_MULTI_FOLDER: number;
  JOIN_ORG_VIA_INVITE_LINK: number;
  TRANSFER_AGREEMENT_TO_ANOTHER_ORG: number;
  LUMIN_ADMIN_DELETE_ORG: number;
  ASSIGNED_SIGN_SEATS: number;
  UNASSIGNED_SIGN_SEATS: number;
  REJECT_SIGN_SEAT_REQUEST: number;
};

export const NotiOrgTeam: {
  ADD_MEMBER: number;
  TRANSFER_OWNER: number;
  LEAVE_ORG_TEAM: number;
  REMOVE_MEMBER: number;
  DELETE_TEAM: number;
  DELETE_MULTIPLE_DOCUMENTS: number;
  DELETE_SINGLE_DOCUMENT: number;
  DELETE_TEAM_TEMPLATE: number;
  UPLOAD_TEMPLATE: number;
  DELETE_MULTI_FOLDER: number;
  TEAM_MEMBER_INVITED: number;
};

export const NotiContract: {
  APPROVE: number;
  REJECT: number;
  NO_RESPONSE: number;
  ASSIGNED_SIGNER: number;
  ASSIGNED_VIEWER: number;
  REMOVED_SIGNER: number;
  REMOVED_VIEWER: number;
  MOVE_TO_APPROVE: number;
  MOVE_TO_REJECT: number;
  REQUEST_TO_SIGN: number;
  REJECT_TO_SIGN: number;
  REMINDER: number;
  TAGGED_IN_COMMENT: number;
  COMMENT: number;
  TAGGED_IN_REPLY: number;
  REPLY: number;
  APPROVE_TO_SIGN: number;
  UPDATE_DUE_TIME: number;
  CHANGED_ROLE_SIGNER_TO_VIEWER: number;
  CHANGED_ROLE_VIEWER_TO_SINGER: number;
};

export const NotiType: {
  DOCUMENT: string;
  TEAM: string;
  COMMENT: string;
  PAYMENT: string;
  ORGANIZATION: string;
  FOLDER: string;
  CONTRACT: string;
};

export class NotiFolder {
  static Notification: {
    Organization: {
      DELETE_ORG_FOLDER: number;
      DELETE_TEAM_FOLDER: number;
      CREATE_ORG_FOLDER: number;
      CREATE_TEAM_FOLDER: number;
    };
    Personal: object;
  };
  static isOrganizationNoti(notificationName: string): boolean;
}

export const NotificationTabs: {
  GENERAL: string;
  INVITES: string;
  REQUESTS: string;
};

export const NotiDocumentRoleActions: {
  [key: string]: string;
};

export const NotiDocumentName: {
  [key: string]: string;
};

export const NotiCommentName: {
  [key: string]: string;
};

export const NotiOwnerCommentName: {
  [key: string]: string;
};

export const NotiTeamName: {
  [key: string]: string;
};

export const NotiOrgName: {
  [key: string]: string;
};

export const NotiOwnerOrgName: {
  [key: string]: string;
};

export const NotiOrgNameAddition: {
  [key: string]: string;
};

export const NotiOrgTeamName: {
  [key: string]: string;
};

export const NotiOwnerOrgTeamName: {
  [key: string]: string;
};

export const NotiFolderName: {
  [key: string]: string;
};

export const ContractNotiTypeToName: {
  [key: string]: string;
};

export const NotiContractName: {
  signagreementSent: string;
  signRoleChanged: string;
  signRemindSent: string;
  signDueDateChanged: string;
  signagreementDeleted: string;
  signagreementApproved: string;
  signagreementSigned: string;
  signCommentAdded: string;
  signCommentMentioned: string;
  signagreementRejected: string;
  signNoResponse: string;
};

export const NotiTypeNameMapping: {
  [key: string]: {
    [key: string]: string;
  };
};

export const NotiOwnerTypeNameMapping: {
  [key: string]: {
    [key: string]: string;
  };
};
