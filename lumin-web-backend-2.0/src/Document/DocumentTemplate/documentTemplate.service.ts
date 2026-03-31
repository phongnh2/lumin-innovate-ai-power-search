import { HeadObjectOutput } from '@aws-sdk/client-s3';
import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, ProjectionType } from 'mongoose';
import { v4 as uuid } from 'uuid';

import { CommonConstants } from 'Common/constants/CommonConstants';
import { DEFAULT_MAX_DOCUMENT_TEMPLATE_QUOTA } from 'Common/constants/DocumentConstants';
import { EnvConstants } from 'Common/constants/EnvConstants';
import { ErrorCode } from 'Common/constants/ErrorCode';
import { ErrorMessage } from 'Common/constants/ErrorMessage';
import {
  SUBSCRIPTION_DOCUMENT_TEMPLATE_LIST_UPLOAD_DOCUMENT_ORGANIZATION,
  SUBSCRIPTION_DOCUMENT_TEMPLATE_LIST_UPLOAD_DOCUMENT_PERSONAL,
  SUBSCRIPTION_DOCUMENT_TEMPLATE_LIST_UPLOAD_DOCUMENT_TEAMS,
  SUBSCRIPTION_DOCUMENT_TEMPLATE_LIST_DELETE_DOCUMENT_ORGANIZATION,
  SUBSCRIPTION_DOCUMENT_TEMPLATE_LIST_DELETE_DOCUMENT_PERSONAL,
  SUBSCRIPTION_DOCUMENT_TEMPLATE_LIST_DELETE_DOCUMENT_TEAMS,
  SUBSCRIPTION_UPDATE_DOCUMENT_TEMPLATE_LIST,
  SUBSCRIPTION_DELETE_DOCUMENT_TEMPLATE,
} from 'Common/constants/SubscriptionConstants';
import { GraphErrorException } from 'Common/errors/GraphqlErrorException';
import { Utils } from 'Common/utils/Utils';

import { AwsService } from 'Aws/aws.service';

import { DataLoaderRegistry } from 'DataLoader/dataLoader.registry';
import {
  DocumentOwnerTypeEnum,
  DocumentStorageEnum,
  DocumentFromSourceEnum,
  DocumentKindEnum,
  DocumentRoleEnum,
  DocumentWorkspace,
} from 'Document/document.enum';
import { DocumentService } from 'Document/document.service';
import { ORIGINAL_DOCUMENT_PERMISSION_ROLE } from 'Document/documentConstant';
import { DocumentTemplateSourceTypeEnum, IDocumentTemplate, IDocumentTemplateModel } from 'Document/DocumentTemplate/documentTemplate.interface';
import { IndividualRoles } from 'Document/enums/individual.roles.enum';
import { IDocumentPermission, IDocumentPermissionModel } from 'Document/interfaces';
import { EnvironmentService } from 'Environment/environment.service';
import { Document, DocumentTemplate, ShareLinkType } from 'graphql.schema';
import { LoggerService } from 'Logger/Logger.service';
import { MembershipService } from 'Membership/membership.service';
import { RedisService } from 'Microservices/redis/redis.service';
import { IOrganization } from 'Organization/interfaces/organization.interface';
import { OrganizationRoleEnums, OrganizationTeamRoles } from 'Organization/organization.enum';
import { OrganizationService } from 'Organization/organization.service';
import { ITeam } from 'Team/interfaces/team.interface';
import { TeamService } from 'Team/team.service';
import { User } from 'User/interfaces/user.interface';

@Injectable()
export class DocumentTemplateService {
  private readonly maxDocumentTemplateQuota: number;

