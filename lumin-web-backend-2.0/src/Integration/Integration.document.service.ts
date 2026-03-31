import { HeadObjectOutput } from '@aws-sdk/client-s3';
import { Inject, Injectable, forwardRef } from '@nestjs/common';

import { EnvConstants } from 'Common/constants/EnvConstants';
import { ErrorCode } from 'Common/constants/ErrorCode';
import { ErrorMessage } from 'Common/constants/ErrorMessage';
import { DOC_STACK_PLAN, UNLIMITED_DOCUMENT_STACK } from 'Common/constants/PaymentConstant';
import { GrpcErrorException } from 'Common/errors/GrpcErrorException';

import { AwsService } from 'Aws/aws.service';

import { CustomRuleLoader } from 'CustomRules/custom-rule.loader';
import { CustomRulesService } from 'CustomRules/custom-rule.service';
import UserRules from 'CustomRules/UserRules';

import {
  DocStackIntervalEnum, DocumentOwnerTypeEnum, DocumentRoleEnum, DocumentStorageEnum,
} from 'Document/document.enum';
import { DocumentService } from 'Document/document.service';
import DocumentPaymentHandler from 'Document/handlers/documentPaymentHandler/document.payment.handler';
import DocumentPaymentRequest from 'Document/handlers/documentPaymentHandler/interface/document.payment.request';
import { IDocument } from 'Document/interfaces/document.interface';
import { EnvironmentService } from 'Environment/environment.service';
import { IOrganization } from 'Organization/interfaces/organization.interface';
import { OrganizationDocStackService } from 'Organization/organization.docStack.service';
import { OrganizationService } from 'Organization/organization.service';
import { OrganizationTeamService } from 'Organization/organizationTeam.service';
import { PaymentPlanEnums } from 'Payment/payment.enum';
import planPoliciesHandler from 'Payment/Policy/planPoliciesHandler';
import { RateLimiterService } from 'RateLimiter/rateLimiter.service';
import { TeamService } from 'Team/team.service';
import { IUser, User } from 'User/interfaces/user.interface';
import { UserService } from 'User/user.service';

import { UploadLocation } from './constants';

@Injectable()
export class IntegrationDocumentService {
  private handler: DocumentPaymentHandler;

  private interval: DocStackIntervalEnum = DocStackIntervalEnum.MONTH;

  constructor(
    @Inject(forwardRef(() => OrganizationService))
    private readonly organizationService: OrganizationService,
    private readonly awsService: AwsService,
    private readonly userService: UserService,
    private readonly documentService: DocumentService,
    private readonly rateLimiterService: RateLimiterService,
    private readonly customRuleService: CustomRulesService,
    private readonly customRuleLoader: CustomRuleLoader,
    private readonly organizationTeamService: OrganizationTeamService,
    private readonly environmentService: EnvironmentService,
    private readonly organizationDocStackService: OrganizationDocStackService,
    private readonly teamService: TeamService,
  ) {
    this.handler = new DocumentPaymentHandler(
      documentService,
      teamService,
      organizationService,
      organizationDocStackService,
    );
    this.interval = this.environmentService.getByKey(EnvConstants.DOC_STACK_INTERVAL) as DocStackIntervalEnum;
  }

  async getDocumentMetadata(fileRemoteId: string): Promise<{
    error?: GrpcErrorException,
    documentMetadata?: HeadObjectOutput,
  }> {
    // This remoteId is temp file id uploaded to temporary bucket
    const documentMetadata = await this.awsService.getFileMetadata(fileRemoteId, EnvConstants.S3_INTEGRATION_BUCKET);
    if (!documentMetadata) {
      return {
        error: GrpcErrorException.InvalidArgument('Fail to get temporary file metadata', ErrorCode.Document.TEMPORARY_FILE_MISSING),
      };
    }
    return { documentMetadata };
  }

