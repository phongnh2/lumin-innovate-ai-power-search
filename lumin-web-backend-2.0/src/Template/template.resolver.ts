import { UseGuards, HttpStatus } from '@nestjs/common';
import {
  Args, Context, Mutation, Resolver, Query, ResolveField, Parent,
} from '@nestjs/graphql';
// eslint-disable-next-line import/extensions
import * as GraphQLUpload from 'graphql-upload/GraphQLUpload.js';
import * as mime from 'mime-types';

import { ErrorCode } from 'Common/constants/ErrorCode';
import { RateLimiterStrategy } from 'Common/constants/RateLimiterConstants';
import { GraphErrorException } from 'Common/errors/GraphqlErrorException';
import { Utils } from 'Common/utils/Utils';
import { AvatarFilePipe } from 'Common/validator/FileValidator/avatar.validator.pipe';
import { DocumentFilePipe } from 'Common/validator/FileValidator/document.validator.pipe';
import { FileData } from 'Common/validator/FileValidator/file.validator.pipe';

import { GqlAuthGuard } from 'Auth/guards/graph.auth.guard';
import { DocumentOwnerTypeEnum, DocumentRoleEnum, DocumentStorageEnum } from 'Document/document.enum';
import {
  Template,
  TemplateOwnerType,
  Document,
  GetTemplatesInput,
  GetTemplatesPayload,
  UpdateTemplateCounterInput,
  BelongsTo,
  DeleteTemplateInput,
  DeleteTemplatePayload,
  UploadPersonalTemplateInput,
  EditTemplateInput,
  TemplatePermissions,
} from 'graphql.schema';
import { TemplateWorkspaceEnum } from 'Organization/organization.enum';
import { OrganizationService } from 'Organization/organization.service';
import { OrganizationTeamService } from 'Organization/organizationTeam.service';
import { AcceptanceRateLimiter } from 'RateLimiter/decorators/rateLimiter.strategy.decorator';
import { RateLimiterGuard } from 'RateLimiter/guards/rateLimiter.guard';
import { TemplateLevelGuard } from 'Template/guards/Gql/template.permission.guard';
import {
  TemplateRole,
  TemplateOwnerTypeEnum,
  PersonalTemplateRoles,
  OrgTeamTemplateRoles,
  OrganizationTemplateRoles,
} from 'Template/template.enum';
import { TemplateService } from 'Template/template.service';
import { UserService } from 'User/user.service';

@UseGuards(GqlAuthGuard)
@Resolver('Template')
export class TemplateResolver {
  constructor(
    private readonly templateService: TemplateService,
    private readonly userService: UserService,
    private readonly organizationService: OrganizationService,
    private readonly organizationTeamService: OrganizationTeamService,
  ) {}

  @UseGuards(RateLimiterGuard)
  @AcceptanceRateLimiter(RateLimiterStrategy.USER_ID)
  @Mutation()
  async uploadPersonalTemplate(
    @Args('input') input: UploadPersonalTemplateInput,
    @Args({ name: 'files', type: () => GraphQLUpload }, DocumentFilePipe())
      files: [FileData],
    @Context() context,
  ): Promise<Template> {
    const { user } = context.req;
    const { template, error } = await this.templateService.uploadTemplate({
      ...input,
      uploaderId: user._id,
      ownerType: TemplateOwnerType.PERSONAL,
      files,
    });

    if (error) {
      throw error;
    }
    return template;
  }

