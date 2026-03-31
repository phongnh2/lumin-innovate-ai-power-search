import { Module } from '@nestjs/common';
import {
  ClientsModule,
  GrpcOptions,
  Transport,
} from '@nestjs/microservices';
import { join } from 'path';

import { EnvConstants } from 'Common/constants/EnvConstants';

import { EnvironmentModule } from 'Environment/environment.module';
import { EnvironmentService } from 'Environment/environment.service';

const getAIClientOptions = (host, port) => ({
  transport: Transport.GRPC,
  options: {
    url: `${host}:${port}`,
    package: ['docsum'],
    protoPath: [join(process.cwd(), 'lumin-proto/ai/docsum/docsum.proto')],
    loader: {
      keepCase: true,
    },
  },
} as GrpcOptions);

const getWebChatbotClientOptions = (host: string, port: string) => ({
  transport: Transport.GRPC,
  options: {
    url: `${host}:${port}`,
    package: ['webchatbot'],
    protoPath: [join(process.cwd(), 'lumin-proto/ai/webchatbot/webchatbot.proto')],
    loader: {
      keepCase: true,
      includeDirs: [
        join(process.cwd(), 'lumin-proto'),
        join(process.cwd(), 'lumin-proto/auth'),
      ],
    },
  },
} as GrpcOptions);

@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: 'AI_CLIENT',
        imports: [EnvironmentModule],
        useFactory: (environmentService: EnvironmentService) => {
          const host = environmentService.getByKey(EnvConstants.DOC_SUM_GRPC_HOST);
          const port = environmentService.getByKey(EnvConstants.DOC_SUM_GRPC_PORT);
          return getAIClientOptions(host, port);
        },
        inject: [EnvironmentService],
      },
      {
        name: 'WEBCHATBOT_CLIENT',
        imports: [EnvironmentModule],
        useFactory: (environmentService: EnvironmentService) => {
          const host = environmentService.getByKey(EnvConstants.WEB_RAG_GRPC_HOST);
          const port = environmentService.getByKey(EnvConstants.WEB_RAG_GRPC_PORT);
          return getWebChatbotClientOptions(host, port);
        },
        inject: [EnvironmentService],
      },
    ]),
  ],
  providers: [],
  // Re-export the ClientsModule so we wont have to register same options in other module
  exports: [ClientsModule],
})
export class GrpcClientModule {}
