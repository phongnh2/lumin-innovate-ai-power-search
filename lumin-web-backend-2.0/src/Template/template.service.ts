import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { get } from 'lodash';
import {
  ClientSession, Model, Types, UpdateQuery, FilterQuery, ProjectionType, PipelineStage,
} from 'mongoose';
import { v4 as uuid } from 'uuid';

import { RedisConstants } from 'Common/callbacks/RedisConstants';
import { EnvConstants } from 'Common/constants/EnvConstants';
import { ErrorCode } from 'Common/constants/ErrorCode';
import { ErrorMessage } from 'Common/constants/ErrorMessage';
import { NotiOrgTeam, NotiOrg } from 'Common/constants/NotificationConstants';
import { RateLimiterFileSize } from 'Common/constants/RateLimiterConstants';
import { TEMPLATE_OWNER_ROLE_MAPPING } from 'Common/constants/TemplateConstants';
import { GraphErrorException } from 'Common/errors/GraphqlErrorException';
import { notiOrgFactory } from 'Common/factory/NotiFactory';
import { NotiInterface } from 'Common/factory/NotiFactory/noti.interface';
import { notiFirebaseTeamFactory } from 'Common/factory/NotiFirebaseFactory';
import { Utils } from 'Common/utils/Utils';
import { FileData } from 'Common/validator/FileValidator/file.validator.pipe';

import { AwsService } from 'Aws/aws.service';

import { DocumentOwnerTypeEnum, DocumentRoleEnum, DocumentStorageEnum } from 'Document/document.enum';
import { DocumentService } from 'Document/document.service';
import { INTERNAL_DOCUMENT_PERMISSION_ROLE } from 'Document/documentConstant';
import {
  IDocument,
} from 'Document/interfaces/document.interface';
import { EnvironmentService } from 'Environment/environment.service';
import {
  TemplateOwnerType,
  Template,
  GetTemplatesInput,
  GetTemplatesPayload,
  UpdateTemplateCounterInput,
  CounterType,
  BelongsTo,
  LocationType,
  CreateTemplateBaseOnDocumentInput,
  DestinationType,
  OrganizationTemplateTabs,
  Document,
} from 'graphql.schema';
import { MembershipService } from 'Membership/membership.service';
import { RedisService } from 'Microservices/redis/redis.service';
import { OrganizationService } from 'Organization/organization.service';
import { OrganizationTeamService } from 'Organization/organizationTeam.service';
import { TeamService } from 'Team/team.service';
import {
  ITemplate, ITemplatePermission, ITemplateModel, ITemplatePermissionModel,
} from 'Template/interfaces/template.interface';
import { TemplateOwnerTypeEnum, TemplateRole } from 'Template/template.enum';
import { User } from 'User/interfaces/user.interface';
import { UserService } from 'User/user.service';

@Injectable()
export class TemplateService {
  constructor(
    @InjectModel('Template') private readonly templateModel: Model<ITemplateModel>,
    @InjectModel('TemplatePermission')
    private readonly templatePermissionModel: Model<ITemplatePermissionModel>,
    private readonly teamService: TeamService,
    private readonly membershipService: MembershipService,
    private readonly organizationService: OrganizationService,
    private readonly userService: UserService,
    private readonly awsService: AwsService,
    private readonly environmentService: EnvironmentService,
    private readonly documentService: DocumentService,
    private readonly organizationTeamService: OrganizationTeamService,
    private readonly redisService: RedisService,
  ) {}

  /** Template model CRUD */
  async createTemplate(template: {
    name: string,
    size: number,
    remoteId: string,
    ownerId: string,
    ownerType: TemplateOwnerType,
    description: string,
    thumbnail?: string,
  }): Promise<ITemplate> {
    const newTemplate = await this.templateModel.create(template);
    return { ...newTemplate.toObject(), _id: newTemplate._id.toHexString() };
  }

