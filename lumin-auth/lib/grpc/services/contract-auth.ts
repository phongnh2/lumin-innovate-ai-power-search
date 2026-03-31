/* eslint-disable max-classes-per-file */
import * as grpc from '@grpc/grpc-js';

import { promisify } from 'util';

import { environment } from '@/configs/environment';
import { loader } from '@/lib/grpc/grpcPkgLoader';
import { ProtoGrpcType } from '@/proto/contract/auth';
import { ForceLogoutRequest } from '@/proto/contract/contract/auth/ForceLogoutRequest';
import { ReactivateAccountRequest } from '@/proto/contract/contract/auth/ReactivateAccountRequest';
import { SignOutRequest } from '@/proto/contract/contract/auth/SignOutRequest';
import { SyncUpAccountSettingRequest } from '@/proto/contract/contract/auth/SyncUpAccountSettingRequest';
import { EmptyOutput } from '@/proto/contract/google/protobuf/Empty';

const { contract } = loader.load<ProtoGrpcType>('contract/auth.proto');
const { AuthService: AuthServiceBase } = contract.auth;

class ContractAuthServiceDeliver extends AuthServiceBase {}

export class ContractAuthService {
  private service: ContractAuthServiceDeliver;

  constructor() {
    this.service = new ContractAuthServiceDeliver(environment.contractEnv.host.grpcServerUrl, grpc.credentials.createInsecure());
  }

  async handleSignOut(data: SignOutRequest): Promise<EmptyOutput | undefined> {
    const handler = promisify(this.service.SignOut).bind(this.service);
    return handler(data);
  }

  async handleForceLogout(data: ForceLogoutRequest): Promise<EmptyOutput | undefined> {
    const handler = promisify(this.service.ForceLogout).bind(this.service);
    return handler(data);
  }

  /**
   * @deprecated
   */
  async reactivateAccount(data: ReactivateAccountRequest): Promise<EmptyOutput | undefined> {
    const handler = promisify(this.service.ReactivateAccount).bind(this.service);
    return handler(data);
  }

  async syncUpAccountSetting(data: SyncUpAccountSettingRequest): Promise<EmptyOutput | undefined> {
    const handler = promisify(this.service.SyncUpAccountSetting).bind(this.service);
    return handler(data);
  }
}

export const contractAuthService = new ContractAuthService();
