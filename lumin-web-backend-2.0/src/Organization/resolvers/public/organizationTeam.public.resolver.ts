import {
  HttpStatus,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  Resolver, Mutation, Context, Args, Query,
} from '@nestjs/graphql';
// eslint-disable-next-line import/extensions
import * as GraphQLUpload from 'graphql-upload/GraphQLUpload.js';

import { ErrorCode } from 'Common/constants/ErrorCode';
import { RateLimiterStrategy } from 'Common/constants/RateLimiterConstants';
import { CustomRuleValidator } from 'Common/decorators/customRule.decorator';
import { CurrentOrganization } from 'Common/decorators/organization.decorator';
import { CurrentTeam } from 'Common/decorators/team.decorator';
import { GraphErrorException } from 'Common/errors/GraphqlErrorException';
import { LoggingInterceptor } from 'Common/interceptors/logging.interceptor';
import { SanitizeInputInterceptor } from 'Common/interceptors/sanitize.input.interceptor';
import { Utils } from 'Common/utils/Utils';
import { DocumentFilePipe } from 'Common/validator/FileValidator/document.validator.pipe';
import { FileData } from 'Common/validator/FileValidator/file.validator.pipe';

import { CustomRuleAction } from 'CustomRules/custom-rule.enum';

import { IGqlRequest } from 'Auth/interfaces/IGqlRequest';
import { DocumentOwnerTypeEnum } from 'Document/document.enum';
import { IDocumentTemplate } from 'Document/DocumentTemplate/documentTemplate.interface';
import { DocumentPaymentInterceptor, ExtendedDocumentIntercept } from 'Document/interceptor/document.payment.interceptor';
import { IDocument } from 'Document/interfaces/document.interface';
import { DOCUMENT_INDEXING_PREPARATION_CONTEXT } from 'DocumentIndexingBacklog/constants/documentIndexingBacklog.constants';
import { EventScopes, NonDocumentEventNames } from 'Event/enums/event.enum';
import { EventServiceFactory } from 'Event/services/event.service.factory';
import { FolderPermissionGuard } from 'Folder/guards/Gql/folder.permission.guard';
import {
  BasicResponse,
  GetOrganizationTeamFoldersInput,
  Folder,
  GetOrganizationTeamDocumentsInput,
  GetDocumentPayload,
  GetTemplatesInput,
  GetTemplatesPayload,
  UploadTeamTemplateInput,
  Template,
  TemplateOwnerType,
  DocumentTab,
  UploadDocumentToTeamInput,
  UploadDocumentTemplateToTeamInput,
  GetDocumentTemplatesPayload,
  GetOrganizationTeamDocumentTemplatesInput,
} from 'graphql.schema';
import { LoggerService } from 'Logger/Logger.service';
import { OrganizationPermissionGuard, PreventInDeleteProcess } from 'Organization/guards/Gql/organization.permission.guard';
import { IOrganization } from 'Organization/interfaces/organization.interface';
import { OrganizationDocStackService } from 'Organization/organization.docStack.service';
import { OrganizationValidationStrategy, OrganizationTeamRoles } from 'Organization/organization.enum';
import { OrganizationService } from 'Organization/organization.service';
import { OrganizationTeamService } from 'Organization/organizationTeam.service';
import { Resource } from 'Organization/Policy/architecture/policy.enum';
import { AcceptanceRateLimiter } from 'RateLimiter/decorators/rateLimiter.strategy.decorator';
import { RateLimiterGuard } from 'RateLimiter/guards/rateLimiter.guard';
import { ITeam } from 'Team/interfaces/team.interface';
import { TemplateService } from 'Template/template.service';
import { UploadService } from 'Upload/upload.service';
import { User } from 'User/interfaces/user.interface';

@UseInterceptors(DocumentPaymentInterceptor)
@Resolver()
@OrganizationPermissionGuard(OrganizationValidationStrategy.PUBLIC, Resource.ORGANIZATION_TEAM)
@UseInterceptors(SanitizeInputInterceptor)
export class OrganizationTeamPublicResolver {
  constructor(
    private readonly organizationTeamService: OrganizationTeamService,
    private readonly eventService: EventServiceFactory,
    private readonly organizationService: OrganizationService,
    private readonly templateService: TemplateService,
    private readonly organizationDocStackService: OrganizationDocStackService,
    private readonly uploadService: UploadService,
    private readonly loggerService: LoggerService,
  ) {}

