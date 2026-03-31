import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  cloneDeep,
  difference,
  intersection,
  merge,
} from 'lodash';
import {
  FilterQuery,
  Model,
  ProjectionType,
  UpdateQuery,
} from 'mongoose';

import { ErrorCode } from 'Common/constants/ErrorCode';
import { FeatureFlagKeys } from 'Common/constants/FeatureFlags';
import { TeamRole } from 'Common/constants/TeamConstant';
import { GraphErrorException } from 'Common/errors/GraphqlErrorException';

import { DataLoaderRegistry } from 'DataLoader/dataLoader.registry';
import { DocumentRoleEnum } from 'Document/document.enum';
import { OrganizationRoles } from 'Document/enums/organization.roles.enum';
import { FeatureFlagService } from 'FeatureFlag/FeatureFlag.service';
import { EventsGateway } from 'Gateway/SocketIoConfig';
import {
  Document,
  DocumentCapabilities,
  ShareLinkType,
  UpdateDocumentActionPermissionSettingsInput,
  User,
} from 'graphql.schema';
import { LoggerService } from 'Logger/Logger.service';
import { MembershipService } from 'Membership/membership.service';
import { OrganizationService } from 'Organization/organization.service';

import { DocumentService } from '../document.service';
import { DocumentSharedService } from '../document.shared.service';
import {
  DEFAULT_DOCUMENT_CAPABILITIES, DOCUMENT_CAPABILITIES, DocumentActionPermissionPrinciple, DocumentActionPermissionResource,
} from './enums/action.permission.enum';
import { IDocumentActionPermission, IDocumentActionPermissionModel } from './interfaces/document.action.permission.interface';
import { DocumentActionPermissionAlgorithm } from '../guards/document.action.permission.algorithm';

@Injectable()
export class DocumentActionPermissionService {
  private readonly documentActionPermissionAlgorithm: DocumentActionPermissionAlgorithm = new DocumentActionPermissionAlgorithm();

  constructor(
    @InjectModel('DocumentActionPermission')
    private readonly documentActionPermissionModel: Model<IDocumentActionPermissionModel>,
    private readonly loggerService: LoggerService,
    private readonly documentSharedService: DocumentSharedService,
    private readonly documentService: DocumentService,
    private readonly membershipService: MembershipService,
    private readonly organizationService: OrganizationService,
    private readonly featureFlagService: FeatureFlagService,
    private readonly messageGateway: EventsGateway,
  ) {}

  public async createDocumentActionPermission(documentActionPermissionData: IDocumentActionPermission): Promise<IDocumentActionPermission> {
    const documentActionPermission = await this.documentActionPermissionModel.create(documentActionPermissionData);
    return { ...documentActionPermission.toObject(), _id: documentActionPermission._id.toHexString() };
  }

  public async getDocumentActionPermissionByCondition(
    conditions: Record<string, unknown>,
    projection?: ProjectionType<IDocumentActionPermission>,
  ): Promise<IDocumentActionPermission[]> {
    const documentActionPermissions = await this.documentActionPermissionModel.find({ ...conditions }, projection).exec();
    return documentActionPermissions.map((documentActionPermission) => ({
      ...documentActionPermission.toObject(),
      _id: documentActionPermission._id.toHexString(),
    }));
  }

  async updateDocumentActionPermission(
    filter: FilterQuery<IDocumentActionPermission>,
    update: UpdateQuery<IDocumentActionPermission>,
  ): Promise<IDocumentActionPermission> {
    const updatedDocumentActionPermission = await this.documentActionPermissionModel
      .findOneAndUpdate(filter, update, { upsert: true, new: true })
      .exec();
    return updatedDocumentActionPermission
      ? { ...updatedDocumentActionPermission.toObject(), _id: updatedDocumentActionPermission._id.toHexString() }
      : null;
  }

