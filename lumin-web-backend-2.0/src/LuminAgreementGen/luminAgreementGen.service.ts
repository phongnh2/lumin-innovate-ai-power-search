import { Injectable, OnModuleInit } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

import { EnvConstants } from 'Common/constants/EnvConstants';

import { EnvironmentService } from 'Environment/environment.service';
import { GrpcClient } from 'GrpcClient/grpc-client.decorator';
import { GrpcPackage } from 'GrpcClient/grpc.interface';

import { OrganizationService, TransferAgreementGenDocumentsToAnotherOrgRequest } from './interface/organizationService.interface';

@Injectable()
export class LuminAgreementGenService implements OnModuleInit {
  private organizationService: OrganizationService;

  private isAgreementGenIntegrationEnabled: boolean;

  constructor(
    @GrpcClient(GrpcPackage.ORGANIZATION_AG)
    private readonly organizationClient: ClientGrpc,
    private readonly environmentService: EnvironmentService,
  ) { }

  onModuleInit() {
    this.isAgreementGenIntegrationEnabled = this.environmentService.isDevelopment
      ? Boolean(this.environmentService.getByKey(EnvConstants.ENABLE_AGREEMENT_GEN_INTEGRATION))
      : true;
    this.organizationService = this.organizationClient.getService<OrganizationService>('OrganizationService');
  }

  async transferAgreementGenDocumentsToAnotherOrg(req: TransferAgreementGenDocumentsToAnotherOrgRequest): Promise<{
    existAgreementGenDocuments: boolean;
  }> {
    if (!this.isAgreementGenIntegrationEnabled) {
      return { existAgreementGenDocuments: false };
    }
    return firstValueFrom(this.organizationService.transferAgreementGenDocumentsToAnotherOrg(req));
  }
}