  @UseGuards(RateLimiterGuard)
  @AcceptanceRateLimiter(RateLimiterStrategy.USER_ID)
  @PreventInDeleteProcess()
  @Mutation()
  async leaveOrgTeam(
    @Context() context,
    @Args('teamId') teamId: string,
  ): Promise<BasicResponse> {
    const { user, organization } = context.req;
    const membership = await this.organizationTeamService.getOrgTeamMembershipOfUser(user._id as string, teamId, { role: 1 });
    if (membership.role === OrganizationTeamRoles.ADMIN) {
      throw GraphErrorException.NotAcceptable('Team admin can not leave team', ErrorCode.OrgTeam.TEAM_ADMIN_CANNOT_LEAVE_TEAM);
    }
    const result = await this.organizationTeamService.removeMembershipInTeam(teamId, user._id as string, organization._id as string);
    if (!result.deletedCount) {
      throw GraphErrorException.BadRequest('Can not leave organization team', ErrorCode.OrgTeam.CANNOT_LEAVE_TEAM);
    }
    const [actor, team] = await Promise.all([
      this.organizationTeamService.getUserById(user._id as string),
      this.organizationTeamService.getOrgTeamById(teamId),
    ]);
    this.organizationTeamService.notifyLeaveOrganizationTeam(actor, team);
    this.eventService.createEvent({
      eventName: NonDocumentEventNames.TEAM_MEMBER_LEFT,
      eventScope: EventScopes.TEAM,
      actor,
      team,
    });
    return {
      message: 'Leave successfully',
      statusCode: HttpStatus.OK,
    };
  }

  @UseGuards(RateLimiterGuard)
  @AcceptanceRateLimiter(RateLimiterStrategy.USER_ID)
  @UseInterceptors(LoggingInterceptor)
  @FolderPermissionGuard()
  @CustomRuleValidator(CustomRuleAction.USE_S3_STORAGE)
  @Mutation()
  async uploadDocumentToOrgTeamV2(
    @Context() context,
    @Args('input') input: UploadDocumentToTeamInput,
  ): Promise<Partial<IDocument> & ExtendedDocumentIntercept & BasicResponse> {
    const { organization, user }: { organization: IOrganization, user: any } = context.req;
    const {
      teamId,
      folderId,
      documentName,
      encodedUploadData,
    } = input;
    const { thumbnailRemoteId, documentRemoteId } = await this.uploadService.verifyUploadData(user._id as string, encodedUploadData);
    const hasRemainingDocStack = await this.organizationDocStackService.validateIncreaseDocStack(organization, {
      totalNewDocument: 1,
    });
    const isRequestFromMobile = await Utils.isRequestFromMobile(context.req as IGqlRequest);
    if (!hasRemainingDocStack && !isRequestFromMobile) {
      throw GraphErrorException.BadRequest('You currently reached Doc Stack limitation', ErrorCode.Document.ORG_REACHED_DOC_STACK_LIMIT);
    }
    const documentUploaded = await this.organizationService.uploadDocument({
      uploader: user,
      clientId: teamId,
      documentOwnerType: DocumentOwnerTypeEnum.ORGANIZATION_TEAM,
      fileRemoteId: documentRemoteId,
      fileName: documentName,
      context: organization,
      folderId,
      thumbnailRemoteId,
    });
    return {
      ...documentUploaded,
      message: 'Upload organization document successfully',
      statusCode: HttpStatus.OK,
      interceptRequest: {
        documentIds: [documentUploaded._id],
        strategy: DocumentPaymentInterceptor.STRATEGY.AUTO_INCREMENT,
      },
    };
  }

  @Query()
  async getOrganizationTeamFolders(
    @Context() context,
    @Args('input') input: GetOrganizationTeamFoldersInput,
    @CurrentOrganization() organization: IOrganization,
  ): Promise<Folder[]> {
    const { _id: userId } = context.req.user as User;
    const {
      teamId, sortOptions, searchKey,
    } = input;
    await this.organizationTeamService.updateLastAccessedTeam({ userId, orgId: organization._id, teamId });
    return this.organizationService.getOrgTeamFolders({
      teamId,
      sortOptions,
      userId,
      searchKey,
    });
  }