  async computeUserAndDocumentRole({
    user,
    document,
  }: {
    user: User;
    document: Document;
  }): Promise<{ userRole: string; documentPermissionRole: DocumentRoleEnum }> {
    let userRole = null;
    let documentPermissionRole = null;
    const documentPermission = await this.documentService.getDocumentPermissionsByDocId(document._id, {
      role: {
        $in: [DocumentRoleEnum.ORGANIZATION, DocumentRoleEnum.ORGANIZATION_TEAM],
      },
    });
    if (documentPermission.length === 0) {
      if (document.shareSetting.linkType !== ShareLinkType.ANYONE) {
        throw GraphErrorException.Forbidden('You have no permission');
      }

      return { userRole, documentPermissionRole };
    }

    const docPermission = documentPermission[0];
    documentPermissionRole = docPermission.role;
    let membershipUser = null;
    switch (docPermission.role as DocumentRoleEnum) {
      case DocumentRoleEnum.ORGANIZATION_TEAM: {
        membershipUser = await this.membershipService.findOne({
          userId: user._id,
          teamId: docPermission.refId,
        });
        break;
      }
      case DocumentRoleEnum.ORGANIZATION: {
        membershipUser = await this.organizationService.getMembershipByOrgAndUser(docPermission.refId, user._id);
        break;
      }
      default:
        break;
    }

    if (!membershipUser) {
      const externalPermission = await this.documentService.getOneDocumentPermission(user._id, { documentId: document._id });
      if (!externalPermission) {
        if (document.shareSetting.linkType !== ShareLinkType.ANYONE) {
          throw GraphErrorException.Forbidden('You have no permission');
        }
      }

      return { userRole, documentPermissionRole };
    }

    switch (docPermission.role as DocumentRoleEnum) {
      case DocumentRoleEnum.ORGANIZATION: {
        const { role } = await this.organizationService.getMembershipByOrgAndUser(docPermission.refId, user._id);
        userRole = role;
        break;
      }
      case DocumentRoleEnum.ORGANIZATION_TEAM: {
        const { role } = await this.membershipService.findOne(
          {
            teamId: docPermission.refId,
            userId: user._id,
          },
          { _id: -1, role: 1 },
        );
        userRole = role;
        break;
      }
      default:
        break;
    }

    return { userRole, documentPermissionRole };
  }

  async updateDocumentActionPermissionSettings({
    context,
    input,
    user,
  }: {
    context: { req: { user: User }; loaders: DataLoaderRegistry };
    input: UpdateDocumentActionPermissionSettingsInput;
    user: User;
  }): Promise<DocumentCapabilities> {
    try {
      const document = await this.documentSharedService.getDocumentByDocumentId(input.documentId);
      if (!document) {
        throw GraphErrorException.NotFound('Document not found', ErrorCode.Document.DOCUMENT_NOT_FOUND);
      }

      const canEditDocumentActionPermission = await this.checkEditDocumentActionPermission({
        user,
        document,
      });
      if (!canEditDocumentActionPermission) {
        throw GraphErrorException.Forbidden('You have no permission to update document action permission', ErrorCode.Common.NO_PERMISSION);
      }

      const { documentId, principles } = input;
      const principleList = [...principles] as string[];
      const newPrinciples = principleList.map((principle) => principle.toLowerCase() as DocumentActionPermissionPrinciple);
      const documentActionPermissions = await this.getDocumentActionPermissionByCondition(
        { resource: DocumentActionPermissionResource.DOCUMENT, resourceId: documentId },
        { permissions: 1, principle: 1, version: 1 },
      );
      const currentPermissions = documentActionPermissions.map((permission) => permission.principle);
      const updatePrinciples = intersection(currentPermissions, newPrinciples);
      const updatePromises = updatePrinciples
        .map((principle) => {
          const updatePermission = documentActionPermissions.find((permission) => permission.principle === principle);
          const { permissions, version } = this.documentActionPermissionAlgorithm.getPrinciplePolicyData({
            resource: DocumentActionPermissionResource.DOCUMENT,
            principle,
          });
          if (updatePermission.version === version) {
            return null;
          }

          return this.documentActionPermissionModel.updateOne(
            {
              resource: DocumentActionPermissionResource.DOCUMENT,
              resourceId: documentId,
              principle,
            },
            { $set: { permissions, version } },
          );
        })
        .filter(Boolean);
      const insertPrinciples = difference(newPrinciples, currentPermissions);
      const insertPromises = insertPrinciples.map((principle) => {
        const { permissions, version } = this.documentActionPermissionAlgorithm.getPrinciplePolicyData({
          resource: DocumentActionPermissionResource.DOCUMENT,
          principle,
        });

        return this.documentActionPermissionModel.create({
          resource: DocumentActionPermissionResource.DOCUMENT,
          resourceId: documentId,
          principle,
          permissions,
          version,
        });
      });
      const deletePrinciples = difference(currentPermissions, newPrinciples);
      const deletePromises = [
        this.documentActionPermissionModel.deleteMany({
          resource: DocumentActionPermissionResource.DOCUMENT,
          resourceId: documentId,
          principle: { $in: deletePrinciples },
        }),
      ];
      await Promise.all([...updatePromises, ...insertPromises, ...deletePromises]);
      const isDocumentActionPermissionEnabled = await this.featureFlagService.getFeatureIsOn({
        featureFlagKey: FeatureFlagKeys.DOCUMENT_ACTION_PERMISSION,
      });
      const principle = await this.documentService.getUserDocumentPolicyPrinciple({ context, document });
      const capabilities = await this.getDocumentCapabilities({
        document,
        principle: principle?.toLowerCase() as DocumentActionPermissionPrinciple || undefined,
        user,
        disableCapabilities: !isDocumentActionPermissionEnabled,
      });

      return capabilities;
    } catch (error) {
      this.loggerService.error({
        context: this.updateDocumentActionPermissionSettings.name,
        error,
        message: 'Failed to update document action permission settings',
      });
      throw error;
    }
  }