  async getDocumentMetadataTempBucket(fileRemoteId: string): Promise<{
    error?: GrpcErrorException,
    documentMetadata?: HeadObjectOutput,
  }> {
    const documentMetadata = await this.awsService.getFileMetadata(fileRemoteId, EnvConstants.S3_TEMPORARY_FILES);
    if (!documentMetadata) {
      return { error: GrpcErrorException.InvalidArgument('Fail to get temporary file metadata', ErrorCode.Document.TEMPORARY_FILE_MISSING) };
    }
    return { documentMetadata };
  }

  async validateAndGetUploadDestination({
    uploaderId, documentMetadata, orgId,
  }: {uploaderId: string, documentMetadata: HeadObjectOutput, orgId?: string}): Promise<{
    error?: GrpcErrorException,
    organization?: IOrganization,
    user?: User,
  }> {
    if (!this.documentService.verifyUploadFiles([{ mimetype: documentMetadata.ContentType }])) {
      return {
        error: GrpcErrorException.InvalidArgument('Invalid file type. File must be in pdf/png/jpg/jpeg format', ErrorCode.Common.INVALID_FILE_TYPE),
      };
    }
    const user = await this.userService.findUserById(uploaderId);
    if (!user) {
      return { error: GrpcErrorException.NotFound(ErrorMessage.USER.USER_NOT_FOUND, ErrorCode.User.USER_NOT_FOUND) };
    }
    const userRules = new UserRules(this.customRuleService, this.customRuleLoader, user);
    if (userRules.onlyUseDriveStorage) {
      return { error: GrpcErrorException.PermissionDenied('Target domain is restricted to this action', ErrorCode.User.RESTRICTED_ACTION) };
    }
    if (orgId) {
      const memberPermission = await this.organizationService.getMembershipByOrgAndUser(orgId, user._id);
      const organization = await this.organizationService.findOneOrganization({ _id: orgId });
      if (!memberPermission || !organization) {
        return {
          error: GrpcErrorException.NotFound(ErrorMessage.ORGANIZATION.ORGANIZATION_NOT_FOUND, ErrorCode.Org.ORGANIZATION_NOT_FOUND),
        };
      }
      const isPremiumOrg = organization.payment?.type !== PaymentPlanEnums.FREE;
      if (!this.rateLimiterService.verifyUploadFilesSize(isPremiumOrg, [{ size: documentMetadata.ContentLength }])) {
        if (isPremiumOrg) {
          return { error: GrpcErrorException.InvalidArgument(ErrorMessage.DOCUMENT.FILE_SIZE.PAID, ErrorCode.Document.OVER_FILE_SIZE_PREMIUM) };
        }
        return { error: GrpcErrorException.InvalidArgument(ErrorMessage.DOCUMENT.FILE_SIZE.FREE, ErrorCode.Document.OVER_FILE_SIZE_FREE) };
      }
      return {
        organization,
        user,
      };
    }
    const isPremiumUser = user.payment.type !== PaymentPlanEnums.FREE;

    if (isPremiumUser && !this.rateLimiterService.verifyUploadFilesSize(isPremiumUser, [{ size: documentMetadata.ContentLength }])) {
      return { error: GrpcErrorException.InvalidArgument(ErrorMessage.DOCUMENT.FILE_SIZE.PAID, ErrorCode.Document.OVER_FILE_SIZE_PREMIUM) };
    }
    const organization = await this.documentService.updateWorkspaceAndGetUploadDestination(user);
    const isPremium = isPremiumUser || organization?.payment?.type !== PaymentPlanEnums.FREE;
    if (!this.rateLimiterService.verifyUploadFilesSize(isPremium, [{ size: documentMetadata.ContentLength }])) {
      if (isPremium) {
        return { error: GrpcErrorException.InvalidArgument(ErrorMessage.DOCUMENT.FILE_SIZE.PAID, ErrorCode.Document.OVER_FILE_SIZE_PREMIUM) };
      }
      return { error: GrpcErrorException.InvalidArgument(ErrorMessage.DOCUMENT.FILE_SIZE.FREE, ErrorCode.Document.OVER_FILE_SIZE_FREE) };
    }
    if (!isPremiumUser || Boolean(user.setting.defaultWorkspace)) {
      return {
        organization,
        user,
      };
    }
    return { user };
  }

