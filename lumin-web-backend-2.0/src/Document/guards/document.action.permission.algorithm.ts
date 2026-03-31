import { PolicyEffect } from 'Common/common.enum';
import { IPermission } from 'Common/common.interface';
import { GraphErrorException } from 'Common/errors/GraphqlErrorException';

import { DocumentActionPermissionService } from 'Document/ActionPermission/document.action.permission.service';
import {
  DocumentAction,
  DocumentActionPermissionPrinciple,
  DocumentActionPermissionResource,
} from 'Document/ActionPermission/enums/action.permission.enum';
import { Document, ShareLinkType } from 'graphql.schema';

import {
  DocumentActionPermission,
  IActorRequestData,
  IDocumentActionPermission,
  IPolicyRequest,
  IPolicyRequestActor,
  IPolicyRequestResource,
  IVerifyData,
} from '../ActionPermission/interfaces/document.action.permission.interface';
import { PolicyDecisionPoint } from '../ActionPermission/Policy/architecture/PDP';
import * as rolePolicies from '../ActionPermission/Policy/roles.json';

function formatPolicyActions(permissions: Record<string, string>): DocumentAction[] {
  return Object.keys(permissions).map((action) => action as DocumentAction);
}

function formatPolicyPermissions(permissions: Record<string, string>): IPermission[] {
  return Object.values(permissions).map(
    (resolver) => ({
      name: resolver,
      effect: PolicyEffect.ALLOW,
    }),
  );
}

function getDefaultDocumentActionPermission({
  policyData,
  actionPrinciple = DocumentActionPermissionPrinciple.ANYONE.toLowerCase() as DocumentActionPermissionPrinciple,
}: {
  policyData: Record<string, { version: number; permissions: Record<string, string> }>;
  actionPrinciple?: DocumentActionPermissionPrinciple;
}): IPermission[] {
  const { permissions } = policyData[actionPrinciple];
  return formatPolicyPermissions(permissions);
}
function insertDefaultDocumentActionPermission({
  documentActionPermissionService,
  resourceId,
  policyData,
}: {
  documentActionPermissionService: DocumentActionPermissionService;
  resourceId: string;
  policyData: Record<string, { version: number; permissions: Record<string, string> }>;
}): IPermission[] {
  const { version } = policyData[DocumentActionPermissionPrinciple.ANYONE.toLowerCase()];
  const newPermissions = getDefaultDocumentActionPermission({ policyData });
  documentActionPermissionService.updateDocumentActionPermission(
    { resource: DocumentActionPermissionResource.DOCUMENT, resourceId, principle: DocumentActionPermissionPrinciple.ANYONE.toLowerCase() },
    { $set: { version, permissions: newPermissions } },
  );
  return newPermissions;
}

function upsertDocumentActionPermission({
  documentActionPermissionService,
  actionPrinciple,
  resourceId,
  policyData,
}: {
  documentActionPermissionService: DocumentActionPermissionService;
  actionPrinciple: DocumentActionPermissionPrinciple;
  resourceId: string;
  policyData: Record<string, { version: number; permissions: Record<string, string> }>;
}): IPermission[] {
  const { version, permissions } = policyData[actionPrinciple];
  const newPermissions = formatPolicyPermissions(permissions);
  documentActionPermissionService.updateDocumentActionPermission({
    resource: DocumentActionPermissionResource.DOCUMENT,
    resourceId,
    principle: actionPrinciple,
  }, {
    $set: {
      version,
      permissions: newPermissions,
    },
  });
  return newPermissions;
}

function updatePermissionWhenVersionChange({
  documentActionPermissionService,
  actionPrinciple,
  resourceId,
  policyData,
  group,
}: {
  documentActionPermissionService: DocumentActionPermissionService;
  actionPrinciple: DocumentActionPermissionPrinciple;
  resourceId: string;
  policyData: Record<string, { version: number; permissions: Record<string, string> }>;
  group: IDocumentActionPermission;
}) {
  if (group && group.version !== policyData[actionPrinciple].version) {
    upsertDocumentActionPermission({
      documentActionPermissionService,
      actionPrinciple: group.principle,
      resourceId,
      policyData,
    });
  }
}

