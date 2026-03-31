import { Injectable, OnModuleInit } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

import { EnvConstants } from 'Common/constants/EnvConstants';
import { NotificationType, ORGANIZATION_ACTION_TYPES_FOR_SIGN_PRODUCT } from 'Common/constants/NotificationConstants';

import { EnvironmentService } from 'Environment/environment.service';
import { GrpcClient } from 'GrpcClient/grpc-client.decorator';
import { GrpcPackage } from 'GrpcClient/grpc.interface';
import { NotificationUtils } from 'Notication/utils/notification.utils';
import { IPaymentProto } from 'Payment/interfaces/payment.interface';

import {
  ChangeUserEmailRequest,
  DeleteAccountRequest,
  GetSignUserPaymentRequest,
  GetSignUserPaymentResponse,
  LuminContractAuthService,
  LuminContractNotificationService,
  LuminContractUserService,
  PublishNewNotificationRequest,
  SyncUpAccountSettingRequest,
} from './interface/luminContract.interface';
import {
  DeleteDataInWorkspaceRequest,
  GetContractStackInfoRequest,
  GetContractStackInfoResponse,
  OrganizationService,
  PublishUpdateOrganizationRequest,
  TransferAgreementsToAnotherOrgRequest,
  UpdateSubscriptionOfMemberInWorkspaceRequest,
} from './interface/organizationService.interface';

@Injectable()
export class LuminContractService implements OnModuleInit {
  private contractAuthService: LuminContractAuthService;

  private contractNotificationService: LuminContractNotificationService;

  private organizationService: OrganizationService;

  private contractUserService: LuminContractUserService;

  private isContractIntegrationEnabled: boolean;

  constructor(
    @GrpcClient(GrpcPackage.CONTRACT_AUTH)
    private readonly contractAuthClient: ClientGrpc,
    @GrpcClient(GrpcPackage.NOTIFICATION)
    private readonly contractNotificationClient: ClientGrpc,
    @GrpcClient(GrpcPackage.ORGANIZATION)
    private readonly organizationClient: ClientGrpc,
    private readonly environmentService: EnvironmentService,
    @GrpcClient(GrpcPackage.USER)
    private readonly userClient: ClientGrpc,
  ) { }

  onModuleInit() {
    this.isContractIntegrationEnabled = this.environmentService.isDevelopment
      ? Boolean(this.environmentService.getByKey(EnvConstants.ENABLE_CONTRACT_INTEGRATION))
      : true;
    this.contractAuthService = this.contractAuthClient.getService<LuminContractAuthService>('AuthService');
    this.contractNotificationService = this.contractNotificationClient.getService<LuminContractNotificationService>('NotificationService');
    this.organizationService = this.organizationClient.getService<OrganizationService>('OrganizationService');
    this.contractUserService = this.userClient.getService<LuminContractUserService>('UserService');
  }

  async syncUpAccountSetting(req: SyncUpAccountSettingRequest): Promise<void> {
    if (!this.isContractIntegrationEnabled) {
      return;
    }
    await firstValueFrom(this.contractAuthService.syncUpAccountSetting(req));
  }

  async deleteDataInWorkspace(req: DeleteDataInWorkspaceRequest): Promise<void> {
    if (!this.isContractIntegrationEnabled) {
      return;
    }
    await firstValueFrom(this.organizationService.deleteDataInWorkspace(req));
  }

  async deleteAccount(req: DeleteAccountRequest): Promise<void> {
    if (!this.isContractIntegrationEnabled) {
      return;
    }
    await firstValueFrom(this.contractAuthService.deleteAccount(req));
  }

  async publishNewNotification(req: PublishNewNotificationRequest): Promise<void> {
    // only send certain notifications for sign product
    if (!this.isContractIntegrationEnabled) {
      return;
    }
    if (
      !(ORGANIZATION_ACTION_TYPES_FOR_SIGN_PRODUCT.includes(req.notification.actionType)
        || req.notification.notificationType === NotificationType.CONTRACT)
    ) {
      return;
    }
    const transformedReq = {
      ...req,
      notification: NotificationUtils.transformNotificationForGrpc(req.notification),
    };
    await firstValueFrom(this.contractNotificationService.publishNewNotification(transformedReq));
  }

  async transferAgreementsToAnotherOrg(req: TransferAgreementsToAnotherOrgRequest): Promise<{
    existAgreement: boolean;
  }> {
    if (!this.isContractIntegrationEnabled) {
      return { existAgreement: false };
    }
    return firstValueFrom(this.organizationService.transferAgreementsToAnotherOrg(req));
  }

  async publishUpdateOrganization(req: PublishUpdateOrganizationRequest): Promise<void> {
    if (!this.isContractIntegrationEnabled) {
      return;
    }
    await firstValueFrom(this.organizationService.publishUpdateOrganization(req));
  }

  async changeUserEmail(req: ChangeUserEmailRequest): Promise<void> {
    if (!this.isContractIntegrationEnabled) {
      return;
    }
    await firstValueFrom(this.contractUserService.changeUserEmail(req));
  }

  async getSignUserPayment(req: GetSignUserPaymentRequest): Promise<GetSignUserPaymentResponse> {
    if (!this.isContractIntegrationEnabled) {
      return { payment: null };
    }
    return firstValueFrom(this.contractUserService.getSignUserPayment(req));
  }

  async updateSubscriptionOfMemberInWorkspace(req: UpdateSubscriptionOfMemberInWorkspaceRequest): Promise<{
    proUserIds: string[];
    ownerPayment: IPaymentProto;
  }> {
    if (!this.isContractIntegrationEnabled) {
      return {
        proUserIds: [],
        ownerPayment: null,
      };
    }
    return firstValueFrom(this.organizationService.updateSubscriptionOfMemberInWorkspace(req));
  }

  async getContractStackInfo(req: GetContractStackInfoRequest): Promise<GetContractStackInfoResponse> {
    // If isContractIntegrationEnabled = false, return mock data for local testing.
    if (!this.isContractIntegrationEnabled) {
      return {
        data: {
          isOverDocStack: false,
          totalUsed: 1,
          totalStack: 5,
        },
      };
    }
    return firstValueFrom(this.organizationService.getContractStackInfo(req));
  }
}
