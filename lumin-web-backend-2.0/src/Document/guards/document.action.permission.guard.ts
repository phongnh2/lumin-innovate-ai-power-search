import {
  applyDecorators,
  CanActivate,
  ExecutionContext,
  Injectable,
  SetMetadata,
  UseGuards,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { DefaultErrorCode } from 'Common/constants/ErrorCode';
import { GraphErrorException } from 'Common/errors/GraphqlErrorException';
import { Utils } from 'Common/utils/Utils';

import { GqlAttachUserGuard } from 'Auth/guards/graph.attachUser';
import { IGqlRequest } from 'Auth/interfaces/IGqlRequest';
import { DataLoaderRegistry } from 'DataLoader/dataLoader.registry';
import { DocumentAction, DocumentActionPermissionResource } from 'Document/ActionPermission/enums/action.permission.enum';
import { IPolicyRequestData, IVerifyData } from 'Document/ActionPermission/interfaces/document.action.permission.interface';

import { DocumentActionPermissionService } from '../ActionPermission/document.action.permission.service';
import { DocumentService } from '../document.service';
import { DocumentActionPermissionAlgorithm } from './document.action.permission.algorithm';

@Injectable()
export class DocumentActionPermissionGuardInstance implements CanActivate {
  constructor(
    private readonly documentService: DocumentService,
    private readonly documentActionPermissionService: DocumentActionPermissionService,
    protected readonly reflector: Reflector,
  ) {}

  private readonly documentActionPermissionStrategy: DocumentActionPermissionAlgorithm = new DocumentActionPermissionAlgorithm();

  private getRequestData({
    request,
    resource,
    action,
    documentId,
    loaders,
  }: {
    request: IGqlRequest;
    resource: DocumentActionPermissionResource;
    action: DocumentAction;
    documentId: string;
    loaders: DataLoaderRegistry;
  }): IPolicyRequestData {
    return {
      actor: {
        _id: request.user?._id,
        email: request.user?.email,
      },
      loaders,
      resource: {
        action,
        resourceAccess: resource,
        documentId,
      },
    };
  }

  private async getPermissionStatus(verifyData: IVerifyData): Promise<{ allowExecute: boolean }> {
    return {
      allowExecute: await this.documentActionPermissionStrategy.executeAlgorithm(verifyData),
    };
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = Utils.getGqlRequest(context) as IGqlRequest & Record<string, unknown>;
    const permissionMetadata = this.reflector.get<string[]>('permissionMetadata', context.getHandler());
    const [resource, action] = permissionMetadata;

    const [_, { input: { documentId } }, { loaders }] = context.getArgs();
    if (!documentId) {
      throw GraphErrorException.BadRequest('Document ID is required', DefaultErrorCode.BAD_REQUEST);
    }

    if (!Object.values(DocumentAction).includes(action as DocumentAction)) {
      throw GraphErrorException.BadRequest('Invalid action', DefaultErrorCode.BAD_REQUEST);
    }

    const requestData: IPolicyRequestData = this.getRequestData({
      request,
      resource: resource as DocumentActionPermissionResource,
      action: action as DocumentAction,
      documentId,
      loaders,
    });
    const data: IVerifyData = {
      documentService: this.documentService,
      documentActionPermissionService: this.documentActionPermissionService,
      data: requestData,
    };
    const status = await this.getPermissionStatus(data);
    if (!status.allowExecute) {
      throw GraphErrorException.Forbidden('Forbidden Resource', DefaultErrorCode.FORBIDDEN);
    }

    return true;
  }
}

export function DocumentActionPermissionGuard(...permissionMetadata: string[]) {
  return applyDecorators(SetMetadata('permissionMetadata', permissionMetadata), UseGuards(GqlAttachUserGuard, DocumentActionPermissionGuardInstance));
}
