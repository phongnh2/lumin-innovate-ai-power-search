import { ClientOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';

export const grpcClientOptions: ClientOptions = {
  transport: Transport.GRPC,
  options: {
    url: '0.0.0.0:4040',
    package: [
      'worker',
      'auth',
      'kratos',
      'user',
      'lumin.pdf.v1',
      'docsum',
      'document',
      's3',
      'chatbot',
      'organization',
      'notification',
      'webchatbot',
      'common',
    ],
    protoPath: [
      join(process.cwd(), 'lumin-proto/worker/worker.proto'),
      join(process.cwd(), 'lumin-proto/auth/auth.proto'),
      join(process.cwd(), 'lumin-proto/auth/kratos.proto'),
      join(process.cwd(), 'lumin-proto/auth/user.proto'),
      join(process.cwd(), 'lumin-proto/integration/pdf.proto'),
      join(process.cwd(), 'lumin-proto/ai/docsum/docsum.proto'),
      join(process.cwd(), 'lumin-proto/document/document.proto'),
      join(process.cwd(), 'lumin-proto/ai/s3/s3.proto'),
      join(process.cwd(), 'lumin-proto/ai/chatbot/chatbot.proto'),
      join(process.cwd(), 'lumin-proto/organization/organization.proto'),
      join(process.cwd(), 'lumin-proto/notification/notification.proto'),
      join(process.cwd(), 'lumin-proto/common/common.proto'),
      join(process.cwd(), 'lumin-proto/ai/webchatbot/document.proto'),
    ],
    loader: {
      keepCase: true,
      objects: true,
      includeDirs: [
        join(process.cwd(), 'lumin-proto'),
        join(process.cwd(), 'lumin-proto/auth'),
      ],
    },
  },
};