function updatePermissionIfNotExists({
  documentActionPermissionService,
  actionPrinciple,
  resourceId,
  documentActionPermissions,
  policyData,
  document,
  actor,
}: {
  documentActionPermissionService: DocumentActionPermissionService;
  actionPrinciple: DocumentActionPermissionPrinciple;
  resourceId: string;
  documentActionPermissions: IDocumentActionPermission[];
  policyData: Record<string, { version: number; permissions: Record<string, string> }>;
  document: Document;
  actor?: IActorRequestData;
}): IPermission[] {
  if (!documentActionPermissions.length) {
    insertDefaultDocumentActionPermission({
      documentActionPermissionService,
      resourceId,
      policyData,
    });
  }

  const defaultGroup = documentActionPermissions.find(
    (permission) => permission.principle === (DocumentActionPermissionPrinciple.ANYONE.toLowerCase() as DocumentActionPermissionPrinciple),
  );
  const useDefaultGroup = !documentActionPermissions.length
    || (documentActionPermissions.length === 1 && defaultGroup)
    || (document.isPersonal && String(document.ownerId) === String(actor?._id));
  if (useDefaultGroup) {
    if (policyData[DocumentActionPermissionPrinciple.ANYONE.toLowerCase()].version) {
      updatePermissionWhenVersionChange({
        documentActionPermissionService,
        actionPrinciple: DocumentActionPermissionPrinciple.ANYONE.toLowerCase() as DocumentActionPermissionPrinciple,
        resourceId,
        policyData,
        group: defaultGroup,
      });
    }

    return getDefaultDocumentActionPermission({ policyData });
  }

  if (!policyData[actionPrinciple]?.version) {
    return [];
  }

  const baseGroup = documentActionPermissions.find((permission) => permission.principle === actionPrinciple);

  if (!baseGroup) {
    return [];
  }

  if (
    actionPrinciple === (DocumentActionPermissionPrinciple.ANYONE.toLowerCase() as DocumentActionPermissionPrinciple)
      && documentActionPermissions.length > 1
  ) {
    return [];
  }

  updatePermissionWhenVersionChange({
    documentActionPermissionService,
    actionPrinciple,
    resourceId,
    policyData,
    group: baseGroup,
  });
  return baseGroup.permissions;
}

function getListPermissions({
  documentActionPermissionService,
  actionPrinciple,
  resource,
  resourceId,
  documentActionPermissions,
  document,
  actor,
}: {
  documentActionPermissionService: DocumentActionPermissionService;
  actionPrinciple: DocumentActionPermissionPrinciple;
  resource: string;
  resourceId: string;
  documentActionPermissions: IDocumentActionPermission[];
  document: Document;
  actor?: IActorRequestData;
}): IPermission[] {
  const policyData = rolePolicies[resource];
  if (!policyData) {
    return [];
  }

  return updatePermissionIfNotExists({
    documentActionPermissionService,
    actionPrinciple,
    resourceId,
    documentActionPermissions,
    policyData,
    document,
    actor,
  });
}

function getResourceId(resource: IPolicyRequestResource): string {
  switch (resource.resourceAccess) {
    case DocumentActionPermissionResource.DOCUMENT:
      return resource.documentId;
    case DocumentActionPermissionResource.DOCUMENT_TEMPLATE:
    default:
      return '';
  }
}

export class DocumentActionPermissionAlgorithm {
  private readonly PDP: PolicyDecisionPoint = new PolicyDecisionPoint();

  private async interceptPolicyActor({
    documentService,
    documentActionPermissionService,
    data: { actor, resource, loaders },
  }: IVerifyData): Promise<IPolicyRequestActor> {
    const document = await documentService.findOneById(resource.documentId);
    if (!document) {
      throw GraphErrorException.NotFound('Document not found');
    }

    if (!actor._id && document.shareSetting.linkType !== ShareLinkType.ANYONE) {
      throw GraphErrorException.Forbidden('You have no document with this documentId');
    }

    const actionPrinciple = await documentService.getUserDocumentPolicyPrinciple({
      context: {
        req: {
          user: actor,
        },
        loaders,
      },
      document,
    });
    const { resourceAccess } = resource;
    const resourceId = getResourceId(resource);
    const documentActionPermissions = await documentActionPermissionService.getDocumentActionPermissionByCondition(
      { resource: DocumentActionPermissionResource.DOCUMENT, resourceId },
      { permissions: 1, principle: 1, version: 1 },
    );
    let permissions: DocumentActionPermission[] = [];

    switch (resourceAccess) {
      case DocumentActionPermissionResource.DOCUMENT: {
        permissions = getListPermissions({
          documentActionPermissionService,
          actionPrinciple: actionPrinciple.toLowerCase() as DocumentActionPermissionPrinciple,
          resource: DocumentActionPermissionResource.DOCUMENT,
          resourceId: document._id,
          documentActionPermissions,
          document,
          actor,
        });
        break;
      }
      case DocumentActionPermissionResource.DOCUMENT_TEMPLATE:
      default:
        break;
    }

    return {
      role: actionPrinciple.toLowerCase() as DocumentActionPermissionPrinciple,
      permissions,
    };
  }

