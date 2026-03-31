/* eslint-disable max-classes-per-file */
import * as grpc from '@grpc/grpc-js';

import { promisify } from 'util';

import { environment } from '@/configs/environment';
import { loader } from '@/lib/grpc/grpcPkgLoader';
import { EmptyOutput } from '@/proto/auth/google/protobuf/Empty';
import { ProtoGrpcType } from '@/proto/auth/kratos';
import { AfterSignUpInvitationRequest } from '@/proto/auth/kratos/AfterSignUpInvitationRequest';
import { ForceLogoutRequest } from '@/proto/auth/kratos/ForceLogoutRequest';
import { InvitationTokenRequest } from '@/proto/auth/kratos/InvitationTokenRequest';
import { InvitationTokenResponseOutput } from '@/proto/auth/kratos/InvitationTokenResponse';
import { KratosCallbackRequestOutput } from '@/proto/auth/kratos/KratosCallbackRequest';
import { LinkSamlLoginServiceRequest } from '@/proto/auth/kratos/LinkSamlLoginServiceRequest';
import { RegisterAccountRequest } from '@/proto/auth/kratos/RegisterAccountRequest';
import { RegisterAccountResponseOutput } from '@/proto/auth/kratos/RegisterAccountResponse';
import { SignOutRequest } from '@/proto/auth/kratos/SignOutRequest';
import { VerifyFirstSignInWithOryRequest } from '@/proto/auth/kratos/VerifyFirstSignInWithOryRequest';
import { VerifyFirstSignInWithOryResponseOutput } from '@/proto/auth/kratos/VerifyFirstSignInWithOryResponse';

const { kratos } = loader.load<ProtoGrpcType>('auth/kratos.proto');
const { KratosService: KratosServiceBase } = kratos;

class KratosServiceDeliver extends KratosServiceBase {}

export class KratosService {
  private service: KratosServiceDeliver;

  constructor() {
    this.service = new KratosServiceDeliver(environment.internal.host.grpcServerUrl, grpc.credentials.createInsecure());
  }

  async verifyUserInvitationToken(data: InvitationTokenRequest): Promise<InvitationTokenResponseOutput | undefined> {
    const handler = promisify(this.service.VerifyNewUserInvitationToken).bind(this.service);
    return handler(data);
  }

  async verifyRegisterAccount(data: RegisterAccountRequest): Promise<RegisterAccountResponseOutput | undefined> {
    const handler = promisify(this.service.VerifyRegisterAccount).bind(this.service);
    return handler(data);
  }

  async handleKratosRegistrationFlowCallback(data: KratosCallbackRequestOutput): Promise<EmptyOutput | undefined> {
    const handler = promisify(this.service.KratosRegistrationFlow).bind(this.service);
    return handler(data);
  }

  async handleKratosVerificationFlowCallback(data: KratosCallbackRequestOutput): Promise<EmptyOutput | undefined> {
    const handler = promisify(this.service.KratosVerificationFlow).bind(this.service);
    return handler(data);
  }

  async handleKratosSyncUpSettingsDataCallback(data: KratosCallbackRequestOutput): Promise<EmptyOutput | undefined> {
    const handler = promisify(this.service.KratosSyncUpSettingsData).bind(this.service);
    return handler(data);
  }

  async verifyFirstSignInWithOry(data: VerifyFirstSignInWithOryRequest): Promise<VerifyFirstSignInWithOryResponseOutput | undefined> {
    const handler = promisify(this.service.VerifyFirstSignInWithOry).bind(this.service);
    return handler(data);
  }

  async handleSignOut(data: SignOutRequest): Promise<EmptyOutput | undefined> {
    const handler = promisify(this.service.SignOut).bind(this.service);
    return handler(data);
  }

  async handleForceLogout(data: ForceLogoutRequest): Promise<EmptyOutput | undefined> {
    const handler = promisify(this.service.ForceLogout).bind(this.service);
    return handler(data);
  }

  async handleKratosRegistrationFlowCallbackV2(data: KratosCallbackRequestOutput): Promise<RegisterAccountResponseOutput | undefined> {
    const handler = promisify(this.service.KratosRegistrationFlowV2).bind(this.service);
    return handler(data);
  }

  async afterSignUpInvitation(data: AfterSignUpInvitationRequest): Promise<EmptyOutput | undefined> {
    const handler = promisify(this.service.AfterSignUpInvitation).bind(this.service);
    return handler(data);
  }

  async linkSamlLoginService(data: LinkSamlLoginServiceRequest): Promise<EmptyOutput | undefined> {
    const handler = promisify(this.service.LinkSamlLoginService).bind(this.service);
    return handler(data);
  }
}

export const kratosService = new KratosService();
