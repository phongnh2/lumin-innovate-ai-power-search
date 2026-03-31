import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';

import path from 'path';

export class GrpcPackageLoader {
  // eslint-disable-next-line class-methods-use-this
  load<ProtoGrpcType>(
    protoPath: string,
    {
      withProtoDir = false
    }: {
      withProtoDir?: boolean;
    } = {}
  ): ProtoGrpcType {
    const p = path.join(process.cwd(), 'lumin-proto', protoPath);
    const packageDefinition = protoLoader.loadSync(p, {
      keepCase: true,
      defaults: true,
      oneofs: true,
      ...(withProtoDir && {
        includeDirs: [path.join(process.cwd(), 'lumin-proto')]
      })
    });

    return grpc.loadPackageDefinition(packageDefinition) as unknown as ProtoGrpcType;
  }
}

export const loader = new GrpcPackageLoader();