  async findOneById(templateId: string, projection?: ProjectionType<ITemplate>): Promise<ITemplate> {
    const template = await this.templateModel.findById(templateId, projection).exec();
    return template ? { ...template.toObject(), _id: template._id.toHexString() } : null;
  }

  async updateTemplate(filter: FilterQuery<ITemplate>, update?: UpdateQuery<ITemplate>): Promise<ITemplate> {
    const updatedTemplate = await this.templateModel.findOneAndUpdate(filter, update, { new: true }).exec();
    return updatedTemplate ? { ...updatedTemplate.toObject(), _id: updatedTemplate._id.toHexString() } : null;
  }

  async findOnePermission(filter: FilterQuery<ITemplatePermission>, projection?: ProjectionType<ITemplatePermission>): Promise<ITemplatePermission> {
    const templatePermission = await this.templatePermissionModel.findOne(filter, projection).exec();
    return templatePermission ? { ...templatePermission.toObject(), _id: templatePermission._id.toHexString() } : null;
  }

  async createTemplatePermission(data: {
    refId: string,
    templateId: string,
    role: TemplateRole
  }): Promise<ITemplatePermission> {
    const createdTemplatePermission = await this.templatePermissionModel.create(data as any);
    return { ...createdTemplatePermission.toObject(), _id: createdTemplatePermission._id.toHexString() };
  }

  async getTemplateById(id: string | Types.ObjectId, projection?: ProjectionType<ITemplate>): Promise<ITemplate> {
    const template = await this.templateModel.findById(id, projection).exec();
    return template ? { ...template.toObject(), _id: template._id.toHexString() } : null;
  }

  async getOwnerOfTemplate(templateId: string, projection?: Record<string, number>): Promise<ITemplatePermission> {
    const templatePermission = await this.templatePermissionModel.findOne({
      templateId,
      role: { $in: [TemplateRole.OWNER, TemplateRole.ORGANIZATION, TemplateRole.ORGANIZATION_TEAM] },
    }, projection).exec();
    return templatePermission ? { ...templatePermission.toObject(), _id: templatePermission._id.toHexString() } : null;
  }

  async findById(templateId: string): Promise<ITemplate> {
    const template = await this.templateModel.findOne({ _id: templateId });
    return template ? { ...template.toObject(), _id: template._id.toHexString() } : null;
  }

  async getTemplatePermissions(
    conditions: FilterQuery<ITemplatePermission>,
    projection?: ProjectionType<ITemplatePermission>,
  ): Promise<ITemplatePermission[]> {
    const templatePermissions = await this.templatePermissionModel.find(conditions, projection).exec();
    return templatePermissions.map((templatePermission) => ({ ...templatePermission.toObject(), _id: templatePermission._id.toHexString() }));
  }

  aggregateTemplatePermission(pipelines: PipelineStage[]): any {
    return this.templatePermissionModel.aggregate(pipelines);
  }

  async deleteTemplate(id: string, session: ClientSession = null, options = {}): Promise<ITemplate> {
    const deletedTemplate = await this.templateModel.findOneAndDelete({ _id: id }, options).session(session);
    return deletedTemplate ? { ...deletedTemplate.toObject(), _id: deletedTemplate._id.toHexString() } : null;
  }

  async deleteTemplatePermission(templateId: string, session: ClientSession = null): Promise<void> {
    await this.templatePermissionModel.findOneAndDelete({ templateId }).session(session);
  }