  @UseGuards(RateLimiterGuard)
  @AcceptanceRateLimiter(RateLimiterStrategy.USER_ID)
  @TemplateLevelGuard(PersonalTemplateRoles.ALL, OrganizationTemplateRoles.ALL, OrgTeamTemplateRoles.ALL)
  @Mutation()
  async createDocumentFromTemplate(
    @Args('templateId') templateId: string,
    @Args('notify') notify: boolean,
    @Context() context,
  ): Promise<Document> {
    const { user } = context.req;
    const [template, templatePermission] = await Promise.all([
      this.templateService.getTemplateById(templateId),
      this.templateService.getOwnerOfTemplate(templateId),
    ]);
    if (!template) {
      throw GraphErrorException.NotFound('You have find template with this templateId', ErrorCode.Template.TEMPLATE_NOT_FOUND);
    }
    const { role, refId } = templatePermission;
    let documentWorkspace = TemplateWorkspaceEnum.PERSONAL;
    let targetId = user._id;
    let roleOfDocumentPermission = DocumentRoleEnum.OWNER;
    let documentOwnerType = DocumentOwnerTypeEnum.PERSONAL;
    switch (role) {
      case TemplateRole.OWNER: {
        break;
      }
      case TemplateRole.ORGANIZATION: {
        const organization = await this.organizationService.getOrgById(refId, { settings: 1 });
        documentWorkspace = organization.settings.templateWorkspace;
        if (documentWorkspace === TemplateWorkspaceEnum.ORGANIZATION) {
          roleOfDocumentPermission = DocumentRoleEnum.ORGANIZATION;
          documentOwnerType = DocumentOwnerTypeEnum.ORGANIZATION;
          targetId = refId;
        }
        break;
      }
      case TemplateRole.ORGANIZATION_TEAM: {
        const team = await this.organizationTeamService.getOrgTeamById(refId);
        documentWorkspace = team.settings.templateWorkspace;
        if (documentWorkspace === TemplateWorkspaceEnum.ORGANIZATION_TEAM) {
          targetId = refId;
          roleOfDocumentPermission = DocumentRoleEnum.ORGANIZATION_TEAM;
          documentOwnerType = DocumentOwnerTypeEnum.ORGANIZATION_TEAM;
        }
        break;
      }
      default: break;
    }
    const { documentRemoteId, thumbnailRemoteId } = await this.templateService.createDocumentFromTemplate(template);
    const mimeType = mime.lookup('pdf') as string;
    const documentData: Document & { service: DocumentStorageEnum } = {
      name: template.name,
      remoteId: documentRemoteId,
      mimeType,
      size: template.size,
      service: DocumentStorageEnum.S3,
      isPersonal: targetId === user._id,
      ownerId: user._id,
      thumbnail: thumbnailRemoteId,
      lastModifiedBy: user._id,
    };

    const documentCreated = await this.templateService.createDocumentData({
      document: documentData, roleOfDocumentPermission, targetId, documentOwnerType,
    });

    const isCloneToTeam = role === TemplateRole.ORGANIZATION_TEAM && documentWorkspace === TemplateWorkspaceEnum.ORGANIZATION_TEAM;
    if (notify || isCloneToTeam) {
      this.templateService.notiUseTemplate({
        templateRole: templatePermission.role,
        uploaderId: user._id,
        document: documentCreated,
        targetId: templatePermission.refId,
      });
    }
    this.templateService.updateTemplate({ _id: templateId }, { $inc: { 'counter.download': 1 } });
    return documentCreated as unknown as Document;
  }

  @UseGuards(RateLimiterGuard)
  @AcceptanceRateLimiter(RateLimiterStrategy.USER_ID)
  @Query()
  getPersonalTemplates(
    @Args('pagingOption') pagingOption: GetTemplatesInput,
    @Context() context,
  ): Promise<GetTemplatesPayload> {
    const { _id: userId } = context.req.user;
    return this.templateService.getTemplatesList([userId as string], pagingOption);
  }

  @UseGuards(RateLimiterGuard)
  @AcceptanceRateLimiter(RateLimiterStrategy.USER_ID)
  @TemplateLevelGuard(PersonalTemplateRoles.ALL, OrganizationTemplateRoles.ALL, OrgTeamTemplateRoles.ALL)
  @Mutation()
  updateTemplateCounter(
    @Args('input') input: UpdateTemplateCounterInput,
  ): Promise<Template> {
    return this.templateService.updateTemplateCounter(input) as Promise<Template>;
  }

  @UseGuards(RateLimiterGuard)
  @AcceptanceRateLimiter(RateLimiterStrategy.USER_ID)
  @TemplateLevelGuard(PersonalTemplateRoles.ALL, OrgTeamTemplateRoles.ALL, OrganizationTemplateRoles.ALL)
  @Query()
  getTemplateById(@Args('templateId') templateId: string, @Args('increaseView') increaseView: boolean): Promise<Template> {
    if (increaseView) {
      return this.templateService.updateTemplate({ _id: templateId }, { $inc: { 'counter.view': 1 } });
    }
    return this.templateService.findOneById(templateId);
  }

