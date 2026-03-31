import { PolicyEffect } from 'Common/common.enum';

import { DataLoaderRegistry } from 'DataLoader/dataLoader.registry';

import { DocumentService } from '../../document.service';
import { DocumentActionPermissionService } from '../document.action.permission.service';
import { DocumentAction, DocumentActionPermissionPrinciple, DocumentActionPermissionResource } from '../enums/action.permission.enum';

export interface DocumentActionPermission {
  name: string;
  effect: PolicyEffect;
}

export interface IDocumentActionPermissionModel {
  resource: DocumentActionPermissionResource;
  resourceId: string;
  principle: DocumentActionPermissionPrinciple;
  permissions: DocumentActionPermission[];
  version: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IDocumentActionPermission extends IDocumentActionPermissionModel {
  _id: string;
}

export interface IPolicyRequestResource {
  documentId: string;
  action: DocumentAction;
  resourceAccess: DocumentActionPermissionResource;
}

export interface IPolicyRequestActor {
  role: DocumentActionPermissionPrinciple;
  permissions: DocumentActionPermission[];
}

export interface IPolicyRequestAttribute {
  actor: IPolicyRequestActor;
}

export interface IPolicyRequest {
  resource: IPolicyRequestResource;
  attribute: IPolicyRequestAttribute;
}

export interface IActorRequestData {
  _id: string;
  email: string;
}
export interface IResourceRequestData {
  action: DocumentAction;
  resourceAccess: DocumentActionPermissionResource;
}

export interface IPolicyRequestData {
  actor: IActorRequestData;
  resource: IPolicyRequestResource;
  loaders: DataLoaderRegistry;
}

export interface IVerifyData {
  documentService: DocumentService;
  documentActionPermissionService: DocumentActionPermissionService;
  data: IPolicyRequestData;
}