  /** Template services */
  async uploadTemplate(data: {
    name: string,
    description: string,
    uploaderId: string,
    ownerType: TemplateOwnerType,
    files: [FileData],
    orgId?: string,
    teamId?: string,
    isNotify?: boolean,
  }): Promise<{ template?: Template, error?: GraphErrorException }> {
    const {
      name, description, uploaderId, ownerType, files, orgId, teamId, isNotify = true,
    } = data;
    const pdfFile = files.find((file) => file.type === 'template');
    const thumbnailFile = files.find((file) => file.type === 'thumbnail');

    // TODO: check premium limit for template
    if (pdfFile.filesize > RateLimiterFileSize.PAID) {
      return {
        error: GraphErrorException.BadRequest(
          ErrorMessage.TEMPLATE.FILE_SIZE,
          ErrorCode.Template.OVER_FILE_SIZE_LIMIT,
        ),
      };
    }

    let refId: string;
    switch (ownerType) {
      case TemplateOwnerType.PERSONAL:
        refId = uploaderId;
        break;
      case TemplateOwnerType.ORGANIZATION_TEAM:
        refId = teamId;
        break;
      case TemplateOwnerType.ORGANIZATION:
        refId = orgId;
        break;
      default:
        break;
    }

    const { canUpload, error } = await this.checkDailyTemplateUploadLimit({ uploaderId, refId });

    if (!canUpload) {
      return { error };
    }

    const template = await this.createTemplateWithBufferData({
      file: pdfFile,
      name: `${name}.pdf`,
      thumbnail: thumbnailFile,
      uploaderId,
      description,
      ownerType,
    });

    await this.createTemplatePermission({
      refId,
      templateId: template._id,
      role: TEMPLATE_OWNER_ROLE_MAPPING[ownerType],
    });

    if (isNotify) {
      this.notifyUploadTemplate({
        template, destinationId: refId, destinationType: (ownerType as unknown) as DestinationType, actorId: uploaderId,
      });
    }

    this.userService.findUserById(uploaderId)
      .then((uploader) => this.redisService.setUploadFileLimit({
        uploader,
        totalUploaded: 1,
        resourceId: refId,
        baseKey: RedisConstants.UPLOAD_TEMPLATE,
      }));

    return { template };
  }

  async checkDailyTemplateUploadLimit(data: { uploaderId: string, refId: string }): Promise<{
    canUpload: boolean,
    error?: GraphErrorException,
  }> {
    const { uploaderId, refId } = data;
    const currentTotalUpload = (await this.redisService.getRedisValueWithKey(
      `${RedisConstants.UPLOAD_TEMPLATE}${uploaderId}:${refId}`,
    )) || 0;
    const dailyUploadLimit = this.environmentService.getByKey(EnvConstants.DAILY_UPLOAD_TEMPLATE_LIMIT);
    const canUpload = Number(currentTotalUpload) < Number(dailyUploadLimit);
    return {
      canUpload,
      ...!canUpload && { error: GraphErrorException.BadRequest(ErrorMessage.TEMPLATE.DAILY_UPLOAD, ErrorCode.Template.DAILY_UPLOAD_TEMPLATE_LIMIT) },
    };
  }

  async createTemplateWithBufferData(data: {
    file: FileData,
    name: string,
    description: string,
    uploaderId: string,
    ownerType: TemplateOwnerType,
    thumbnail?: FileData,
  }): Promise<ITemplate> {
    const {
      file, name, thumbnail, description, uploaderId, ownerType,
    } = data;
    const {
      fileBuffer, mimetype: fileMimetype, filesize: templateSize,
    } = file;

    const [templateKeyFile, thumbnailKeyFile] = await Promise.all([
      this.awsService.uploadTemplateWithBuffer(fileBuffer, fileMimetype, ownerType),
      thumbnail && this.awsService.uploadThumbnailWithBuffer(thumbnail.fileBuffer, thumbnail.mimetype),
    ]);

    const templateData = {
      name,
      size: templateSize,
      remoteId: templateKeyFile,
      thumbnail: thumbnailKeyFile,
      ownerId: uploaderId,
      description,
      ownerType,
    };
    return this.createTemplate(templateData);
  }

