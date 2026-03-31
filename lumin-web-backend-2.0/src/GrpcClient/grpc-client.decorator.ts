import { Inject } from '@nestjs/common';

import { GrpcPackage } from './grpc.interface';

export function GrpcClient(name: GrpcPackage) {
  return Inject(`${name}_package`);
}