  @Query()
  async getOrganizationTeamDocuments(
    @Context() context,
    @Args('input') input: GetOrganizationTeamDocumentsInput,
    @CurrentTeam() team: ITeam,
    @CurrentOrganization() organization: IOrganization,
  ): Promise<GetDocumentPayload> {
    const { user } = context.req as { user: User };
    this.organizationService.prepareTeamDocumentIndexing({ user, team, organization }).catch((error) => {
      this.loggerService.error({
        context: DOCUMENT_INDEXING_PREPARATION_CONTEXT,
        message: 'Error preparing team document indexing',
        extraInfo: {
          teamId: team._id,
          organizationId: organization._id,
        },
        error,
      });
    });
    await this.organizationTeamService.updateLastAccessedTeam({ userId: user._id, orgId: organization._id, teamId: team._id });
    return this.organizationService.getDocuments({
      user,
      resource: team,
      ...input,
      tab: input.tab ?? DocumentTab.ORGANIZATION,
    });
  }

  @UseGuards(RateLimiterGuard)
  @AcceptanceRateLimiter(RateLimiterStrategy.USER_ID)
  @Query()
  getTeamTemplates(
    @Args('teamId') teamId: string,
    @Args('pagingOption') pagingOption: GetTemplatesInput,
  ): Promise<GetTemplatesPayload> {
    return this.templateService.getTemplatesList([teamId], pagingOption);
  }

  @UseGuards(RateLimiterGuard)
  @AcceptanceRateLimiter(RateLimiterStrategy.USER_ID)
  @Mutation()
  async uploadTeamTemplate(
    @Args('input') input: UploadTeamTemplateInput,
    @Args({ name: 'files', type: () => GraphQLUpload }, DocumentFilePipe())
      files: [FileData],
    @Context() context,
  ): Promise<Template> {
    const { user } = context.req;
    const { template, error } = await this.templateService.uploadTemplate({
      ...input,
      uploaderId: user._id,
      ownerType: TemplateOwnerType.ORGANIZATION_TEAM,
      files,
    });

    if (error) {
      throw error;
    }
    return template;
  }

  @UseGuards(RateLimiterGuard)
  @AcceptanceRateLimiter(RateLimiterStrategy.USER_ID)
  @UseInterceptors(LoggingInterceptor)
  @CustomRuleValidator(CustomRuleAction.MANAGE_DOCUMENT_TEMPLATE, CustomRuleAction.USE_S3_STORAGE)
  @Mutation()
  async uploadDocumentTemplateToOrgTeam(
    @Context() context,
    @Args('input') input: UploadDocumentTemplateToTeamInput,
  ): Promise<Partial<IDocumentTemplate> & BasicResponse> {
    const { organization, user }: { organization: IOrganization, user: any } = context.req;
    const { teamId, fileName, encodedUploadData } = input;
    const { thumbnailRemoteId, documentRemoteId } = await this.uploadService.verifyUploadData(user._id as string, encodedUploadData);
    const documentUploaded = await this.organizationService.uploadDocumentTemplate({
      uploader: user,
      clientId: teamId,
      documentOwnerType: DocumentOwnerTypeEnum.ORGANIZATION_TEAM,
      fileRemoteId: documentRemoteId,
      fileName,
      context: organization,
      thumbnailRemoteId,
    });
    return {
      ...documentUploaded,
      message: 'Upload organization team document template successfully',
      statusCode: HttpStatus.OK,
    };
  }

  @UseGuards(RateLimiterGuard)
  @AcceptanceRateLimiter(RateLimiterStrategy.USER_ID)
  @CustomRuleValidator(CustomRuleAction.MANAGE_DOCUMENT_TEMPLATE)
  @Query()
  async getOrganizationTeamDocumentTemplates(
    @Context() context,
    @Args('input') input: GetOrganizationTeamDocumentTemplatesInput,
    @CurrentTeam() team: ITeam,
  ): Promise<GetDocumentTemplatesPayload> {
    const { user } = context.req as { user: User };
    return this.organizationService.getDocumentTemplates({
      user,
      resource: team,
      ...input,
      tab: input.tab ?? DocumentTab.ORGANIZATION,
    });
  }
}
