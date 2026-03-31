import { RabbitSubscribe, defaultNackErrorHandler } from '@golevelup/nestjs-rabbitmq';
import {
  Controller,
} from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';

import { ErrorCode } from 'Common/constants/ErrorCode';
import { GrpcErrorException } from 'Common/errors/GrpcErrorException';

import { DocumentService } from 'Document/document.service';
import { LoggerService } from 'Logger/Logger.service';
import { RedisService } from 'Microservices/redis/redis.service';
import { OrganizationService } from 'Organization/organization.service';
import { EXCHANGE_KEYS, QUEUES, ROUTING_KEY } from 'RabbitMQ/RabbitMQ.constant';
import { UserService } from 'User/user.service';

import { BulkInviteMembersFromCsvInput } from './dtos/bulkInviteMembersFromCsv.dto';
import { IOrganizationProto, IOrganizationWithRoleProto, UpdateContractStackMessage } from './interfaces/organization.interface';
import { OrganizationUtils } from './utils/organization.utils';

@Controller('/organization')
export class OrganizationController {
  constructor(
      private readonly organizationService: OrganizationService,
      private readonly redisService: RedisService,
      private readonly userService: UserService,
      private readonly documentService: DocumentService,
      private readonly loggerService: LoggerService,
  ) { }

  @GrpcMethod('WorkerService', 'RemoveDeletedOrganizations')
  async removeDeletedOrganizations(data): Promise<any> {
    const { orgIds } = data;
    console.log('removeDeletedOrganizations ~ orgIds:', orgIds);
    if (orgIds) {
      // eslint-disable-next-line no-restricted-syntax
      for (const orgId of orgIds) {
        console.log('removeDeletedOrganizations ~ orgId:', orgId);
        // eslint-disable-next-line no-await-in-loop
        await this.organizationService.deleteOrganization({ orgId, addToBlacklist: true });
        // eslint-disable-next-line no-await-in-loop, @typescript-eslint/no-unsafe-argument
        await this.redisService.removeOrgsToDelete([orgId]);
      }
    }
  }

  @GrpcMethod('WorkerService', 'BulkInviteMembersFromCsv')
  async bulkInviteMembersFromCsv(input: BulkInviteMembersFromCsvInput): Promise<any> {
    await this.organizationService.bulkInviteMembersFromCsv(input);
  }

  @GrpcMethod('OrganizationService', 'GetDestinationWorkspaceToMigrate')
  async getDestinationWorkspaceToMigrate(input): Promise<{
    organization: Partial<IOrganizationProto>;
  }> {
    const { userId }: {
      userId: string;
    } = input;
    const destinationWorkspace = await this.organizationService.getDestinationWorkspaceToMigrate(userId);
    return {
      organization: {
        organization_id: destinationWorkspace._id,
        name: destinationWorkspace.name,
        created_at: destinationWorkspace.createdAt.getTime(),
        avatar_remote_id: destinationWorkspace.avatarRemoteId,
        url: destinationWorkspace.url,
      },
    };
  }

  @GrpcMethod('OrganizationService', 'GetOrganizationsByUserId')
  async getOrganizationsByUserId(input): Promise<{
    organizations: Partial<IOrganizationWithRoleProto>[];
  }> {
    const { userId, product }: {
      userId: string;
      product: string;
    } = input;
    const memberships = await this.organizationService.getMembersByUserId(userId);
    if (memberships.length === 0) {
      return {
        organizations: [],
      };
    }
    const orgIds = new Set(memberships.map((membership) => membership.orgId));
    const organizations = await this.organizationService.findOrganization({ _id: { $in: Array.from(orgIds) } }, null, { sort: { createdAt: -1 } });
    organizations.forEach((organization) => {
      const paymentByProduct = OrganizationUtils.interceptPaymentByProduct(organization, product, userId);
      organization.payment = {
        ...organization.payment,
        ...paymentByProduct,
      };
    });
    return {
      organizations: organizations.map((organization) => ({
        ...OrganizationUtils.convertToOrganizationProto(organization),
        user_role: memberships.find(
          (membership) => membership.orgId.toHexString() === organization._id,
        )?.role,
      })),
    };
  }

