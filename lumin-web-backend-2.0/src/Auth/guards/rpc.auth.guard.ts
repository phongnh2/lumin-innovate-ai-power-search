import { Metadata } from '@grpc/grpc-js';
import {
  CanActivate,
  ExecutionContext,
  Injectable,
} from '@nestjs/common';

import { EnvConstants } from 'Common/constants/EnvConstants';
import { ErrorCode } from 'Common/constants/ErrorCode';
import { Utils } from 'Common/utils/Utils';

import { AuthService } from 'Auth/auth.service';
import { EnvironmentService } from 'Environment/environment.service';
import { UserService } from 'User/user.service';

@Injectable()
export class RpcAttachUserGuard implements CanActivate {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
    private readonly environmentService: EnvironmentService,
  ) { }

  cryptoKey = this.environmentService.getByKey(EnvConstants.ENCRYPT_KEY);

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = Utils.getRpcRequest(context);
    const ctx = context.switchToRpc().getContext();
    if (!request) {
      return false;
    }
    try {
      const oryAuthorizationToken = this.authService.getOryAuthenticationTokenRpc(ctx as Metadata);
      const session = await this.authService.getSession(oryAuthorizationToken);
      const user = await this.userService.findUserByEmail(session.identity.traits.email as string);
      let updatedUser = await this.userService.verifyUserFromExistingSession(user);
      // In case backend fails to receive callback from Kratos in registration flow
      if (!updatedUser) {
        updatedUser = await this.authService.newUserFromExistingKratosSession(session);
      }
      request.user = updatedUser;
    } catch (err) {
      if (typeof err?.getErrorCode === 'function' && err?.getErrorCode() === ErrorCode.Common.INVALID_IP_ADDRESS) {
        throw err;
      }
      return false;
    }
    return true;
  }
}
