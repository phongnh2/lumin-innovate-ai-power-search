import { Module } from '@nestjs/common';
import { ClientsModule } from '@nestjs/microservices';

import { EnvironmentModule } from 'Environment/environment.module';
import { getContractClientOptions } from 'GrpcClient/contract-client.options';
import { GrpcPackage } from 'GrpcClient/grpc.interface';

import { LuminContractService } from './luminContract.service';

@Module({
  imports: [
    EnvironmentModule,
    ClientsModule.registerAsync([getContractClientOptions(GrpcPackage.CONTRACT_AUTH)]),
    ClientsModule.registerAsync([getContractClientOptions(GrpcPackage.NOTIFICATION)]),
    ClientsModule.registerAsync([getContractClientOptions(GrpcPackage.ORGANIZATION)]),
    ClientsModule.registerAsync([getContractClientOptions(GrpcPackage.USER)]),
  ],
  providers: [LuminContractService],
  exports: [LuminContractService],
})
export class LuminContractModule {}
