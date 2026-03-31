import { DocumentRoleEnum } from 'Document/document.enum';

export enum DocumentAction {
  EXPORT = 'export',
  PRINT = 'print',
  COPY = 'copy',
  SAVE_AS_TEMPLATE = 'saveAsTemplate',
  MERGE = 'merge',
  SEND_FOR_SIGNATURES = 'sendForSignatures',
  REQUEST_SIGNATURES = 'requestSignatures',
  SAVE_A_CERTIFIED_VERSION = 'saveACertifiedVersion',
}

export enum DocumentActionPermissionResource {
  DOCUMENT = 'document',
  DOCUMENT_TEMPLATE = 'document_template',
}

export enum DocumentActionPermissionPrinciple {
  ANYONE = 'anyone',
  OWNER = DocumentRoleEnum.OWNER,
  EDITOR = DocumentRoleEnum.EDITOR,
  SHARER = DocumentRoleEnum.SHARER,
  VIEWER = DocumentRoleEnum.VIEWER,
  SPECTATOR = DocumentRoleEnum.SPECTATOR,
}

export enum PolicyPrinciple {
  ROLE = 'role',
}

export const DOCUMENT_CAPABILITIES = {
  [DocumentAction.EXPORT]: 'canExport',
  [DocumentAction.PRINT]: 'canPrint',
  [DocumentAction.COPY]: 'canCopy',
  [DocumentAction.SAVE_AS_TEMPLATE]: 'canSaveAsTemplate',
  [DocumentAction.MERGE]: 'canMerge',
  [DocumentAction.SEND_FOR_SIGNATURES]: 'canSendForSignatures',
  [DocumentAction.REQUEST_SIGNATURES]: 'canRequestSignatures',
  [DocumentAction.SAVE_A_CERTIFIED_VERSION]: 'canSaveACertifiedVersion',
} as const;

export const DEFAULT_DOCUMENT_CAPABILITIES = {
  canExport: false,
  canCopy: false,
  canPrint: false,
  canSaveAsTemplate: false,
  canMerge: false,
  canSendForSignatures: false,
  canRequestSignatures: false,
  canSaveACertifiedVersion: false,
} as const;
