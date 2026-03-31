import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';

import { EnvConstants } from 'Common/constants/EnvConstants';
import { ErrorCode } from 'Common/constants/ErrorCode';
import { RateLimiterFileSizeInMB } from 'Common/constants/RateLimiterConstants';
import { GrpcErrorException } from 'Common/errors/GrpcErrorException';
import GrpcStructConverter from 'Common/utils/GrpcStructConverter';

import { DocumentService } from 'Document/document.service';
import { DocumentTemplateService } from 'Document/DocumentTemplate/documentTemplate.service';
import { EnvironmentService } from 'Environment/environment.service';
import { LoggerService } from 'Logger/Logger.service';
import {
  IOrganizationProto,
  IOrganization,
} from 'Organization/interfaces/organization.interface';
import { IOrganizationMember } from 'Organization/interfaces/organization.member.interface';
import { OrganizationService } from 'Organization/organization.service';
import { OrganizationTeamService } from 'Organization/organizationTeam.service';
import { PaymentPlanEnums } from 'Payment/payment.enum';
import { IUser } from 'User/interfaces/user.interface';
import { UserService } from 'User/user.service';

import { UploadLocation } from './constants';
import { DocumentTemplateWorkspaceGuard } from './guards/document-template-workspace.guard';
import { GrpcInput, OrganizationMembershipGuard, ValidatedOrganization } from './guards/organization-membership.guard';
import { IntegrationDocumentService } from './Integration.document.service';
import { IntegrationOrganizationService } from './Integration.organization.service';
import {
  DocumentTemplateListResponseProto, DocumentTemplateProto,
  OrganizationBasicInfoResponseProto, OrganizationMembersResponseProto,
  OrganizationMemberProto, DocumentBasicInfoResponseProto,
} from './interfaces';
import { convertDocumentFieldToDocumentProto } from './utils';

@Controller('lumin.pdf.v1')
export class IntegrationController {
  constructor(
    private readonly integrationDocumentService: IntegrationDocumentService,
    private readonly userService: UserService,
    private readonly integrationOrganizationService: IntegrationOrganizationService,
    private readonly documentService: DocumentService,
    private readonly organizationService: OrganizationService,
    private readonly organizationTeamService: OrganizationTeamService,
    private readonly environmentService: EnvironmentService,
    private readonly documentTemplateService: DocumentTemplateService,
    private readonly loggerService: LoggerService,
  ) {}

  @GrpcMethod('PdfService', 'UploadPersonalDocument')
  async uploadPersonalDocumentV1(data): Promise<{
    data?: any
  }> {
    const {
      file_remote_id: fileRemoteId, file_name: fileName, caller: uploaderId, circle_id: orgId,
    }: {
      file_remote_id: string,
      file_name: string,
      caller: string,
      circle_id: string,
    } = data;
    const { error, documentMetadata } = await this.integrationDocumentService.getDocumentMetadata(fileRemoteId);
    if (error) {
      throw error;
    }
    const {
      organization,
      user,
      error: validateError,
    } = await this.integrationDocumentService.validateAndGetUploadDestination({
      uploaderId,
      documentMetadata,
      orgId,
    });
    if (validateError) {
      throw validateError;
    }
    const document = await this.integrationDocumentService.uploadDocument({
      organization,
      user,
      tempDocumentInfo: {
        remoteId: fileRemoteId,
        mimeType: documentMetadata.ContentType,
        fileName,
        fileSize: documentMetadata.ContentLength,
      },
    });
    return {
      data: convertDocumentFieldToDocumentProto(document),
    };
  }

  @GrpcMethod('PdfService', 'GetLimitPersonalFileSize')
  async getLimitPersonalFileSizeV1(data): Promise<{
    limit: number
  }> {
    const { caller: uploaderId }: { caller: string } = data;
    const user = await this.userService.findUserById(uploaderId);
    if (!user) {
      throw GrpcErrorException.NotFound('User not found', ErrorCode.User.USER_NOT_FOUND);
    }
    const organization = await this.documentService.getDestinationWorkspace(user, { shouldCreateOrg: false });
    const isPremiumUser = user.payment.type !== PaymentPlanEnums.FREE;
    if (!isPremiumUser && !organization) {
      return { limit: RateLimiterFileSizeInMB.FREE };
    }
    const isPremium = isPremiumUser || organization.payment.type !== PaymentPlanEnums.FREE;
    if (isPremium) {
      return { limit: RateLimiterFileSizeInMB.PAID };
    }
    return { limit: RateLimiterFileSizeInMB.FREE };
  }

