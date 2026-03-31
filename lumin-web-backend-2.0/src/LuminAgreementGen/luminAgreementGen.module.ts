import { Module } from '@nestjs/common';
import { ClientsModule } from '@nestjs/microservices';

import { EnvironmentModule } from 'Environment/environment.module';
import { getAgreementGenClientOptions } from 'GrpcClient/agreement-gen-client.options';
import { GrpcPackage } from 'GrpcClient/grpc.interface';

import { LuminAgreementGenService } from './luminAgreementGen.service';

@Module({
  imports: [
    EnvironmentModule,
    ClientsModule.registerAsync([getAgreementGenClientOptions(GrpcPackage.ORGANIZATION_AG)]),
  ],
  providers: [LuminAgreementGenService],
  exports: [LuminAgreementGenService],
})
export class LuminAgreementGenModule {}
