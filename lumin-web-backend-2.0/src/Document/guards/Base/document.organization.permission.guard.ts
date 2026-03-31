import {
  CanActivate, ExecutionContext, Injectable, Inject, forwardRef,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlContextType } from '@nestjs/graphql';
import { isArray } from 'lodash';

import { ErrorCode } from 'Common/constants/ErrorCode';
import { GraphErrorException } from 'Common/errors/GraphqlErrorException';
import { GrpcErrorException } from 'Common/errors/GrpcErrorException';
import { Utils } from 'Common/utils/Utils';

import { IGqlRequest } from 'Auth/interfaces/IGqlRequest';
import { IRpcRequest } from 'Auth/interfaces/rpcRequest';
import { DocumentService } from 'Document/document.service';
import { VerifyDocumentPermissionBase, ValidationStrategy } from 'Document/guards/document.verify.permission.base';
import { IRequestData } from 'Document/guards/request.data.interface';
import { MembershipService } from 'Membership/membership.service';
import { OrganizationService } from 'Organization/organization.service';

@Injectable()
export class DocumentOrganizationLevelGuardBase implements CanActivate {
  constructor(
    @Inject(forwardRef(() => DocumentService))
    protected readonly documentService: DocumentService,
    protected readonly membershipService: MembershipService,
    protected readonly organizationService: OrganizationService,
    protected readonly reflector: Reflector,
  ) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = this.transformContext(context);
    const permissions = this.reflector.getAllAndOverride<string[]>('permissions', [context.getHandler(), context.getClass()]);

    if (!permissions) return true;

    const requestData: IRequestData | IRequestData[] = this.getRequestData(request, context);
    const validationStrategy = isArray(requestData) ? ValidationStrategy.MULTIPLE_DOCUMENT : ValidationStrategy.SINGLE_DOCUMENT;

    return VerifyDocumentPermissionBase.Organization({
      documentService: this.documentService,
      membershipService: this.membershipService,
      organizationService: this.organizationService,
      // eslint-disable-next-line no-empty-function
      nextFunc: () => {},
      errorCallback: (type: string) => this.getError(type, context),
      data: {
        requestData,
        permissions,
      },
    }, validationStrategy);
  }

  public transformContext(context: ExecutionContext): IGqlRequest | IRpcRequest {
    let request = null;
    if (context.getType() === 'rpc') {
      request = Utils.getRpcRequest(context);
    } else if (context.getType<GqlContextType>() === 'graphql') {
      request = Utils.getGqlRequest(context);
    }
    return request;
  }

  public getRequestData(request: IGqlRequest | IRpcRequest, context: ExecutionContext): IRequestData | IRequestData[] {
    if (context.getType<GqlContextType>() === 'graphql') {
      return this.getRequestDataFromGraphqlCtx(request as IGqlRequest, context);
    }
    if (context.getType() === 'rpc') {
      return this.getRequestDataFromRpcCtx(request as IRpcRequest, context);
    }
    return null;
  }

  public getRequestDataFromRpcCtx(request: IRpcRequest, context: ExecutionContext): IRequestData {
    const {
      documentId,
    } = context.switchToRpc().getData();
    const userId = request.user._id;
    return {
      _id: userId,
      documentId,
    };
  }

  public getRequestDataFromGraphqlCtx(request: IGqlRequest, context: ExecutionContext): IRequestData | IRequestData[] {
    const {
      clientId, documentId, documentIds, input,
    } = context.getArgs()[1];
    const userId = request.user?._id;
    const targetClientId = input ? input.clientId : clientId;
    let targetDocumentId = input ? input.documentId : documentId;
    const targetDocumentIds = (input ? input.documentIds : documentIds) as string[];
    if (targetDocumentIds?.length) {
      if (targetDocumentIds.length > 1) {
        return targetDocumentIds.map((docId) => ({
          _id: userId,
          clientId: targetClientId,
          documentId: docId,
        }));
      }
      [targetDocumentId] = targetDocumentIds;
    }
    return {
      _id: userId,
      clientId: targetClientId,
      documentId: targetDocumentId,
    };
  }

  public getError(type: string, context: ExecutionContext) {
    switch (type) {
      case ErrorCode.Document.NO_DOCUMENT_PERMISSION:
        return this.getPermissionError(context);
      case ErrorCode.Document.DOCUMENT_NOT_FOUND:
        return this.getNotFoundError(context);
      default:
        return null;
    }
  }

  private getPermissionError(context: ExecutionContext) {
    switch (context.getType<GqlContextType>()) {
      case 'graphql':
        return GraphErrorException.Forbidden('You have no permission', ErrorCode.Document.NO_DOCUMENT_PERMISSION);
      case 'rpc':
        return GrpcErrorException.PermissionDenied('You have no permission', 'permission_denied');
      default:
        return null;
    }
  }

  private getNotFoundError(context: ExecutionContext) {
    switch (context.getType<GqlContextType>()) {
      case 'graphql':
        return GraphErrorException.NotFound('Document not found', ErrorCode.Document.DOCUMENT_NOT_FOUND);
      case 'rpc':
        return GrpcErrorException.NotFound('Document not found', ErrorCode.Document.DOCUMENT_NOT_FOUND);
      default:
        return null;
    }
  }
}