  @GrpcMethod('PdfService', 'GetOrganizationsOfUser')
  async getOrganizationsOfUserV1(data): Promise<{
    organizations: IOrganizationProto[]
  }> {
    const { caller: userId }: { caller: string } = data;
    const user = await this.userService.findUserById(userId);
    if (!user) {
      throw GrpcErrorException.NotFound('User not found', ErrorCode.User.USER_NOT_FOUND);
    }
    const organizations = await this.integrationOrganizationService.getOrganizationsOfUser(userId);
    return {
      organizations,
    };
  }

  @GrpcMethod('PdfService', 'GetDocumentInfo')
  async getDocumentInfoV1(data): Promise<{
    data: {
      document_id: string,
      owner_id: string,
      last_modified_by: string,
      file_name: string,
      size: number,
      service: string,
      file_remote_id: string,
      mime_type: string,
      is_personal: boolean,
      thumbnail: string,
      enable_google_sync: boolean,
      created_at: string,
      last_modify: string,
      last_access: string,
      version: number,
      temporary_remote_id: string,
      from_source: string,
    },
    owner: {
      owner_id: string;
      owner_name: string;
      owner_avater_remoteId
    }
  }> {
    const { document_id: documentId, caller: userId }: { document_id: string, caller: string } = data;
    const user = await this.userService.findUserById(userId);
    if (!user) {
      throw GrpcErrorException.NotFound('User not found', ErrorCode.User.USER_NOT_FOUND);
    }
    const { error, document } = await this.integrationDocumentService.validateDocumentPermission(documentId, userId);
    if (error) {
      throw error;
    }
    const owner = await this.userService.findUserById(document.ownerId);
    return {
      data: convertDocumentFieldToDocumentProto(document),
      owner: {
        owner_id: owner._id,
        owner_name: owner.name,
        owner_avater_remoteId: owner.avatarRemoteId,
      },
    };
  }

  @GrpcMethod('PdfService', 'GetAccessibleDocumentTemplateList')
  @OrganizationMembershipGuard()
  async getAccessibleDocumentTemplateList(
    @ValidatedOrganization()
      { organization, user }: { organization: IOrganization; user: IUser },
  ): Promise<DocumentTemplateListResponseProto> {
    const documentTemplates = await this.organizationService.getAccessibleDocumentTemplates({
      user,
      resource: organization,
    });
    const transformedList = documentTemplates.documents.map(
      (documentTemplate) => ({
        template_id: documentTemplate._id,
        name: documentTemplate.name,
        type: documentTemplate.templateSourceType.toLowerCase(),
        created_at: new Date(documentTemplate.createdAt).getTime(),
        updated_at: new Date(documentTemplate.lastModify).getTime(),
      }) as DocumentTemplateProto,
    );

    return {
      total_count: transformedList.length,
      data: transformedList,
    };
  }

  @GrpcMethod('PdfService', 'GetOrganizationInfo')
  @OrganizationMembershipGuard()
  async getOrganizationInfo(
    @GrpcInput() input: { workspace_id: string; },
    @ValidatedOrganization() { organization, membership }: { organization: IOrganization; membership: IOrganizationMember },
  ): Promise<OrganizationBasicInfoResponseProto> {
    const { workspace_id: organizationId } = input;
    const {
      _id: id, name, ownerId, createdAt,
    } = organization;
    const owner = await this.userService.findUserById(ownerId as string);
    if (!owner) {
      throw GrpcErrorException.NotFound('Owner not found', ErrorCode.Org.OWNER_NOT_FOUND);
    }

    const [totalMembers, totalTeams] = await Promise.all([
      this.organizationService.getTotalMemberInOrg(organizationId, { withPendingMembers: false }),
      this.organizationTeamService.getTotalTeamByOrgId(organizationId),
    ]);

    return {
      id,
      name,
      owner: owner.email,
      user_role: membership.role.toLowerCase(),
      total_members: totalMembers,
      total_spaces: totalTeams,
      created_at: new Date(createdAt).getTime(),
    };
  }

