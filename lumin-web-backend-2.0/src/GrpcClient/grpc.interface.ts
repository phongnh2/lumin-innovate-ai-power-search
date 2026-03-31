import { ClientsProviderAsyncOptions } from '@nestjs/microservices';

export enum GrpcPackage {
  CONTRACT_AUTH = 'contract.auth',
  NOTIFICATION = 'notification',
  ORGANIZATION = 'organization',
  ORGANIZATION_AG = 'organization_ag',
  USER = 'user',
}

export type ClientsModuleAsyncOpts = ClientsProviderAsyncOptions & {
  name: `${GrpcPackage}_package`
  useFactory: ClientsProviderAsyncOptions['useFactory']
}
