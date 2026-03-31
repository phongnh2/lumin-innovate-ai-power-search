/* eslint-disable max-classes-per-file */
export class NotiDocument {
  public static readonly CREATE = 0;

  public static readonly DELETE = 1;

  public static readonly SHARE = 2;

  public static readonly UPLOADED_IN_TEAM = 3;

  public static readonly REQUEST_ACCESS = 4;

  public static readonly ACCEPT_REQUEST_ACCESS = 5;

  public static readonly UPLOAD_DOCUMENT_ORGANIZATION = 6;

  public static readonly UPLOAD_DOCUMENT_ORGANIZATION_TEAM = 7;

  public static readonly UPDATE_USER_PERMISSION = 8;

  public static readonly UPDATE_ANNOT_OF_ANOTHER = 9;

  public static readonly REMOVE_SHARED_USER = 10;

  public static readonly RESTORE_ORIGINAL_VERSION = 11;

  public static readonly RESTORE_DOCUMENT_VERSION = 12;
}

export class NotiComment {
  public static readonly CREATE = 50;

  public static readonly DELETE = 51;

  public static readonly MENTION = 52;

  public static readonly REPLY = 53;
}

export class NotiPayment {
  public static readonly CREATE = 100;

  public static readonly CANCEL = 101;

  public static readonly UPGRADE = 102;

  public static readonly RENEW_SUCCESS = 103;

  public static readonly RENEW_FAIL = 104;

  public static readonly CREATE_SUCCESS = 105;
}

export class NotiTeam {
  public static readonly ADD_MEMBER = 150;

  public static readonly DELETE_DOCUMENT_TEAM = 151;

  public static readonly ADD_MEMBER_LIST = 152;

  // public static readonly DELETE_MEMBER = 153;

  // public static readonly DELETE_MEMBER_LIST = 154;

  public static readonly TRANSFER_OWNER = 155;

  public static readonly TRANSFER_OWNER_LIST = 156;

  public static readonly CHANGE_ROLE = 157;

  public static readonly DELETE_TEAM = 158;

  // public static readonly LEAVE_TEAM = 159;

  public static readonly MOVE_FILE = 160;

  public static readonly DELETE_MULTI_DOCUMENT = 161;
}

export class NotiOrg {
  public static readonly REQUEST_JOIN = 200;

  public static readonly INVITE_JOIN = 201;

  public static readonly TRANSFER_OWNER = 202;

  public static readonly UPDATE_ORGANIZATION_ROLE = 203;

  public static readonly LEAVE_ORG = 204;

  public static readonly REMOVE_MEMBER = 205;

  public static readonly ACCEPT_REQUEST_ACCESS_ORG = 206;

  public static readonly REMOVE_DOCUMENT = 207;

  public static readonly DELETE_MULTI_DOCUMENT = 208;

  public static readonly DISABLED_AUTO_APPROVE = 209;

  public static readonly AUTO_JOIN_ORG = 210;

  public static readonly DELETE_ORGANIZATION = 211;

  public static readonly STOP_TRANSFER_ADMIN = 212;

  public static readonly CONVERT_TO_MAIN_ORGANIZATION = 213;

  public static readonly CONVERT_TO_CUSTOM_ORGANIZATION = 214;

  public static readonly DELETE_ORGANIZATION_TEMPLATE = 215;

  public static readonly UPLOAD_TEMPLATE = 216;

  public static readonly REMOVE_ASSOCIATE_DOMAIN = 217;

  public static readonly FIRST_USER_MANUALLY_JOIN_ORG = 218;

  public static readonly FIRST_MEMBER_INVITE_COLLABORATOR = 219;

  public static readonly INVITE_JOIN_SAME_UNPOPULAR_DOMAIN = 220;

  public static readonly MEMBERS_OF_FREE_CIRCLE_START_FREE_TRIAL = 221;

  public static readonly MEMBERS_OF_FREE_CIRCLE_UPGRADE_SUBSCRIPTION = 222;

  public static readonly ANYONE_CAN_JOIN_ENABLED_AUTOMATICALLY = 223;

  public static readonly DELETE_MULTI_FOLDER = 224;

  public static readonly JOIN_ORG_VIA_INVITE_LINK = 225;