  constructor(
    @Inject('PUB_SUB') private readonly pubSub,
    @InjectModel(DocumentKindEnum.TEMPLATE) private readonly documentTemplateModel: Model<IDocumentTemplateModel>,
    private readonly awsService: AwsService,
    @Inject(forwardRef(() => DocumentService))
    private readonly documentService: DocumentService,
    @InjectModel('DocumentPermission')
    private readonly documentPermissionModel: Model<IDocumentPermissionModel>,
    private readonly loggerService: LoggerService,
    private readonly redisService: RedisService,
    private readonly teamService: TeamService,
    private readonly environmentService: EnvironmentService,
    @Inject(forwardRef(() => OrganizationService))
    private readonly organizationService: OrganizationService,
    private readonly membershipService: MembershipService,
  ) {
    this.maxDocumentTemplateQuota = Number(this.environmentService.getByKey(EnvConstants.MAX_DOCUMENT_TEMPLATE_QUOTA))
      || DEFAULT_MAX_DOCUMENT_TEMPLATE_QUOTA;
  }

  async findDocumentTemplateById(documentId: string, projection?: ProjectionType<IDocumentTemplate>): Promise<IDocumentTemplate> {
    const template = await this.documentTemplateModel.findOne({ _id: documentId, kind: DocumentKindEnum.TEMPLATE }, projection).exec();
    return template ? { ...template.toObject(), _id: template._id.toHexString() } : null;
  }

  async createDocumentTemplate(document: Partial<IDocumentTemplateModel> & { service: DocumentStorageEnum }): Promise<IDocumentTemplate> {
    const createdDate: number = Date.now();
    const createdDocumentTemplate = await this.documentTemplateModel.create({
      ...document,
      createdAt: String(createdDate),
      lastAccess: String(createdDate),
      lastModify: String(createdDate),
    });
    return { ...createdDocumentTemplate.toObject(), _id: createdDocumentTemplate._id.toHexString() };
  }

  public async createDocumentTemplateWithBufferData({
    clientId, fileRemoteId, thumbnailRemoteId, uploader, docType, fileName: docName = '', documentInfo,
  }: {
    clientId: string,
    fileRemoteId: string,
    fileName?: string,
    uploader: User,
    docType: DocumentOwnerTypeEnum,
    documentInfo?: HeadObjectOutput,
    thumbnailRemoteId?: string,
  }, metadata?: {
    documentName?: string,
    thumbnailKey?: string,
    manipulationStep?: string,
  }): Promise<IDocumentTemplate> {
    const documentMetadata = documentInfo || await this.awsService.getDocumentMetadata(fileRemoteId);
    const {
      ContentType: mimeType, ContentLength: docSize,
    } = documentMetadata;
    const { documentName, thumbnailKey, manipulationStep } = metadata || {};
    const isPersonal = DocumentOwnerTypeEnum.PERSONAL === docType;

    const newDocumentTemplateName = documentName ? `${documentName}${CommonConstants.PDF_FILE_EXTENSION}` : docName;

    const namingDocumentTemplate = await this.documentService.getDocumentNameAfterNaming({
      clientId: docType === DocumentOwnerTypeEnum.PERSONAL ? uploader._id : clientId,
      fileName: newDocumentTemplateName,
      documentFolderType: docType,
      mimetype: mimeType,
    });
    const documentTemplateThumbnail = thumbnailRemoteId || thumbnailKey;
    const documentTemplateData: Partial<IDocumentTemplateModel> & { service: DocumentStorageEnum } = {
      name: namingDocumentTemplate,
      remoteId: fileRemoteId,
      mimeType,
      size: docSize,
      service: DocumentStorageEnum.S3,
      isPersonal,
      lastModifiedBy: uploader._id,
      ownerId: uploader._id,
      shareSetting: {},
      remoteEmail: '',
      enableGoogleSync: false,
      ownerName: uploader.name || '',
      roleOfDocument: '',
      bookmarks: '',
      fromSource: DocumentFromSourceEnum.USER_UPLOAD,
      templateSourceType: DocumentTemplateSourceTypeEnum.PDF,
      ...documentTemplateThumbnail && { thumbnail: documentTemplateThumbnail },
      ...(manipulationStep && { manipulationStep }),
    };
    return this.createDocumentTemplate(documentTemplateData);
  }