  async createDocumentFromTemplate(template: Template): Promise<{ documentRemoteId: string, thumbnailRemoteId: string }> {
    const templateBucket = this.environmentService.getByKey(
      EnvConstants.S3_TEMPLATES_BUCKET,
    );
    const documentBucket = this.environmentService.getByKey(
      EnvConstants.S3_DOCUMENTS_BUCKET,
    );
    const thumbnailBucket = this.environmentService.getByKey(
      EnvConstants.S3_RESOURCES_BUCKET,
    );

    const templateSource = `${templateBucket}/${template.remoteId}`;
    const keyDocument = `${uuid()}.pdf`;

    const thumbnailCopySource = `${thumbnailBucket}/${template.thumbnail}`;
    const keyThumbnail = `thumbnails/${uuid()}.${Utils.getExtensionFile(
      template.thumbnail,
    )}`;

    const copyDocumentPromise = this.awsService.copyObjectS3(
      templateSource,
      documentBucket,
      keyDocument,
      false,
      this.awsService.s3InstanceForDocument(),
    );

    const copyThumbnailPromise = template.thumbnail ? this.awsService.copyObjectS3(
      thumbnailCopySource,
      thumbnailBucket,
      keyThumbnail,
      true,
    ) : '';

    const [documentRemoteId, thumbnailRemoteId] = await Promise.all([copyDocumentPromise, copyThumbnailPromise]);

    return { documentRemoteId, thumbnailRemoteId };
  }

  async createDocumentData({
    document, targetId, roleOfDocumentPermission, documentOwnerType,
  } : {
    document: Document & { service: DocumentStorageEnum },
    targetId: string,
    roleOfDocumentPermission: DocumentRoleEnum,
    documentOwnerType: DocumentOwnerTypeEnum,
  }): Promise<IDocument> {
    const newName = await this.documentService.getDocumentNameAfterNaming(
      {
        clientId: targetId,
        fileName: document.name,
        documentFolderType: documentOwnerType,
        mimetype: document.mimeType,
      },
    );

    const documentCreated = await this.documentService.createDocument({ ...document, name: newName });
    const documentPermission = {
      documentId: documentCreated._id,
      refId: targetId,
      role: roleOfDocumentPermission,
    };
    await this.documentService.createDocumentPermissions([
      documentPermission,
    ]);

    this.documentService.broadcastUploadDocument({
      document: documentCreated,
      location: documentOwnerType,
      receiverId: targetId,
    });

    return documentCreated;
  }

  async notiUseTemplate({
    templateRole,
    uploaderId,
    document,
    targetId,
  }: {
    templateRole: TemplateRole,
    uploaderId: string,
    document: IDocument,
    targetId: string,
  }): Promise<void> {
    const uploader = await this.userService.findUserById(uploaderId);
    switch (templateRole) {
      case TemplateRole.ORGANIZATION: {
        const target = await this.organizationService.getOrgById(targetId);
        this.organizationService.sendNotiUploadDocument({
          document: document as unknown as Document,
          target,
          uploader,
        });
      }
        break;
      case TemplateRole.ORGANIZATION_TEAM: {
        const target = await this.organizationTeamService.getOrgTeamById(targetId);
        this.organizationTeamService.sendNotiUploadDocument({
          document: document as unknown as Document,
          target,
          uploader,
        });
      }
        break;

      default:
        break;
    }
  }

  async getTemplatesList(
    clientIds: string[],
    input: GetTemplatesInput,
  ): Promise<GetTemplatesPayload> {
    const { limit, offset, searchKey } = input;
    const clientObjectIds = clientIds.map((clientId) => new Types.ObjectId(clientId));
    const lookupMatchExpression = {
      $expr: {
        $eq: ['$_id', '$$templateId'],
      },
    };
    if (searchKey) {
      const searchKeyRegex = this.documentService.generateSearchDocumentKeyRegex(searchKey);
      Object.assign(lookupMatchExpression, {
        name: { $regex: searchKeyRegex },
      });
    }
    const lookupExpression = {
      from: 'templates',
      let: {
        templateId: '$templateId',
      },
      pipeline: [
        {
          $match: lookupMatchExpression,
        },
      ],
      as: 'template',
    };
    const pipelines = [
      {
        $match: {
          refId: { $in: clientObjectIds },
        },
      },
      {
        $lookup: lookupExpression,
      },
      { $unwind: '$template' },
      {
        $facet: {
          metadata: [{ $count: 'total' }],
          templates: [
            {
              $sort: { createdAt: -1 },
            },
            {
              $skip: offset * limit,
            },
            {
              $limit: limit,
            },
          ],
        },
      },
    ] as PipelineStage[];

    const results = await this.aggregateTemplatePermission(pipelines);
    const data: { metadata: any[], templates: any[] } = results[0];
    const { metadata, templates } = data;
    const totalItem = get(metadata, '[0].total', 0);
    return {
      totalItem,
      edges: templates.map((item) => ({ node: item.template })),
      pageInfo: {
        limit,
        offset,
      },
    };
  }