  async uploadDocument({
    organization,
    user,
    tempDocumentInfo,
  }: {
    organization: IOrganization,
    user: User,
    tempDocumentInfo: { remoteId: string, mimeType: string, fileName: string, fileSize: number }
  }): Promise<IDocument> {
    const {
      remoteId, mimeType, fileName, fileSize,
    } = tempDocumentInfo;
    const remoteDocumentId = await this.documentService.copyTempFileToS3({ mimeType, remoteId });
    if (organization) {
      return this.organizationService.uploadDocument({
        uploader: user,
        clientId: organization._id,
        documentOwnerType: DocumentOwnerTypeEnum.PERSONAL,
        fileRemoteId: remoteDocumentId,
        fileName,
        context: organization,
      });
    }
    const documentCreated = await this.documentService.createDocument({
      name: fileName,
      remoteId: remoteDocumentId,
      mimeType,
      size: fileSize,
      service: DocumentStorageEnum.S3,
      isPersonal: true,
      lastModifiedBy: user._id,
      ownerId: user._id,
      shareSetting: {},
      thumbnail: '',
    });
    const documentPermission = {
      documentId: documentCreated._id,
      refId: user._id,
      role: DocumentRoleEnum.OWNER,
    };
    await this.documentService.createDocumentPermissions([
      documentPermission,
    ]);
    return documentCreated;
  }

  async validateDocumentPermission(documentId: string, userId: string): Promise<{ error?: GrpcErrorException; document?: IDocument }> {
    const document = await this.documentService.getDocumentByConditions(documentId);
    if (!document) {
      return {
        error: GrpcErrorException.NotFound('Document not found', ErrorCode.Document.DOCUMENT_NOT_FOUND),
      };
    }
    // Personal document
    const [documentPermission] = await this.documentService.getDocumentPermissionsByDocId(documentId, { refId: userId });
    if (documentPermission) {
      return { document };
    }
    // Organization/Team document
    const [groupDocumentPermission] = await this.documentService.getDocumentPermissionsByDocId(
      documentId,
      { role: { $in: [DocumentRoleEnum.ORGANIZATION_TEAM, DocumentRoleEnum.ORGANIZATION] } },
    );
    if (groupDocumentPermission) {
      switch (groupDocumentPermission.role) {
        case DocumentRoleEnum.ORGANIZATION: {
          const organizationMember = await this.organizationService.getMembershipByOrgAndUser(groupDocumentPermission.refId, userId);
          if (organizationMember) {
            return { document };
          }
          break;
        }
        case DocumentRoleEnum.ORGANIZATION_TEAM: {
          const [teamMember] = await this.organizationTeamService.findMembershipsByCondition({ teamId: groupDocumentPermission.refId, userId });
          if (teamMember) {
            return { document };
          }
          break;
        }
        default: {
          break;
        }
      }
    }
    return {
      error: GrpcErrorException.NotFound('Document permission not found', ErrorCode.Document.NO_DOCUMENT_PERMISSION),
    };
  }

  validateFileRestrictions({
    user,
    organization,
    documentMetadata,
  }: {
    user: IUser;
    organization: IOrganization;
    documentMetadata: HeadObjectOutput;
  }) {
    if (
      !this.documentService.verifyUploadFiles([
        { mimetype: documentMetadata.ContentType },
      ])
    ) {
      throw GrpcErrorException.InvalidArgument(
        'Invalid file type',
        ErrorCode.Common.INVALID_FILE_TYPE,
      );
    }
    const userRules = new UserRules(
      this.customRuleService,
      this.customRuleLoader,
      user,
    );
    if (userRules.onlyUseDriveStorage) {
      throw GrpcErrorException.PermissionDenied(
        'Target domain is restricted to this action',
        ErrorCode.User.RESTRICTED_ACTION,
      );
    }
    const isPremiumOrg = organization.payment?.type !== PaymentPlanEnums.FREE;
    if (!this.rateLimiterService.verifyUploadFilesSize(isPremiumOrg, [{ size: documentMetadata.ContentLength }])) {
      if (isPremiumOrg) {
        throw GrpcErrorException.InvalidArgument(ErrorMessage.DOCUMENT.FILE_SIZE.PAID, ErrorCode.Document.OVER_FILE_SIZE_PREMIUM);
      }
      throw GrpcErrorException.InvalidArgument(ErrorMessage.DOCUMENT.FILE_SIZE.FREE, ErrorCode.Document.OVER_FILE_SIZE_FREE);
    }
  }