  async processAfterUpdateDocumentTemplateToDb({
    clientId, document, documentOwnerType, uploader, organization,
  }: {
    clientId: string;
    document: IDocumentTemplate;
    documentOwnerType: DocumentOwnerTypeEnum;
    uploader: User;
    organization: IOrganization;
  }): Promise<IDocumentTemplate> {
    const { _id: documentId, kind } = document;
    let permissionObject: Partial<IDocumentPermission> | null = null;

    const payload = {
      document: {
        ...document,
        roleOfDocument: IndividualRoles.SHARER.toUpperCase(),
      },
      type: null,
    };

    let memberIds: string[] = [];

    switch (documentOwnerType) {
      case DocumentOwnerTypeEnum.PERSONAL:
        permissionObject = {
          documentId,
          refId: uploader._id,
          role: DocumentRoleEnum.OWNER,
          workspace: {
            refId: organization._id,
            type: DocumentWorkspace.ORGANIZATION,
          },
          documentKind: kind,
        };
        Object.assign(payload, {
          document: {
            ...payload.document,
            roleOfDocument: IndividualRoles.OWNER.toUpperCase(),
          },
          type: SUBSCRIPTION_DOCUMENT_TEMPLATE_LIST_UPLOAD_DOCUMENT_PERSONAL,
        });
        memberIds = [uploader._id];
        break;
      case DocumentOwnerTypeEnum.ORGANIZATION: {
        permissionObject = {
          documentId,
          refId: organization._id,
          role: DocumentRoleEnum.ORGANIZATION,
          documentKind: kind,
        };
        Object.assign(payload, {
          type: SUBSCRIPTION_DOCUMENT_TEMPLATE_LIST_UPLOAD_DOCUMENT_ORGANIZATION,
          organizationId: organization._id,
        });
        const orgMembers = await this.organizationService.getMembersByOrgId(organization._id, {
          userId: 1,
          role: 1,
        });
        memberIds = orgMembers.map(({ userId }) => userId);
        break;
      }
      case DocumentOwnerTypeEnum.ORGANIZATION_TEAM: {
        const team: ITeam = await this.teamService.findOneById(clientId);
        permissionObject = {
          documentId,
          refId: team._id,
          role: DocumentRoleEnum.ORGANIZATION_TEAM,
          documentKind: kind,
        };
        Object.assign(payload, {
          type: SUBSCRIPTION_DOCUMENT_TEMPLATE_LIST_UPLOAD_DOCUMENT_TEAMS,
          teamId: team._id,
        });
        const teamMembers = await this.membershipService.find({
          teamId: clientId,
        });
        memberIds = teamMembers.map(({ userId }) => userId);
        break;
      }
      default:
        permissionObject = null;
    }

    if (!permissionObject) {
      throw GraphErrorException.BadRequest('Permission object not found');
    }
    await this.documentService.createDocumentPermission(permissionObject);

    this.publishUpdateDocumentTemplate(
      memberIds,
      payload,
      SUBSCRIPTION_UPDATE_DOCUMENT_TEMPLATE_LIST,
    );

    return document;
  }

  splitDocumentCursor(cursor: string): {documentIdCursor: string, lastAccessCursor: string} {
    const [documentIdCursor, lastAccessCursor] = cursor.split(':');
    return {
      documentIdCursor,
      lastAccessCursor,
    };
  }

  public generateSearchDocumentKeyRegex(searchKey: string): RegExp {
    const processSearchKey = Utils.escapeRegExp(searchKey.trim());
    let key = processSearchKey;
    /**
     * We need to handle the case where the key is 'pdf' separately
     * because our database consistentlyrecords document names as '[name].pdf'.
     */
    if (processSearchKey === 'pdf') {
      key = `${processSearchKey}.*.pdf`;
    }
    const searchKeyRegex = new RegExp(key, 'i');
    return searchKeyRegex;
  }

