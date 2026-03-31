import {
  Inject, UseGuards, UseInterceptors, HttpStatus,
} from '@nestjs/common';
import {
  Args, Context, Mutation, Parent, Query, ResolveField, Resolver, Subscription,
} from '@nestjs/graphql';

import { EnvConstants } from 'Common/constants/EnvConstants';
import { ErrorCode } from 'Common/constants/ErrorCode';
import { RateLimiterStrategy } from 'Common/constants/RateLimiterConstants';
import {
  SUBSCRIPTION_UPDATE_DOCUMENT_TEMPLATE_LIST,
  SUBSCRIPTION_DELETE_DOCUMENT_TEMPLATE,
} from 'Common/constants/SubscriptionConstants';
import { CustomRuleValidator } from 'Common/decorators/customRule.decorator';
import { GraphErrorException } from 'Common/errors/GraphqlErrorException';
import { SanitizeInputInterceptor } from 'Common/interceptors/sanitize.input.interceptor';

import { AwsService } from 'Aws/aws.service';

import { CustomRuleAction } from 'CustomRules/custom-rule.enum';

import { GqlAttachUserGuard } from 'Auth/guards/graph.attachUser';
import { GqlAuthGuard } from 'Auth/guards/graph.auth.guard';
import { DataLoaderRegistry } from 'DataLoader/dataLoader.registry';
import { DocumentOwnerTypeEnum, DocumentRoleEnum } from 'Document/document.enum';
import { DocumentEventService } from 'Document/document.event.service';
import { DocumentService } from 'Document/document.service';
import { IDocumentTemplate } from 'Document/DocumentTemplate/documentTemplate.interface';
import { DocumentTemplateService } from 'Document/DocumentTemplate/documentTemplate.service';
import { IndividualRoles } from 'Document/enums/individual.roles.enum';
import {
  OrganizationDocumentRoles,
  OrgTeamDocumentRoles,
} from 'Document/enums/organization.roles.enum';
import { DocumentGuestAuthLevelGuard } from 'Document/guards/Gql/document.guest.permission.guard';
import { DocumentPersonalLevelGuard } from 'Document/guards/Gql/document.personal.permission.guard';
import { IDocument } from 'Document/interfaces';
import { EnvironmentService } from 'Environment/environment.service';
import {
  TypeOfDocument, DocumentTemplate, ShareLinkType, BasicResponse, DocumentKindEnum, BelongsTo,
  DeleteDocumentTemplateInput,
  CreateDocumentFromDocumentTemplateInput,
} from 'graphql.schema';
import { LoggerService } from 'Logger/Logger.service';
import { RedisService } from 'Microservices/redis/redis.service';
import { OrganizationService } from 'Organization/organization.service';
import { TEMPLATE_ACTION_COUNT_DOC_STACK } from 'Payment/Policy/newPriceModel';
import { AcceptanceRateLimiter } from 'RateLimiter/decorators/rateLimiter.strategy.decorator';
import { RateLimiterGuard } from 'RateLimiter/guards/rateLimiter.guard';
import { User } from 'User/interfaces/user.interface';
import { UserService } from 'User/user.service';

@Resolver('DocumentTemplate')
@CustomRuleValidator(CustomRuleAction.MANAGE_DOCUMENT_TEMPLATE)
export class DocumentTemplateResolver {
  constructor(
    @Inject('PUB_SUB') private readonly pubSub,
    private readonly documentTemplateService: DocumentTemplateService,
    private readonly documentService: DocumentService,
    private readonly environmentService: EnvironmentService,
    private readonly awsService: AwsService,
    private readonly userService: UserService,
    private readonly documentEventService: DocumentEventService,
    private readonly loggerService: LoggerService,
    private readonly organizationService: OrganizationService,
    private readonly redisService: RedisService,
  ) {}

  @UseGuards(GqlAuthGuard)
  @Subscription(SUBSCRIPTION_UPDATE_DOCUMENT_TEMPLATE_LIST)
  updateDocumentTemplateList(@Args('input') input) {
    return this.pubSub.asyncIterator(`${SUBSCRIPTION_UPDATE_DOCUMENT_TEMPLATE_LIST}.${input.clientId}`);
  }

