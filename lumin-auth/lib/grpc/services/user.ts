/* eslint-disable max-classes-per-file */
import * as grpc from '@grpc/grpc-js';

import { promisify } from 'util';

import { environment } from '@/configs/environment';
import { loader } from '@/lib/grpc/grpcPkgLoader';
import { EmptyOutput } from '@/proto/auth/google/protobuf/Empty';
import { ProtoGrpcType } from '@/proto/auth/user';
import { AddSyncOidcAvatarTaskRequest } from '@/proto/auth/user/AddSyncOidcAvatarTaskRequest';
import { CurrentUserResponse } from '@/proto/auth/user/CurrentUserResponse';
import { DeleteAccountResponse } from '@/proto/auth/user/DeleteAccountResponse';
import { GetUserByEmailRequest } from '@/proto/auth/user/GetUserByEmailRequest';
import { GetUserByEmailResponse } from '@/proto/auth/user/GetUserByEmailResponse';
import { IdentityRequest } from '@/proto/auth/user/IdentityRequest';
import { TeamAndOrganizationResponse } from '@/proto/auth/user/TeamAndOrganizationResponse';
import { UpdateProfileAvatarRequest } from '@/proto/auth/user/UpdateProfileAvatarRequest';
import { UpdateUserPropertiesRequest } from '@/proto/auth/user/UpdateUserPropertiesRequest';
import { VerifyRecaptchaRequest } from '@/proto/auth/user/VerifyRecaptchaRequest';
import { VerifyRecaptchaResponse } from '@/proto/auth/user/VerifyRecaptchaResponse';

const { user } = loader.load<ProtoGrpcType>('auth/user.proto');
const { UserService: UserServiceBase } = user;

class UserServiceDeliver extends UserServiceBase {}

export class UserService {
  private service: UserServiceDeliver;

  constructor() {
    this.service = new UserServiceDeliver(environment.internal.host.grpcServerUrl, grpc.credentials.createInsecure());
  }

  async updateProfileAvatar(data: UpdateProfileAvatarRequest): Promise<EmptyOutput | undefined> {
    const handler = promisify(this.service.UpdateProfileAvatar).bind(this.service);
    return handler(data);
  }

  async removeProfileAvatar(data: IdentityRequest): Promise<EmptyOutput | undefined> {
    const handler = promisify(this.service.RemoveProfileAvatar).bind(this.service);
    return handler(data);
  }

  async getCurrentUser(data: IdentityRequest): Promise<CurrentUserResponse | undefined> {
    const handler = promisify(this.service.GetCurrentUser).bind(this.service);
    return handler(data);
  }

  async deleteAccount(data: IdentityRequest): Promise<DeleteAccountResponse | undefined> {
    const handler = promisify(this.service.DeleteAccount).bind(this.service);
    return handler(data);
  }

  async getTeamAndOrganizationOwner(data: IdentityRequest): Promise<TeamAndOrganizationResponse | undefined> {
    const handler = promisify(this.service.GetTeamAndOrganizationOwner).bind(this.service);
    return handler(data);
  }

  /**
   * @deprecated
   */
  async reactivateAccount(data: IdentityRequest): Promise<CurrentUserResponse | undefined> {
    const handler = promisify(this.service.ReactivateAccount).bind(this.service);
    return handler(data);
  }

  async getUserByEmail(data: GetUserByEmailRequest): Promise<GetUserByEmailResponse | undefined> {
    const handler = promisify(this.service.GetUserByEmail).bind(this.service);
    return handler(data);
  }

  async verifyRecaptcha(data: VerifyRecaptchaRequest): Promise<VerifyRecaptchaResponse | undefined> {
    const handler = promisify(this.service.VerifyRecaptcha).bind(this.service);
    return handler(data);
  }

  async updateUserProperties(data: UpdateUserPropertiesRequest): Promise<EmptyOutput | undefined> {
    const handler = promisify(this.service.UpdateUserProperties).bind(this.service);
    return handler(data);
  }

  async addSyncOidcAvatarTask(data: AddSyncOidcAvatarTaskRequest): Promise<EmptyOutput | undefined> {
    const handler = promisify(this.service.addSyncOidcAvatarTask).bind(this.service);
    return handler(data);
  }
}

export const userService = new UserService();