  async updateTemplateCounter(params: UpdateTemplateCounterInput): Promise<ITemplate> {
    const { templateId, type, number } = params;
    const updatePathMapping = {
      [CounterType.DOWNLOAD]: 'counter.download',
      [CounterType.VIEW]: 'counter.view',
    };
    return this.updateTemplate({ _id: templateId }, { $inc: { [updatePathMapping[type]]: number } });
  }

  getSignedUrl(remoteId: string): Promise<string> {
    return this.awsService.getSignedUrl({
      keyFile: remoteId,
      bucketName: this.environmentService.getByKey(
        EnvConstants.S3_TEMPLATES_BUCKET,
      ),
    });
  }

  async getTemplateBelongsTo(templateId: string): Promise<BelongsTo> {
    const templatePermission = await this.findOnePermission({ templateId });
    const { role, refId } = templatePermission;
    switch (role) {
      case TemplateRole.OWNER:
        return {
          type: LocationType.PERSONAL,
          location: await this.userService.findUserById(refId, { _id: 1, name: 1 }),
        };
      case TemplateRole.ORGANIZATION:
        return {
          type: LocationType.ORGANIZATION,
          location: await this.organizationService.getOrgById(refId, { _id: 1, name: 1 }),
        };
      case TemplateRole.ORGANIZATION_TEAM:
        return {
          type: LocationType.ORGANIZATION_TEAM,
          location: await this.teamService.findOneById(refId, { _id: 1, name: 1 }),
        };
      default: {
        return null;
      }
    }
  }

  async deleteRemoteThumbnail(remoteId: string): Promise<void> {
    if (!remoteId) return;
    if (remoteId.includes('http')) {
      const splited = remoteId.split('/');
      remoteId = `${splited[splited.length - 2]}/${splited[splited.length - 1]}`;
    }
    await this.awsService.removeThumbnail(remoteId);
  }

  async deleteRemoteTemplate(template: ITemplate): Promise<void> {
    await this.awsService.removeTemplate(template.remoteId);
  }

  async getTemplateByTemplateId(templateId: string): Promise<ITemplate> {
    const template = await this.templateModel.findOne({ _id: templateId }).exec();
    return template ? { ...template.toObject(), _id: template._id.toHexString() } : null;
  }

  async getTemplatePermissionsByTemplateId(
    templateId:string,
    condition?: FilterQuery<ITemplatePermission>,
  ): Promise<ITemplatePermission[]> {
    const templatePermissions = await this.templatePermissionModel.find({ templateId, ...condition } as FilterQuery<ITemplatePermission>)
      .exec();
    return templatePermissions.map((templatePermission) => ({ ...templatePermission.toObject(), _id: templatePermission._id.toHexString() }));
  }

  deleteOriginalTemplate(template: ITemplate): void {
    this.deleteTemplate(template._id);
    this.deleteRemoteThumbnail(template.thumbnail);
    this.deleteRemoteTemplate(template);
    this.deleteTemplatePermission(template._id);
  }