  @UseGuards(RateLimiterGuard)
  @AcceptanceRateLimiter(RateLimiterStrategy.USER_ID)
  @TemplateLevelGuard(PersonalTemplateRoles.OWNER, OrganizationTemplateRoles.OWNER, OrgTeamTemplateRoles.OWNER)
  @Mutation()
  async editTemplate(
    @Args('input') input: EditTemplateInput,
    @Args({ name: 'file', type: () => GraphQLUpload }, AvatarFilePipe())
      thumbnailFile: FileData,
  ): Promise<Template> {
    const { templateId, isRemoveThumbnail } = input;
    const { thumbnail: currentThumbnail } = await this.templateService.findById(templateId);
    const shouldRemoveThumbnail = Boolean(currentThumbnail && isRemoveThumbnail);
    return this.templateService.editTemplateInfo({
      ...input,
      thumbnailInfo: {
        currentThumbnail,
        thumbnailFile,
        shouldRemoveThumbnail,
      },
    });
  }

  @ResolveField('signedUrl')
  async getSignedUrl(@Parent() template: Template): Promise<string> {
    if (template.signedUrl) {
      return template.signedUrl;
    }
    return this.templateService.getSignedUrl(template.remoteId);
  }

  @ResolveField('belongsTo')
  async getTemplateBelongsTo(@Parent() template: Template): Promise<BelongsTo> {
    if (template.belongsTo) {
      return template.belongsTo;
    }
    return this.templateService.getTemplateBelongsTo(template._id);
  }

  @ResolveField('ownerName')
  async getOwnerName(@Parent() template: Template): Promise<string> {
    if (template.ownerName) {
      return template.ownerName;
    }
    const owner = await this.userService.findUserById(template.ownerId, { name: 1 });
    return owner && owner.name || 'anonymous';
  }

  @ResolveField('permissions')
  getTemplatePermission(@Context() context, @Parent() template: Template): TemplatePermissions {
    const { _id: userId } = context.req.user;
    const isOwnerOfTemplate = template.ownerId.toHexString() === userId;

    return {
      canEdit: isOwnerOfTemplate,
      canDelete: isOwnerOfTemplate,
    };
  }

  @UseGuards(RateLimiterGuard)
  @AcceptanceRateLimiter(RateLimiterStrategy.USER_ID)
  @TemplateLevelGuard(PersonalTemplateRoles.OWNER, OrganizationTemplateRoles.OWNER, OrgTeamTemplateRoles.OWNER)
  @Mutation()
  async deleteTemplate(
    @Args('input') input: DeleteTemplateInput,
    @Context() context,
  ): Promise<DeleteTemplatePayload> {
    const { user } = context.req;
    const { templateId, isNotify } = input;
    const [template, actorInfo, [templatePermission]] = await Promise.all([
      this.templateService.getTemplateByTemplateId(templateId),
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      this.userService.findUserById(user._id),
      this.templateService.getTemplatePermissionsByTemplateId(
        templateId,
        {
          role: {
            $in: [
              TemplateRole.OWNER,
              TemplateRole.ORGANIZATION,
              TemplateRole.ORGANIZATION_TEAM,
            ],
          },
        },
      ),
    ]);
    const roleTemplate: TemplateRole = TemplateRole[templatePermission.role.toUpperCase()];

    const isRawTemplate = [
      TemplateRole.OWNER,
      TemplateRole.ORGANIZATION,
      TemplateRole.ORGANIZATION_TEAM,
    ].includes(roleTemplate);
    const clientType: TemplateOwnerTypeEnum = Utils.mapTemplateRoleOwnerType(roleTemplate);

    if (isRawTemplate) {
      this.templateService.deleteOriginalTemplate(template);
    }
    if ((isNotify && roleTemplate === TemplateRole.ORGANIZATION) || roleTemplate === TemplateRole.ORGANIZATION_TEAM) {
      this.templateService.notifyDeleteTemplateToMembers(
        clientType,
        actorInfo,
        templatePermission.refId,
        template,
      );
    }
    return {
      message: 'Delete template success',
      statusCode: HttpStatus.OK,
    };
  }

  @UseGuards(RateLimiterGuard)
  @AcceptanceRateLimiter(RateLimiterStrategy.USER_ID)
  @Query()
  async checkReachDailyTemplateUploadLimit(
    @Args('uploaderId') uploaderId: string,
    @Args('refId') refId: string,
  ): Promise<boolean> {
    const { canUpload } = await this.templateService.checkDailyTemplateUploadLimit({
      uploaderId,
      refId,
    });
    return !canUpload;
  }
}
