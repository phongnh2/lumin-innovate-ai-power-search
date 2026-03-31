import { Controller, UnauthorizedException } from '@nestjs/common';
import { GrpcMethod, RpcException } from '@nestjs/microservices';

import { CommonConstants } from 'Common/constants/CommonConstants';

import { LoggerService } from 'Logger/Logger.service';

import { AuthService } from './auth.service';

@Controller('auth')
export class AuthGrpcController {
  constructor(
    private readonly authService: AuthService,
    private readonly loggerService: LoggerService,
  ) {}

  @GrpcMethod('AuthService', 'VerifySession')
  async verifySession(request: {
    headers: {
      authorizationV2: string;
    }
  }) {
    const { headers } = request;
    const oryAuthorizationToken = this.authService.getOryAuthorizationToken({
      [CommonConstants.ORY_AUTHORIZATION_HTTP_REQUEST_HEADER]: headers.authorizationV2,
    });
    try {
      const session = await this.authService.getSession(oryAuthorizationToken);
      if (!session) {
        return null;
      }

      const { email, loginService, name } = session.identity?.traits || {};
      return {
        identityId: session.identity.id,
        email,
        loginService,
        name,
      };
    } catch (err: unknown) {
      this.loggerService.error({
        context: this.verifySession.name,
        error: this.loggerService.getCommonErrorAttributes(err),
      });
      throw new RpcException(new UnauthorizedException());
    }
  }
}
