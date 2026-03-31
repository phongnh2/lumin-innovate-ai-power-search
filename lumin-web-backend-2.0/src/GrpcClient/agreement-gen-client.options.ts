import { Transport } from '@nestjs/microservices';

import { EnvConstants } from 'Common/constants/EnvConstants';

import { EnvironmentService } from 'Environment/environment.service';

import { ClientsModuleAsyncOpts, GrpcPackage } from './grpc.interface';

// you can only use ClientsModule.registerAsync() if using this function
export const getAgreementGenClientOptions = (
  name: GrpcPackage,
): ClientsModuleAsyncOpts => ({
  name: `${name}_package`,
  useFactory: (environmentService: EnvironmentService) => {
    const host = environmentService.getByKey(EnvConstants.AGREEMENT_GEN_GRPC_HOST);
    const port = environmentService.getByKey(EnvConstants.AGREEMENT_GEN_GRPC_PORT);
    return {
      transport: Transport.GRPC,
      options: {
        url: `${host}:${port}`,
        package: [GrpcPackage.ORGANIZATION],
        protoPath: [
          'organization/organization.proto',
        ],
        loader: {
          arrays: true,
          keepCase: true,
          includeDirs: ['lumin-proto'],
        },
      },
    };
  },
  inject: [EnvironmentService],
});