  @GrpcMethod('PdfService', 'GetOrganizationMembers')
  @OrganizationMembershipGuard()
  async getOrganizationMembers(
    input: {
      workspace_id: string;
      user_id: string;
      page?: number;
      limit?: number;
    },
  ): Promise<OrganizationMembersResponseProto> {
    const {
      user_id: userId, workspace_id: organizationId, page = 1, limit = 10,
    } = input;

    const payload = {
      userId,
      orgId: organizationId,
      limit,
      offset: (page - 1) * limit,
      option: {},
      searchKey: '',
    };
    const members = await this.organizationService.getMembers(payload);
    const transformedListMembers = members.edges.map((member) => {
      const { node } = member;
      const { user } = node;
      return {
        id: user._id,
        name: user.name,
        email: user.email,
        role: node.role,
        joined_at: new Date(node.joinDate).getTime(),
        last_active_at: new Date(node.lastActivity).getTime(),
      } as OrganizationMemberProto;
    });

    return {
      limit,
      page,
      total_members: members.totalItem,
      total_count: members.totalRecord,
      members: transformedListMembers,
    };
  }

  @GrpcMethod('PdfService', 'UploadDocument')
  @OrganizationMembershipGuard()
  async uploadDocument(
    @GrpcInput() input: {
      file_remote_id: string;
      file_name: string;
      user_id: string;
      workspace_id: string;
      space_id?: string;
      folder_id?: string;
      upload_location: UploadLocation;
    },
    @ValidatedOrganization() { organization, user }: { organization: IOrganization; user: IUser },
  ): Promise<DocumentBasicInfoResponseProto> {
    const {
      user_id: userId,
      workspace_id: organizationId,
      space_id: teamId,
      folder_id: folderId,
      file_remote_id: fileRemoteId,
      file_name: fileName,
      upload_location: uploadLocation,
    } = input;

    if (uploadLocation === UploadLocation.Space) {
      await this.integrationOrganizationService.validateOrganizationTeamAndMembership({ userId, organizationId, teamId });
    }

    const { error, documentMetadata } = await this.integrationDocumentService.getDocumentMetadata(fileRemoteId);
    if (error) {
      throw error;
    }

    this.integrationDocumentService.validateFileRestrictions({
      user,
      organization,
      documentMetadata,
    });

    if (uploadLocation !== UploadLocation.Personal) {
      await this.integrationOrganizationService.validateDocStackLimit(
        organization,
      );
    }

    const { createdDocument } = await this.integrationDocumentService.handleUploadDocument({
      user,
      organization,
      teamId,
      folderId,
      document: {
        remoteId: fileRemoteId,
        mimeType: documentMetadata.ContentType,
        fileName,
      },
      uploadLocation,
    });

    if (uploadLocation !== UploadLocation.Personal) {
      await this.integrationDocumentService.handleDocStackStrategy({ userId, documentIds: [createdDocument._id] });
    }

    const baseUrl = this.environmentService.getByKey(EnvConstants.BASE_URL);
    return {
      id: createdDocument._id,
      name: createdDocument.name,
      size: createdDocument.size,
      mime_type: createdDocument.mimeType,
      location: {
        type: uploadLocation,
        workspace_id: organizationId,
        space_id: teamId ?? '',
        folder_id: folderId ?? '',
      },
      preview_url: `${baseUrl}/viewer/${createdDocument._id}`,
      created_at: new Date(createdDocument.createdAt).getTime(),
      updated_at: new Date(createdDocument.lastModify).getTime(),
    };
  }