  private interceptPolicyResource({ data: { resource } }: IVerifyData): IPolicyRequestResource {
    const { action, resourceAccess, documentId } = resource;
    return {
      action,
      documentId,
      resourceAccess,
    };
  }

  async executeAlgorithm(verifyData: IVerifyData): Promise<boolean> {
    const policyActor = await this.interceptPolicyActor(verifyData);
    const policyResource = this.interceptPolicyResource(verifyData);
    const policyRequest = {
      resource: policyResource,
      attribute: {
        actor: policyActor,
      },
    } as IPolicyRequest;

    return this.PDP.evaluate(policyRequest);
  }

  getPolicyActions({
    resource,
    principle,
  }: {
    resource: DocumentActionPermissionResource;
    principle: DocumentActionPermissionPrinciple;
  }): DocumentAction[] {
    let policyData = rolePolicies[resource][principle];
    if (!policyData) {
      policyData = rolePolicies[resource][DocumentActionPermissionPrinciple.ANYONE.toLowerCase()];
    }

    return formatPolicyActions(policyData.permissions as Record<string, string>);
  }

  getPrinciplePolicyData({ resource, principle }: { resource: DocumentActionPermissionResource; principle: DocumentActionPermissionPrinciple }): {
    permissions: IPermission[];
    version: number;
  } {
    const policyData = rolePolicies[resource][principle];
    if (!policyData) {
      return {
        permissions: [],
        version: null,
      };
    }

    const { permissions, version } = policyData;
    return {
      permissions: formatPolicyPermissions(permissions as Record<string, string>),
      version,
    };
  }

  private getActionPermissionsActor({
    documentActionPermissionService,
    documentActionPermissions,
    actionPrinciple,
    resource,
    document,
    actor,
  }: {
    documentActionPermissionService: DocumentActionPermissionService;
    documentActionPermissions: IDocumentActionPermission[];
    actionPrinciple: DocumentActionPermissionPrinciple;
    resource: IPolicyRequestResource;
    document: Document;
    actor: IActorRequestData;
  }): IPolicyRequestActor {
    const { resourceAccess } = resource;
    const resourceId = getResourceId(resource);

    let permissions: DocumentActionPermission[] = [];

    switch (resourceAccess) {
      case DocumentActionPermissionResource.DOCUMENT: {
        permissions = getListPermissions({
          documentActionPermissionService,
          actionPrinciple: actionPrinciple.toLowerCase() as DocumentActionPermissionPrinciple,
          resource: DocumentActionPermissionResource.DOCUMENT,
          resourceId,
          documentActionPermissions,
          document,
          actor,
        });
        break;
      }
      case DocumentActionPermissionResource.DOCUMENT_TEMPLATE:
      default:
        break;
    }

    return {
      role: actionPrinciple,
      permissions,
    };
  }

  checkActionPermission({
    documentActionPermissionService,
    action,
    actionPrinciple,
    document,
    resource,
    documentActionPermissions,
    actor,
  }: {
    documentActionPermissionService: DocumentActionPermissionService;
    action: DocumentAction;
    actionPrinciple: DocumentActionPermissionPrinciple;
    document: Document;
    resource: DocumentActionPermissionResource;
    documentActionPermissions: IDocumentActionPermission[];
    actor?: IActorRequestData;
  }): boolean {
    const requestResource = {
      action,
      documentId: document._id,
      resourceAccess: resource,
    };

    const { role, permissions } = this.getActionPermissionsActor({
      documentActionPermissionService,
      documentActionPermissions,
      actionPrinciple,
      resource: requestResource,
      document,
      actor,
    });

    const policyRequest = {
      resource: requestResource,
      attribute: {
        actor: {
          role,
          permissions,
        },
      },
    } as IPolicyRequest;
    return this.PDP.evaluate(policyRequest);
  }
}