  generateDocumentCursor(documents: Partial<IDocumentTemplate>[]): string {
    if (!documents.length) {
      return '';
    }
    const { lastAccess, _id: documentId } = documents[documents.length - 1];
    return `${documentId}:${(new Date(lastAccess)).getTime()}`;
  }

  async getDocumentPermissionInBatch(
    conditions: FilterQuery<IDocumentPermission>,
    projection?: ProjectionType<IDocumentPermission>,
  ): Promise<IDocumentPermission[]> {
    const batchSize = 1000;
    const totalBatchWarningThreshold = 5;

    const cursor = this.documentPermissionModel.find(conditions, projection).batchSize(batchSize).lean().cursor();
    const documentPermissions = [];

    let totalBatch = 0;
    await cursor.eachAsync((batch) => {
      documentPermissions.push(...batch.map((doc) => ({ ...doc, _id: doc._id.toHexString() })));
      totalBatch++;
      if (totalBatch >= totalBatchWarningThreshold) {
        const debugData = {
          totalBatch,
          batchSize,
          total: documentPermissions.length,
          query: {
            conditions,
            projection,
          },
        };
        this.loggerService.warn({
          message: 'Large document permission retrieved',
          context: this.getDocumentPermissionInBatch.name,
          extraInfo: debugData,
        });
        // In case we lost the log
        this.redisService.setKeyIfNotExist(
          'debug:document-permission-batch',
          JSON.stringify(debugData),
          String(60 * 60 * 24 * 1000), // 1 day in milliseconds
        );
      }
    }, { batchSize });

    return documentPermissions;
  }

  async getDocumentTemplateById(documentId: string, projection?: ProjectionType<IDocumentTemplate>): Promise<IDocumentTemplate | null> {
    const document = await this.documentTemplateModel.findOne({ _id: documentId }, projection).exec();
    return document ? { ...document.toObject(), _id: document._id.toHexString() } : null;
  }

  async getDocumentInPermissionPagination(
    permissionArray: string[],
    conditions: FilterQuery<IDocumentTemplateModel>,
    limit: number,
  ) {
    const conditionsArray = [];
    Object.keys(conditions).forEach((key) => {
      conditionsArray.push({
        [key]: conditions[key],
      });
    });
    const conditionsQuery = conditionsArray.length
      ? { $and: [{ _id: { $in: permissionArray } }, ...conditionsArray] } : { _id: { $in: permissionArray } };
    const documents = await this.documentTemplateModel
      .find(
        conditionsQuery,
        { annotations: 0 },
      )
      .sort({ lastAccess: -1, _id: -1 })
      .limit(limit)
      .exec();
    return documents.map((document) => ({ ...document.toObject(), _id: document._id.toHexString() }));
  }

  async countTemplatesByOwnerType(params: {
    clientId: string;
    documentOwnerType: DocumentOwnerTypeEnum;
    organizationId?: string;
  }): Promise<number> {
    const { clientId, documentOwnerType, organizationId } = params;
    const ownerTypeToRoleMap: Partial<Record<DocumentOwnerTypeEnum, DocumentRoleEnum>> = {
      [DocumentOwnerTypeEnum.PERSONAL]: DocumentRoleEnum.OWNER,
      [DocumentOwnerTypeEnum.ORGANIZATION]: DocumentRoleEnum.ORGANIZATION,
      [DocumentOwnerTypeEnum.ORGANIZATION_TEAM]: DocumentRoleEnum.ORGANIZATION_TEAM,
    };

    const role = ownerTypeToRoleMap[documentOwnerType];
    if (!role) {
      return 0;
    }

    const permissionQuery: FilterQuery<IDocumentPermission> = {
      refId: clientId,
      role,
    };

    // For PERSONAL documents, filter by workspace to ensure quota is within organization
    if (documentOwnerType === DocumentOwnerTypeEnum.PERSONAL && organizationId) {
      permissionQuery.workspace = {
        refId: organizationId,
        type: DocumentWorkspace.ORGANIZATION,
      };
    }

    const documentPermissions = await this.documentPermissionModel.find(
      permissionQuery,
    ).select('documentId').lean().exec();

    if (documentPermissions.length === 0) {
      return 0;
    }

    const documentIds = documentPermissions.map((perm) => perm.documentId);
    const templateCount = await this.documentTemplateModel.countDocuments({
      _id: { $in: documentIds },
      kind: DocumentKindEnum.TEMPLATE,
    }).exec();

    return templateCount;
  }