  public static readonly TRANSFER_AGREEMENT_TO_ANOTHER_ORG = 226;

  public static readonly LUMIN_ADMIN_DELETE_ORG = 227;

  public static readonly ASSIGNED_SIGN_SEATS = 228;

  public static readonly UNASSIGNED_SIGN_SEATS = 229;

  public static readonly REJECT_SIGN_SEAT_REQUEST = 230;
}

export class NotiOrgTeam {
  public static readonly ADD_MEMBER = 250;

  public static readonly TRANSFER_OWNER = 251;

  public static readonly REMOVE_MEMBER = 254;

  public static readonly LEAVE_ORG_TEAM = 252;

  public static readonly DELETE_TEAM = 253;

  public static readonly DELETE_MULTI_DOCUMENT = 255;

  public static readonly DELETE_DOCUMENT = 256;

  public static readonly DELETE_TEAM_TEMPLATE = 257;

  public static readonly UPLOAD_TEMPLATE = 258;

  public static readonly DELETE_MULTI_FOLDER = 259;

  public static readonly TEAM_MEMBER_INVITED = 260;
}

export class NotiFolder {
  public static readonly DELETE_ORG_FOLDER = 300;

  public static readonly DELETE_TEAM_FOLDER = 301;

  public static readonly CREATE_ORG_FOLDER = 302;

  public static readonly CREATE_TEAM_FOLDER = 303;
}

export class NotificationTargetType {
  public static readonly USER = 'user';

  public static readonly TEAM = 'team';

  public static readonly ORGANIZATION = 'organization';

  public static readonly NON_USER = 'non-user';
}

export class NotificationEntityType {
  public static readonly USER = 'user';

  public static readonly ORGANIZATION = 'organization';

  public static readonly TEAM = 'team';

  public static readonly DOCUMENT = 'document';

  public static readonly FOLDER = 'folder';
}

export class NotificationType {
  public static readonly DOCUMENT = 'DocumentNotification';

  public static readonly COMMENT = 'CommentNotification';

  public static readonly PAYMENT = 'PaymentNotification';

  public static readonly TEAM = 'TeamNotification';

  public static readonly ORGANIZATION = 'OrganizationNotification';

  public static readonly FOLDER = 'FolderNotification';

  public static readonly CONTRACT = 'ContractNotification';
}

export const MAX_UNREAD_COUNT_QUERY = 100;

export const LIMIT_NOTIFICATIONS_PER_QUERY = 10;

export const MAX_TEAM_MEMBERS_FOR_ALL_NOTI = 20;

export const ORGANIZATION_ACTION_TYPES_FOR_SIGN_PRODUCT = [
  NotiOrg.REQUEST_JOIN,
  NotiOrg.INVITE_JOIN,
  NotiOrg.TRANSFER_OWNER,
  NotiOrg.UPDATE_ORGANIZATION_ROLE,
  NotiOrg.LEAVE_ORG,
  NotiOrg.REMOVE_MEMBER,
  NotiOrg.ACCEPT_REQUEST_ACCESS_ORG,
  NotiOrg.DISABLED_AUTO_APPROVE,
  NotiOrg.AUTO_JOIN_ORG,
  NotiOrg.DELETE_ORGANIZATION,
  NotiOrg.STOP_TRANSFER_ADMIN,
  NotiOrg.FIRST_USER_MANUALLY_JOIN_ORG,
  NotiOrg.FIRST_MEMBER_INVITE_COLLABORATOR,
  NotiOrg.INVITE_JOIN_SAME_UNPOPULAR_DOMAIN,
  NotiOrg.MEMBERS_OF_FREE_CIRCLE_START_FREE_TRIAL,
  NotiOrg.MEMBERS_OF_FREE_CIRCLE_UPGRADE_SUBSCRIPTION,
  NotiOrg.ANYONE_CAN_JOIN_ENABLED_AUTOMATICALLY,
  NotiOrg.JOIN_ORG_VIA_INVITE_LINK,
  NotiOrg.TRANSFER_AGREEMENT_TO_ANOTHER_ORG,
  NotiOrg.ASSIGNED_SIGN_SEATS,
  NotiOrg.UNASSIGNED_SIGN_SEATS,
  NotiOrg.REJECT_SIGN_SEAT_REQUEST,
];