  async checkEditDocumentActionPermission({
    user,
    document,
    userRole,
    documentPermissionRole,
  }: {
    user: User;
    document: Document;
    userRole?: string;
    documentPermissionRole?: DocumentRoleEnum;
  }): Promise<boolean> {
    if (document.isPersonal) {
      return String(document.ownerId) === user?._id;
    }

    let computedUserRole: string = userRole;
    let computedDocumentPermissionRole: DocumentRoleEnum = documentPermissionRole;
    if (!documentPermissionRole || !userRole) {
      const computedData = await this.computeUserAndDocumentRole({ user, document });
      computedUserRole = computedData.userRole;
      computedDocumentPermissionRole = computedData.documentPermissionRole;
    }

    switch (computedDocumentPermissionRole) {
      case DocumentRoleEnum.ORGANIZATION:
        return [OrganizationRoles.ORGANIZATION_ADMIN, OrganizationRoles.BILLING_MODERATOR].includes(computedUserRole as OrganizationRoles);
      case DocumentRoleEnum.ORGANIZATION_TEAM:
        return computedUserRole === TeamRole.ADMIN;
      default:
        return false;
    }
  }

  async getDocumentCapabilities({
    document,
    principle,
    disableCapabilities = false,
    user,
    userRole,
    documentPermissionRole,
  }: {
    document?: Document;
    principle?: DocumentActionPermissionPrinciple;
    disableCapabilities?: boolean;
    user?: User;
    userRole?: string;
    documentPermissionRole?: DocumentRoleEnum;
  }): Promise<DocumentCapabilities> {
    const defaultCapabilities = cloneDeep(DEFAULT_DOCUMENT_CAPABILITIES);
    if (!principle) {
      return defaultCapabilities;
    }

    if (disableCapabilities) {
      return merge(
        defaultCapabilities,
        Object.entries(defaultCapabilities).reduce((acc, [key, value]) => ({ ...acc, [key]: !value }), {}),
      );
    }

    const actions = this.documentActionPermissionAlgorithm.getPolicyActions({
      resource: DocumentActionPermissionResource.DOCUMENT,
      principle,
    });

    if (!document) {
      throw GraphErrorException.NotFound('Document not found', ErrorCode.Document.DOCUMENT_NOT_FOUND);
    }

    const documentActionPermissions = await this.getDocumentActionPermissionByCondition(
      { resource: DocumentActionPermissionResource.DOCUMENT, resourceId: document._id },
      { permissions: 1, principle: 1, version: 1 },
    );
    let principleList: string[] = [];
    if (!documentActionPermissions.length) {
      principleList = [DocumentActionPermissionPrinciple.ANYONE.toUpperCase()];
    } else {
      principleList = [...new Set(documentActionPermissions.map((permission) => permission.principle.toUpperCase()))];
    }

    const capabilities = {} as DocumentCapabilities;
    // eslint-disable-next-line no-restricted-syntax
    for (const action of actions) {
      const isAllowed = this.documentActionPermissionAlgorithm.checkActionPermission({
        documentActionPermissionService: this,
        action,
        actionPrinciple: principle,
        document,
        resource: DocumentActionPermissionResource.DOCUMENT,
        documentActionPermissions,
        actor: user ? {
          _id: user._id,
          email: user.email,
        } : undefined,
      });
      capabilities[DOCUMENT_CAPABILITIES[action]] = isAllowed;
    }

    let canEditDocumentActionPermission = false;

    if (user) {
      canEditDocumentActionPermission = await this.checkEditDocumentActionPermission({
        user,
        document,
        userRole,
        documentPermissionRole,
      });
    }

    return merge(defaultCapabilities, capabilities, {
      ...(canEditDocumentActionPermission && { canEditDocumentActionPermission, principleList }),
    });
  }
}