  async validateTemplateQuota(params: {
    uploader: User;
    clientId: string;
    documentOwnerType: DocumentOwnerTypeEnum;
    organizationId: string;
  }): Promise<void> {
    const {
      uploader, clientId, documentOwnerType, organizationId,
    } = params;
    const templateListClientId = documentOwnerType === DocumentOwnerTypeEnum.PERSONAL
      ? uploader._id
      : clientId;

    const templateCount = await this.countTemplatesByOwnerType({
      clientId: templateListClientId,
      documentOwnerType,
      organizationId,
    });

    if (templateCount >= this.maxDocumentTemplateQuota) {
      throw GraphErrorException.BadRequest(
        ErrorMessage.DOCUMENT.TEMPLATE_QUOTA_EXCEEDED,
        ErrorCode.Document.DOCUMENT_TEMPLATE_QUOTA_EXCEEDED,
      );
    }
  }

  publishUpdateDocumentTemplate(receiverIds: string[], payload: Record<string, any>, publishType: string) {
    receiverIds.forEach((receiverId) => {
      const channelName = `${publishType}.${receiverId}`;
      this.pubSub.publish(channelName, {
        [publishType]: {
          statusCode: 200,
          clientId: receiverId,
          teamId: '',
          organizationId: '',
          ownerId: payload.document?.ownerId || '',
          ...payload,
        },
      });
    });
  }

  async getRoleOfDocument(
    document: DocumentTemplate,
    loaders: DataLoaderRegistry,
    user?: User,
  ): Promise<string> {
    if (document.roleOfDocument) {
      return document.roleOfDocument;
    }
    const documentPermission = await loaders.originalDocumentPermissionsLoader.load(document._id);
    if (!documentPermission || !user) {
      return '';
    }

    const userId = user._id;
    let memberDocRole: string;
    switch (documentPermission.role as DocumentRoleEnum) {
      case DocumentRoleEnum.OWNER:
        if (documentPermission.refId.toHexString() === userId) {
          memberDocRole = documentPermission.role.toUpperCase();
        }
        break;
      case DocumentRoleEnum.ORGANIZATION: {
        const orgMembership = await loaders.orgMembershipLoader.load(`${userId}-${documentPermission.refId}`);
        if (orgMembership) {
          memberDocRole = this.documentService.getOrgMemberDocumentPermission({
            documentPermission, role: orgMembership.role as OrganizationRoleEnums, userId, documentOwnerId: document.ownerId,
          });
        }
      }
        break;
      case DocumentRoleEnum.ORGANIZATION_TEAM: {
        const teamMembership = await loaders.teamMembershipLoader.load(`${userId}-${documentPermission.refId}`);
        if (teamMembership) {
          memberDocRole = this.documentService.getTeamMemberDocumentPermission({
            documentPermission, role: teamMembership.role as OrganizationTeamRoles, userId, documentOwnerId: document.ownerId,
          });
        }
        break;
      }
      default:
        break;
    }
    if (memberDocRole) {
      return memberDocRole;
    }

    const externalPermission = await loaders.documentPermissionLoader.load(`${user._id}-${document._id}`);

    if (!externalPermission) {
      return document.shareSetting?.linkType === ShareLinkType.ANYONE
        ? DocumentRoleEnum.GUEST
        : '';
    }

    return externalPermission.role.toUpperCase();
  }

