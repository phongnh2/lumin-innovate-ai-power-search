import { DocumentPermissionOfMemberEnum, DocumentRoleEnum } from 'Document/document.enum';

export const INTERNAL_DOCUMENT_PERMISSION_ROLE = [DocumentRoleEnum.ORGANIZATION_TEAM, DocumentRoleEnum.ORGANIZATION];

export const ORIGINAL_DOCUMENT_PERMISSION_ROLE = [DocumentRoleEnum.OWNER, DocumentRoleEnum.ORGANIZATION, DocumentRoleEnum.ORGANIZATION_TEAM];

export const DEFAULT_TEAM_MEMBER_DOCUMENT_PERMISSION = DocumentPermissionOfMemberEnum.EDITOR;

export const DEFAULT_ORG_MEMBER_DOCUMENT_PERMISSION = DocumentPermissionOfMemberEnum.SHARER;

export const DEFAULT_TEAM_DOCUMENT_OWNER_PERMISSION = DocumentPermissionOfMemberEnum.SHARER;

export const DEFAULT_ORG_DOCUMENT_OWNER_PERMISSION = DocumentPermissionOfMemberEnum.SHARER;

export const PRIORITY_ROLE = {
  [DocumentRoleEnum.SHARER]: 1,
  [DocumentRoleEnum.EDITOR]: 2,
  [DocumentRoleEnum.VIEWER]: 3,
  [DocumentRoleEnum.SPECTATOR]: 4,
};

export const DEFAULT_ANNOT_ORDER = 1;

export const INITIAL_DOC_STACK_QUANTITY = 1;

export const MAX_THUMBNAIL_SIZE = 0.5 * 1024 * 1024;

export const AUTO_SYNC_BYTE_MAXIMUM = 20 * 1024 * 1024;

export const ANNOTATION_IMAGE_BASE_PATH = 'annotation-image';

export const OCR_LIMIT_SIZE = 30 * 1024 * 1024;

export const CONVERSION_LIMIT_SIZE = 100 * 1024 * 1024;

export const RUBBER_STAMP_MAXIMUM = 100;

export const MAX_DOCUMENT_SIZE_FOR_INDEXING = 20 * 1024 * 1024;

export enum OutlineActionEnum {
  INSERT = 'insert',
  EDIT = 'edit',
  DELETE = 'delete',
  MOVE = 'move',
  REFRESH = 'refresh',
}

export enum OutlineMoveDirectionsEnum {
  UP = 'up',
  DOWN = 'down',
  INTO = 'into',
}

export const OUTLINE_NAME_MAX_LENGTH = 255;

export const INPUT_CONTENT_MAX_LENGTH = 10000;

export const MAX_NESTED_OUTLINE_LEVEL = 100;

export const MAX_OUTLINE_PER_LEVEL = 10000;
export const MAX_OUTLINE_PER_CHUNK = 100;
export const MAX_OUTLINE_PER_DOCUMENT = MAX_NESTED_OUTLINE_LEVEL * MAX_OUTLINE_PER_LEVEL;

export const MAXIMUM_RECENT_DOCUMENTS = 300;

export const MAX_DOCUMENTS_PER_DOWNLOAD = 20;

export const MAX_DOCUMENTS_SIZE_PER_DOWNLOAD = 500 * 1024 * 1024;

export const STYLING_IMPACT_TEMPLATES = 'styling_impact_templates';
