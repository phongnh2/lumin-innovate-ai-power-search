/* eslint-disable max-classes-per-file */
import * as grpc from '@grpc/grpc-js';

import { promisify } from 'util';

import { environment } from '@/configs/environment';
import { loader } from '@/lib/grpc/grpcPkgLoader';
import { ProtoGrpcType } from '@/proto/auth/auth';
import { AttempResendVerificationRequest } from '@/proto/auth/auth/AttempResendVerificationRequest';
import { AttempResendVerificationResponse } from '@/proto/auth/auth/AttempResendVerificationResponse';
import { GetUserByEmailRequest } from '@/proto/auth/auth/GetUserByEmailRequest';
import { GetUserByIdRequest } from '@/proto/auth/auth/GetUserByIdRequest';
import { UpdateUserPropertiesByIdentityIdRequest } from '@/proto/auth/auth/UpdateUserPropertiesByIdentityIdRequest';
import { UpdateUserPropertiesByIdRequest } from '@/proto/auth/auth/UpdateUserPropertiesByIdRequest';
import { VerifyTokenRequest } from '@/proto/auth/auth/VerifyTokenRequest';
import { VerifyTokenResponse } from '@/proto/auth/auth/VerifyTokenResponse';
import { UserOutput } from '@/proto/auth/common/User';

const { auth } = loader.load<ProtoGrpcType>('auth/auth.proto');
const { AuthService: AuthServiceBase } = auth;

class AuthServiceDeliver extends AuthServiceBase {}

export class AuthService {
  private service: AuthServiceDeliver;

  constructor() {
    this.service = new AuthServiceDeliver(environment.internal.host.grpcServerUrl, grpc.credentials.createInsecure());
  }

  async getUserByEmail(data: GetUserByEmailRequest): Promise<UserOutput | undefined> {
    const handler = promisify(this.service.getUserByEmail).bind(this.service);
    return handler(data);
  }

  async getUserById(data: GetUserByIdRequest): Promise<UserOutput | undefined> {
    const handler = promisify(this.service.GetUserById).bind(this.service);
    return handler(data);
  }

  async updateUserPropertiesById(data: UpdateUserPropertiesByIdRequest): Promise<UserOutput | undefined> {
    const handler = promisify(this.service.UpdateUserPropertiesById).bind(this.service);
    return handler(data);
  }

  async verifyLuminToken(data: VerifyTokenRequest): Promise<VerifyTokenResponse | undefined> {
    const handler = promisify(this.service.VerifyToken).bind(this.service);
    return handler(data);
  }

  async setAttempResendVerification(data: AttempResendVerificationRequest): Promise<AttempResendVerificationResponse | undefined> {
    const handler = promisify(this.service.SetAttempResendVerification).bind(this.service);
    return handler(data);
  }

  async checkAttempResendVerification(data: AttempResendVerificationRequest): Promise<AttempResendVerificationResponse | undefined> {
    const handler = promisify(this.service.CheckAttempResendVerification).bind(this.service);
    return handler(data);
  }

  async updateUserPropertiesByIdentityId(data: UpdateUserPropertiesByIdentityIdRequest): Promise<UserOutput | undefined> {
    const handler = promisify(this.service.updateUserPropertiesByIdentityId).bind(this.service);
    return handler(data);
  }
}

export const authService = new AuthService();