  async createDocumentFromDocumentTemplate(data: { template: IDocumentTemplate; destinationId: string; user: User }) {
    const { template, destinationId, user } = data;

    const documentBucket = this.environmentService.getByKey(EnvConstants.S3_DOCUMENTS_BUCKET);
    const thumbnailBucket = this.environmentService.getByKey(EnvConstants.S3_RESOURCES_BUCKET);

    const templateSource = `${documentBucket}/${template.remoteId}`;
    const keyTemplate = `${uuid()}.pdf`;

    const thumbnailCopySource = `${thumbnailBucket}/${template.thumbnail}`;
    const keyThumbnail = `thumbnails/${uuid()}.${Utils.getExtensionFile(template.thumbnail)}`;

    const [documentRemoteId, thumbnailRemoteId] = await Promise.all([
      this.awsService.copyObjectS3(templateSource, documentBucket, keyTemplate, false, this.awsService.s3InstanceForDocument()),
      this.awsService.copyObjectS3(thumbnailCopySource, thumbnailBucket, keyThumbnail),
    ]);

    const namingDocumentTemplate = await this.documentService.getDocumentNameAfterNaming({
      clientId: user._id,
      fileName: template.name,
      documentFolderType: DocumentOwnerTypeEnum.PERSONAL,
      mimetype: template.mimeType,
    });
    const newDocument: Partial<IDocumentTemplateModel> & { service: DocumentStorageEnum } = {
      name: namingDocumentTemplate,
      remoteId: documentRemoteId,
      mimeType: template.mimeType,
      size: template.size,
      service: DocumentStorageEnum.S3,
      isPersonal: true,
      lastModifiedBy: user._id,
      ownerId: user._id,
      shareSetting: {},
      enableGoogleSync: false,
      ownerName: user.name || '',
      fromSource: template.fromSource,
      thumbnail: thumbnailRemoteId,
      manipulationStep: template.manipulationStep,
    };

    const documentCreated = await this.documentService.createDocument(newDocument);
    await Promise.all([
      this.documentService.createDocumentPermission({
        documentId: documentCreated._id,
        refId: user._id,
        role: DocumentRoleEnum.OWNER,
        workspace: {
          refId: destinationId,
          type: DocumentWorkspace.ORGANIZATION,
        },
      }),
      this.documentService.replicateDocumentAssets(template._id, documentCreated._id),
    ]);

    return documentCreated;
  }

  async deleteDocumentTemplate(params: {
    documentTemplate: IDocumentTemplate;
    documentPermission: IDocumentPermission;
    clientId: string;
  }): Promise<void> {
    const {
      documentTemplate, documentPermission, clientId,
    } = params;

    const roleOfDocument: DocumentRoleEnum = DocumentRoleEnum[documentPermission.role.toUpperCase()];

    if (!ORIGINAL_DOCUMENT_PERMISSION_ROLE.includes(roleOfDocument)) {
      throw GraphErrorException.BadRequest('Shared templates are not supported for now.');
    }

    const { allReceivers } = await this.documentService.getReceiverIdsFromDocumentId(documentTemplate._id);

    await this.documentService.deleteOriginalDocument(documentTemplate as unknown as Document);

    const subscriptionType = {
      default: SUBSCRIPTION_DOCUMENT_TEMPLATE_LIST_DELETE_DOCUMENT_PERSONAL,
      organization: SUBSCRIPTION_DOCUMENT_TEMPLATE_LIST_DELETE_DOCUMENT_ORGANIZATION,
      organization_team: SUBSCRIPTION_DOCUMENT_TEMPLATE_LIST_DELETE_DOCUMENT_TEAMS,
    };
    const payload = {
      documentTemplateId: documentTemplate._id,
      teamId: roleOfDocument === DocumentRoleEnum.ORGANIZATION_TEAM ? clientId : '',
      organizationId: roleOfDocument === DocumentRoleEnum.ORGANIZATION ? clientId : '',
    };
    this.documentService.publishDeleteOriginalDocument(
      [...allReceivers, clientId],
      {
        ...payload,
        type: subscriptionType[roleOfDocument] || subscriptionType.default,
      },
      SUBSCRIPTION_DELETE_DOCUMENT_TEMPLATE,
    );
  }
}
