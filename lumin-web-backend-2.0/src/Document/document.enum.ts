export enum DocumentStorageEnum {
  S3 = 's3',
  GOOGLE = 'google',
  DROPBOX = 'dropbox',
  ONEDRIVE = 'onedrive',
}

export enum DocumentRoleEnum {
  OWNER = 'owner',
  TEAM = 'team',
  SHARER = 'sharer',
  EDITOR = 'editor',
  VIEWER = 'viewer',
  SPECTATOR = 'spectator',
  ORGANIZATION = 'organization',
  ORGANIZATION_TEAM = 'organization_team',
  GUEST = 'guest',
}

export enum DocumentOwnerTypeEnum {
  PERSONAL = 'PERSONAL',
  TEAM = 'TEAM',
  ORGANIZATION = 'ORGANIZATION',
  ORGANIZATION_TEAM = 'ORGANIZATION_TEAM'
}

export enum DocumentPermissionOfMemberEnum {
  SHARER = 'sharer',
  EDITOR = 'editor',
  VIEWER = 'viewer',
  SPECTATOR = 'spectator'
}

export enum ShareSettingPermissionEnum {
  VIEWER = 'VIEWER',
  SPECTATOR = 'SPECTATOR',
  EDITOR = 'EDITOR'
}

export enum ShareSettingLinkTypeEnum {
  ANYONE = 'ANYONE',
  INVITED = 'INVITED'
}

export enum DocumentWorkspace {
  ORGANIZATION = 'organization',
}

export enum DocStackIntervalEnum {
  DAY = 'd',
  MONTH = 'M'
}

export enum DocumentMimeType {
  PDF = 'application/pdf',
  PNG = 'image/png',
  JPEG = 'image/jpeg',
  JPG = 'image/jpg',
  DOC = 'application/msword',
  DOCX = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  XLS = 'application/vnd.ms-excel',
  XLSX = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  PPTX = 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  OCTET_STREAM = 'application/octet-stream',
  PPT = 'application/vnd.ms-powerpoint',
}

export enum ShareTypeEnum {
  PUBLIC = 'Public',
  ORGANIZATION = 'Organization',
  ORGANIZATION_TEAM = 'Organization Team',
  SPECIFIC_USER = 'Specific User',
  PRIVATE = 'Private',
}

export type SIGNATURE_MIMETYPE = Pick<typeof DocumentMimeType, 'JPG' | 'PNG' |'JPEG' >

export enum DocumentFromSourceEnum {
  USER_UPLOAD = 'USER_UPLOAD',
  LUMIN_TEMPLATES_LIBRARY = 'LUMIN_TEMPLATES_LIBRARY',
}

export enum DocumentIndexingStatusEnum {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

export enum DocumentIndexingOriginEnum {
  LUMIN_PDF = 'LUMIN_PDF',
  LUMIN_SIGN = 'LUMIN_SIGN',
}

export enum DocumentKindEnum {
  TEMPLATE = 'TEMPLATE',
}