  @UseGuards(GqlAttachUserGuard)
  @Subscription(SUBSCRIPTION_DELETE_DOCUMENT_TEMPLATE, {
    resolve: (payload) => payload[SUBSCRIPTION_DELETE_DOCUMENT_TEMPLATE],
  })
  deleteDocumentTemplateSubscription(@Args('clientId') clientId: string) {
    return this.pubSub.asyncIterator(`${SUBSCRIPTION_DELETE_DOCUMENT_TEMPLATE}.${clientId}`);
  }

  @ResolveField('clientId')
  async getClientId(
    @Parent() document: DocumentTemplate,
    @Context() { loaders }: { loaders: DataLoaderRegistry },
  ): Promise<string> {
    if (document.isPersonal) {
      return '';
    }
    const documentPermission = await loaders.originalDocumentPermissionsLoader.load(document._id);
    const isInternalDocPermission = [
      DocumentRoleEnum.ORGANIZATION, DocumentRoleEnum.ORGANIZATION_TEAM,
    ].includes(documentPermission?.role as DocumentRoleEnum);
    return (isInternalDocPermission && documentPermission?.refId) || '';
  }

  @ResolveField('roleOfDocument')
  async getRoleOfDocument(
    @Context() context,
    @Parent() document: DocumentTemplate,
  ): Promise<string> {
    const { user }: { user: User | undefined } = context.req;
    const { loaders } = context as { loaders: DataLoaderRegistry };
    return this.documentTemplateService.getRoleOfDocument(
      document,
      loaders,
      user,
    );
  }

  @ResolveField('documentType')
  async getDocumentType(
    @Parent() document: DocumentTemplate,
    @Context() { loaders }: { loaders: DataLoaderRegistry },
  ): Promise<string> {
    if (document.isPersonal) {
      return TypeOfDocument.PERSONAL;
    }
    const docPermission = await loaders.originalDocumentPermissionsLoader.load(document._id);

    if (!docPermission || ![DocumentRoleEnum.ORGANIZATION, DocumentRoleEnum.ORGANIZATION_TEAM].includes(docPermission.role as DocumentRoleEnum)) {
      if (document.shareSetting.linkType !== ShareLinkType.ANYONE) {
        throw GraphErrorException.Forbidden(
          'You have no document with this documentId',
        );
      }
      return null;
    }

    return TypeOfDocument[docPermission.role.toUpperCase()];
  }

  @ResolveField('thumbnail')
  getThumbnail(
    @Parent() document: DocumentTemplate,
  ): Promise<string> | null {
    const { thumbnail } = document;
    if (!thumbnail) {
      return null;
    }
    const bucketName = this.environmentService.getByKey(EnvConstants.S3_RESOURCES_BUCKET);
    return this.awsService.getSignedUrl({ keyFile: thumbnail, bucketName });
  }

  @ResolveField('belongsTo')
  getDocumentBelongsTo(
    @Parent() document: DocumentTemplate,
    @Context() context,
  ): Promise<BelongsTo> | BelongsTo | null {
    const { user } = context.req;
    if (!user) {
      return null;
    }

    if (document.belongsTo) {
      return document.belongsTo;
    }
    return this.documentService.getBelongsTo(document);
  }