  @GrpcMethod('PdfService', 'GetDocumentTemplateById')
  @DocumentTemplateWorkspaceGuard()
  async getDocumentTemplateById(
    @GrpcInput() input: { template_id: string },
  ): Promise<{template: DocumentTemplateProto}> {
    const { template_id: templateId } = input;
    const documentTemplate = await this.documentTemplateService.findDocumentTemplateById(templateId);

    if (!documentTemplate) {
      throw GrpcErrorException.NotFound(
        'Document template not found or user does not have access',
        ErrorCode.Document.DOCUMENT_NOT_FOUND,
      );
    }

    return {
      template: {
        template_id: documentTemplate._id,
        name: documentTemplate.name,
        type: documentTemplate.templateSourceType.toLowerCase(),
        created_at: new Date(documentTemplate.createdAt).getTime(),
        updated_at: new Date(documentTemplate.lastModify).getTime(),
        remote_id: documentTemplate.remoteId,
      } as DocumentTemplateProto,
    };
  }

  @GrpcMethod('PdfService', 'NotifyXeroApp')
  notifyXeroApp({
    type,
    data,
    user_id: userId,
    workspace_id: workspaceId,
  }: {
    type: string,
    data: { fields: Record<string, unknown> },
    user_id: string,
    workspace_id: string,
  }): void {
    let deserializedData = {};
    try {
      deserializedData = GrpcStructConverter.deserialize(data) as Record<string, unknown>;
    } catch (error) {
      this.loggerService.error({
        context: this.notifyXeroApp.name,
        error,
      });
    }
    this.userService.notifyXeroApp({
      type,
      userId,
      workspaceId,
      data: deserializedData,
    });
  }

  @GrpcMethod('PdfService', 'CreateDocument')
  @OrganizationMembershipGuard()
  async createDocument(
    @GrpcInput() input: {
      file_remote_id: string;
      file_name: string;
      user_id: string;
      workspace_id: string;
      space_id?: string;
      folder_id?: string;
      upload_location: UploadLocation;
    },
    @ValidatedOrganization() { organization, user }: { organization: IOrganization; user: IUser },
  ): Promise<DocumentBasicInfoResponseProto> {
    const {
      user_id: userId,
      workspace_id: organizationId,
      space_id: teamId,
      folder_id: folderId,
      file_remote_id: fileRemoteId,
      file_name: fileName,
      upload_location: uploadLocation,
    } = input;

    if (uploadLocation === UploadLocation.Space) {
      await this.integrationOrganizationService.validateOrganizationTeamAndMembership({ userId, organizationId, teamId });
    }

    const { error, documentMetadata } = await this.integrationDocumentService.getDocumentMetadataTempBucket(fileRemoteId);
    if (error) {
      throw error;
    }

    this.integrationDocumentService.validateFileRestrictions({
      user,
      organization,
      documentMetadata,
    });

    if (uploadLocation !== UploadLocation.Personal) {
      await this.integrationOrganizationService.validateDocStackLimit(
        organization,
      );
    }

    const { createdDocument } = await this.integrationDocumentService.handleUploadDocument({
      user,
      organization,
      teamId,
      folderId,
      document: {
        remoteId: fileRemoteId,
        mimeType: documentMetadata.ContentType,
        fileName,
      },
      uploadLocation,
      bucketEnv: EnvConstants.S3_DOCUMENTS_BUCKET,
      tempBucketEnv: EnvConstants.S3_TEMPORARY_FILES,
    });

    if (uploadLocation !== UploadLocation.Personal) {
      await this.integrationDocumentService.handleDocStackStrategy({ userId, documentIds: [createdDocument._id] });
    }

    const baseUrl = this.environmentService.getByKey(EnvConstants.BASE_URL);
    return {
      id: createdDocument._id,
      name: createdDocument.name,
      size: createdDocument.size,
      mime_type: createdDocument.mimeType,
      location: {
        type: uploadLocation,
        workspace_id: organizationId,
        space_id: teamId ?? '',
        folder_id: folderId ?? '',
      },
      preview_url: `${baseUrl}/viewer/${createdDocument._id}`,
      created_at: new Date(createdDocument.createdAt).getTime(),
      updated_at: new Date(createdDocument.lastModify).getTime(),
    };
  }
}
