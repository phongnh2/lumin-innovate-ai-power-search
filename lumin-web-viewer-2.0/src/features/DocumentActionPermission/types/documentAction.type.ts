import { DocumentActionPermissionPrincipleType } from './permissionRole.type';

export type DocumentActionCapabilities = {
  canEditDocumentActionPermission: boolean;
  canExport: boolean;
  canPrint: boolean;
  canCopy: boolean;
  canSaveAsTemplate: boolean;
  canMerge: boolean;
  canSendForSignatures: boolean;
  canRequestSignatures: boolean;
  canSaveACertifiedVersion: boolean;
  principleList: DocumentActionPermissionPrincipleType[];
};