  @UseGuards(RateLimiterGuard)
  @AcceptanceRateLimiter(RateLimiterStrategy.IP_ADDRESS)
  @DocumentGuestAuthLevelGuard(
    IndividualRoles.OWNER,
    OrganizationDocumentRoles.OWNER,
    OrgTeamDocumentRoles.OWNER,
  )
  @UseInterceptors(SanitizeInputInterceptor)
  @CustomRuleValidator(CustomRuleAction.ACCESS_DOCUMENT)
  @Query('documentTemplate')
  async documentTemplate(
    @Args('documentId') documentId: string,
    @Context() context,
  ): Promise<DocumentTemplate> {
    const { user: userContext } = context.req;
    const document = await this.documentTemplateService.findDocumentTemplateById(
      documentId,
    ) as unknown as DocumentTemplate;
    if (!document) {
      throw GraphErrorException.NotFound(
        'You have no template with this id',
        ErrorCode.Document.DOCUMENT_HAS_BEEN_DELETED,
      );
    }
    document.signedUrl = await this.awsService.getSignedUrl({
      keyFile: document.remoteId,
    });
    document.etag = await this.documentService.getDocumentETag(document.remoteId);
    const user = await this.userService.findUserById(userContext._id as string);

    const result = Object.assign(
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      Object.create(Object.getPrototypeOf(document)),
      document,
    );
    result.belongsTo = await this.documentService.getBelongsTo(document);
    const orgId = this.organizationService.getOrgIdOfDocument(result.belongsTo as BelongsTo);
    result.isShared = false;
    result.actionCountDocStack = TEMPLATE_ACTION_COUNT_DOC_STACK;
    const owner = await this.userService.findUserById(document.ownerId);
    result.ownerName = owner.name;
    result.ownerEmail = owner.email;
    const [imageSignUrls, lastChangedAnnotation] = await Promise.all([
      this.documentService.getImageSignedUrlsById(documentId),
      this.redisService.getLastChangedAnnotation(documentId),
    ]);
    if (lastChangedAnnotation) {
      this.redisService.renewLastChangedAnnotationExpire(documentId);
    }

    if (user) {
      this.organizationService.trackIpAddress({ orgId, userId: user._id, request: context.req });
    }

    result.imageSignedUrls = imageSignUrls;
    result.lastChangedAnnotation = lastChangedAnnotation;
    result.premiumToolsInfo = await this.documentService.getPremiumToolInfo({ document, userId: userContext?._id });
    return result;
  }

  @UseGuards(RateLimiterGuard)
  @AcceptanceRateLimiter(RateLimiterStrategy.USER_ID)
  @DocumentPersonalLevelGuard(
    IndividualRoles.ALL,
    OrganizationDocumentRoles.OWNER,
    OrgTeamDocumentRoles.OWNER,
  )
  @UseInterceptors(SanitizeInputInterceptor)
  @Mutation('deleteDocumentTemplate')
  async deleteDocumentTemplate(
    @Args('input') input: DeleteDocumentTemplateInput,
  ): Promise<BasicResponse> {
    const { documentId, clientId } = input;

    const [documentTemplate, [documentPermission]] = await Promise.all([
      this.documentTemplateService.getDocumentTemplateById(documentId),
      this.documentService.getDocumentPermissionsByDocId(documentId, {
        refId: clientId,
        documentKind: DocumentKindEnum.TEMPLATE,
      }),
    ]);

    if (!documentTemplate) {
      throw GraphErrorException.NotFound(
        'No template found',
        ErrorCode.Template.TEMPLATE_NOT_FOUND,
      );
    }

    await this.documentTemplateService.deleteDocumentTemplate({
      documentTemplate: documentTemplate as unknown as IDocumentTemplate,
      documentPermission,
      clientId,
    });

    return {
      message: 'Delete document template success',
      statusCode: HttpStatus.OK,
    };
  }

  @UseGuards(RateLimiterGuard)
  @AcceptanceRateLimiter(RateLimiterStrategy.USER_ID)
  @DocumentPersonalLevelGuard(IndividualRoles.ALL, OrganizationDocumentRoles.ALL, OrgTeamDocumentRoles.ALL)
  @Mutation()
  async createDocumentFromDocumentTemplate(@Args('input') input: CreateDocumentFromDocumentTemplateInput, @Context() context): Promise<IDocument> {
    const { documentId, destinationId } = input;
    const { user }: { user: User | undefined } = context.req;

    const orgMembership = await this.organizationService.getMembershipByOrgAndUser(destinationId, user?._id);
    if (!orgMembership) {
      throw GraphErrorException.Forbidden("You don't have permission to do this action");
    }

    const template = await this.documentTemplateService.findDocumentTemplateById(documentId);
    if (!template) {
      throw GraphErrorException.NotFound('Template not found', ErrorCode.Document.DOCUMENT_TEMPLATE_NOT_FOUND);
    }
    const createdDocument = await this.documentTemplateService.createDocumentFromDocumentTemplate({
      template,
      destinationId,
      user,
    });

    this.documentService.broadcastUploadDocument({
      document: createdDocument,
      location: DocumentOwnerTypeEnum.PERSONAL,
      receiverId: user._id,
    });

    return createdDocument;
  }
}