  public async notifyDeleteTemplateToMembers(
    type: TemplateOwnerTypeEnum,
    actor: User,
    clientId: string,
    template: ITemplate,
  ):Promise<void> {
    const notificationData = {
      actor: {
        user: actor,
      },
      entity: {
        template,
      },
      target: {},
    };
    let notification: NotiInterface = null;
    switch (type) {
      case TemplateOwnerTypeEnum.ORGANIZATION_TEAM: {
        const team = await this.teamService.findOneById(clientId);
        if (!team) {
          return;
        }
        const organization = await this.organizationService.getOrgById(team.belongsTo as string);
        notificationData.target = { team, organization };
        notification = notiOrgFactory.create(NotiOrgTeam.DELETE_TEAM_TEMPLATE, notificationData);
        this.membershipService.publishNotiToAllTeamMember(clientId, notification, [actor._id]);

        // send out-app noti for mobile
        const {
          notificationContent: firebaseNotificationContent,
          notificationData: firebaseNotificationData,
        } = notiFirebaseTeamFactory.create(NotiOrgTeam.DELETE_TEAM_TEMPLATE, {
          organization,
          team,
          template,
          actor,
        });
        this.organizationService.publishFirebaseNotiToAllTeamMember({
          teamId: team._id,
          firebaseNotificationData,
          firebaseNotificationContent,
          excludes: [actor._id],
        });
        break;
      }
      case TemplateOwnerTypeEnum.ORGANIZATION: {
        const organization = await this.organizationService.getOrgById(clientId);
        if (!organization) {
          return;
        }
        notificationData.target = { organization };

        notification = notiOrgFactory.create(NotiOrg.DELETE_ORGANIZATION_TEMPLATE, notificationData);
        this.organizationService.publishNotiToAllOrgMember({
          orgId: clientId,
          notification,
          excludedIds: [actor._id],
        });
        break;
      }
      default:
        break;
    }
  }

  async editTemplateInfo(data: {
    templateId: string,
    name: string,
    description: string,
    thumbnailInfo: {
      currentThumbnail: string,
      thumbnailFile: FileData,
      shouldRemoveThumbnail: boolean,
    },
  }): Promise<Template> {
    const {
      templateId,
      name,
      description,
      thumbnailInfo: { currentThumbnail, thumbnailFile, shouldRemoveThumbnail },
    } = data;
    let newThumbnail: string = currentThumbnail;

    if (thumbnailFile) {
      const {
        fileBuffer: thumbnailBuffer, mimetype: thumbnailMimetype,
      } = thumbnailFile;

      newThumbnail = await this.awsService.uploadThumbnailWithBuffer(thumbnailBuffer, thumbnailMimetype);
    }

    if (shouldRemoveThumbnail) {
      newThumbnail = '';
    }

    if (shouldRemoveThumbnail || (thumbnailFile && currentThumbnail)) {
      this.awsService.removeThumbnail(currentThumbnail);
    }

    const template = await this.updateTemplate({ _id: templateId }, {
      name: `${name}.pdf`,
      description,
      thumbnail: newThumbnail,
    });
    return template;
  }