  @GrpcMethod('OrganizationService', 'GetOrganizationById')
  async getOrganizationById(input): Promise<{
    organization: Partial<IOrganizationProto>;
  }> {
    const { organizationId }: {
      organizationId: string;
    } = input;
    const organization = await this.organizationService.getOrgById(organizationId);
    if (!organization) {
      throw GrpcErrorException.NotFound('Organization not found', ErrorCode.Org.ORGANIZATION_NOT_FOUND);
    }
    return {
      organization: OrganizationUtils.convertToOrganizationProto(organization),
    };
  }

  @GrpcMethod('OrganizationService', 'GetOrganizationByUrl')
  async getOrganizationByUrl(input): Promise<{
    organization: Partial<IOrganizationWithRoleProto>;
  }> {
    const { url, userId, product }: {
      url: string;
      userId: string;
      product: string;
    } = input;
    const organization = await this.organizationService.getOrgByUrl(url);
    if (!organization) {
      throw GrpcErrorException.NotFound('Organization not found', ErrorCode.Org.ORGANIZATION_NOT_FOUND);
    }
    const membership = await this.organizationService.getMembershipByOrgAndUser(organization._id, userId);
    if (!membership) {
      throw GrpcErrorException.InvalidArgument('Membership not found', ErrorCode.Org.MEMBERSHIP_NOT_FOUND);
    }
    this.userService.updateLastAccessedOrg(userId, organization._id);
    const paymentByProduct = OrganizationUtils.interceptPaymentByProduct(organization, product, userId);
    organization.payment = {
      ...organization.payment,
      ...paymentByProduct,
    };
    return {
      organization: {
        ...OrganizationUtils.convertToOrganizationProto(organization),
        user_role: membership.role,
      },
    };
  }

  @GrpcMethod('OrganizationService', 'GetOrganizationByIdAndUserId')
  async getOrganizationByIdAndUserId(input): Promise<{
    organization: Partial<IOrganizationWithRoleProto>;
  }> {
    const { organizationId, userId, product }: {
      organizationId: string;
      userId: string;
      product: string;
    } = input;
    const [organization, membership] = await Promise.all([
      this.organizationService.getOrgById(organizationId),
      this.organizationService.getMembershipByOrgAndUser(organizationId, userId),
    ]);
    if (!organization) {
      throw GrpcErrorException.NotFound('Organization not found', ErrorCode.Org.ORGANIZATION_NOT_FOUND);
    }
    if (!membership) {
      throw GrpcErrorException.NotFound('Membership not found', ErrorCode.Org.MEMBERSHIP_NOT_FOUND);
    }
    const paymentByProduct = OrganizationUtils.interceptPaymentByProduct(organization, product, userId);
    organization.payment = {
      ...organization.payment,
      ...paymentByProduct,
    };
    return {
      organization: {
        ...OrganizationUtils.convertToOrganizationProto(organization),
        user_role: membership.role,
      },
    };
  }

  @GrpcMethod('OrganizationService', 'GetDestinationWorkspaceToUpload')
  async getDestinationWorkspaceToUpload(input): Promise<{
    organization: Partial<IOrganizationProto>;
  }> {
    const { userId, product }: {
      userId: string;
      product: string;
    } = input;
    const user = await this.userService.findUserById(userId);
    const organization = await this.documentService.getDestinationWorkspace(user, { shouldCreateOrg: true, byPassPremiumUser: false });
    const paymentByProduct = OrganizationUtils.interceptPaymentByProduct(organization, product, userId);
    organization.payment = {
      ...organization.payment,
      ...paymentByProduct,
    };
    return {
      organization: {
        ...OrganizationUtils.convertToOrganizationProto(organization),
        url: organization.url,
      },
    };
  }

  @GrpcMethod('WorkerService', 'MigrateNewTermsOfUseForKeyCustomers')
  migrateNewTermsOfUseForKeyCustomers(data: { orgIds: string[] }): void {
    this.organizationService.migrateNewTermsOfUseForKeyCustomers(data.orgIds);
  }

  @RabbitSubscribe({
    exchange: EXCHANGE_KEYS.LUMIN_SIGN_UPLOADED_AGREEMENT,
    routingKey: ROUTING_KEY.LUMIN_SIGN_UPLOADED_AGREEMENT_SYNC_DOC_STACKS,
    queue: QUEUES.LUMIN_SIGN_UPLOADED_AGREEMENT,
    errorHandler: defaultNackErrorHandler,
  })
  updateContractStack(message: UpdateContractStackMessage) {
    const {
      orgId,
      signDocStackStorage,
    } = message;
    this.organizationService.publishSignUploadAgreement({ signDocStackStorage, orgId });
  }
}