  async handleDocStackStrategy({ documentIds, userId }: {documentIds: string[]; userId: string}): Promise<void> {
    const documentPaymentRequest = new DocumentPaymentRequest();
    documentPaymentRequest.setDocumentIds(documentIds);

    const { _id: incrementTargetId, info: orgInfo } = await this.handler.getDefaultDocumentPermissionTarget(documentIds[0]);
    if (
      !orgInfo
          || !DOC_STACK_PLAN.includes(orgInfo.payment.type as PaymentPlanEnums)
    ) {
      return;
    }
    const { payment, createdAt, docStackStartDate } = orgInfo;
    const docStack = planPoliciesHandler
      .from({ plan: payment.type, period: payment.period })
      .getDocStack(payment.quantity);
    if (docStack !== UNLIMITED_DOCUMENT_STACK) {
      documentPaymentRequest.setIncrementTargetId(incrementTargetId);
    }
    await this.handleApproachingDocStackLimit({
      organization: orgInfo,
      userId,
    });
    const updatedCommand = documentPaymentRequest.build({
      docStackStartDate: docStackStartDate || createdAt,
      interval: this.interval,
    });
    this.handler.execUpdateRequest(updatedCommand);
  }

  private async handleApproachingDocStackLimit({
    organization,
    userId,
  }: { organization: IOrganization; userId: string; }): Promise<void> {
    const { totalUsed, totalStack } = await this.organizationDocStackService.getDocStackInfo({
      orgId: organization._id,
      payment: organization.payment,
      totalNewDocument: 1,
    });
    if (totalUsed + 1 === totalStack) {
      this.organizationService.notifyHitDocstack(organization);
      this.organizationDocStackService.trackOrgHitDocStackLimitEvent({
        userId,
        organization,
        docStackLimit: totalStack,
      });
    }
  }

  async handleUploadDocument({
    user,
    organization,
    document,
    uploadLocation,
    teamId,
    folderId,
    bucketEnv,
    tempBucketEnv,
  }: {
    user: IUser;
    organization: IOrganization;
    document: {
      remoteId: string;
      mimeType: string;
      fileName: string;
    };
    uploadLocation: UploadLocation;
    teamId?: string;
    folderId?: string;
    bucketEnv?: string;
    tempBucketEnv?: string;
  }): Promise<{ createdDocument: IDocument }> {
    const { mimeType, remoteId, fileName } = document;

    const remoteDocumentId = await this.documentService.copyTempFileToS3({
      mimeType,
      remoteId,
    }, bucketEnv, tempBucketEnv);

    const documentOwnerType = {
      [UploadLocation.Personal]: DocumentOwnerTypeEnum.PERSONAL,
      [UploadLocation.Space]: DocumentOwnerTypeEnum.ORGANIZATION_TEAM,
      [UploadLocation.Workspace]: DocumentOwnerTypeEnum.ORGANIZATION,
    }[uploadLocation];

    const clientId = {
      [UploadLocation.Personal]: organization._id,
      [UploadLocation.Space]: teamId,
      [UploadLocation.Workspace]: organization._id,
    }[uploadLocation];

    const createdDocument = await this.organizationService.uploadDocument({
      uploader: user,
      clientId,
      folderId,
      documentOwnerType,
      fileRemoteId: remoteDocumentId,
      fileName,
      context: organization,
    });

    return { createdDocument };
  }
}