  async createTemplateBaseOnDocument(
    params: CreateTemplateBaseOnDocumentInput &
    {
      files: [FileData], uploaderId: string
    },
  ): Promise<Template> {
    const {
      documentId, files, templateData: templateInput, uploaderId, destinationId, destinationType, isNotify = true, isRemoveThumbnail,
    } = params;
    const { name, description } = templateInput;
    const { canUpload, error } = await this.checkDailyTemplateUploadLimit({ uploaderId, refId: destinationId });
    if (!canUpload) {
      throw error;
    }

    const document = await this.documentService.getDocumentByDocumentId(documentId);

    const thumbnailRemoteId = await this.getThumbnailRemoteIdToCreateTemplate(
      { existedThumbnailRemoteId: document.thumbnail, files, isRemoveThumbnail },
    );

    let template;
    if (document.service === DocumentStorageEnum.S3) {
      const newTemplateRemoteId = await this.documentService.copyDocumentToS3(
        document as unknown as Document,
        EnvConstants.S3_TEMPLATES_BUCKET,
      );
      template = await this.createTemplate({
        name: `${name}.pdf`,
        size: document.size,
        remoteId: newTemplateRemoteId,
        thumbnail: thumbnailRemoteId,
        ownerId: uploaderId,
        ownerType: TemplateOwnerType[destinationType],
        description,
      });
    } else {
      const pdfFile = files?.find((file) => file.type === 'template');
      if (!pdfFile) {
        throw GraphErrorException.BadRequest('file is required when create template from third party document');
      }
      const {
        fileBuffer, mimetype: fileMimetype, filesize: templateSize,
      } = pdfFile;

      // Verify premium or free template size later
      if (templateSize > RateLimiterFileSize.PAID) {
        throw GraphErrorException.BadRequest(
          ErrorMessage.TEMPLATE.FILE_SIZE,
          ErrorCode.Template.OVER_FILE_SIZE_LIMIT,
        );
      }
      const templateRemoteId = await this.awsService.uploadTemplateWithBuffer(
        fileBuffer,
        fileMimetype,
        destinationType as unknown as TemplateOwnerType,
      );
      template = await this.createTemplate({
        name: `${name}.pdf`,
        size: templateSize,
        remoteId: templateRemoteId,
        thumbnail: thumbnailRemoteId,
        ownerId: uploaderId,
        ownerType: TemplateOwnerType[destinationType],
        description,
      });
    }
    this.userService.findUserById(uploaderId)
      .then((uploader) => this.redisService.setUploadFileLimit({
        uploader,
        totalUploaded: 1,
        resourceId: destinationId,
        baseKey: RedisConstants.UPLOAD_TEMPLATE,
      }));
    await this.createTemplatePermission({
      refId: destinationId,
      templateId: template._id,
      role: TEMPLATE_OWNER_ROLE_MAPPING[destinationType],
    });
    if (isNotify) {
      this.notifyUploadTemplate({
        template, destinationId, destinationType, actorId: uploaderId,
      });
    }
    return template;
  }

  async getThumbnailRemoteIdToCreateTemplate(
    input:{existedThumbnailRemoteId: string, files: [FileData], isRemoveThumbnail: boolean},
  ): Promise<string> {
    const { existedThumbnailRemoteId, files, isRemoveThumbnail } = input;
    const thumbnailFile = files?.find((file) => file.type === 'thumbnail');
    const shouldRemoveThumbnail = isRemoveThumbnail && !thumbnailFile;
    if (shouldRemoveThumbnail) {
      return '';
    }
    if (!thumbnailFile) {
      return this.documentService.copyThumbnailToS3(existedThumbnailRemoteId);
    }
    return this.awsService.uploadThumbnailWithBuffer(thumbnailFile.fileBuffer, thumbnailFile.mimetype);
  }

  async notifyUploadTemplate(
    params: { template: ITemplate, destinationId: string, destinationType: DestinationType, actorId: string },
  ): Promise<void> {
    const {
      destinationId, destinationType, actorId, template,
    } = params;
    const actor = await this.userService.findUserById(actorId);
    switch (destinationType) {
      case DestinationType.ORGANIZATION: {
        const org = await this.organizationService.getOrgById(destinationId);
        const notification = notiOrgFactory.create(NotiOrg.UPLOAD_TEMPLATE, {
          actor: { user: actor },
          target: { organization: org },
          entity: { template },
        });
        this.organizationService.publishNotiToAllOrgMember({ orgId: destinationId, notification, excludedIds: [actorId] });
        break;
      }
      case DestinationType.ORGANIZATION_TEAM: {
        const orgTeam = await this.organizationTeamService.getOrgTeamById(destinationId);
        const org = await this.organizationService.getOrgById(orgTeam.belongsTo as string);
        const notification = notiOrgFactory.create(NotiOrgTeam.UPLOAD_TEMPLATE, {
          actor: { user: actor },
          target: {
            organization: org,
            team: orgTeam,
          },
          entity: { template },
        });
        this.membershipService.publishNotiToAllTeamMember(destinationId, notification, [actorId]);

        // send out-app noti for mobile
        const {
          notificationContent: firebaseNotificationContent,
          notificationData: firebaseNotificationData,
        } = notiFirebaseTeamFactory.create(NotiOrgTeam.UPLOAD_TEMPLATE, {
          organization: org,
          team: orgTeam,
          template,
          actor,
        });
        this.organizationService.publishFirebaseNotiToAllTeamMember({
          teamId: orgTeam._id,
          firebaseNotificationData,
          firebaseNotificationContent,
          excludes: [actor._id],
        });
        break;
      }
      default: break;
    }
  }

