import { Transport } from '@nestjs/microservices';
import { join } from 'path';

import { EnvConstants } from 'Common/constants/EnvConstants';

import { EnvironmentService } from 'Environment/environment.service';

import { ClientsModuleAsyncOpts, GrpcPackage } from './grpc.interface';

// you can only use ClientsModule.registerAsync() if using this function
export const getContractClientOptions = (
  name: GrpcPackage,
): ClientsModuleAsyncOpts => ({
  name: `${name}_package`,
  useFactory: (environmentService: EnvironmentService) => {
    const host = environmentService.getByKey(EnvConstants.CONTRACT_GRPC_HOST);
    const port = environmentService.getByKey(EnvConstants.CONTRACT_GRPC_PORT);
    return {
      transport: Transport.GRPC,
      options: {
        url: `${host}:${port}`,
        package: [GrpcPackage.CONTRACT_AUTH, GrpcPackage.NOTIFICATION, GrpcPackage.ORGANIZATION, GrpcPackage.USER],
        protoPath: [
          'contract/auth.proto',
          'notification/notification.proto',
          'organization/organization.proto',
          'auth/user.proto',
        ],
        loader: {
          arrays: true,
          keepCase: true,
          includeDirs: [
            join(process.cwd(), 'lumin-proto'),
            join(process.cwd(), 'lumin-proto/auth'),
          ],
        },
      },
    };
  },
  inject: [EnvironmentService],
});