  async verifyDestinationToCreateTemplate(
    params: { destinationId: string, destinationType: DestinationType, actorId: string, documentId: string },
  ): Promise<boolean> {
    const {
      destinationId, destinationType, actorId, documentId,
    } = params;
    const [[internalDocumentPermission], personalPermission] = await Promise.all([
      this.documentService.getDocumentPermissionByConditions({
        documentId, role: { $in: INTERNAL_DOCUMENT_PERMISSION_ROLE },
      }),
      this.documentService.getOneDocumentPermission(actorId, { documentId }),
    ]);

    if (personalPermission) {
      return this.verifyCreateTemplateFromPersonalDoc({ destinationId, destinationType, actorId });
    }
    if (internalDocumentPermission) {
      return destinationId === internalDocumentPermission.refId.toHexString();
    }
    return false;
  }

  async verifyCreateTemplateFromPersonalDoc(params: {destinationId: string, destinationType: DestinationType, actorId: string}): Promise<boolean> {
    const { destinationId, destinationType, actorId } = params;
    switch (destinationType) {
      case DestinationType.PERSONAL:
        return destinationId === actorId;
      case DestinationType.ORGANIZATION: {
        const orgMembership = await this.organizationService.getMembershipByOrgAndUser(destinationId, actorId);
        return Boolean(orgMembership);
      }
      case DestinationType.ORGANIZATION_TEAM: {
        const teamMembership = await this.organizationTeamService.findMembershipsByCondition({ userId: actorId, destinationId });
        return Boolean(teamMembership);
      }
      default: return false;
    }
  }

  async getSpecificTemplatePermissions(templateId: string, userId: string): Promise<ITemplatePermission[]> {
    const templatePermissions: ITemplatePermission[] = await this.getTemplatePermissions({ templateId });
    return templatePermissions.reduce(([personal, org, team], templatePermission: ITemplatePermission) => {
      if (templatePermission.refId.toHexString() === userId) {
        return [templatePermission, org, team];
      }
      if (templatePermission.role === TemplateRole.ORGANIZATION) {
        return [personal, templatePermission, team];
      }
      if (templatePermission.role === TemplateRole.ORGANIZATION_TEAM) {
        return [personal, org, templatePermission];
      }
      return [personal, org, team];
    }, [null, null, null]);
  }

  async getClientIdToGetOrgTemplates(param: { userId: string, orgId: string, tab: OrganizationTemplateTabs }): Promise<string[]> {
    const { userId, orgId, tab } = param;
    switch (tab) {
      case OrganizationTemplateTabs.ORGANIZATION:
        return [orgId];
      case OrganizationTemplateTabs.ORGANIZATION_PERSONAL: {
        const membership = await this.organizationService.getMembershipByOrgAndUser(orgId, userId);
        return [membership._id];
      }
      case OrganizationTemplateTabs.ORGANIZATION_ALL: {
        const [orgTeams, orgMembership] = await Promise.all([
          this.teamService.find({ belongsTo: orgId }),
          this.organizationService.getMembershipByOrgAndUser(orgId, userId),
        ]);
        const orgTeamIds = orgTeams.map(({ _id }) => _id);
        return [orgId, ...orgTeamIds, orgMembership._id];
      }
      default: return [];
    }
  }
}
